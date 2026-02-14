"use client";

import { useTransition } from "react";
import { removeGroupMember } from "@/lib/actions/groups";

export function RemoveGroupMemberButton({
  membershipId,
  groupId,
}: {
  membershipId: string;
  groupId: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm("Remove this member from the group?")) {
          startTransition(() => removeGroupMember(membershipId, groupId));
        }
      }}
      disabled={isPending}
      className="text-xs text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-50"
      title="Remove from group"
    >
      &times;
    </button>
  );
}
