import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventById } from "@/lib/dal/events";
import { WarmthBadge } from "@/components/app/warmth-badge";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  const present = event.attendances.filter((a) => a.status === "PRESENT");
  const late = event.attendances.filter((a) => a.status === "LATE");

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/events"
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          &larr; Back to Events
        </Link>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{event.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-zinc-400">
            <span>{new Date(event.date).toLocaleDateString()}</span>
            <span className="capitalize">
              {event.type.toLowerCase().replace("_", " ")}
            </span>
            {event.group && (
              <Link
                href={`/groups/${event.group.id}`}
                className="text-amber-400 hover:text-amber-300 transition-colors"
              >
                {event.group.name}
              </Link>
            )}
          </div>
          {event.description && (
            <p className="text-sm text-zinc-500 mt-2">{event.description}</p>
          )}
        </div>
        <Link
          href={`/events/${event.id}/attendance`}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
        >
          Take Attendance
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="border border-zinc-800 rounded-lg p-4 flex-1 text-center">
          <div className="text-2xl font-bold text-white">{present.length}</div>
          <div className="text-xs text-zinc-500">Present</div>
        </div>
        <div className="border border-zinc-800 rounded-lg p-4 flex-1 text-center">
          <div className="text-2xl font-bold text-white">{late.length}</div>
          <div className="text-xs text-zinc-500">Late</div>
        </div>
        <div className="border border-zinc-800 rounded-lg p-4 flex-1 text-center">
          <div className="text-2xl font-bold text-white">
            {event.attendances.length}
          </div>
          <div className="text-xs text-zinc-500">Total Recorded</div>
        </div>
      </div>

      {event.attendances.length > 0 && (
        <div className="border border-zinc-800 rounded-lg p-4">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
            Attendance
          </h2>
          <div className="space-y-2">
            {event.attendances.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between text-sm"
              >
                <Link
                  href={`/people/${att.person.id}`}
                  className="text-white hover:text-amber-400 transition-colors"
                >
                  {att.person.firstName} {att.person.lastName}
                </Link>
                <div className="flex items-center gap-2">
                  <WarmthBadge
                    label={att.person.warmthLabel}
                    score={att.person.warmthScore}
                    showScore={false}
                  />
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      att.status === "PRESENT"
                        ? "bg-green-500/15 text-green-400"
                        : att.status === "LATE"
                        ? "bg-yellow-500/15 text-yellow-400"
                        : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {att.status.toLowerCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
