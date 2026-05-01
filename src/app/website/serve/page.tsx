import Link from "next/link";
import { db } from "@/lib/db";
import { ensureChurch } from "@/lib/assistant/runner";
import { computeTheme } from "@/lib/website/theme";

export const dynamic = "force-dynamic";

export default async function PublicServePage() {
  const church = await ensureChurch();
  const theme = computeTheme(church);
  const roles = await db.volunteerRole.findMany({
    where: {
      gathering: {
        isPublic: true,
        isPublished: true,
        startsAt: { gte: new Date() },
      },
    },
    include: {
      gathering: { select: { id: true, name: true, startsAt: true } },
      _count: { select: { signups: true } },
    },
    orderBy: { gathering: { startsAt: "asc" } },
  });

  return (
    <div className="max-w-3xl mx-auto px-5 py-16">
      <h1 className="text-4xl font-bold tracking-tight">Serve with us</h1>
      <p className="mt-2 text-lg" style={{ color: theme.muted }}>
        Pick a way to help out. Every spot matters.
      </p>

      {roles.length === 0 ? (
        <div
          className="mt-10 rounded-2xl p-10 text-center"
          style={{ border: `1px dashed ${theme.border}` }}
        >
          <p>Nothing posted just yet — check back soon!</p>
        </div>
      ) : (
        <ul className="mt-10 space-y-4">
          {roles.map((r) => {
            const remaining = Math.max(0, r.slotsNeeded - r._count.signups);
            return (
              <li key={r.id}>
                <Link
                  href={`/website/g/${r.gathering.id}`}
                  className="flex items-center justify-between gap-4 rounded-2xl p-5 transition-colors"
                  style={{
                    background: theme.bg,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-lg">{r.name}</p>
                    <p className="text-sm" style={{ color: theme.muted }}>
                      {r.gathering.name} ·{" "}
                      {r.gathering.startsAt.toLocaleString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-3 py-1 text-sm font-medium"
                    style={{
                      background: remaining === 0 ? "#10b98122" : theme.accentSoft,
                      color: remaining === 0 ? "#10b981" : theme.accent,
                    }}
                  >
                    {remaining === 0 ? "All filled — thanks!" : `${remaining} spot${remaining === 1 ? "" : "s"} left`}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
