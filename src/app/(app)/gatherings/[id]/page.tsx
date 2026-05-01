import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ensureChurch } from "@/lib/assistant/runner";
import {
  addVolunteerRole,
  addRegistration,
  deleteVolunteerRole,
} from "@/lib/actions/gatherings";

export const dynamic = "force-dynamic";

export default async function GatheringDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const church = await ensureChurch();
  const g = await db.gathering.findUnique({
    where: { id },
    include: {
      registrations: { orderBy: { createdAt: "desc" } },
      volunteerRoles: {
        orderBy: { createdAt: "asc" },
        include: { signups: { orderBy: { createdAt: "asc" } } },
      },
    },
  });
  if (!g) notFound();

  const totalSignups = g.volunteerRoles.reduce(
    (s, r) => s + r.signups.length,
    0,
  );
  const totalNeeded = g.volunteerRoles.reduce((s, r) => s + r.slotsNeeded, 0);

  const fmt = g.startsAt.toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="easy max-w-5xl mx-auto pb-24 space-y-8">
      <div>
        <Link href="/gatherings" className="text-sm text-zinc-400 hover:text-white">
          ← All gatherings
        </Link>
        <div className="flex items-start justify-between gap-4 mt-3">
          <div className="min-w-0">
            <h1 className="text-white font-bold truncate">{g.name}</h1>
            <p className="text-zinc-300 mt-2">{fmt}</p>
            {g.location && <p className="text-zinc-400 mt-1">{g.location}</p>}
            {g.summary && <p className="text-zinc-300 mt-3 max-w-prose">{g.summary}</p>}
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <Link
              href={`/website/g/${g.id}`}
              target="_blank"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-zinc-950"
              style={{ backgroundColor: church.accentColor }}
            >
              Preview on website ↗
            </Link>
          </div>
        </div>
      </div>

      {/* Status row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Stat
          label="Registrations"
          value={g.registrations.length}
          hint={
            g.registrationOpen
              ? "Sign-ups are open."
              : 'Sign-ups closed. (Type "Open registration" to allow sign-ups.)'
          }
          accent={church.accentColor}
        />
        <Stat
          label="Volunteers"
          value={`${totalSignups} / ${totalNeeded || 0}`}
          hint={
            totalNeeded === 0
              ? "Add a volunteer role below to start filling spots."
              : totalSignups >= totalNeeded
              ? "All spots filled — well done!"
              : `Still need ${totalNeeded - totalSignups} more.`
          }
          accent={church.accentColor}
        />
        <Stat
          label="On website"
          value={g.isPublic ? "Yes" : "No"}
          hint={
            g.isPublic
              ? "Anyone visiting your church website can see this."
              : "Hidden from the public site."
          }
          accent={church.primaryColor}
        />
      </div>

      {/* Registrations */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Sign-ups</h2>
          {g.capacity && (
            <span className="text-sm text-zinc-400">
              Capacity: {g.registrations.length} / {g.capacity}
            </span>
          )}
        </div>
        {g.registrations.length === 0 ? (
          <p className="text-zinc-400 mb-4">
            No-one has signed up yet. You can add someone manually below.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-800 mb-4">
            {g.registrations.map((r) => (
              <li key={r.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-zinc-100 font-medium">
                    {r.firstName} {r.lastName}
                    {r.partySize > 1 && (
                      <span className="text-zinc-500 text-sm ml-2">
                        +{r.partySize - 1} guest{r.partySize - 1 === 1 ? "" : "s"}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {[r.email, r.phone].filter(Boolean).join(" • ") ||
                      "No contact info"}
                  </p>
                </div>
                <span className="text-xs text-zinc-500">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
        <form
          action={async (fd) => {
            "use server";
            await addRegistration(g.id, fd);
          }}
          className="grid grid-cols-1 sm:grid-cols-5 gap-2"
        >
          <input
            type="text"
            name="firstName"
            required
            placeholder="First name"
            className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 text-white"
          />
          <input
            type="text"
            name="lastName"
            required
            placeholder="Last name"
            className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 text-white"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 text-white"
          />
          <input
            type="number"
            min={1}
            name="partySize"
            defaultValue={1}
            className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 text-white"
          />
          <button
            type="submit"
            className="rounded-xl px-4 font-semibold text-zinc-950"
            style={{ backgroundColor: church.accentColor }}
          >
            Add sign-up
          </button>
        </form>
      </section>

      {/* Volunteer roles */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="text-white font-semibold mb-4">Volunteer roles</h2>
        {g.volunteerRoles.length === 0 ? (
          <p className="text-zinc-400 mb-4">
            None yet. Try adding &ldquo;Ushers &mdash; 4 spots&rdquo; or &ldquo;Greeters &mdash; 2 spots&rdquo;.
          </p>
        ) : (
          <ul className="space-y-4 mb-5">
            {g.volunteerRoles.map((r) => {
              const ratio = r.signups.length / Math.max(1, r.slotsNeeded);
              const barColor =
                ratio >= 1 ? "#10b981" : ratio >= 0.5 ? "#f59e0b" : "#ef4444";
              return (
                <li
                  key={r.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-white font-medium">{r.name}</p>
                      {r.description && (
                        <p className="text-sm text-zinc-400 mt-0.5">{r.description}</p>
                      )}
                    </div>
                    <span className="text-sm text-zinc-300 font-medium">
                      {r.signups.length} / {r.slotsNeeded}
                    </span>
                  </div>
                  <div className="h-2 mt-3 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, ratio * 100)}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </div>
                  {r.signups.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {r.signups.map((s) => (
                        <li
                          key={s.id}
                          className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300"
                        >
                          {s.name}
                        </li>
                      ))}
                    </ul>
                  )}
                  <form
                    action={async () => {
                      "use server";
                      await deleteVolunteerRole(r.id, g.id);
                    }}
                    className="mt-3"
                  >
                    <button
                      type="submit"
                      className="text-xs text-zinc-500 hover:text-rose-400"
                    >
                      Remove role
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
        <form
          action={async (fd) => {
            "use server";
            await addVolunteerRole(g.id, fd);
          }}
          className="grid grid-cols-1 sm:grid-cols-5 gap-2"
        >
          <input
            type="text"
            name="name"
            required
            placeholder="Role name (e.g. Usher)"
            className="sm:col-span-2 rounded-xl bg-zinc-900 border border-zinc-700 px-3 text-white"
          />
          <input
            type="text"
            name="description"
            placeholder="Short description (optional)"
            className="sm:col-span-2 rounded-xl bg-zinc-900 border border-zinc-700 px-3 text-white"
          />
          <input
            type="number"
            min={1}
            name="slotsNeeded"
            defaultValue={1}
            className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 text-white"
          />
          <button
            type="submit"
            className="sm:col-span-5 rounded-xl px-4 py-3 font-semibold text-zinc-950"
            style={{ backgroundColor: church.accentColor }}
          >
            Add volunteer role
          </button>
        </form>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: number | string;
  hint: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <div className="text-xs uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="text-3xl font-bold text-white mt-1" style={{ color: accent }}>
        {value}
      </div>
      <p className="text-sm text-zinc-400 mt-2 leading-snug">{hint}</p>
    </div>
  );
}
