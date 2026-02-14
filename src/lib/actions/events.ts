"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { calculateWarmth } from "@/lib/warmth";

export async function createEvent(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const event = await db.event.create({
    data: {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      type: formData.get("type") as "SUNDAY_SERVICE" | "SMALL_GROUP" | "SPECIAL_EVENT" | "CLASS" | "OTHER",
      date: new Date(formData.get("date") as string),
      groupId: (formData.get("groupId") as string) || null,
    },
  });

  revalidatePath("/events");
  redirect(`/events/${event.id}`);
}

export async function saveAttendance(
  eventId: string,
  records: { personId: string; status: "PRESENT" | "ABSENT" | "LATE" }[],
) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  // Use a transaction to upsert all attendance records
  await db.$transaction(
    records.map((r) =>
      db.attendance.upsert({
        where: {
          personId_eventId: { personId: r.personId, eventId },
        },
        create: { personId: r.personId, eventId, status: r.status },
        update: { status: r.status },
      })
    )
  );

  // Recalculate warmth for all affected people
  const personIds = [...new Set(records.map((r) => r.personId))];
  for (const pid of personIds) {
    const result = await calculateWarmth(pid);
    await db.person.update({
      where: { id: pid },
      data: {
        warmthScore: result.score,
        warmthLabel: result.label,
        warmthUpdatedAt: new Date(),
      },
    });
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/attendance`);
  revalidatePath("/events");
  revalidatePath("/people");
  revalidatePath("/dashboard");
}
