import { notFound } from "next/navigation";
import Link from "next/link";
import { getGroupById } from "@/lib/dal/groups";
import { WarmthBadge } from "@/components/app/warmth-badge";
import { AddGroupMemberWidget } from "@/components/app/groups/add-member";
import { RemoveGroupMemberButton } from "@/components/app/groups/remove-member";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const group = await getGroupById(id);
  if (!group) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/groups"
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          &larr; Back to Groups
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{group.name}</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 capitalize">
            {group.type.toLowerCase().replace("_", " ")}
          </span>
        </div>
        {group.description && (
          <p className="text-sm text-zinc-400 mt-1">{group.description}</p>
        )}
        {group.meetingDay && (
          <p className="text-sm text-zinc-500 mt-1">
            Meets {group.meetingDay}
            {group.meetingTime ? ` at ${group.meetingTime}` : ""}
          </p>
        )}
      </div>

      <div className="border border-zinc-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
            Members ({group.members.length})
          </h2>
        </div>
        {group.members.length > 0 ? (
          <div className="space-y-2">
            {group.members.map((gm) => (
              <div key={gm.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/people/${gm.person.id}`}
                    className="text-white hover:text-amber-400 font-medium text-sm transition-colors"
                  >
                    {gm.person.firstName} {gm.person.lastName}
                  </Link>
                  <span className="text-xs text-zinc-500 capitalize">
                    {gm.role.toLowerCase().replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <WarmthBadge
                    label={gm.person.warmthLabel}
                    score={gm.person.warmthScore}
                  />
                  <RemoveGroupMemberButton
                    membershipId={gm.id}
                    groupId={group.id}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No members yet</p>
        )}
      </div>

      <AddGroupMemberWidget groupId={group.id} />

      {group.events.length > 0 && (
        <div className="border border-zinc-800 rounded-lg p-4 mt-6">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
            Recent Events
          </h2>
          <div className="space-y-2">
            {group.events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="flex items-center justify-between text-sm hover:bg-zinc-900/50 p-2 rounded transition-colors"
              >
                <span className="text-white">{event.name}</span>
                <div className="flex items-center gap-3 text-zinc-400">
                  <span>{event._count.attendances} attended</span>
                  <span>
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
