"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { parsePrompt } from "./parser";
import type { AssistantResult, ParsedIntent } from "./types";

/**
 * Single entry-point used by the home prompt bar. Parses the prompt, runs
 * the right database action, and returns a friendly receipt for the UI.
 */
export async function runPrompt(rawPrompt: string): Promise<AssistantResult & { parsed: ParsedIntent }> {
  const parsed = parsePrompt(rawPrompt);
  const result = await execute(parsed, rawPrompt);

  // Log the action for the activity feed (so the admin sees a history of
  // everything they asked the system to do — like a paper trail).
  try {
    await db.assistantAction.create({
      data: {
        prompt: rawPrompt,
        intent: parsed.name,
        summary: result.summary,
        status: result.ok ? "done" : "needs_attention",
        meta: { args: parsed.args, reason: parsed.reason } as object,
      },
    });
  } catch {
    /* logging failures shouldn't break the user flow */
  }

  return { ...result, parsed };
}

async function execute(parsed: ParsedIntent, raw: string): Promise<AssistantResult> {
  switch (parsed.name) {
    case "add_person":
      return addPerson(parsed);
    case "add_gathering":
      return addGathering(parsed);
    case "open_registration":
      return toggleRegistration(parsed, true);
    case "close_registration":
      return toggleRegistration(parsed, false);
    case "add_volunteer_role":
      return addVolunteerRole(parsed);
    case "find_person":
      return findPerson(parsed);
    case "list_gatherings":
      return listGatherings();
    case "list_volunteers":
      return listVolunteers();
    case "list_registrations":
      return listRegistrations();
    case "update_brand_color":
      return updateBrandColor(parsed);
    case "set_church_name":
      return setChurchName(parsed);
    case "show_website":
      return {
        intent: parsed.name,
        ok: true,
        summary: "Here is your church's public website.",
        nextStep: "I built it from your brand and gatherings — no setup needed.",
        href: "/website",
      };
    case "show_help":
      return {
        intent: parsed.name,
        ok: true,
        summary: "Here are some things you can ask me to do.",
        nextStep: "Try one of the examples below — just type or click.",
      };
    case "unknown":
    default:
      return {
        intent: "unknown",
        ok: false,
        summary: "I'm not sure how to help with that yet.",
        nextStep: `Try: "Add a potluck next Sunday at 6pm" or "Find Mary Smith". (You typed: "${raw}")`,
      };
  }
}

// ─────────────────────────── handlers ───────────────────────────

async function addPerson(parsed: ParsedIntent): Promise<AssistantResult> {
  const name = (parsed.args.name as string) ?? "";
  if (!name || !name.includes(" ")) {
    return {
      intent: parsed.name,
      ok: false,
      summary: "I need a first and last name to add a person.",
      nextStep: 'Try: "Add new visitor Mary Smith".',
    };
  }
  const [firstName, ...rest] = name.split(/\s+/);
  const lastName = rest.join(" ");
  const person = await db.person.create({
    data: {
      firstName,
      lastName,
      email: (parsed.args.email as string) ?? null,
      phone: (parsed.args.phone as string) ?? null,
      status: "VISITOR",
    },
  });
  revalidatePath("/people");
  revalidatePath("/home");
  return {
    intent: parsed.name,
    ok: true,
    summary: `Added ${firstName} ${lastName} as a visitor.`,
    nextStep: "I put them in your People list. You can change their status anytime.",
    href: `/people/${person.id}`,
    receipt: [
      { label: "Name", value: `${firstName} ${lastName}` },
      ...(person.email ? [{ label: "Email", value: person.email }] : []),
      ...(person.phone ? [{ label: "Phone", value: person.phone }] : []),
      { label: "Status", value: "Visitor" },
    ],
  };
}

async function addGathering(parsed: ParsedIntent): Promise<AssistantResult> {
  const title = (parsed.args.title as string) ?? "Untitled gathering";
  const startsAtIso = parsed.args.startsAt as string | null;
  const startsAt = startsAtIso ? new Date(startsAtIso) : nextSundayAt(10);
  const startsAtLabel =
    (parsed.args.startsAtLabel as string) ??
    startsAt.toLocaleString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  const category =
    (parsed.args.category as string as
      | "WORSHIP_SERVICE"
      | "EVENT"
      | "CLASS"
      | "SMALL_GROUP"
      | "MEETING"
      | "OUTREACH"
      | "KIDS"
      | "YOUTH"
      | "OTHER") ?? "EVENT";

  const g = await db.gathering.create({
    data: {
      name: title,
      startsAt,
      category,
      isPublic: true,
      isPublished: true,
    },
  });
  revalidatePath("/gatherings");
  revalidatePath("/home");
  revalidatePath("/website");
  return {
    intent: parsed.name,
    ok: true,
    summary: `Scheduled "${title}" for ${startsAtLabel}.`,
    nextStep: "It's already on your public website. Open Gatherings to add registration or volunteers.",
    href: `/gatherings/${g.id}`,
    receipt: [
      { label: "Name", value: title },
      { label: "When", value: startsAtLabel },
      { label: "Category", value: prettyCategory(category) },
      { label: "On website", value: "Yes — published" },
    ],
  };
}

