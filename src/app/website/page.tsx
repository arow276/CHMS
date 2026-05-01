import Link from "next/link";
import { db } from "@/lib/db";
import { ensureChurch } from "@/lib/assistant/runner";
import { computeTheme } from "@/lib/website/theme";

export const dynamic = "force-dynamic";

export default async function WebsiteHome() {
  const church = await ensureChurch();
  const theme = computeTheme(church);

  const upcoming = await db.gathering.findMany({
    where: { isPublic: true, isPublished: true, startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
    take: 6,
    include: {
      _count: { select: { volunteerRoles: true } },
    },
  });

  return (
    <div>
      {/* Hero */}
      <section
        className="px-5 py-20 sm:py-28 text-center"
        style={{
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
          color: theme.onPrimary,
        }}
      >
        <div className="max-w-3xl mx-auto">
          {church.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={church.logoUrl}
              alt=""
              className="h-20 w-20 mx-auto mb-6 rounded-2xl bg-white/20 object-contain p-2"
            />
          ) : null}
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
            Welcome to {church.name}
          </h1>
          {church.tagline && (
            <p className="mt-4 text-xl sm:text-2xl opacity-95">{church.tagline}</p>
          )}
          {church.serviceTimes && (
            <p className="mt-3 text-lg opacity-90">{church.serviceTimes}</p>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/website/events"
              className="rounded-full px-6 py-3 font-semibold"
              style={{ background: theme.bg, color: theme.text }}
            >
              See what&rsquo;s on →
            </Link>
            <Link
              href="/website/visit"
              className="rounded-full px-6 py-3 font-semibold border-2"
              style={{ borderColor: theme.onPrimary, color: theme.onPrimary }}
            >
              Plan a visit
            </Link>
          </div>
        </div>
      </section>

      {/* Mission */}
      {church.mission && (
        <section className="max-w-3xl mx-auto px-5 py-16 text-center">
          <p className="text-2xl sm:text-3xl font-medium leading-snug">
            {church.mission}
          </p>
        </section>
      )}

      {/* What's coming up */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">What&rsquo;s coming up</h2>
            <p className="mt-1" style={{ color: theme.muted }}>
              Sign up online &mdash; we&rsquo;d love to see you.
            </p>
          </div>
          <Link
            href="/website/events"
            className="hidden sm:inline-block underline text-sm"
            style={{ color: theme.primary }}
          >
            All events →
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ border: `1px dashed ${theme.border}` }}
          >
            <p className="text-lg">Nothing on the calendar just yet — check back soon!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcoming.map((g) => (
              <Link
                key={g.id}
                href={`/website/g/${g.id}`}
                className="rounded-2xl overflow-hidden transition-transform hover:-translate-y-0.5"
                style={{
                  background: theme.bg,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <div className="aspect-[5/2]" style={{ background: theme.primarySoft }}>
                  {g.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={g.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs uppercase tracking-wider" style={{ color: theme.primary }}>
                    {g.startsAt.toLocaleString(undefined, {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="mt-1 text-xl font-semibold leading-snug">{g.name}</p>
                  {g.summary && (
                    <p className="mt-2 text-sm" style={{ color: theme.muted }}>
                      {g.summary}
                    </p>
                  )}
                  <div className="mt-3 flex gap-2 text-xs">
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
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* About */}
      {church.about && (
        <section
          className="px-5 py-20"
          style={{ background: theme.primarySoft }}
        >
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight mb-4">About us</h2>
            <p className="text-lg leading-relaxed whitespace-pre-line">
              {church.about}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
