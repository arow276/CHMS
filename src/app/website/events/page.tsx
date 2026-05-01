import Link from "next/link";
import { db } from "@/lib/db";
import { ensureChurch } from "@/lib/assistant/runner";
import { computeTheme } from "@/lib/website/theme";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  WORSHIP_SERVICE: "Worship",
  EVENT: "Event",
  CLASS: "Class",
  SMALL_GROUP: "Small Group",
  MEETING: "Meeting",
  OUTREACH: "Outreach",
  KIDS: "Kids",
  YOUTH: "Youth",
  OTHER: "Other",
};

export default async function PublicEventsPage() {
  const church = await ensureChurch();
  const theme = computeTheme(church);
  const gatherings = await db.gathering.findMany({
    where: { isPublic: true, isPublished: true, startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
    include: { _count: { select: { volunteerRoles: true } } },
  });

  return (
    <div className="max-w-6xl mx-auto px-5 py-16">
      <h1 className="text-4xl font-bold tracking-tight">What&rsquo;s on at {church.name}</h1>
      <p className="mt-2" style={{ color: theme.muted }}>
        Tap any event for details, sign-ups, or volunteer roles.
      </p>

      {gatherings.length === 0 ? (
        <div
          className="mt-10 rounded-2xl p-10 text-center"
          style={{ border: `1px dashed ${theme.border}` }}
        >
          <p className="text-lg">Nothing on the calendar just yet.</p>
        </div>
      ) : (
        <ul className="mt-10 space-y-4">
          {gatherings.map((g) => (
            <li key={g.id}>
              <Link
                href={`/website/g/${g.id}`}
                className="flex items-center gap-5 rounded-2xl p-5 transition-colors"
                style={{
                  background: theme.bg,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <div
                  className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl"
                  style={{ background: theme.primarySoft }}
                >
                  <span className="text-xs font-bold tracking-wider" style={{ color: theme.primary }}>
                    {g.startsAt.toLocaleString(undefined, { month: "short" }).toUpperCase()}
                  </span>
                  <span className="text-3xl font-bold">{g.startsAt.getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-wider" style={{ color: theme.primary }}>
                    {CATEGORY_LABEL[g.category] ?? "Event"}
                  </p>
                  <p className="mt-0.5 text-xl font-semibold leading-snug">{g.name}</p>
                  <p className="text-sm mt-1" style={{ color: theme.muted }}>
                    {g.startsAt.toLocaleString(undefined, {
                      weekday: "long",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {g.location ? ` • ${g.location}` : ""}
                  </p>
                </div>
                <div className="hidden sm:flex flex-col gap-1 text-xs">
                  {g.registrationOpen && (
                    <span
                      className="rounded-full px-2 py-0.5 font-medium"
                      style={{ background: theme.accentSoft, color: theme.accent }}
                    >
                      Sign up
                    </span>
                  )}
                  {g._count.volunteerRoles > 0 && (
                    <span
                      className="rounded-full px-2 py-0.5 font-medium"
                      style={{ background: theme.primarySoft, color: theme.primary }}
                    >
                      Volunteer
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
