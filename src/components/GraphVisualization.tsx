"use client";

export function GraphVisualization() {
  const nodes = [
    { id: "sarah", label: "Sarah M.", x: 200, y: 80, warmth: "hot", size: 28 },
    { id: "james", label: "James K.", x: 90, y: 180, warmth: "warm", size: 24 },
    { id: "maria", label: "Maria L.", x: 320, y: 170, warmth: "hot", size: 26 },
    { id: "david", label: "David R.", x: 50, y: 310, warmth: "cool", size: 22 },
    { id: "group", label: "Life Group", x: 200, y: 270, warmth: "warm", size: 30, isGroup: true },
    { id: "tom", label: "Tom W.", x: 360, y: 300, warmth: "cold", size: 20 },
    { id: "sunday", label: "Sunday AM", x: 140, y: 380, warmth: "warm", size: 26, isEvent: true },
    { id: "lisa", label: "Lisa P.", x: 300, y: 400, warmth: "lukewarm", size: 22 },
  ];

  const edges = [
    { from: "sarah", to: "james", strength: 3 },
    { from: "sarah", to: "maria", strength: 3 },
    { from: "sarah", to: "group", strength: 2 },
    { from: "james", to: "group", strength: 2 },
    { from: "james", to: "david", strength: 1 },
    { from: "maria", to: "group", strength: 2 },
    { from: "maria", to: "tom", strength: 1 },
    { from: "group", to: "sunday", strength: 2 },
    { from: "david", to: "sunday", strength: 1 },
    { from: "lisa", to: "sunday", strength: 1 },
    { from: "lisa", to: "tom", strength: 1 },
  ];

  const warmthColor: Record<string, string> = {
    hot: "#ef4444",
    warm: "#f59e0b",
    lukewarm: "#a3a3a3",
    cool: "#6366f1",
    cold: "#3b82f6",
  };

  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <svg viewBox="0 0 420 480" className="w-full h-full">
      <defs>
        {nodes.map((node) => (
          <radialGradient key={`glow-${node.id}`} id={`glow-${node.id}`}>
            <stop offset="0%" stopColor={warmthColor[node.warmth]} stopOpacity="0.4" />
            <stop offset="100%" stopColor={warmthColor[node.warmth]} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>

      {/* Edges */}
      {edges.map((edge, i) => {
        const from = nodeMap[edge.from];
        const to = nodeMap[edge.to];
        return (
          <line
            key={i}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="#3f3f46"
            strokeWidth={edge.strength * 0.8}
            strokeOpacity={0.5 + edge.strength * 0.15}
            strokeDasharray={edge.strength === 1 ? "4 4" : "none"}
          />
        );
      })}

      {/* Node glows */}
      {nodes.map((node) => (
        <circle
          key={`glow-circle-${node.id}`}
          cx={node.x}
          cy={node.y}
          r={node.size * 2}
          fill={`url(#glow-${node.id})`}
          className="animate-pulse-warm"
          style={{ animationDelay: `${Math.random() * 2}s` }}
        />
      ))}

      {/* Nodes */}
      {nodes.map((node) => (
        <g key={node.id}>
          <circle
            cx={node.x}
            cy={node.y}
            r={node.size}
            fill="#18181b"
            stroke={warmthColor[node.warmth]}
            strokeWidth={2}
          />
          {node.isGroup && (
            <text
              x={node.x}
              y={node.y - 2}
              textAnchor="middle"
              fontSize="14"
              fill={warmthColor[node.warmth]}
            >
              G
            </text>
          )}
          {node.isEvent && (
            <text
              x={node.x}
              y={node.y - 2}
              textAnchor="middle"
              fontSize="14"
              fill={warmthColor[node.warmth]}
            >
              E
            </text>
          )}
          {!node.isGroup && !node.isEvent && (
            <text
              x={node.x}
              y={node.y - 1}
              textAnchor="middle"
              fontSize="12"
              fill={warmthColor[node.warmth]}
              fontWeight="600"
            >
              {node.label.charAt(0)}
            </text>
          )}
          <text
            x={node.x}
            y={node.y + node.size + 14}
            textAnchor="middle"
            fontSize="11"
            fill="#a1a1aa"
            fontFamily="var(--font-geist-sans), system-ui"
          >
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function DatabaseTable() {
  const rows = [
    { id: "001", name: "Sarah Mitchell", email: "sarah@email.com", phone: "555-0123", status: "Member" },
    { id: "002", name: "James Kim", email: "james@email.com", phone: "555-0456", status: "Member" },
    { id: "003", name: "Maria Lopez", email: "maria@email.com", phone: "555-0789", status: "Visitor" },
    { id: "004", name: "David Reed", email: "david@email.com", phone: "555-0321", status: "Member" },
    { id: "005", name: "Tom Wallace", email: "tom@email.com", phone: "555-0654", status: "Inactive" },
    { id: "006", name: "Lisa Park", email: "lisa@email.com", phone: "555-0987", status: "Visitor" },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-mono">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800 text-zinc-500">
            <th className="px-3 py-2 text-left font-medium">ID</th>
            <th className="px-3 py-2 text-left font-medium">Name</th>
            <th className="px-3 py-2 text-left font-medium hidden sm:table-cell">Email</th>
            <th className="px-3 py-2 text-left font-medium hidden md:table-cell">Phone</th>
            <th className="px-3 py-2 text-left font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-zinc-800/50 text-zinc-400">
              <td className="px-3 py-2 text-zinc-600">{row.id}</td>
              <td className="px-3 py-2">{row.name}</td>
              <td className="px-3 py-2 hidden sm:table-cell text-zinc-600">{row.email}</td>
              <td className="px-3 py-2 hidden md:table-cell text-zinc-600">{row.phone}</td>
              <td className="px-3 py-2">
                <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] ${
                  row.status === "Member" ? "bg-zinc-800 text-zinc-400" :
                  row.status === "Visitor" ? "bg-zinc-800 text-zinc-500" :
                  "bg-zinc-900 text-zinc-600"
                }`}>
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
