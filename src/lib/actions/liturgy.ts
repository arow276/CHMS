"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { LiturgyDocument } from "@/lib/liturgy/types";

export async function updateLiturgyDocument(id: string, document: LiturgyDocument) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  if (!document || !Array.isArray(document.sections)) {
    throw new Error("Invalid liturgy document");
  }

  await db.liturgy.update({
    where: { id },
    data: {
      title: document.title || undefined,
      document: document as unknown as Prisma.JsonObject,
    },
  });

  revalidatePath(`/liturgy/${id}`);
  revalidatePath("/liturgy");
}

export async function updateLiturgyStatus(id: string, status: "DRAFT" | "FINAL") {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await db.liturgy.update({ where: { id }, data: { status } });

  revalidatePath(`/liturgy/${id}`);
  revalidatePath("/liturgy");
}

export async function deleteLiturgy(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await db.liturgy.delete({ where: { id } });

  revalidatePath("/liturgy");
  redirect("/liturgy");
}
