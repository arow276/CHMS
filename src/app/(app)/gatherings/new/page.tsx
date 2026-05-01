import Link from "next/link";
import { createGathering } from "@/lib/actions/gatherings";
import { ensureChurch } from "@/lib/assistant/runner";

export const dynamic = "force-dynamic";

export default async function NewGatheringPage() {
  const church = await ensureChurch();
  const defaultStart = nextSundayAt10();
  return (
    <div className="easy max-w-2xl mx-auto pb-24">
      <Link href="/gatherings" className="text-sm text-zinc-400 hover:text-white">
        ← Back to gatherings
      </Link>
      <h1 className="text-white font-bold mt-3">New gathering</h1>
      <p className="text-zinc-400 mt-1">
        Calendar entry, registration, and volunteer roles all live in one place.
      </p>

      <form action={createGathering} className="mt-8 space-y-5">
        <Field label="Name" required>
          <input
            type="text"
            name="name"
            required
            placeholder="Sunday Service, Easter Picnic, Youth Pizza Night…"
            className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 text-white"
          />
        </Field>

        <Field label="Type">
          <select
            name="category"
            defaultValue="EVENT"
            className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 text-white"
          >
            <option value="WORSHIP_SERVICE">Worship Service</option>
            <option value="EVENT">Event</option>
            <option value="CLASS">Class</option>
            <option value="SMALL_GROUP">Small Group</option>
            <option value="MEETING">Meeting</option>
            <option value="OUTREACH">Outreach</option>
            <option value="KIDS">Kids</option>
            <option value="YOUTH">Youth</option>
            <option value="OTHER">Other</option>
          </select>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Starts" required>
            <input
              type="datetime-local"
              name="startsAt"
              required
              defaultValue={toLocalDatetime(defaultStart)}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 text-white"
            />
          </Field>
          <Field label="Ends (optional)">
            <input
              type="datetime-local"
              name="endsAt"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 text-white"
            />
          </Field>
        </div>

        <Field label="Where">
          <input
            type="text"
            name="location"
            placeholder="The sanctuary, Fellowship hall, Zoom…"
            className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 text-white"
          />
        </Field>

        <Field label="Short description (shown on website)">
          <textarea
            name="summary"
            rows={3}
            placeholder="One or two friendly sentences."
            className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 text-white"
          />
        </Field>

        <fieldset className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <legend className="px-2 text-sm uppercase tracking-wider text-zinc-400">
            Sign-ups
          </legend>
          <label className="flex items-center gap-3 mt-2">
            <input
              type="checkbox"
              name="registrationOpen"
              className="h-5 w-5 rounded"
              style={{ accentColor: church.accentColor }}
            />
            <span className="text-zinc-200">Let people sign up on our website</span>
          </label>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Capacity (optional)">
              <input
                type="number"
                name="capacity"
                min={0}
                placeholder="Leave blank for unlimited"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 text-white"
              />
            </Field>
            <Field label="Cost in cents (0 for free)">
              <input
                type="number"
                name="costCents"
                min={0}
                defaultValue={0}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 text-white"
              />
            </Field>
          </div>
        </fieldset>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="isPublic"
            defaultChecked
            className="h-5 w-5 rounded"
            style={{ accentColor: church.accentColor }}
          />
          <span className="text-zinc-200">Show this on our public website</span>
        </label>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="rounded-xl px-6 py-3 font-semibold text-zinc-950"
            style={{ backgroundColor: church.accentColor }}
          >
            Save gathering
          </button>
          <Link
            href="/gatherings"
            className="rounded-xl px-6 py-3 font-semibold border border-zinc-700 text-zinc-200 hover:bg-zinc-800"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm text-zinc-300 mb-1">
        {label}
        {required && <span className="text-rose-400 ml-1">*</span>}
      </span>
      {children}
    </label>
  );
}

function nextSundayAt10() {
  const d = new Date();
  d.setHours(10, 0, 0, 0);
  const days = (7 - d.getDay()) % 7 || 7;
  d.setDate(d.getDate() + days);
  return d;
}

function toLocalDatetime(d: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}`;
}
