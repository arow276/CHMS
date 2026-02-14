"use client";

import { deletePerson } from "@/lib/actions/people";
import { useTransition } from "react";

export function DeletePersonButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm("Are you sure you want to delete this person?")) {
          startTransition(() => deletePerson(id));
        }
      }}
      disabled={isPending}
      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm rounded-lg transition-colors disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
