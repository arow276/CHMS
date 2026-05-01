import Link from "next/link";
import { db } from "@/lib/db";
import { ensureChurch } from "@/lib/assistant/runner";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  WORSHIP_SERVICE: "Worship Service",
  EVENT: "Event",
  CLASS: "Class",
  SMALL_GROUP: "Small Group",
  MEETING: "Meeting",
  OUTREACH: "Outreach",
  KIDS: "Kids",
  YOUTH: "Youth",
  OTHER: "Other",
};

export default async function GatheringsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const params = await searchParams;
  const view = params.view === "past" ? "past" : "upcoming";
  const church = await ensureChurch();
  const where = view === "past"
    ? { startsAt: { lt: new Date() } }
    : { startsAt: { gte: new Date() } };

  const gatherings = await db.gathering.findMany({
    where,
    orderBy: { startsAt: view === "past" ? "desc" : "asc" },
    include: {
      _count: { select: { registrations: true, volunteerRoles: true } },
      volunteerRoles: { include: { _count: { select: { signups: true } } } },
    },
  });

  // Group by month for an at-a-glance calendar feel
  const byMonth = new Map<string, typeof gatherings>();
  for (const g of gatherings) {
    const key = g.startsAt.toLocaleString(undefined, { month: "long", year: "numeric" });
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(g);
  }

  return (
    <div className="easy max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-white font-bold">Gatherings</h1>
          <p className="text-zinc-400 mt-1">
            Everything you put on the calendar — services, classes, events, meetings.
            Sign-ups and volunteer roles all live here too.
          </p>
        </div>
        <Link
          href="/gatherings/new"
          className="rounded-xl px-5 py-3 font-semibold text-zinc-950"
          style={{ backgroundColor: church.accentColor }}
        >
          + New gathering
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mt-6 mb-4 border-b border-zinc-800">
        <Tab href="/gatherings?view=upcoming" active={view === "upcoming"} accent={church.accentColor}>
          Upcoming
        </Tab>
        <Tab href="/gatherings?view=past" active={view === "past"} accent={church.accentColor}>
          Past
        </Tab>
      </div>

      {gatherings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 p-12 text-center">
          <p className="text-zinc-200 text-lg font-medium">
            {view === "past" ? "No past gatherings yet." : "Nothing scheduled yet."}
          </p>
          <p className="text-zinc-500 mt-2">
            Just go to <Link href="/home" className="underline">Home</Link> and type{" "}
            <span className="italic text-zinc-300">&ldquo;Add a service this Sunday at 10am&rdquo;</span>.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {[...byMonth.entries()].map(([month, items]) => (
            <section key={month}>
              <h2 className="text-zinc-400 text-sm uppercase tracking-wider mb-3">{month}</h2>
              <ul className="space-y-3">
                {items.map((g) => {
                  const filled = g.volunteerRoles.reduce((s, r) => s + r._count.signups, 0);
                  const needed = g.volunteerRoles.reduce((s, r) => s + r.slotsNeeded, 0);
                  return (
                    <li key={g.id}>
                      <Link
                        href={`/gatherings/${g.id}`}
                        className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-5 hover:border-zinc-700 transition-colors"
                      >
                        <DateTile date={g.startsAt} accent={church.primaryColor} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-white font-semibold text-lg truncate">{g.name}</p>
                            <span
                              className="rounded-full px-2 py-0.5 text-[11px] uppercase tracking-wider"
                              style={{
                                background: `${church.accentColor}18`,
                                color: church.accentColor,
                              }}
                            >
                              {CATEGORY_LABEL[g.category]}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-400 mt-0.5">
                            {g.startsAt.toLocaleString(undefined, {
                              weekday: "short",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                            {g.location ? ` • ${g.location}` : ""}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs">
                            {g.registrationOpen && (
                              <Pill icon="✓" label={`${g._count.registrations} signed up`} color="#10b981" />
                            )}
                            {needed > 0 && (
                              <Pill
                                icon="✋"
                                label={`${filled}/${needed} volunteers`}
                                color={filled >= needed ? "#10b981" : "#f59e0b"}
                              />
                            )}
                            {g.isPublic && (
                              <Pill icon="🌐" label="On website" color="#60a5fa" />
                            )}
                          </div>
                        </div>
                        <div className="hidden sm:block text-zinc-500">→</div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function Tab({
  href,
  active,
  accent,
  children,
}: {
  href: string;
  active: boolean;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 text-base font-medium border-b-2 -mb-px transition-colors ${
        active ? "" : "border-transparent text-zinc-500 hover:text-zinc-300"
      }`}
      style={active ? { borderColor: accent, color: "white" } : undefined}
    >
      {children}
    </Link>
  );
}

function DateTile({ date, accent }: { date: Date; accent: string }) {
  const month = date.toLocaleString(undefined, { month: "short" }).toUpperCase();
  const day = date.getDate();
  return (
    <div
      className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl"
      style={{ background: `${accent}18`, border: `1px solid ${accent}44` }}
    >
      <span className="text-[11px] font-semibold tracking-wider" style={{ color: accent }}>
        {month}
      </span>
      <span className="text-2xl font-bold text-white leading-none">{day}</span>
    </div>
  );
}

function Pill({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ background: `${color}18`, color }}
    >
      <span aria-hidden>{icon}</span>
      {label}
    </span>
  );
}
