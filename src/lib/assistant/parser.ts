import type { ParsedIntent, IntentName } from "./types";

/**
 * A deterministic, jargon-light intent parser.
 *
 * It is intentionally simple and forgiving so a 75-year-old admin can type
 * "add a potluck next sunday at 6pm" or "register Mary Smith for the picnic"
 * and have the right thing happen — no menus, no documentation.
 */

type Pattern = {
  intent: IntentName;
  /** Words/phrases that, if any present, raise this intent's match score. */
  cues: string[];
  /** Patterns that confirm the match — at least one must hit. */
  confirm?: RegExp[];
  /** Pulls structured args out of the raw prompt. */
  extract?: (prompt: string) => ParsedIntent["args"];
  /** Words readable explanation of what we understood. */
  describe: (args: ParsedIntent["args"]) => string;
};

const HELP_CUES = ["help", "what can you do", "how do i", "options", "tour"];

const PATTERNS: Pattern[] = [
  {
    intent: "add_person",
    cues: ["add person", "new person", "add member", "add visitor", "new visitor", "new member"],
    confirm: [/\badd\b.*(person|member|visitor|family|attendee)/i, /\bnew\b.*(person|member|visitor)/i],
    extract: (raw) => {
      const m = raw.match(/(?:add|new)\s+(?:person|member|visitor)\s+(?:named\s+)?([A-Z][a-zA-Z'.-]+(?:\s+[A-Z][a-zA-Z'.-]+)?)/);
      const name = m?.[1]?.trim();
      const email = raw.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0];
      const phone = raw.match(/(\+?\d[\d\s().-]{8,}\d)/)?.[1]?.replace(/\s+/g, " ").trim();
      return { name: name ?? null, email: email ?? null, phone: phone ?? null };
    },
    describe: (a) => (a.name ? `Add ${a.name} to your people` : "Add a new person to your people"),
  },
  {
    intent: "add_gathering",
    cues: [
      "add event",
      "new event",
      "create event",
      "schedule",
      "add service",
      "potluck",
      "picnic",
      "meeting",
      "class",
      "outreach",
      "youth",
      "kids",
      "small group",
      "worship",
    ],
    confirm: [
      /\b(add|new|create|schedule|plan)\b.*\b(event|service|meeting|class|gathering|potluck|picnic|outreach|study|prayer|breakfast|dinner|lunch)\b/i,
    ],
    extract: (raw) => {
      const dateInfo = parseHumanDate(raw);
      const titleMatch = raw.match(
        /(?:add|new|create|schedule|plan)(?:\s+a)?\s+(.+?)(?:\s+(?:on|at|for|next|this|tomorrow|tonight))/i,
      );
      let title = titleMatch?.[1]?.trim();
      if (!title) {
        // Fallback: pull a rough title between verb and end of string
        const t2 = raw.match(/(?:add|new|create|schedule|plan)(?:\s+a)?\s+(.+)$/i)?.[1]?.trim();
        title = t2;
      }
      const category = guessCategory(raw);
      return {
        title: cleanTitle(title) ?? null,
        category,
        startsAt: dateInfo.iso,
        startsAtLabel: dateInfo.label,
      };
    },
    describe: (a) =>
      `Schedule "${a.title ?? "a new gathering"}"${a.startsAtLabel ? ` for ${a.startsAtLabel}` : ""}`,
  },
  {
    intent: "open_registration",
    cues: ["open registration", "start signups", "let people sign up", "let people register"],
    confirm: [/\b(open|start|begin)\b.*\b(registration|sign[- ]?ups?)\b/i],
    extract: (raw) => ({ gatheringName: extractAfter(raw, /(?:for|on)\s+(.+)$/i) }),
    describe: (a) =>
      a.gatheringName
        ? `Open registration for ${a.gatheringName}`
        : "Open registration on the gathering you choose",
  },
  {
    intent: "close_registration",
    cues: ["close registration", "stop signups", "end registration"],
    confirm: [/\b(close|stop|end)\b.*\b(registration|sign[- ]?ups?)\b/i],
    extract: (raw) => ({ gatheringName: extractAfter(raw, /(?:for|on)\s+(.+)$/i) }),
    describe: (a) =>
      a.gatheringName
        ? `Close registration for ${a.gatheringName}`
        : "Close registration on the gathering you choose",
  },
  {
    intent: "add_volunteer_role",
    cues: ["volunteer", "need volunteers", "sign up volunteers", "add helpers", "need helpers"],
    confirm: [/\b(need|add|create)\b.*\b(volunteer|helper|usher|greeter|server|set[- ]?up|teardown|nursery)\b/i],
    extract: (raw) => {
      const slots = parseInt(raw.match(/(\d+)\s+(?:volunteers?|helpers?|people|spots?)/i)?.[1] ?? "1", 10);
      const role = raw
        .match(/\b(?:need|add|create)\s+(?:\d+\s+)?(\w[\w\s-]+?)(?:\s+(?:for|to|on|at|next|this|tomorrow))/i)?.[1]
        ?.trim();
      const gathering = extractAfter(raw, /\bfor\s+(.+)$/i);
      return { role: role ?? "Helper", slots, gatheringName: gathering ?? null };
    },
    describe: (a) =>
      `Need ${a.slots ?? 1} ${a.role ?? "helpers"}${a.gatheringName ? ` for ${a.gatheringName}` : ""}`,
  },
  {
    intent: "find_person",
    cues: ["find", "look up", "search for", "who is", "where is"],
    confirm: [/\b(find|look up|search for|who is|where is)\b\s+([A-Z][a-zA-Z'.-]+)/i],
    extract: (raw) => {
      const name = raw.match(
        /\b(?:find|look up|search for|who is|where is)\s+([A-Z][a-zA-Z'.-]+(?:\s+[A-Z][a-zA-Z'.-]+)?)/,
      )?.[1];
      return { name: name ?? null };
    },
    describe: (a) => (a.name ? `Look up ${a.name}` : "Look up a person"),
  },
  {
    intent: "list_gatherings",
    cues: ["what's coming up", "upcoming events", "calendar", "what's on", "this week", "next week"],
    confirm: [/\b(upcoming|coming up|this week|next week|on the calendar|what's on)\b/i],
    describe: () => "Show what's coming up",
  },
  {
    intent: "list_volunteers",
    cues: ["volunteers", "who's volunteering", "helpers"],
    confirm: [/\bvolunteer/i],
    describe: () => "Show all volunteers",
  },
  {
    intent: "list_registrations",
    cues: ["registrations", "who registered", "sign ups", "signups"],
    confirm: [/\b(registr|sign[- ]?ups?)\b/i],
    describe: () => "Show all sign-ups",
  },
  {
    intent: "update_brand_color",
    cues: ["brand color", "primary color", "accent color", "church color", "color scheme"],
    confirm: [/\b(color|colour|brand|theme)\b/i],
    extract: (raw) => {
      const hex = raw.match(/#[0-9a-fA-F]{6}/)?.[0];
      const which = /accent|secondary/i.test(raw) ? "accent" : "primary";
      return { hex: hex ?? null, which };
    },
    describe: (a) => `Update ${a.which ?? "primary"} color${a.hex ? ` to ${a.hex}` : ""}`,
  },
  {
    intent: "set_church_name",
    cues: ["church name", "rename church", "set name"],
    confirm: [/\b(church name|rename church|set name|name the church)\b/i],
    extract: (raw) => {
      const m = raw.match(/(?:name(?:d)?|rename|call|to)\s+(?:the church\s+)?["']?([^"'.\n]+?)["']?$/i);
      return { name: m?.[1]?.trim() ?? null };
    },
    describe: (a) => (a.name ? `Set church name to "${a.name}"` : "Set the church name"),
  },
  {
    intent: "show_website",
    cues: ["website", "public site", "preview site", "see our site", "show site"],
    confirm: [/\b(website|public site|preview site|our site)\b/i],
    describe: () => "Show your church's public website",
  },
];

export function parsePrompt(rawPrompt: string): ParsedIntent {
  const prompt = rawPrompt.trim();
  if (!prompt) {
    return {
      name: "unknown",
      understood: "Nothing yet — type what you'd like to do.",
      reason: "empty prompt",
      args: {},
    };
  }
  if (HELP_CUES.some((c) => prompt.toLowerCase().includes(c))) {
    return {
      name: "show_help",
      understood: "Show what I can do",
      reason: 'matched "help"',
      args: {},
    };
  }

  const scores = PATTERNS.map((p) => {
    const lower = prompt.toLowerCase();
    let score = 0;
    let why = "";
    for (const cue of p.cues) {
      if (lower.includes(cue)) {
        score += 2;
        why = `mentioned "${cue}"`;
      }
    }
    if (p.confirm) {
      for (const re of p.confirm) {
        if (re.test(prompt)) {
          score += 3;
          why = why || `matched "${re.source.slice(0, 30)}…"`;
        }
      }
    }
    return { p, score, why };
  });

  scores.sort((a, b) => b.score - a.score);
  const top = scores[0];
  if (!top || top.score === 0) {
    return {
      name: "unknown",
      understood: "I'm not sure what to do with that yet.",
      reason: "no patterns matched",
      args: { raw: prompt },
    };
  }

  const args = top.p.extract ? top.p.extract(prompt) : {};
  return {
    name: top.p.intent,
    understood: top.p.describe(args),
    reason: top.why,
    args,
  };
}

// ───────────────────────── helpers ─────────────────────────

function cleanTitle(t?: string): string | undefined {
  if (!t) return undefined;
  return t
    .replace(/^(an?|the)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractAfter(raw: string, re: RegExp): string | null {
  const m = raw.match(re);
  return m?.[1]?.trim() ?? null;
}

function guessCategory(raw: string): string {
  const r = raw.toLowerCase();
  if (/\bworship|service|sunday\b/.test(r)) return "WORSHIP_SERVICE";
  if (/\bclass|study|course\b/.test(r)) return "CLASS";
  if (/\bsmall group|life group|home group\b/.test(r)) return "SMALL_GROUP";
  if (/\bmeeting|board|committee\b/.test(r)) return "MEETING";
  if (/\boutreach|mission|serve|community\b/.test(r)) return "OUTREACH";
  if (/\bkids|children|nursery\b/.test(r)) return "KIDS";
  if (/\byouth|teen|student\b/.test(r)) return "YOUTH";
  return "EVENT";
}

/**
 * Parses friendly date phrases into a JS Date.
 * Handles: "tomorrow", "tonight", "next sunday", "this saturday at 6pm",
 *          "june 12", "12/15 7pm". Falls back to "this Sunday at 10am".
 */
export function parseHumanDate(input: string): { iso: string | null; label: string | null } {
  const now = new Date();
  const lower = input.toLowerCase();

  const dow = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  let target: Date | null = null;

  if (/\btonight\b/.test(lower)) {
    target = atTime(today(), "19:00");
  } else if (/\btomorrow\b/.test(lower)) {
    target = addDays(today(), 1);
  } else if (/\bthis (sun|mon|tue|wed|thu|fri|sat)/.test(lower)) {
    const idx = dow.findIndex((d) => lower.includes(`this ${d}`) || lower.includes(`this ${d.slice(0, 3)}`));
    if (idx >= 0) target = nextDayOfWeek(today(), idx, /*forceNext=*/ false);
  } else if (/\bnext (sun|mon|tue|wed|thu|fri|sat)/.test(lower)) {
    const idx = dow.findIndex((d) => lower.includes(`next ${d}`) || lower.includes(`next ${d.slice(0, 3)}`));
    if (idx >= 0) target = nextDayOfWeek(today(), idx, /*forceNext=*/ true);
  } else if (/\bnext week\b/.test(lower)) {
    target = addDays(today(), 7);
  } else {
    // Look for explicit dates: "june 12", "6/12", "12/15"
    const months = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];
    const monthRe = new RegExp(`\\b(${months.join("|")})\\s+(\\d{1,2})\\b`, "i");
    const monthMatch = lower.match(monthRe);
    if (monthMatch) {
      const monthIdx = months.indexOf(monthMatch[1].toLowerCase());
      const day = parseInt(monthMatch[2], 10);
      const year = now.getMonth() > monthIdx ? now.getFullYear() + 1 : now.getFullYear();
      target = new Date(year, monthIdx, day, 18, 0);
    } else {
      const slashMatch = lower.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
      if (slashMatch) {
        const month = parseInt(slashMatch[1], 10) - 1;
        const day = parseInt(slashMatch[2], 10);
        const yr = slashMatch[3] ? parseInt(slashMatch[3], 10) : now.getFullYear();
        const fullYear = yr < 100 ? 2000 + yr : yr;
        target = new Date(fullYear, month, day, 18, 0);
      }
    }
  }

  // Time of day, e.g. "at 6pm", "7:30pm", "10am"
  const timeMatch = lower.match(/\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);
  if (timeMatch && target) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = parseInt(timeMatch[2] ?? "0", 10);
    const meridiem = timeMatch[3];
    if (meridiem === "pm" && hour < 12) hour += 12;
    if (meridiem === "am" && hour === 12) hour = 0;
    target.setHours(hour, minute, 0, 0);
  }

  if (!target) return { iso: null, label: null };

  return {
    iso: target.toISOString(),
    label: target.toLocaleString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(d: Date, n: number) {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}
function atTime(d: Date, hhmm: string) {
  const [h, m] = hhmm.split(":").map((x) => parseInt(x, 10));
  const c = new Date(d);
  c.setHours(h, m ?? 0, 0, 0);
  return c;
}
function nextDayOfWeek(from: Date, dow: number, forceNext: boolean) {
  const d = new Date(from);
  const diff = (dow - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + (diff === 0 && forceNext ? 7 : diff || (forceNext ? 7 : 0)));
  d.setHours(10, 0, 0, 0);
  return d;
}
