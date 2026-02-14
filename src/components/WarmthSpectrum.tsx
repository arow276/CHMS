"use client";

interface PersonWarmth {
  name: string;
  score: number;
  trend: "up" | "down" | "stable";
  detail: string;
}

const people: PersonWarmth[] = [
  { name: "Rachel Johnson", score: 92, trend: "up", detail: "Leads Bible study, active in 3 ministries, mentoring 2 new members" },
  { name: "Sarah Mitchell", score: 85, trend: "stable", detail: "Weekly attendance, Life Group regular, volunteering in kids ministry" },
  { name: "James Kim", score: 68, trend: "down", detail: "Attendance steady but dropped men's group. No new connections in 60 days" },
  { name: "Maria Lopez", score: 55, trend: "down", detail: "3 visits in January, 1 in February. Attended newcomer lunch but no follow-up" },
  { name: "David Reed", score: 32, trend: "down", detail: "Twice monthly → once monthly. No small group. Last personal contact: 6 weeks ago" },
  { name: "Tom Wallace", score: 12, trend: "down", detail: "4 weeks absent. Left Life Group. Lost family member recently. Needs care." },
];

function warmthLabel(score: number): { label: string; color: string; bg: string } {
  if (score >= 80) return { label: "Hot", color: "text-red-400", bg: "bg-red-500" };
  if (score >= 60) return { label: "Warm", color: "text-amber-400", bg: "bg-amber-500" };
  if (score >= 40) return { label: "Lukewarm", color: "text-zinc-400", bg: "bg-zinc-500" };
  if (score >= 20) return { label: "Cool", color: "text-indigo-400", bg: "bg-indigo-500" };
  return { label: "Cold", color: "text-blue-400", bg: "bg-blue-500" };
}

function trendIcon(trend: "up" | "down" | "stable") {
  if (trend === "up") return <span className="text-green-500 text-xs">↑</span>;
  if (trend === "down") return <span className="text-red-400 text-xs">↓</span>;
  return <span className="text-zinc-500 text-xs">→</span>;
}

export function WarmthSpectrum() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-2">
      {people.map((person) => {
        const w = warmthLabel(person.score);
        return (
          <div
            key={person.name}
            className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3 group hover:border-zinc-700 transition-colors"
          >
            {/* Warmth bar */}
            <div className="w-24 shrink-0">
              <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${w.bg} transition-all duration-700`}
                  style={{ width: `${person.score}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className={`text-[10px] font-medium ${w.color}`}>{w.label}</span>
                <span className="text-[10px] text-zinc-600">{person.score}</span>
              </div>
            </div>

            {/* Name and trend */}
            <div className="flex items-center gap-1.5 w-36 shrink-0">
              {trendIcon(person.trend)}
              <span className="text-sm text-zinc-200 truncate">{person.name}</span>
            </div>

            {/* Detail */}
            <p className="text-xs text-zinc-500 leading-relaxed hidden sm:block">{person.detail}</p>
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-4">
        {[
          { label: "Hot", color: "bg-red-500" },
          { label: "Warm", color: "bg-amber-500" },
          { label: "Lukewarm", color: "bg-zinc-500" },
          { label: "Cool", color: "bg-indigo-500" },
          { label: "Cold", color: "bg-blue-500" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${item.color}`} />
            <span className="text-[10px] text-zinc-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
