import { WarmthLevel } from "@prisma/client";

const warmthConfig: Record<WarmthLevel, { bg: string; text: string; label: string }> = {
  HOT: { bg: "bg-red-500/15", text: "text-red-400", label: "Hot" },
  WARM: { bg: "bg-amber-500/15", text: "text-amber-400", label: "Warm" },
  LUKEWARM: { bg: "bg-zinc-500/15", text: "text-zinc-400", label: "Lukewarm" },
  COOL: { bg: "bg-indigo-500/15", text: "text-indigo-400", label: "Cool" },
  COLD: { bg: "bg-blue-500/15", text: "text-blue-400", label: "Cold" },
};

export function WarmthBadge({
  label,
  score,
  showScore = true,
}: {
  label: WarmthLevel;
  score: number;
  showScore?: boolean;
}) {
  const config = warmthConfig[label];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
      {showScore && <span className="opacity-75">{score}</span>}
    </span>
  );
}
