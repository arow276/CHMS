import Link from "next/link";
import { getDashboardData } from "@/lib/dal/dashboard";
import { WarmthBadge } from "@/components/app/warmth-badge";
import { RecalculateButton } from "@/components/app/dashboard/recalculate-button";
import type { WarmthLevel } from "@prisma/client";

const warmthOrder: WarmthLevel[] = ["HOT", "WARM", "LUKEWARM", "COOL", "COLD"];
const warmthColors: Record<WarmthLevel, string> = {
  HOT: "#ef4444",
  WARM: "#f59e0b",
  LUKEWARM: "#a3a3a3",
  COOL: "#6366f1",
  COLD: "#3b82f6",
};

export default async function DashboardPage() {
  const data = await getDashboardData();

  const distMap = new Map(data.warmthDistribution.map((d) => [d.label, d.count]));
  const totalForDist = data.warmthDistribution.reduce((s, d) => s + d.count, 0) || 1;
  const maxAttendance = Math.max(...data.attendanceTrend.map((t) => t.count), 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Link
            href="/events/new"
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors"
          >
            + Sunday Service
          </Link>
          <Link
            href="/people/new"
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors"
          >
            + Person
          </Link>
          <RecalculateButton />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total People" value={data.totalPeople} />
        <StatCard label="Avg Warmth" value={data.avgWarmth} />
        <StatCard label="Last Sunday" value={data.lastSundayAttendance} />
        <StatCard label="Active Groups" value={data.activeGroups} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Warmth Distribution */}
        <div className="border border-zinc-800 rounded-lg p-4">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
            Warmth Distribution
          </h2>
          <div className="space-y-2">
            {warmthOrder.map((level) => {
              const count = distMap.get(level) ?? 0;
              const pct = (count / totalForDist) * 100;
              return (
                <div key={level} className="flex items-center gap-3">
                  <span className="text-xs text-zinc-400 w-20 capitalize">
                    {level.toLowerCase()}
                  </span>
                  <div className="flex-1 h-5 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.max(pct, 2)}%`,
                        backgroundColor: warmthColors[level],
                      }}
                    />
                  </div>
                  <span className="text-xs text-zinc-500 w-8 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attendance Trend */}
        <div className="border border-zinc-800 rounded-lg p-4">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
            Sunday Attendance
          </h2>
          {data.attendanceTrend.length > 0 ? (
            <div className="flex items-end gap-2 h-32">
              {data.attendanceTrend.map((t, i) => {
                const height = (t.count / maxAttendance) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-zinc-400">{t.count}</span>
                    <div
                      className="w-full bg-amber-500/60 rounded-t transition-all"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <span className="text-[10px] text-zinc-600">
                      {new Date(t.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No Sunday services recorded yet</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Needs Attention */}
        <div className="border border-zinc-800 rounded-lg p-4">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
            Needs Attention
          </h2>
          {data.coolingPeople.length > 0 ? (
            <div className="space-y-3">
              {data.coolingPeople.map((p) => (
                <Link
                  key={p.id}
                  href={`/people/${p.id}`}
                  className="flex items-center justify-between hover:bg-zinc-900/50 p-2 -mx-2 rounded transition-colors"
                >
                  <div>
                    <span className="text-white text-sm font-medium">
                      {p.firstName} {p.lastName}
                    </span>
                    {p.lastAttended && (
                      <span className="text-xs text-zinc-500 ml-2">
                        Last seen {new Date(p.lastAttended).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <WarmthBadge label={p.warmthLabel} score={p.warmthScore} />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Everyone is engaged!</p>
          )}
        </div>

        {/* Recent Visitors */}
        <div className="border border-zinc-800 rounded-lg p-4">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
            Recent Visitors
          </h2>
          {data.recentVisitors.length > 0 ? (
            <div className="space-y-3">
              {data.recentVisitors.map((v) => (
                <Link
                  key={v.id}
                  href={`/people/${v.id}`}
                  className="flex items-center justify-between hover:bg-zinc-900/50 p-2 -mx-2 rounded transition-colors"
                >
                  <span className="text-white text-sm">
                    {v.firstName} {v.lastName}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {new Date(v.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No recent visitors</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-zinc-800 rounded-lg p-4">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-zinc-500 mt-1">{label}</div>
    </div>
  );
}
