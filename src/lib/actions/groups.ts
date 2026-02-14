"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function createGroup(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const group = await db.group.create({
    data: {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      type: formData.get("type") as "LIFE_GROUP" | "MINISTRY" | "CLASS" | "COMMITTEE" | "OTHER",
      meetingDay: (formData.get("meetingDay") as string) || null,
      meetingTime: (formData.get("meetingTime") as string) || null,
    },
  });

  revalidatePath("/groups");
  redirect(`/groups/${group.id}`);
}

export async function updateGroup(id: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await db.group.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      type: formData.get("type") as "LIFE_GROUP" | "MINISTRY" | "CLASS" | "COMMITTEE" | "OTHER",
      meetingDay: (formData.get("meetingDay") as string) || null,
      meetingTime: (formData.get("meetingTime") as string) || null,
    },
  });

  revalidatePath(`/groups/${id}`);
  revalidatePath("/groups");
  redirect(`/groups/${id}`);
}

export async function addGroupMember(
  groupId: string,
  personId: string,
  role: string,
) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await db.groupMember.create({
    data: {
      groupId,
      personId,
      role: role as "LEADER" | "CO_LEADER" | "MEMBER",
    },
  });

  revalidatePath(`/groups/${groupId}`);
  revalidatePath(`/people/${personId}`);
}

export async function removeGroupMember(membershipId: string, groupId: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const membership = await db.groupMember.delete({ where: { id: membershipId } });

  revalidatePath(`/groups/${groupId}`);
  revalidatePath(`/people/${membership.personId}`);
}

export async function searchPeople(query: string) {
  return db.person.findMany({
    where: {
      OR: [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
      ],
    },
    select: { id: true, firstName: true, lastName: true },
    take: 10,
  });
}
