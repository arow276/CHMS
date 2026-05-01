"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const GatheringInput = z.object({
  name: z.string().min(1, "Give it a name."),
  summary: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  category: z.enum([
    "WORSHIP_SERVICE",
    "EVENT",
    "CLASS",
    "SMALL_GROUP",
    "MEETING",
    "OUTREACH",
    "KIDS",
    "YOUTH",
    "OTHER",
  ]),
  startsAt: z.string(),
  endsAt: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  isPublic: z.boolean().default(true),
  registrationOpen: z.boolean().default(false),
  capacity: z.number().int().nonnegative().optional().nullable(),
  costCents: z.number().int().nonnegative().default(0),
});

export async function createGathering(formData: FormData) {
  const data = GatheringInput.parse({
    name: formData.get("name"),
    summary: formData.get("summary") || null,
    description: formData.get("description") || null,
    category: formData.get("category") || "EVENT",
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt") || null,
    location: formData.get("location") || null,
    isPublic: formData.get("isPublic") === "on",
    registrationOpen: formData.get("registrationOpen") === "on",
    capacity: formData.get("capacity") ? Number(formData.get("capacity")) : null,
    costCents: formData.get("costCents") ? Number(formData.get("costCents")) : 0,
  });

  const g = await db.gathering.create({
    data: {
      ...data,
      startsAt: new Date(data.startsAt),
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
    },
  });

  revalidatePath("/gatherings");
  revalidatePath("/website");
  revalidatePath("/home");
  redirect(`/gatherings/${g.id}`);
}

export async function updateGathering(id: string, formData: FormData) {
  const data = GatheringInput.parse({
    name: formData.get("name"),
    summary: formData.get("summary") || null,
    description: formData.get("description") || null,
    category: formData.get("category") || "EVENT",
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt") || null,
    location: formData.get("location") || null,
    isPublic: formData.get("isPublic") === "on",
    registrationOpen: formData.get("registrationOpen") === "on",
    capacity: formData.get("capacity") ? Number(formData.get("capacity")) : null,
    costCents: formData.get("costCents") ? Number(formData.get("costCents")) : 0,
  });
  await db.gathering.update({
    where: { id },
    data: {
      ...data,
      startsAt: new Date(data.startsAt),
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
    },
  });
  revalidatePath("/gatherings");
  revalidatePath(`/gatherings/${id}`);
  revalidatePath("/website");
}

export async function deleteGathering(id: string) {
  await db.gathering.delete({ where: { id } });
  revalidatePath("/gatherings");
  revalidatePath("/website");
  redirect("/gatherings");
}

export async function addVolunteerRole(gatheringId: string, formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const description = ((formData.get("description") as string) || "").trim() || null;
  const slotsNeeded = Math.max(1, Number(formData.get("slotsNeeded") || 1));
  if (!name) return;
  await db.volunteerRole.create({
    data: { name, description, slotsNeeded, gatheringId },
  });
  revalidatePath(`/gatherings/${gatheringId}`);
  revalidatePath("/website");
}

export async function deleteVolunteerRole(roleId: string, gatheringId: string) {
  await db.volunteerRole.delete({ where: { id: roleId } });
  revalidatePath(`/gatherings/${gatheringId}`);
  revalidatePath("/website");
}

export async function addRegistration(gatheringId: string, formData: FormData) {
  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  const email = ((formData.get("email") as string) || "").trim() || null;
  const phone = ((formData.get("phone") as string) || "").trim() || null;
  const partySize = Math.max(1, Number(formData.get("partySize") || 1));
  if (!firstName || !lastName) return;
  await db.registration.create({
    data: { firstName, lastName, email, phone, partySize, gatheringId },
  });
  revalidatePath(`/gatherings/${gatheringId}`);
}

export async function addVolunteerSignup(roleId: string, gatheringId: string, formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = ((formData.get("email") as string) || "").trim() || null;
  const phone = ((formData.get("phone") as string) || "").trim() || null;
  if (!name) return;
  await db.volunteerSignup.create({
    data: { name, email, phone, roleId },
  });
  revalidatePath(`/gatherings/${gatheringId}`);
}