async function toggleRegistration(parsed: ParsedIntent, open: boolean): Promise<AssistantResult> {
  const search = (parsed.args.gatheringName as string) ?? "";
  const g = await findGatheringByName(search);
  if (!g) {
    return {
      intent: parsed.name,
      ok: false,
      summary: search
        ? `I couldn't find a gathering called "${search}".`
        : "Tell me which gathering — for example, \"Open registration for the picnic\".",
    };
  }
  await db.gathering.update({
    where: { id: g.id },
    data: { registrationOpen: open },
  });
  revalidatePath("/gatherings");
  revalidatePath(`/gatherings/${g.id}`);
  revalidatePath("/website");
  return {
    intent: parsed.name,
    ok: true,
    summary: `${open ? "Opened" : "Closed"} registration for ${g.name}.`,
    nextStep: open
      ? "Anyone visiting your website can sign up now."
      : "People can still see the gathering, but they can't sign up.",
    href: `/gatherings/${g.id}`,
    receipt: [
      { label: "Gathering", value: g.name },
      { label: "Registration", value: open ? "Open" : "Closed" },
    ],
  };
}

async function addVolunteerRole(parsed: ParsedIntent): Promise<AssistantResult> {
  const role = ((parsed.args.role as string) ?? "Helper").trim();
  const slots = Number(parsed.args.slots ?? 1);
  const search = (parsed.args.gatheringName as string) ?? "";
  const g = await findGatheringByName(search);
  if (!g) {
    return {
      intent: parsed.name,
      ok: false,
      summary: "Tell me which gathering needs volunteers.",
      nextStep: 'Try: "Need 4 ushers for the Easter service".',
    };
  }
  await db.volunteerRole.create({
    data: {
      name: role,
      slotsNeeded: slots,
      gatheringId: g.id,
    },
  });
  revalidatePath(`/gatherings/${g.id}`);
  revalidatePath("/website");
  return {
    intent: parsed.name,
    ok: true,
    summary: `Asking for ${slots} ${role}${slots === 1 ? "" : "s"} at ${g.name}.`,
    nextStep: "It now appears on the gathering's signup page.",
    href: `/gatherings/${g.id}`,
    receipt: [
      { label: "Gathering", value: g.name },
      { label: "Role", value: role },
      { label: "Spots needed", value: String(slots) },
    ],
  };
}

async function findPerson(parsed: ParsedIntent): Promise<AssistantResult> {
  const name = ((parsed.args.name as string) ?? "").trim();
  if (!name) {
    return {
      intent: parsed.name,
      ok: false,
      summary: "Tell me who to look for.",
      nextStep: 'Try: "Find Mary Smith".',
    };
  }
  const [first, ...rest] = name.split(/\s+/);
  const last = rest.join(" ");
  const people = await db.person.findMany({
    where: {
      OR: [
        { firstName: { contains: first, mode: "insensitive" } },
        { lastName: { contains: last || first, mode: "insensitive" } },
      ],
    },
    take: 5,
    select: { id: true, firstName: true, lastName: true, email: true, phone: true, status: true },
  });
  if (people.length === 0) {
    return {
      intent: parsed.name,
      ok: false,
      summary: `I didn't find anyone named "${name}".`,
      nextStep: "Want me to add them? Just say so.",
    };
  }
  if (people.length === 1) {
    const p = people[0];
    return {
      intent: parsed.name,
      ok: true,
      summary: `Found ${p.firstName} ${p.lastName}.`,
      href: `/people/${p.id}`,
      receipt: [
        { label: "Name", value: `${p.firstName} ${p.lastName}` },
        ...(p.email ? [{ label: "Email", value: p.email }] : []),
        ...(p.phone ? [{ label: "Phone", value: p.phone }] : []),
        { label: "Status", value: prettyStatus(p.status) },
      ],
    };
  }
  return {
    intent: parsed.name,
    ok: true,
    summary: `Found ${people.length} matches for "${name}".`,
    nextStep: "Open the People page to pick the right one.",
    href: `/people?q=${encodeURIComponent(name)}`,
    receipt: people.map((p) => ({
      label: `${p.firstName} ${p.lastName}`,
      value: prettyStatus(p.status),
    })),
  };
}

