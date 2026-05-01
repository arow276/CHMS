import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ensureChurch } from "@/lib/assistant/runner";
import { computeTheme } from "@/lib/website/theme";
import { addRegistration, addVolunteerSignup } from "@/lib/actions/gatherings";

export const dynamic = "force-dynamic";

export default async function PublicGatheringPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const church = await ensureChurch();
  const theme = computeTheme(church);
  const g = await db.gathering.findFirst({
    where: { id, isPublic: true, isPublished: true },
    include: {
      volunteerRoles: {
        include: { _count: { select: { signups: true } } },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { registrations: true } },
    },
  });
  if (!g) notFound();

  const seatsLeft = g.capacity ? Math.max(0, g.capacity - g._count.registrations) : null;

  return (
    <article className="max-w-3xl mx-auto px-5 py-12">
      <Link href="/website/events" className="text-sm underline" style={{ color: theme.primary }}>
        ← All events
      </Link>

      <header
        className="mt-4 rounded-2xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
          color: theme.onPrimary,
        }}
      >
        <div className="p-8">
          <p className="text-sm uppercase tracking-wider opacity-90">
            {g.startsAt.toLocaleString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            {" · "}
            {g.startsAt.toLocaleString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
          <h1 className="mt-2 text-3xl sm:text-5xl font-bold tracking-tight">{g.name}</h1>
          {g.location && (
            <p className="mt-3 opacity-95">📍 {g.location}</p>
          )}
        </div>
      </header>

      {g.summary && <p className="mt-6 text-lg leading-relaxed">{g.summary}</p>}
      {g.description && (
        <p className="mt-3 leading-relaxed whitespace-pre-line" style={{ color: theme.muted }}>
          {g.description}
        </p>
      )}

      {/* Sign-up form */}
      {g.registrationOpen ? (
        <section
          className="mt-10 rounded-2xl p-6"
          style={{ background: theme.primarySoft, border: `1px solid ${theme.border}` }}
        >
          <h2 className="text-2xl font-bold">Sign up</h2>
          <p className="mt-1" style={{ color: theme.muted }}>
            {seatsLeft === null
              ? "We'd love to see you there."
              : seatsLeft > 0
              ? `${seatsLeft} spot${seatsLeft === 1 ? "" : "s"} left.`
              : "We're full — but you can still ask to join the wait list below."}
          </p>
          <form
            action={async (fd) => {
              "use server";
              await addRegistration(g.id, fd);
            }}
            className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            <input
              name="firstName"
              required
              placeholder="First name"
              className="rounded-xl px-4 py-3 border w-full"
              style={{ background: theme.bg, color: theme.text, borderColor: theme.border }}
            />
            <input
              name="lastName"
              required
              placeholder="Last name"
              className="rounded-xl px-4 py-3 border w-full"
              style={{ background: theme.bg, color: theme.text, borderColor: theme.border }}
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="rounded-xl px-4 py-3 border w-full"
              style={{ background: theme.bg, color: theme.text, borderColor: theme.border }}
            />
            <input
              name="phone"
              type="tel"
              placeholder="Phone (optional)"
              className="rounded-xl px-4 py-3 border w-full"
              style={{ background: theme.bg, color: theme.text, borderColor: theme.border }}
            />
            <input
              name="partySize"
              type="number"
              min={1}
              defaultValue={1}
              placeholder="How many people?"
              className="rounded-xl px-4 py-3 border w-full"
              style={{ background: theme.bg, color: theme.text, borderColor: theme.border }}
            />
            <button
              type="submit"
              className="rounded-xl px-4 py-3 font-semibold sm:col-span-2"
              style={{ background: theme.primary, color: theme.onPrimary }}
            >
              Save my spot
            </button>
          </form>
        </section>
      ) : null}

      {/* Volunteer roles */}
      {g.volunteerRoles.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-bold">Help out</h2>
          <p className="mt-1" style={{ color: theme.muted }}>
            We&rsquo;d love your help &mdash; pick a role you&rsquo;d enjoy.
          </p>
          <ul className="mt-5 space-y-4">
            {g.volunteerRoles.map((r) => {
              const filled = r._count.signups;
              const ratio = filled / Math.max(1, r.slotsNeeded);
              return (
                <li
                  key={r.id}
                  className="rounded-2xl p-5"
                  style={{ background: theme.bg, border: `1px solid ${theme.border}` }}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-lg font-semibold">{r.name}</p>
                    <span className="text-sm" style={{ color: theme.muted }}>
                      {filled} / {r.slotsNeeded} filled
                    </span>
                  </div>
                  {r.description && (
                    <p className="mt-1 text-sm" style={{ color: theme.muted }}>
                      {r.description}
                    </p>
                  )}
                  <div
                    className="mt-3 h-2 rounded-full overflow-hidden"
                    style={{ background: theme.border }}
                  >
                    <div
                      className="h-full"
                      style={{
                        width: `${Math.min(100, ratio * 100)}%`,
                        background: ratio >= 1 ? "#10b981" : theme.accent,
                      }}
                    />
                  </div>
                  {filled < r.slotsNeeded ? (
                    <form
                      action={async (fd) => {
                        "use server";
                        await addVolunteerSignup(r.id, g.id, fd);
                      }}
                      className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2"
                    >
                      <input
                        name="name"
                        required
                        placeholder="Your name"
                        className="rounded-xl px-3 py-2 border"
                        style={{
                          background: theme.bg,
                          color: theme.text,
                          borderColor: theme.border,
                        }}
                      />
                      <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        className="rounded-xl px-3 py-2 border"
                        style={{
                          background: theme.bg,
                          color: theme.text,
                          borderColor: theme.border,
                        }}
                      />
                      <button
                        type="submit"
                        className="rounded-xl px-3 py-2 font-semibold"
                        style={{ background: theme.accent, color: theme.onAccent }}
                      >
                        I&rsquo;ll help
                      </button>
                    </form>
                  ) : (
                    <p
                      className="mt-3 text-sm font-medium"
                      style={{ color: "#10b981" }}
                    >
                      All spots filled — thank you!
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </article>
  );
}
