"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { runPrompt } from "@/lib/assistant/runner";
import { parsePrompt } from "@/lib/assistant/parser";
import type { AssistantResult } from "@/lib/assistant/types";

const SUGGESTIONS = [
  "Add a potluck next Sunday at 6pm",
  "Need 4 ushers for Sunday service",
  "Add new visitor Mary Smith",
  "Open registration for the picnic",
  "What’s coming up?",
  "Find Tom Wallace",
  "Set primary color to #2563EB",
  "Show our website",
];

type Receipt = AssistantResult & { parsed?: { understood: string; reason: string } };

export function PromptBar({ accentColor = "#F59E0B" }: { accentColor?: string }) {
  const [prompt, setPrompt] = useState("");
  const [isPending, startTransition] = useTransition();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input on mount so the page invites a question.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Live preview is derived from the prompt — no effect needed.
  const preview = useMemo(() => {
    if (!prompt.trim()) return "";
    const p = parsePrompt(prompt);
    return p.name === "unknown" ? "" : p.understood;
  }, [prompt]);

  function submit(text?: string) {
    const value = (text ?? prompt).trim();
    if (!value) return;
    startTransition(async () => {
      const r = await runPrompt(value);
      setReceipt(r);
      setPrompt("");
      // Refresh data on the current page so visual changes reflect immediately.
      router.refresh();
    });
  }

  return (
    <div className="easy">
      <div
        className="rounded-3xl p-1 shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${accentColor}33, transparent 70%)`,
          border: `1px solid ${accentColor}55`,
        }}
      >
        <div className="rounded-[20px] bg-zinc-900/90 backdrop-blur p-4 sm:p-5">
          <label className="block text-sm text-zinc-400 mb-2 font-medium">
            What would you like to do?
          </label>
          <div className="flex items-center gap-3">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl"
              style={{ background: `${accentColor}22`, color: accentColor }}
              aria-hidden
            >
              ✦
            </span>
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              disabled={isPending}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder='Try: "Add a potluck next Sunday at 6pm"'
              className="flex-1 bg-transparent text-white text-lg sm:text-xl placeholder:text-zinc-600 focus:outline-none"
            />
            <button
              onClick={() => submit()}
              disabled={!prompt.trim() || isPending}
              className="rounded-xl px-5 py-3 font-semibold text-zinc-950 disabled:opacity-50"
              style={{ backgroundColor: accentColor }}
            >
              {isPending ? "Working…" : "Do it"}
            </button>
          </div>
          {preview && !isPending && (
            <div
              className="mt-3 flex items-start gap-2 text-sm text-zinc-400"
              style={{ color: `${accentColor}` }}
            >
              <span aria-hidden>↪</span>
              <span>I&rsquo;ll {preview.toLowerCase()}.</span>
            </div>
          )}
        </div>
      </div>

      {/* Suggestion chips — give the user starting points without forcing menus */}
      {!receipt && (
        <div className="mt-5 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setPrompt(s);
                submit(s);
              }}
              className="rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-600 hover:text-white transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Receipt: visual confirmation that the task happened */}
      {receipt && (
        <ReceiptCard
          receipt={receipt}
          accentColor={accentColor}
          onDismiss={() => setReceipt(null)}
        />
      )}
    </div>
  );
}

function ReceiptCard({
  receipt,
  accentColor,
  onDismiss,
}: {
  receipt: Receipt;
  accentColor: string;
  onDismiss: () => void;
}) {
  const success = receipt.ok;
  return (
    <div
      role="status"
      className="mt-6 animate-confetti-pop rounded-2xl p-6 sm:p-7"
      style={{
        background: success ? `${accentColor}10` : "#3f1f1f",
        border: `2px solid ${success ? accentColor : "#7f1d1d"}`,
      }}
    >
      <div className="flex items-start gap-4">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
          style={{ background: success ? accentColor : "#dc2626" }}
        >
          {success ? (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <path className="animate-check-draw" d="M5 12l5 5 9-11" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          )}
        </span>
        <div className="flex-1">
          <p className="text-xl font-semibold text-white leading-snug">
            {success ? "Done! " : "Hmm — "}
            {receipt.summary}
          </p>
          {receipt.nextStep && (
            <p className="mt-2 text-zinc-300 leading-relaxed">{receipt.nextStep}</p>
          )}

          {receipt.receipt && receipt.receipt.length > 0 && (
            <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 rounded-xl bg-black/30 p-4">
              {receipt.receipt.map((row, i) => (
                <div key={i} className="flex justify-between gap-4 text-sm">
                  <dt className="text-zinc-400">{row.label}</dt>
                  <dd className="text-white font-medium text-right">{row.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            {receipt.href && (
              <Link
                href={receipt.href}
                className="rounded-xl px-5 py-3 font-semibold text-zinc-950"
                style={{ backgroundColor: accentColor }}
              >
                Take me there
              </Link>
            )}
            <button
              onClick={onDismiss}
              className="rounded-xl px-5 py-3 font-semibold border border-zinc-700 text-zinc-200 hover:bg-zinc-800"
            >
              Do something else
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
