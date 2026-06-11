import Link from "next/link";
import { getLiturgies } from "@/lib/dal/liturgy";
import { getTradition } from "@/lib/liturgy/traditions";
import { ColorChip } from "@/components/app/liturgy/color-chip";
import type { LiturgicalDay } from "@/lib/liturgy/types";

const statusColors: Record<string, string> = {
  DRAFT: "bg-zinc-500/15 text-zinc-400",
  FINAL: "bg-green-500/15 text-green-400",
};

export default async function LiturgyPage() {
  const { liturgies, total } = await getLiturgies();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Liturgy</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {total} {total === 1 ? "service" : "services"} planned
          </p>
        </div>
        <Link
          href="/liturgy/new"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
        >
          Plan a Liturgy
        </Link>
      </div>

      {liturgies.length > 0 ? (
        <div className="border border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Service</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Tradition</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Liturgical Day</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Color</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {liturgies.map((liturgy) => {
                const day = liturgy.liturgicalDay as unknown as LiturgicalDay;
                const tradition = getTradition(liturgy.tradition);
                return (
                  <tr key={liturgy.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/liturgy/${liturgy.id}`}
                        className="text-white hover:text-amber-400 font-medium transition-colors"
                      >
                        {liturgy.title}
                      </Link>
                      {liturgy.event && (
                        <div className="text-xs text-zinc-500 mt-0.5">
                          Linked to {liturgy.event.name}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">
                      {tradition?.shortName ?? liturgy.tradition}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">{day?.dayName ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-zinc-400">
                      {new Date(liturgy.date).toLocaleDateString("en-US", { timeZone: "UTC" })}
                    </td>
                    <td className="px-4 py-3">{day?.color ? <ColorChip color={day.color} /> : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[liturgy.status]}`}>
                        {liturgy.status.toLowerCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-zinc-800 rounded-lg py-16 text-center">
          <div className="text-4xl mb-3">⛪</div>
          <h2 className="text-lg font-semibold mb-1">No liturgies yet</h2>
          <p className="text-sm text-zinc-500 max-w-md mx-auto mb-6">
            Plan your first service — pick a tradition, a rite, and a date, and
            Shepherd will draft a complete, print-ready order of worship.
          </p>
          <Link
            href="/liturgy/new"
            className="inline-block px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
          >
            Plan a Liturgy
          </Link>
        </div>
      )}
    </div>
  );
}
