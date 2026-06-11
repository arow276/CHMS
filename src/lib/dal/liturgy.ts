import { db } from "@/lib/db";

export async function getLiturgies() {
  const [liturgies, total] = await Promise.all([
    db.liturgy.findMany({
      orderBy: { date: "desc" },
      include: { event: { select: { id: true, name: true } } },
    }),
    db.liturgy.count(),
  ]);
  return { liturgies, total };
}

export async function getLiturgy(id: string) {
  return db.liturgy.findUnique({
    where: { id },
    include: { event: { select: { id: true, name: true, date: true } } },
  });
}
