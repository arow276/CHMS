"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function createHousehold(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const address = formData.get("address") as string;

  const household = await db.household.create({
    data: { name, address: address || null },
  });

  revalidatePath("/households");
  redirect(`/households/${household.id}`);
}

export async function updateHousehold(id: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const address = formData.get("address") as string;

  await db.household.update({
    where: { id },
    data: { name, address: address || null },
  });

  revalidatePath(`/households/${id}`);
  revalidatePath("/households");
  redirect(`/households/${id}`);
}

export async function removeMemberFromHousehold(personId: string, householdId: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await db.person.update({
    where: { id: personId },
    data: { householdId: null },
  });

  revalidatePath(`/households/${householdId}`);
  revalidatePath(`/people/${personId}`);
}

export async function addMemberToHousehold(
  householdId: string,
  personId: string,
  role: string,
) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await db.person.update({
    where: { id: personId },
    data: {
      householdId,
      householdRole: role as "HEAD" | "SPOUSE" | "CHILD" | "MEMBER" | "OTHER",
    },
  });

  revalidatePath(`/households/${householdId}`);
  revalidatePath(`/people/${personId}`);
}
