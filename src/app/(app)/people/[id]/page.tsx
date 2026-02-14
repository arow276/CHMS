import { notFound } from "next/navigation";
import Link from "next/link";
import { getPersonById } from "@/lib/dal/people";
import { WarmthBadge } from "@/components/app/warmth-badge";
import { DeletePersonButton } from "@/components/app/people/delete-person-button";

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = await getPersonById(id);
  if (!person) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/people"
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          &larr; Back to People
        </Link>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              {person.firstName} {person.lastName}
            </h1>
            <WarmthBadge label={person.warmthLabel} score={person.warmthScore} />
          </div>
          <div className="flex items-center gap-3 mt-2 text-sm text-zinc-400">
            <span className="capitalize">{person.status.toLowerCase()}</span>
            {person.gender && (
              <>
                <span>&middot;</span>
                <span className="capitalize">
                  {person.gender.toLowerCase().replace("_", " ")}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/people/${person.id}/edit`}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors"
          >
            Edit
          </Link>
          <DeletePersonButton id={person.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="border border-zinc-800 rounded-lg p-4">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
            Contact
          </h2>
          <div className="space-y-2 text-sm">
            {person.email && (
              <div>
                <span className="text-zinc-500">Email:</span>{" "}
                <span className="text-white">{person.email}</span>
              </div>
            )}
            {person.phone && (
              <div>
                <span className="text-zinc-500">Phone:</span>{" "}
                <span className="text-white">{person.phone}</span>
              </div>
            )}
            {person.dateOfBirth && (
              <div>
                <span className="text-zinc-500">Birthday:</span>{" "}
                <span className="text-white">
                  {new Date(person.dateOfBirth).toLocaleDateString()}
                </span>
              </div>
            )}
            {person.notes && (
              <div className="mt-3 pt-3 border-t border-zinc-800">
                <span className="text-zinc-500">Notes:</span>
                <p className="text-white mt-1">{person.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Household */}
        <div className="border border-zinc-800 rounded-lg p-4">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
            Household
          </h2>
          {person.household ? (
            <div>
              <Link
                href={`/households/${person.household.id}`}
                className="text-white hover:text-amber-400 font-medium transition-colors"
              >
                {person.household.name}
              </Link>
              <p className="text-xs text-zinc-500 mt-1 capitalize">
                {person.householdRole.toLowerCase()}
              </p>
              <div className="mt-3 space-y-1">
                {person.household.members
                  .filter((m) => m.id !== person.id)
                  .map((m) => (
                    <Link
                      key={m.id}
                      href={`/people/${m.id}`}
                      className="block text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                      {m.firstName} {m.lastName}
                    </Link>
                  ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Not assigned to a household</p>
          )}
        </div>

        {/* Groups */}
        <div className="border border-zinc-800 rounded-lg p-4">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
            Groups
          </h2>
          {person.groupMemberships.length > 0 ? (
            <div className="space-y-2">
              {person.groupMemberships.map((gm) => (
                <Link
                  key={gm.id}
                  href={`/groups/${gm.group.id}`}
                  className="block"
                >
                  <div className="text-white hover:text-amber-400 font-medium text-sm transition-colors">
                    {gm.group.name}
                  </div>
                  <div className="text-xs text-zinc-500 capitalize">
                    {gm.role.toLowerCase().replace("_", " ")}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Not in any groups</p>
          )}
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="mt-6 border border-zinc-800 rounded-lg p-4">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
          Recent Attendance
        </h2>
        {person.attendances.length > 0 ? (
          <div className="space-y-2">
            {person.attendances.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <span className="text-white">{att.event.name}</span>
                  <span className="text-zinc-500 ml-2">
                    {new Date(att.event.date).toLocaleDateString()}
                  </span>
                </div>
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
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No attendance records</p>
        )}
      </div>
    </div>
  );
}
