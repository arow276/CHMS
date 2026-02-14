"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const personSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  status: z.enum(["VISITOR", "REGULAR", "MEMBER", "INACTIVE"]),
  gender: z.enum(["MALE", "FEMALE", "NOT_SPECIFIED"]).optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  householdId: z.string().optional().or(z.literal("")),
  householdRole: z.enum(["HEAD", "SPOUSE", "CHILD", "MEMBER", "OTHER"]).optional().or(z.literal("")),
  notes: z.string().optional(),
});

export async function createPerson(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const raw = Object.fromEntries(formData.entries());
  const parsed = personSchema.parse(raw);

  const person = await db.person.create({
    data: {
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: parsed.email || null,
      phone: parsed.phone || null,
      status: parsed.status as "VISITOR" | "REGULAR" | "MEMBER" | "INACTIVE",
      gender: parsed.gender && parsed.gender !== "" ? (parsed.gender as "MALE" | "FEMALE" | "NOT_SPECIFIED") : null,
      dateOfBirth: parsed.dateOfBirth ? new Date(parsed.dateOfBirth) : null,
      householdId: parsed.householdId || null,
      householdRole: parsed.householdRole && parsed.householdRole !== "" ? (parsed.householdRole as "HEAD" | "SPOUSE" | "CHILD" | "MEMBER" | "OTHER") : undefined,
      notes: parsed.notes || null,
    },
  });

  revalidatePath("/people");
  redirect(`/people/${person.id}`);
}

export async function updatePerson(id: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const raw = Object.fromEntries(formData.entries());
  const parsed = personSchema.parse(raw);

  await db.person.update({
    where: { id },
    data: {
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: parsed.email || null,
      phone: parsed.phone || null,
      status: parsed.status as "VISITOR" | "REGULAR" | "MEMBER" | "INACTIVE",
      gender: parsed.gender && parsed.gender !== "" ? (parsed.gender as "MALE" | "FEMALE" | "NOT_SPECIFIED") : null,
      dateOfBirth: parsed.dateOfBirth ? new Date(parsed.dateOfBirth) : null,
      householdId: parsed.householdId || null,
      householdRole: parsed.householdRole && parsed.householdRole !== "" ? (parsed.householdRole as "HEAD" | "SPOUSE" | "CHILD" | "MEMBER" | "OTHER") : undefined,
      notes: parsed.notes || null,
    },
  });

  revalidatePath(`/people/${id}`);
  revalidatePath("/people");
  redirect(`/people/${id}`);
}

export async function deletePerson(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await db.person.delete({ where: { id } });
  revalidatePath("/people");
  redirect("/people");
}
