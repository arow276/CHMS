"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

export function PeopleFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`/people?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <input
        type="text"
        placeholder="Search people..."
        defaultValue={searchParams.get("search") ?? ""}
        onChange={(e) => updateFilter("search", e.target.value)}
        className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 w-64"
      />
      <select
        defaultValue={searchParams.get("status") ?? ""}
        onChange={(e) => updateFilter("status", e.target.value)}
        className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
      >
        <option value="">All Statuses</option>
        <option value="VISITOR">Visitor</option>
        <option value="REGULAR">Regular</option>
        <option value="MEMBER">Member</option>
        <option value="INACTIVE">Inactive</option>
      </select>
      <select
        defaultValue={searchParams.get("warmth") ?? ""}
        onChange={(e) => updateFilter("warmth", e.target.value)}
        className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
      >
        <option value="">All Warmth</option>
        <option value="HOT">Hot</option>
        <option value="WARM">Warm</option>
        <option value="LUKEWARM">Lukewarm</option>
        <option value="COOL">Cool</option>
        <option value="COLD">Cold</option>
      </select>
      {isPending && (
        <span className="text-xs text-zinc-500 self-center">Loading...</span>
      )}
    </div>
  );
}
