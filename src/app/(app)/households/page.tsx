import Link from "next/link";
import { getHouseholds } from "@/lib/dal/households";
import { WarmthBadge } from "@/components/app/warmth-badge";

export default async function HouseholdsPage() {
  const { households, total } = await getHouseholds();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Households</h1>
          <p className="text-sm text-zinc-400 mt-1">{total} households</p>
        </div>
        <Link
          href="/households/new"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
        >
          Add Household
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {households.map((h) => (
          <Link
            key={h.id}
            href={`/households/${h.id}`}
            className="border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
          >
            <h3 className="font-medium text-white">{h.name}</h3>
            {h.address && (
              <p className="text-xs text-zinc-500 mt-1">{h.address}</p>
            )}
            <div className="mt-3 space-y-1">
              {h.members.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-300">
                    {m.firstName} {m.lastName}
                    <span className="text-zinc-600 ml-1 capitalize text-xs">
                      ({m.householdRole.toLowerCase()})
                    </span>
                  </span>
                  <WarmthBadge label={m.warmthLabel} score={m.warmthScore} showScore={false} />
                </div>
              ))}
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              {h.members.length} member{h.members.length !== 1 ? "s" : ""}
            </p>
          </Link>
        ))}
      </div>

      {households.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          No households yet. Create one to group family members.
        </div>
      )}
    </div>
  );
}
