import Link from "next/link";
import { WarmthBadge } from "@/components/app/warmth-badge";
import type { PersonWithRelations } from "@/lib/dal/people";

export function PeopleTable({ people }: { people: PersonWithRelations[] }) {
  if (people.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        No people found. Add someone to get started.
      </div>
    );
  }

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/50">
            <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Name
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Status
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Warmth
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Household
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Groups
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {people.map((person) => (
            <tr
              key={person.id}
              className="hover:bg-zinc-900/50 transition-colors"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/people/${person.id}`}
                  className="text-white hover:text-amber-400 font-medium transition-colors"
                >
                  {person.firstName} {person.lastName}
                </Link>
                {person.email && (
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {person.email}
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 capitalize">
                  {person.status.toLowerCase()}
                </span>
              </td>
              <td className="px-4 py-3">
                <WarmthBadge label={person.warmthLabel} score={person.warmthScore} />
              </td>
              <td className="px-4 py-3 text-sm text-zinc-400">
                {person.household?.name ?? "—"}
              </td>
              <td className="px-4 py-3 text-sm text-zinc-400">
                {person.groupMemberships.length > 0
                  ? person.groupMemberships.map((gm) => gm.group.name).join(", ")
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
