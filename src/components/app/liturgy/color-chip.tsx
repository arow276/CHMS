// Small badge for liturgical colors. No hooks — usable from both server and
// client components.

const COLOR_STYLES: Record<string, { dot: string; chip: string }> = {
  violet: { dot: "bg-purple-500", chip: "bg-purple-500/15 text-purple-300" },
  purple: { dot: "bg-purple-500", chip: "bg-purple-500/15 text-purple-300" },
  blue: { dot: "bg-blue-500", chip: "bg-blue-500/15 text-blue-300" },
  rose: { dot: "bg-pink-400", chip: "bg-pink-400/15 text-pink-300" },
  white: { dot: "bg-zinc-100", chip: "bg-zinc-100/10 text-zinc-200" },
  gold: { dot: "bg-yellow-400", chip: "bg-yellow-400/15 text-yellow-300" },
  green: { dot: "bg-green-500", chip: "bg-green-500/15 text-green-300" },
  red: { dot: "bg-red-500", chip: "bg-red-500/15 text-red-300" },
  scarlet: { dot: "bg-red-600", chip: "bg-red-600/15 text-red-300" },
  black: { dot: "bg-zinc-600", chip: "bg-zinc-600/20 text-zinc-300" },
  none: { dot: "bg-zinc-700", chip: "bg-zinc-700/20 text-zinc-400" },
};

export function liturgicalColorStyle(color: string) {
  const key = color.toLowerCase().split(/[\s(]/)[0];
  return COLOR_STYLES[key] ?? COLOR_STYLES.none;
}

export function ColorChip({ color }: { color: string }) {
  const style = liturgicalColorStyle(color);
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full capitalize ${style.chip}`}>
      <span className={`w-2 h-2 rounded-full ${style.dot}`} />
      {color}
    </span>
  );
}
