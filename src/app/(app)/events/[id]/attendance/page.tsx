import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventById } from "@/lib/dal/events";
import { db } from "@/lib/db";
import { AttendanceForm } from "@/components/app/events/attendance-form";

export default async function AttendancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  // Get all people to show in the attendance checklist
  // If event is linked to a group, prioritize group members
  let people;
  if (event.groupId) {
    const groupMembers = await db.groupMember.findMany({
      where: { groupId: event.groupId },
      include: { person: true },
      orderBy: { person: { lastName: "asc" } },
    });
    people = groupMembers.map((gm) => gm.person);
  } else {
    people = await db.person.findMany({
      where: { status: { not: "INACTIVE" } },
      orderBy: { lastName: "asc" },
    });
  }

  // Build a map of existing attendance records
  const existingAttendance = new Map(
    event.attendances.map((a) => [a.person.id, a.status])
  );

  const peopleWithAttendance = people.map((p) => ({
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    currentStatus: existingAttendance.get(p.id) ?? null,
  }));

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/events/${event.id}`}
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          &larr; Back to {event.name}
        </Link>
        <h1 className="text-2xl font-bold mt-2">Take Attendance</h1>
        <p className="text-sm text-zinc-400 mt-1">
          {event.name} &mdash; {new Date(event.date).toLocaleDateString()}
          {event.group && ` (${event.group.name})`}
        </p>
      </div>

      <AttendanceForm eventId={event.id} people={peopleWithAttendance} />
    </div>
  );
}
