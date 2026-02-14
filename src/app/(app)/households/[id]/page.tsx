import { notFound } from "next/navigation";
import Link from "next/link";
import { getHouseholdById } from "@/lib/dal/households";
import { WarmthBadge } from "@/components/app/warmth-badge";
import { AddMemberToHousehold } from "@/components/app/households/add-member";

export default async function HouseholdDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const household = await getHouseholdById(id);
  if (!household) notFound();

  const avgWarmth =
    household.members.length > 0
      ? Math.round(
          household.members.reduce((sum, m) => sum + m.warmthScore, 0) /
            household.members.length
        )
      : 0;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/households"
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          &larr; Back to Households
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">{household.name}</h1>
        {household.address && (
          <p className="text-sm text-zinc-400 mt-1">{household.address}</p>
        )}
        <p className="text-sm text-zinc-500 mt-1">
          Average warmth: {avgWarmth}
        </p>
      </div>

      <div className="border border-zinc-800 rounded-lg p-4 mb-6">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
          Members
        </h2>
        {household.members.length > 0 ? (
          <div className="space-y-3">
            {household.members.map((m) => (
              <div key={m.id} className="flex items-center justify-between">
                <div>
                  <Link
                    href={`/people/${m.id}`}
                    className="text-white hover:text-amber-400 font-medium transition-colors"
                  >
                    {m.firstName} {m.lastName}
                  </Link>
                  <span className="text-xs text-zinc-500 ml-2 capitalize">
                    {m.householdRole.toLowerCase()}
                  </span>
                </div>
                <WarmthBadge label={m.warmthLabel} score={m.warmthScore} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No members yet</p>
        )}
      </div>

      <AddMemberToHousehold householdId={household.id} />
    </div>
  );
}
