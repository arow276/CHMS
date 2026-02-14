"use client";

import { useState, useTransition } from "react";
import { saveAttendance } from "@/lib/actions/events";
import { useRouter } from "next/navigation";

type PersonAttendance = {
  id: string;
  firstName: string;
  lastName: string;
  currentStatus: "PRESENT" | "ABSENT" | "LATE" | null;
};

export function AttendanceForm({
  eventId,
  people,
}: {
  eventId: string;
  people: PersonAttendance[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [statuses, setStatuses] = useState<Record<string, "PRESENT" | "ABSENT" | "LATE">>(() => {
    const initial: Record<string, "PRESENT" | "ABSENT" | "LATE"> = {};
    for (const p of people) {
      if (p.currentStatus) {
        initial[p.id] = p.currentStatus;
      }
    }
    return initial;
  });

  const filtered = people.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q)
    );
  });

  function togglePerson(personId: string) {
    setStatuses((prev) => {
      const current = prev[personId];
      if (!current) return { ...prev, [personId]: "PRESENT" };
      const next = { ...prev };
      delete next[personId];
      return next;
    });
  }

  function markAllPresent() {
    const all: Record<string, "PRESENT"> = {};
    for (const p of people) {
      all[p.id] = "PRESENT";
    }
    setStatuses(all);
  }

  function handleSave() {
    const records = Object.entries(statuses).map(([personId, status]) => ({
      personId,
      status,
    }));
    startTransition(async () => {
      await saveAttendance(eventId, records);
      router.push(`/events/${eventId}`);
    });
  }

  const checkedCount = Object.keys(statuses).length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter people..."
          className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
        <button
          onClick={markAllPresent}
          className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-sm text-white rounded-lg transition-colors whitespace-nowrap"
        >
          Mark All Present
        </button>
      </div>

      <div className="border border-zinc-800 rounded-lg divide-y divide-zinc-800 max-h-[60vh] overflow-y-auto">
        {filtered.map((p) => {
          const status = statuses[p.id];
          return (
            <label
              key={p.id}
              className="flex items-center justify-between px-4 py-3 hover:bg-zinc-900/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={!!status}
                  onChange={() => togglePerson(p.id)}
                  className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-amber-500 focus:ring-amber-500/50"
                />
                <span className="text-white text-sm">
                  {p.firstName} {p.lastName}
                </span>
              </div>
              {status && (
                <select
                  value={status}
                  onChange={(e) =>
                    setStatuses((prev) => ({
                      ...prev,
                      [p.id]: e.target.value as "PRESENT" | "LATE",
                    }))
                  }
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs bg-zinc-800 border border-zinc-700 text-white rounded px-2 py-1"
                >
                  <option value="PRESENT">Present</option>
                  <option value="LATE">Late</option>
                </select>
              )}
            </label>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-zinc-400">
          {checkedCount} of {people.length} checked
        </span>
        <button
          onClick={handleSave}
          disabled={isPending || checkedCount === 0}
          className="px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
        >
          {isPending ? "Saving..." : "Save Attendance"}
        </button>
      </div>
    </div>
  );
}