async function listGatherings(): Promise<AssistantResult> {
  const upcoming = await db.gathering.findMany({
    where: { startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
    take: 10,
    include: { _count: { select: { registrations: true, volunteerRoles: true } } },
  });
  if (upcoming.length === 0) {
    return {
      intent: "list_gatherings",
      ok: true,
      summary: "Nothing is scheduled yet.",
      nextStep: 'Try: "Add a service this Sunday at 10am".',
      href: "/gatherings",
    };
  }
  return {
    intent: "list_gatherings",
    ok: true,
    summary: `You have ${upcoming.length} thing${upcoming.length === 1 ? "" : "s"} coming up.`,
    href: "/gatherings",
    receipt: upcoming.map((g) => ({
      label: g.name,
      value: g.startsAt.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    })),
  };
}

async function listVolunteers(): Promise<AssistantResult> {
  const roles = await db.volunteerRole.findMany({
    include: {
      gathering: { select: { id: true, name: true, startsAt: true } },
      _count: { select: { signups: true } },
    },
    orderBy: { gathering: { startsAt: "asc" } },
    take: 25,
  });
  if (roles.length === 0) {
    return {
      intent: "list_volunteers",
      ok: true,
      summary: "No volunteer roles yet.",
      nextStep: 'Try: "Need 4 ushers for the Easter service".',
    };
  }
  return {
    intent: "list_volunteers",
    ok: true,
    summary: `You have ${roles.length} volunteer roles posted.`,
    href: "/gatherings",
    receipt: roles.map((r) => ({
      label: `${r.name} — ${r.gathering.name}`,
      value: `${r._count.signups} of ${r.slotsNeeded} filled`,
    })),
  };
}

async function listRegistrations(): Promise<AssistantResult> {
  const counts = await db.gathering.findMany({
    where: { registrationOpen: true },
    include: { _count: { select: { registrations: true } } },
    orderBy: { startsAt: "asc" },
    take: 25,
  });
  if (counts.length === 0) {
    return {
      intent: "list_registrations",
      ok: true,
      summary: "No gatherings are taking registrations right now.",
    };
  }
  return {
    intent: "list_registrations",
    ok: true,
    summary: `${counts.length} gatherings are open for sign-ups.`,
    href: "/gatherings",
    receipt: counts.map((g) => ({
      label: g.name,
      value: `${g._count.registrations} signed up${g.capacity ? ` of ${g.capacity}` : ""}`,
    })),
  };
}

async function updateBrandColor(parsed: ParsedIntent): Promise<AssistantResult> {
  const hex = (parsed.args.hex as string) ?? null;
  const which = ((parsed.args.which as string) ?? "primary") as "primary" | "accent";
  if (!hex) {
    return {
      intent: parsed.name,
      ok: false,
      summary: "Tell me a color in #RRGGBB form, like #2563EB.",
      nextStep: "Or open Church Brand and pick one with the color picker.",
      href: "/brand",
    };
  }
  const church = await ensureChurch();
  const updated = await db.church.update({
    where: { id: church.id },
    data: which === "accent" ? { accentColor: hex } : { primaryColor: hex },
  });
  revalidatePath("/brand");
  revalidatePath("/website");
  revalidatePath("/home");
  return {
    intent: parsed.name,
    ok: true,
    summary: `Set the ${which} color to ${hex}.`,
    nextStep: "Your website and app already use the new color.",
    href: "/website",
    receipt: [
      { label: "Primary color", value: updated.primaryColor },
      { label: "Accent color", value: updated.accentColor },
    ],
  };
}

async function setChurchName(parsed: ParsedIntent): Promise<AssistantResult> {
  const name = ((parsed.args.name as string) ?? "").trim();
  if (!name) {
    return {
      intent: parsed.name,
      ok: false,
      summary: "Tell me the church's name.",
      nextStep: 'Try: "Set church name to First Baptist of Anywhere".',
    };
  }
  const church = await ensureChurch();
  await db.church.update({
    where: { id: church.id },
    data: { name, slug: slugify(name) },
  });
  revalidatePath("/brand");
  revalidatePath("/website");
  revalidatePath("/home");
  return {
    intent: parsed.name,
    ok: true,
    summary: `Renamed your church to "${name}".`,
    nextStep: "It now appears across the app and on your website.",
    href: "/website",
    receipt: [{ label: "Church name", value: name }],
  };
}

// ─────────────────────────── helpers ───────────────────────────

export async function ensureChurch() {
  const existing = await db.church.findFirst();
  if (existing) return existing;
  return db.church.create({
    data: {
      name: "Our Church",
      slug: "our-church",
      tagline: "A place to belong.",
    },
  });
}

async function findGatheringByName(search: string) {
  if (!search) {
    // Return the next upcoming gathering as a sensible default
    return db.gathering.findFirst({
      where: { startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
    });
  }
  return db.gathering.findFirst({
    where: { name: { contains: search.trim(), mode: "insensitive" } },
    orderBy: { startsAt: "asc" },
  });
}

function nextSundayAt(hour: number) {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  const days = (7 - d.getDay()) % 7 || 7;
  d.setDate(d.getDate() + days);
  return d;
}

function prettyCategory(c: string) {
  return c.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());
}

function prettyStatus(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}
