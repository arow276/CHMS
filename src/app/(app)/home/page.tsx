import Link from "next/link";
import { db } from "@/lib/db";
import { ensureChurch } from "@/lib/assistant/runner";
import { PromptBar } from "@/components/app/assistant/prompt-bar";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const church = await ensureChurch();

  const [upcoming, openSignups, recentActions, peopleCount] = await Promise.all([
    db.gathering.findMany({
      where: { startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 4,
      include: {
        _count: { select: { registrations: true, volunteerRoles: true } },
      },
    }),
    db.gathering.count({ where: { registrationOpen: true } }),
    db.assistantAction.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    db.person.count(),
  ]);

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="easy max-w-4xl mx-auto pb-24">
      {/* Greeting */}
      <header className="mb-8">
        <p className="text-zinc-500 text-sm uppercase tracking-wider mb-2">
          {greetingFor(new Date())} • {church.name}
        </p>
        <h1 className="text-white font-bold tracking-tight">
          Hi {firstName} — what would you like to do?
        </h1>
        <p className="text-zinc-400 mt-2 text-base">
          Just type it. I&rsquo;ll handle the menus, fields and forms for you.
        </p>
      </header>

      {/* The big prompt bar — the centerpiece of the whole app */}
      <PromptBar accentColor={church.accentColor} />

      {/* "At a glance" — small reassurance the system is alive */}
      <section className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="People" value={peopleCount} href="/people" />
        <Stat label="Coming up" value={upcoming.length} href="/gatherings" />
        <Stat label="Open sign-ups" value={openSignups} href="/gatherings" />
        <Stat
          label="Website"
          value={church.publishSite ? "Live" : "Off"}
          href="/website"
          accent={church.accentColor}
        />
      </section>

      {/* Upcoming gatherings — preview, with one-click "do more" actions */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Coming up</h2>
          <Link href="/gatherings" className="text-sm text-zinc-400 hover:text-white">
            See all →
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <EmptyState
            title="Nothing on the calendar yet"
            hint='Type "Add a service this Sunday at 10am" above.'
          />
        ) : (
          <ul className="space-y-3">
            {upcoming.map((g) => (
              <li
                key={g.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-5 hover:border-zinc-700 transition-colors"
              >
                <Link href={`/gatherings/${g.id}`} className="flex items-center gap-4">
                  <DateTile date={g.startsAt} accent={church.primaryColor} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{g.name}</p>
                    <p className="text-sm text-zinc-400">
                      {g.startsAt.toLocaleString(undefined, {
                        weekday: "long",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                      {g.location ? ` • ${g.location}` : ""}
                    </p>
                  </div>
                  <div className="hidden sm:flex flex-col items-end text-xs text-zinc-500 gap-1">
                    {g.registrationOpen && (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-400">
                        Sign-ups open
                      </span>
                    )}
                    {g._count.volunteerRoles > 0 && (
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-400">
                        {g._count.volunteerRoles} volunteer role
                        {g._count.volunteerRoles === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recent activity — paper-trail of what the assistant has done */}
      {recentActions.length > 0 && (
        <section className="mt-10">
          <h2 className="text-white font-semibold mb-3">Recently done</h2>
          <ol className="space-y-2">
            {recentActions.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-3 rounded-xl border border-zinc-800/70 bg-zinc-900/30 px-4 py-3"
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm"
                  style={{
                    background: a.status === "done" ? `${church.accentColor}22` : "#7f1d1d22",
                    color: a.status === "done" ? church.accentColor : "#fca5a5",
                  }}
                >
                  {a.status === "done" ? "✓" : "!"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-200 text-sm truncate">{a.summary}</p>
                  <p className="text-zinc-500 text-xs">
                    From: <span className="italic">&ldquo;{a.prompt}&rdquo;</span> ·{" "}
                    {timeAgo(a.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Footer reassurance */}
      <p className="mt-12 text-center text-sm text-zinc-600">
        Everything you do here flows automatically into your church&rsquo;s website and app.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: number | string;
  href: string;
  accent?: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 hover:border-zinc-600 transition-colors"
    >
      <div className="text-2xl font-bold text-white" style={accent ? { color: accent } : undefined}>
        {value}
      </div>
      <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">{label}</div>
    </Link>
  );
}

function DateTile({ date, accent }: { date: Date; accent: string }) {
  const month = date.toLocaleString(undefined, { month: "short" }).toUpperCase();
  const day = date.getDate();
  return (
    <div
      className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl"
      style={{ background: `${accent}18`, border: `1px solid ${accent}44` }}
    >
      <span className="text-[10px] font-semibold tracking-wider" style={{ color: accent }}>
        {month}
      </span>
      <span className="text-xl font-bold text-white leading-none">{day}</span>
    </div>
  );
}

function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 p-8 text-center">
      <p className="text-zinc-300 font-medium">{title}</p>
      <p className="text-zinc-500 text-sm mt-1">{hint}</p>
    </div>
  );
}

function greetingFor(d: Date) {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function timeAgo(d: Date) {
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
