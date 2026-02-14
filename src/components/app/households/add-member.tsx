"use client";

import { useState, useTransition } from "react";
import { searchPeople } from "@/lib/actions/groups";
import { addMemberToHousehold } from "@/lib/actions/households";

export function AddMemberToHousehold({ householdId }: { householdId: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [role, setRole] = useState("MEMBER");
  const [isPending, startTransition] = useTransition();
  const [showSearch, setShowSearch] = useState(false);

  async function handleSearch(q: string) {
    setQuery(q);
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const people = await searchPeople(q);
    setResults(people);
  }

  function handleAdd(personId: string) {
    startTransition(async () => {
      await addMemberToHousehold(householdId, personId, role);
      setQuery("");
      setResults([]);
      setShowSearch(false);
    });
  }

  if (!showSearch) {
    return (
      <button
        onClick={() => setShowSearch(true)}
        className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
      >
        + Add Member
      </button>
    );
  }

  return (
    <div className="border border-zinc-800 rounded-lg p-4">
      <h3 className="text-sm font-medium text-zinc-300 mb-3">Add Member</h3>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name..."
          className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white"
        >
          <option value="HEAD">Head</option>
          <option value="SPOUSE">Spouse</option>
          <option value="CHILD">Child</option>
          <option value="MEMBER">Member</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
      {results.length > 0 && (
        <div className="space-y-1">
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => handleAdd(p.id)}
              disabled={isPending}
              className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded transition-colors disabled:opacity-50"
            >
              {p.firstName} {p.lastName}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setShowSearch(false)}
        className="mt-2 text-xs text-zinc-500 hover:text-white transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}
