"use client";

import { useState, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  alerts?: Alert[];
}

interface Alert {
  label: string;
  warmth: "hot" | "warm" | "cool" | "cold";
  detail: string;
}

const conversations: Message[][] = [
  [
    {
      role: "user",
      content: "Who's been cooling off lately?",
    },
    {
      role: "assistant",
      content:
        "I've noticed 3 people whose engagement has dropped significantly in the last 30 days:",
      alerts: [
        {
          label: "Tom Wallace",
          warmth: "cold",
          detail: "Hasn't attended in 4 weeks. Was in Life Group — stopped after March 2nd.",
        },
        {
          label: "David Reed",
          warmth: "cool",
          detail: "Attendance dropped from weekly to twice/month. No small group connections.",
        },
        {
          label: "Lisa Park",
          warmth: "cool",
          detail: "Visited 3 times in January, only once in February. No follow-up contact logged.",
        },
      ],
    },
  ],
  [
    {
      role: "user",
      content: "How is the Johnson family doing?",
    },
    {
      role: "assistant",
      content:
        "The Johnson family has 4 members across 3 connection points. Overall warmth is trending down:",
      alerts: [
        {
          label: "Mike Johnson",
          warmth: "warm",
          detail: "Still attending Sundays. Dropped men's group last month.",
        },
        {
          label: "Rachel Johnson",
          warmth: "hot",
          detail: "Active in women's ministry, leads Tuesday Bible study. Strong connections.",
        },
        {
          label: "Tyler Johnson (teen)",
          warmth: "cold",
          detail: "Hasn't been to youth group in 6 weeks. Worth a check-in.",
        },
      ],
    },
  ],
  [
    {
      role: "user",
      content: "Who should I reach out to this week?",
    },
    {
      role: "assistant",
      content:
        "Based on warmth signals and recent life events, here are your top priorities:",
      alerts: [
        {
          label: "Tom Wallace — urgent",
          warmth: "cold",
          detail: "4 weeks absent, recently lost a family member. High priority pastoral care.",
        },
        {
          label: "New visitors (3)",
          warmth: "warm",
          detail: "Sarah Chen, Mark Davis, Amy Torres — all visited last Sunday, no follow-up yet.",
        },
        {
          label: "Lisa Park",
          warmth: "cool",
          detail: "3rd-time visitor fading. A personal call now could make the difference.",
        },
      ],
    },
  ],
];

const warmthDot: Record<string, string> = {
  hot: "bg-red-500",
  warm: "bg-amber-500",
  cool: "bg-indigo-500",
  cold: "bg-blue-500",
};

export function PromptDemo() {
  const [activeConvo, setActiveConvo] = useState(0);
  const [showResponse, setShowResponse] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const currentConvo = conversations[activeConvo];
  const userMessage = currentConvo[0].content;

  useEffect(() => {
    setShowResponse(false);
    setDisplayedText("");

    let charIndex = 0;
    const typingInterval = setInterval(() => {
      if (charIndex < userMessage.length) {
        setDisplayedText(userMessage.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => setShowResponse(true), 400);
      }
    }, 35);

    return () => clearInterval(typingInterval);
  }, [activeConvo, userMessage]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Tab bar */}
      <div className="flex gap-1 mb-4">
        {conversations.map((convo, i) => (
          <button
            key={i}
            onClick={() => setActiveConvo(i)}
            className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
              i === activeConvo
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-zinc-800/50 text-zinc-500 border border-zinc-800 hover:text-zinc-300"
            }`}
          >
            {i === 0 ? "Cooling off" : i === 1 ? "Family check" : "Weekly reach-out"}
          </button>
        ))}
      </div>

      {/* Chat window */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-xs text-zinc-400 font-mono">Shepherd Assistant</span>
        </div>

        <div className="p-4 space-y-4 min-h-[320px]">
          {/* User message */}
          <div className="flex justify-end">
            <div className="bg-zinc-800 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%]">
              <p className="text-sm text-zinc-200">{displayedText}<span className="inline-block w-0.5 h-4 bg-amber-500 ml-0.5 align-middle" style={{ opacity: showResponse ? 0 : 1 }} /></p>
            </div>
          </div>

          {/* Assistant response */}
          {showResponse && (
            <div className="space-y-3" style={{ animation: "slide-in-response 0.4s ease-out" }}>
              <div className="bg-zinc-900 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%]">
                <p className="text-sm text-zinc-300 mb-3">{currentConvo[1].content}</p>
                <div className="space-y-2">
                  {currentConvo[1].alerts?.map((alert, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 bg-zinc-950 rounded-lg p-2.5 border border-zinc-800"
                      style={{ animation: `slide-in-response 0.3s ease-out ${i * 0.1}s both` }}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${warmthDot[alert.warmth]}`} />
                      <div>
                        <span className="text-xs font-medium text-zinc-200 block">{alert.label}</span>
                        <span className="text-xs text-zinc-500 leading-relaxed">{alert.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="px-4 py-3 border-t border-zinc-800">
          <div className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2">
            <span className="text-zinc-600 text-sm flex-1">Ask about your people...</span>
            <div className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500">
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NavigationDemo() {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        {/* Fake nav sidebar */}
        <div className="flex">
          <div className="w-48 border-r border-zinc-800 bg-zinc-950 p-3 space-y-0.5 shrink-0">
            <div className="text-[10px] uppercase text-zinc-600 font-medium px-2 py-1 tracking-wider">Main Menu</div>
            {["Dashboard", "People", "Groups", "Events", "Check-in", "Giving", "Reports", "Communications", "Settings"].map((item, i) => (
              <div
                key={item}
                className={`text-xs px-2 py-1.5 rounded ${
                  i === 1 ? "bg-zinc-800 text-zinc-200" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {item}
              </div>
            ))}
          </div>
          <div className="flex-1 p-3">
            {/* Sub navigation */}
            <div className="flex gap-2 border-b border-zinc-800 pb-2 mb-3">
              {["All People", "Members", "Visitors", "Archived"].map((tab, i) => (
                <span key={tab} className={`text-[10px] pb-1 ${i === 0 ? "text-zinc-300 border-b border-zinc-300" : "text-zinc-600"}`}>
                  {tab}
                </span>
              ))}
            </div>
            {/* Filter bar */}
            <div className="flex gap-1.5 mb-3">
              <div className="text-[10px] px-2 py-1 rounded border border-zinc-800 text-zinc-500">Status ▾</div>
              <div className="text-[10px] px-2 py-1 rounded border border-zinc-800 text-zinc-500">Group ▾</div>
              <div className="text-[10px] px-2 py-1 rounded border border-zinc-800 text-zinc-500">Campus ▾</div>
            </div>
            {/* Table rows */}
            <div className="space-y-1">
              {["Sarah Mitchell", "James Kim", "Maria Lopez", "David Reed"].map((name) => (
                <div key={name} className="flex items-center justify-between text-[10px] px-2 py-1.5 rounded bg-zinc-900/50">
                  <span className="text-zinc-400">{name}</span>
                  <span className="text-zinc-600">View →</span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-[10px] text-zinc-600 text-center">
              Page 1 of 47 &nbsp; ← →
            </div>
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-zinc-600 mt-3">
        Click. Navigate. Search. Filter. Scroll. Click again...
      </p>
    </div>
  );
}
