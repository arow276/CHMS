"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { calculateWarmth, recalculateAllWarmth } from "@/lib/warmth";

export async function recalculateAllWarmthAction() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const count = await recalculateAllWarmth();
  revalidatePath("/dashboard");
  revalidatePath("/people");
  return count;
}

export async function recalculatePersonWarmth(personId: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const result = await calculateWarmth(personId);
  await db.person.update({
    where: { id: personId },
    data: {
      warmthScore: result.score,
      warmthLabel: result.label,
      warmthUpdatedAt: new Date(),
    },
  });
  revalidatePath(`/people/${personId}`);
  revalidatePath("/people");
  revalidatePath("/dashboard");
  return result;
}
