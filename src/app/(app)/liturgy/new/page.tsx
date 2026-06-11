import Link from "next/link";
import { db } from "@/lib/db";
import { LiturgyBuilder } from "@/components/app/liturgy/liturgy-builder";

export default async function NewLiturgyPage() {
  // Offer upcoming events for optional linking (next ~4 months)
  const now = new Date();
  const horizon = new Date(now.getTime() + 120 * 86_400_000);
  const events = await db.event.findMany({
    where: { date: { gte: now, lte: horizon } },
    select: { id: true, name: true, date: true },
    orderBy: { date: "asc" },
    take: 30,
  });

  return (
    <div>
      <div className="mb-6">
        <Link href="/liturgy" className="text-sm text-zinc-400 hover:text-white transition-colors">
          &larr; Back to Liturgy
        </Link>
        <h1 className="text-2xl font-bold mt-2">Plan a Liturgy</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Choose your tradition and rite, pick the date, and Shepherd drafts a
          complete order of service with propers, rubrics, and planning notes.
        </p>
      </div>

      <LiturgyBuilder
        upcomingEvents={events.map((e) => ({
          id: e.id,
          name: e.name,
          date: e.date.toISOString(),
        }))}
      />
    </div>
  );
}
