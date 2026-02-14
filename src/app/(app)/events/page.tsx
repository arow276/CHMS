import Link from "next/link";
import { getEvents } from "@/lib/dal/events";

const typeColors: Record<string, string> = {
  SUNDAY_SERVICE: "bg-amber-500/15 text-amber-400",
  SMALL_GROUP: "bg-indigo-500/15 text-indigo-400",
  SPECIAL_EVENT: "bg-green-500/15 text-green-400",
  CLASS: "bg-blue-500/15 text-blue-400",
  OTHER: "bg-zinc-500/15 text-zinc-400",
};

export default async function EventsPage() {
  const { events, total } = await getEvents();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-sm text-zinc-400 mt-1">{total} events</p>
        </div>
        <Link
          href="/events/new"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
        >
          New Event
        </Link>
      </div>

      <div className="border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Event
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Type
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Date
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Group
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Attendance
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {events.map((event) => (
              <tr
                key={event.id}
                className="hover:bg-zinc-900/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/events/${event.id}`}
                    className="text-white hover:text-amber-400 font-medium transition-colors"
                  >
                    {event.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                      typeColors[event.type] ?? typeColors.OTHER
                    }`}
                  >
                    {event.type.toLowerCase().replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400">
                  {new Date(event.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400">
                  {event.group ? (
                    <Link
                      href={`/groups/${event.group.id}`}
                      className="hover:text-white transition-colors"
                    >
                      {event.group.name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400 text-right">
                  {event._count.attendances}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {events.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          No events yet. Create one to start tracking attendance.
        </div>
      )}
    </div>
  );
}
