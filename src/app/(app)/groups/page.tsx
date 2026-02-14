import Link from "next/link";
import { getGroups } from "@/lib/dal/groups";
import { WarmthBadge } from "@/components/app/warmth-badge";
import type { WarmthLevel } from "@prisma/client";

function scoreToLabel(score: number): WarmthLevel {
  if (score >= 80) return "HOT";
  if (score >= 60) return "WARM";
  if (score >= 40) return "LUKEWARM";
  if (score >= 20) return "COOL";
  return "COLD";
}

export default async function GroupsPage() {
  const { groups, total } = await getGroups();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Groups</h1>
          <p className="text-sm text-zinc-400 mt-1">{total} groups</p>
        </div>
        <Link
          href="/groups/new"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
        >
          New Group
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((g) => {
          const avgWarmth =
            g.members.length > 0
              ? Math.round(
                  g.members.reduce((s, m) => s + m.person.warmthScore, 0) /
                    g.members.length
                )
              : 0;
          return (
            <Link
              key={g.id}
              href={`/groups/${g.id}`}
              className="border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-medium text-white">{g.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 capitalize">
                  {g.type.toLowerCase().replace("_", " ")}
                </span>
              </div>
              {g.description && (
                <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                  {g.description}
                </p>
              )}
              <div className="flex items-center gap-3 mt-3 text-xs text-zinc-400">
                <span>{g.members.length} members</span>
                {g.meetingDay && (
                  <span>
                    {g.meetingDay}
                    {g.meetingTime ? ` ${g.meetingTime}` : ""}
                  </span>
                )}
              </div>
              {g.members.length > 0 && (
                <div className="mt-2">
                  <WarmthBadge label={scoreToLabel(avgWarmth)} score={avgWarmth} />
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          No groups yet. Create one to organize your people.
        </div>
      )}
    </div>
  );
}
