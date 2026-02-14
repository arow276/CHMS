import Link from "next/link";
import { createEvent } from "@/lib/actions/events";
import { db } from "@/lib/db";

export default async function NewEventPage() {
  const groups = await db.group.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Default to next Sunday at 10:00 AM
  const now = new Date();
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  const defaultDate = nextSunday.toISOString().split("T")[0];

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/events"
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          &larr; Back to Events
        </Link>
        <h1 className="text-2xl font-bold mt-2">New Event</h1>
      </div>

      <form action={createEvent} className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Event Name *
          </label>
          <input
            name="name"
            required
            defaultValue="Sunday Service"
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Type *
          </label>
          <select
            name="type"
            required
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="SUNDAY_SERVICE">Sunday Service</option>
            <option value="SMALL_GROUP">Small Group</option>
            <option value="SPECIAL_EVENT">Special Event</option>
            <option value="CLASS">Class</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Date *
          </label>
          <input
            name="date"
            type="date"
            required
            defaultValue={defaultDate}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Linked Group
          </label>
          <select
            name="groupId"
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="">None (open to all)</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            rows={2}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
        >
          Create Event
        </button>
      </form>
    </div>
  );
}
