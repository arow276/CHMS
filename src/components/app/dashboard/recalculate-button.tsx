"use client";

import { useTransition } from "react";
import { recalculateAllWarmthAction } from "@/lib/actions/warmth";

export function RecalculateButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          const count = await recalculateAllWarmthAction();
          alert(`Recalculated warmth for ${count} people.`);
        })
      }
      disabled={isPending}
      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
    >
      {isPending ? "Recalculating..." : "Recalculate Warmth"}
    </button>
  );
}
