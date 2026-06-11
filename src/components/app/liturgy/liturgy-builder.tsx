"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TRADITIONS, getService, getTradition } from "@/lib/liturgy/traditions";
import { computeLiturgicalDay, nextSundayIso } from "@/lib/liturgy/calendar";
import type { GenerateStreamEvent } from "@/lib/liturgy/types";
import { ColorChip } from "./color-chip";

interface UpcomingEvent {
  id: string;
  name: string;
  date: string; // ISO
}

const inputClass =
  "w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50";

export function LiturgyBuilder({ upcomingEvents }: { upcomingEvents: UpcomingEvent[] }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [traditionId, setTraditionId] = useState<string | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [date, setDate] = useState(() => nextSundayIso());
  const [options, setOptions] = useState<Record<string, string | boolean>>({});
  const [notes, setNotes] = useState("");
  const [eventId, setEventId] = useState("");

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressChars, setProgressChars] = useState(0);
  const [progressLabel, setProgressLabel] = useState("Preparing…");
  const bufferRef = useRef("");

  const tradition = traditionId ? getTradition(traditionId) : undefined;
  const service = traditionId && serviceId ? getService(traditionId, serviceId) : undefined;

  const day = useMemo(() => {
    if (!tradition || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
    try {
      return computeLiturgicalDay(date, tradition.calendar);
    } catch {
      return null;
    }
  }, [tradition, date]);

  function chooseTradition(id: string) {
    setTraditionId(id);
    setServiceId(null);
    setOptions({});
    setStep(2);
  }

  function chooseService(id: string) {
    if (!traditionId) return;
    const svc = getService(traditionId, id);
    if (!svc) return;
    setServiceId(id);
    const defaults: Record<string, string | boolean> = {};
    for (const opt of svc.options) defaults[opt.id] = opt.default;
    setOptions(defaults);
    setStep(3);
  }

  async function generate() {
    if (!tradition || !service) return;
    setGenerating(true);
    setError(null);
    setProgressChars(0);
    setProgressLabel("Consulting the calendar…");
    bufferRef.current = "";

    try {
      const res = await fetch("/api/liturgy/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tradition: tradition.id,
          serviceType: service.id,
          date,
          options,
          notes,
          eventId: eventId || null,
        }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Request failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let lineBuf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        lineBuf += decoder.decode(value, { stream: true });

        let nl;
        while ((nl = lineBuf.indexOf("\n")) >= 0) {
          const line = lineBuf.slice(0, nl).trim();
          lineBuf = lineBuf.slice(nl + 1);
          if (!line) continue;

          let event: GenerateStreamEvent;
          try {
            event = JSON.parse(line) as GenerateStreamEvent;
          } catch {
            continue;
          }

          if (event.type === "delta") {
            bufferRef.current += event.text;
            setProgressChars(bufferRef.current.length);
            const titles = bufferRef.current.match(/"title"\s*:\s*"((?:[^"\\]|\\.)+)"/g);
            if (titles && titles.length > 0) {
              const last = titles[titles.length - 1];
              const m = last.match(/"title"\s*:\s*"((?:[^"\\]|\\.)+)"/);
              if (m) setProgressLabel(`Drafting — ${JSON.parse(`"${m[1]}"`)}`);
            } else {
              setProgressLabel("Drafting the order of service…");
            }
          } else if (event.type === "done") {
            setProgressLabel("Finished — opening your bulletin…");
            router.push(`/liturgy/${event.id}`);
            return;
          } else if (event.type === "error") {
            throw new Error(event.message);
          }
        }
      }

      throw new Error("The generation stream ended unexpectedly. Please try again.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
      setGenerating(false);
    }
  }

  // ── Generating screen ──
  if (generating) {
    return (
      <div className="max-w-2xl">
        <div className="border border-zinc-800 rounded-lg p-8 bg-zinc-900/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
            <div>
              <div className="font-semibold">{progressLabel}</div>
              <div className="text-xs text-zinc-500 mt-0.5">
                {tradition?.name} · {service?.name}
                {progressChars > 0 && ` · ${Math.round(progressChars / 1000)}k characters drafted`}
              </div>
            </div>
          </div>

          {day && (
            <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-950">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{day.dayName}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {day.season}
                    {day.sundayCycle && ` · Year ${day.sundayCycle}`}
                    {typeof day.tone === "number" && ` · Tone ${day.tone}`}
                  </div>
                </div>
                <ColorChip color={day.color} />
              </div>
            </div>
          )}

          <p className="text-xs text-zinc-600 mt-6">
            Drafting propers, rubrics, hymn suggestions, and planning notes.
            Full services can take a couple of minutes — please keep this tab open.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6 text-xs font-medium">
        {[
          { n: 1, label: "Tradition" },
          { n: 2, label: "Service" },
          { n: 3, label: "Date & Options" },
        ].map(({ n, label }, i) => (
          <div key={n} className="flex items-center gap-2">
            {i > 0 && <div className="w-6 h-px bg-zinc-700" />}
            <button
              type="button"
              disabled={n > step}
              onClick={() => n < step && setStep(n as 1 | 2 | 3)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors ${
                n === step
                  ? "bg-amber-500/15 text-amber-400"
                  : n < step
                    ? "text-zinc-300 hover:bg-zinc-800"
                    : "text-zinc-600"
              }`}
            >
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${n <= step ? "bg-amber-500 text-zinc-950" : "bg-zinc-800"}`}>
                {n}
              </span>
              {label}
            </button>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Step 1 — Tradition */}
      {step === 1 && (
        <div className="grid sm:grid-cols-2 gap-3">
          {TRADITIONS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => chooseTradition(t.id)}
              className={`text-left border rounded-lg p-4 transition-colors ${
                traditionId === t.id
                  ? "border-amber-500/60 bg-amber-500/5"
                  : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-600"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-semibold">{t.name}</span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                  {t.family}
                </span>
              </div>
              <div className="text-xs text-amber-400/90 mb-2">{t.tagline}</div>
              <p className="text-xs text-zinc-500 leading-relaxed">{t.description}</p>
            </button>
          ))}
        </div>
      )}

      {/* Step 2 — Service */}
      {step === 2 && tradition && (
        <div>
          <div className="text-sm text-zinc-400 mb-4">
            <span className="text-white font-medium">{tradition.name}</span> · choose a service
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {tradition.services.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => chooseService(s.id)}
                className={`text-left border rounded-lg p-4 transition-colors ${
                  serviceId === s.id
                    ? "border-amber-500/60 bg-amber-500/5"
                    : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-600"
                }`}
              >
                <div className="font-semibold mb-1">{s.name}</div>
                <p className="text-xs text-zinc-500 leading-relaxed mb-3">{s.description}</p>
                <div className="text-[11px] text-zinc-600 leading-relaxed">
                  {s.ordo.slice(0, 3).map((line) => (
                    <div key={line} className="truncate">· {line}</div>
                  ))}
                  {s.ordo.length > 3 && <div>· …</div>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3 — Date & options */}
      {step === 3 && tradition && service && (
        <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
          <div className="space-y-5">
            <div className="text-sm text-zinc-400">
              <span className="text-white font-medium">{tradition.name}</span>
              {" · "}
              <span className="text-white font-medium">{service.name}</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Service date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Link to event</label>
                <select
                  value={eventId}
                  onChange={(e) => {
                    setEventId(e.target.value);
                    const ev = upcomingEvents.find((u) => u.id === e.target.value);
                    if (ev) setDate(ev.date.slice(0, 10));
                  }}
                  className={inputClass}
                >
                  <option value="">None</option>
                  {upcomingEvents.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name} — {new Date(ev.date).toLocaleDateString("en-US", { timeZone: "UTC" })}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {service.options.length > 0 && (
              <div className="border border-zinc-800 rounded-lg p-4 space-y-4">
                <div className="text-sm font-medium">Rite options</div>
                {service.options.map((opt) => (
                  <div key={opt.id}>
                    {opt.type === "select" ? (
                      <div>
                        <label className="block text-sm text-zinc-300 mb-1.5">{opt.label}</label>
                        <select
                          value={String(options[opt.id] ?? opt.default)}
                          onChange={(e) => setOptions((o) => ({ ...o, [opt.id]: e.target.value }))}
                          className={inputClass}
                        >
                          {opt.choices?.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(options[opt.id] ?? opt.default)}
                          onChange={(e) => setOptions((o) => ({ ...o, [opt.id]: e.target.checked }))}
                          className="mt-0.5 accent-amber-500"
                        />
                        <span className="text-sm text-zinc-300">{opt.label}</span>
                      </label>
                    )}
                    {opt.help && <p className="text-xs text-zinc-600 mt-1">{opt.help}</p>}
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                Special notes for this service
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="e.g. Two infant baptisms; youth group leading the psalm; guest preacher Rev. Jane Smith; stewardship emphasis…"
                className={`${inputClass} resize-none`}
              />
            </div>

            <button
              type="button"
              onClick={generate}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
            >
              Generate Order of Service
            </button>
          </div>

          {/* Live liturgical-day preview */}
          <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/40 lg:sticky lg:top-6">
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
              Liturgical day
            </div>
            {day ? (
              <div className="space-y-3">
                <div>
                  <div className="font-semibold leading-snug">{day.dayName}</div>
                  <div className="text-xs text-zinc-500 mt-1">
                    {day.season}
                    {day.weekInSeason ? ` · Week ${day.weekInSeason}` : ""}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <ColorChip color={day.color} />
                  {day.colorAlternates.map((c) => (
                    <span key={c} className="text-[11px] text-zinc-600">alt: {c}</span>
                  ))}
                </div>
                <div className="text-xs text-zinc-500 space-y-1">
                  {day.sundayCycle && <div>Lectionary Year {day.sundayCycle}{day.weekdayCycle ? ` · Weekday Cycle ${day.weekdayCycle}` : ""}</div>}
                  {day.properNumber != null && <div>RCL/BCP Proper {day.properNumber}</div>}
                  {day.ordinaryTimeWeek != null && <div>Ordinary Time week {day.ordinaryTimeWeek}</div>}
                  {typeof day.tone === "number" && <div>Octoechos Tone {day.tone}</div>}
                </div>
                {day.feasts.length > 0 && (
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-zinc-600 mb-1">Also today</div>
                    {day.feasts.map((f) => (
                      <div key={f} className="text-xs text-amber-400/80">{f}</div>
                    ))}
                  </div>
                )}
                {day.notes.length > 0 && (
                  <ul className="text-[11px] text-zinc-600 space-y-1 border-t border-zinc-800 pt-3">
                    {day.notes.slice(0, 4).map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p className="text-sm text-zinc-600">Pick a date to see its place in the church year.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
