"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteLiturgy,
  updateLiturgyDocument,
  updateLiturgyStatus,
} from "@/lib/actions/liturgy";
import type {
  LiturgicalDay,
  LiturgyDocument,
  LiturgyItem,
  LiturgyItemKind,
} from "@/lib/liturgy/types";
import { ColorChip } from "./color-chip";

interface BulletinViewProps {
  id: string;
  status: "DRAFT" | "FINAL";
  dateIso: string;
  traditionName: string;
  serviceName: string;
  eventName: string | null;
  day: LiturgicalDay;
  initialDocument: LiturgyDocument;
}

const KIND_OPTIONS: LiturgyItemKind[] = [
  "heading", "rubric", "text", "dialogue", "prayer", "reading", "psalm", "hymn", "music", "note",
];

const EMPTY_ITEM: LiturgyItem = {
  kind: "text",
  title: null,
  speaker: null,
  body: null,
  reference: null,
  note: null,
};

const editInput =
  "w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50";

export function BulletinView(props: BulletinViewProps) {
  const router = useRouter();
  const [doc, setDoc] = useState<LiturgyDocument>(props.initialDocument);
  const [status, setStatus] = useState(props.status);
  const [editMode, setEditMode] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  function mutate(updater: (d: LiturgyDocument) => LiturgyDocument) {
    setDoc((d) => updater(structuredClone(d)));
    setDirty(true);
  }

  function updateItem(si: number, ii: number, patch: Partial<LiturgyItem>) {
    mutate((d) => {
      d.sections[si].items[ii] = { ...d.sections[si].items[ii], ...patch };
      return d;
    });
  }

  async function save() {
    setSaving(true);
    try {
      await updateLiturgyDocument(props.id, doc);
      setDirty(false);
      setEditMode(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus() {
    const next = status === "DRAFT" ? "FINAL" : "DRAFT";
    setStatus(next);
    await updateLiturgyStatus(props.id, next);
  }

  async function remove() {
    if (!confirm("Delete this liturgy? This cannot be undone.")) return;
    await deleteLiturgy(props.id);
  }

  const dateLabel = new Date(props.dateIso).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  });

  return (
    <div className="grid xl:grid-cols-[1fr_320px] gap-6 items-start">
      <div>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 mb-4 print:hidden">
          <span
            className={`text-xs px-2 py-0.5 rounded-full capitalize ${
              status === "FINAL" ? "bg-green-500/15 text-green-400" : "bg-zinc-500/15 text-zinc-400"
            }`}
          >
            {status.toLowerCase()}
          </span>
          <div className="text-sm text-zinc-500">
            {props.traditionName} · {props.serviceName}
            {props.eventName && ` · ${props.eventName}`}
          </div>
          <div className="flex-1" />
          {dirty && (
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="px-3 py-1.5 text-sm bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          )}
          <button
            type="button"
            onClick={() => setEditMode((e) => !e)}
            className="px-3 py-1.5 text-sm border border-zinc-700 hover:border-zinc-500 rounded-lg text-zinc-300 transition-colors"
          >
            {editMode ? "Done editing" : "Edit"}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 text-sm border border-zinc-700 hover:border-zinc-500 rounded-lg text-zinc-300 transition-colors"
          >
            Print
          </button>
          <button
            type="button"
            onClick={toggleStatus}
            className="px-3 py-1.5 text-sm border border-zinc-700 hover:border-zinc-500 rounded-lg text-zinc-300 transition-colors"
          >
            {status === "DRAFT" ? "Mark Final" : "Reopen Draft"}
          </button>
          <button
            type="button"
            onClick={remove}
            className="px-3 py-1.5 text-sm border border-red-900/60 hover:border-red-600 rounded-lg text-red-400 transition-colors"
          >
            Delete
          </button>
        </div>

        {/* The bulletin "paper" */}
        <div
          className="bg-white text-zinc-900 rounded-lg shadow-xl border border-zinc-300/20 px-8 py-10 sm:px-12 print:shadow-none print:border-0 print:rounded-none print:px-0 print:py-0"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          <header className="text-center mb-8">
            <div
              className="mx-auto mb-3 h-1 w-24 rounded-full"
              style={{ backgroundColor: cssColor(doc.color) }}
            />
            <h1 className="text-2xl font-bold tracking-tight">{doc.title}</h1>
            {doc.subtitle ? (
              <p className="text-sm mt-2 text-zinc-600">{doc.subtitle}</p>
            ) : (
              <p className="text-sm mt-2 text-zinc-600">
                {doc.liturgicalDayName} · {dateLabel}
              </p>
            )}
          </header>

          {doc.sections.map((section, si) => (
            <section key={si} className="mb-8">
              <h2 className="text-center text-sm font-bold uppercase tracking-[0.2em] text-zinc-700 border-b border-zinc-300 pb-2 mb-4">
                {editMode ? (
                  <input
                    value={section.title}
                    onChange={(e) =>
                      mutate((d) => {
                        d.sections[si].title = e.target.value;
                        return d;
                      })
                    }
                    className={`${editInput} text-center font-sans`}
                  />
                ) : (
                  section.title
                )}
              </h2>

              <div className="space-y-4">
                {section.items.map((item, ii) =>
                  editMode ? (
                    <ItemEditor
                      key={ii}
                      item={item}
                      onChange={(patch) => updateItem(si, ii, patch)}
                      onDelete={() =>
                        mutate((d) => {
                          d.sections[si].items.splice(ii, 1);
                          return d;
                        })
                      }
                    />
                  ) : (
                    <ItemView key={ii} item={item} />
                  ),
                )}
              </div>

              {editMode && (
                <button
                  type="button"
                  onClick={() =>
                    mutate((d) => {
                      d.sections[si].items.push({ ...EMPTY_ITEM });
                      return d;
                    })
                  }
                  className="mt-3 text-xs font-sans px-2 py-1 rounded border border-dashed border-zinc-400 text-zinc-500 hover:border-zinc-600 hover:text-zinc-700"
                >
                  + Add element
                </button>
              )}
            </section>
          ))}
        </div>
      </div>

      {/* Planning sidebar */}
      <aside className="space-y-4 print:hidden xl:sticky xl:top-6">
        <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/40">
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
            Liturgical day
          </div>
          <div className="font-medium text-sm leading-snug mb-2">{props.day.dayName}</div>
          <div className="flex flex-wrap gap-2 mb-2">
            <ColorChip color={doc.color} />
          </div>
          <div className="text-xs text-zinc-500 space-y-1">
            <div>{props.day.season}</div>
            {props.day.sundayCycle && <div>Lectionary Year {props.day.sundayCycle}</div>}
            {props.day.properNumber != null && <div>Proper {props.day.properNumber}</div>}
            {typeof props.day.tone === "number" && <div>Tone {props.day.tone}</div>}
          </div>
        </div>

        {doc.hymnSuggestions.length > 0 && (
          <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/40">
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
              Hymn suggestions
            </div>
            <div className="space-y-3">
              {doc.hymnSuggestions.map((slot) => (
                <div key={slot.slot}>
                  <div className="text-xs font-semibold text-amber-400/90 mb-1">{slot.slot}</div>
                  {slot.suggestions.map((h, i) => (
                    <div key={i} className="text-xs text-zinc-400 leading-relaxed">
                      {h.title}
                      {h.number && <span className="text-zinc-600"> · {h.source} {h.number}</span>}
                      {!h.number && <span className="text-zinc-600"> · {h.source}</span>}
                      {h.note && <div className="text-[11px] text-zinc-600 ml-2">{h.note}</div>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {doc.planningNotes.length > 0 && (
          <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/40">
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
              Planning checklist
            </div>
            <ul className="space-y-2">
              {doc.planningNotes.map((note, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-400 leading-relaxed">
                  <span className="mt-0.5 w-3 h-3 rounded-sm border border-zinc-600 shrink-0" />
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}

        {doc.copyrightNotes.length > 0 && (
          <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/40">
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
              Copyright & licensing
            </div>
            <ul className="space-y-2 text-[11px] text-zinc-500 leading-relaxed list-disc list-inside">
              {doc.copyrightNotes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
            <p className="text-[11px] text-zinc-600 mt-3 border-t border-zinc-800 pt-2">
              Always verify texts, readings, and music against your service books
              and your congregation&apos;s licenses before printing.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}

// ── Rendering helpers ──

function cssColor(color: string): string {
  const key = color.toLowerCase().split(/[\s(]/)[0];
  const map: Record<string, string> = {
    violet: "#7c3aed", purple: "#7c3aed", blue: "#2563eb", rose: "#f472b6",
    white: "#d4d4d8", gold: "#eab308", green: "#16a34a", red: "#dc2626",
    scarlet: "#b91c1c", black: "#27272a", none: "#a1a1aa",
  };
  return map[key] ?? "#a1a1aa";
}

function ItemView({ item }: { item: LiturgyItem }) {
  const showTitleRow = item.title || item.reference;

  if (item.kind === "rubric") {
    return (
      <p className="text-[13px] italic leading-relaxed" style={{ color: "#9f1239" }}>
        {item.body ?? item.title}
      </p>
    );
  }

  if (item.kind === "note") {
    return <p className="text-xs italic text-zinc-500 leading-relaxed">{item.body ?? item.title}</p>;
  }

  return (
    <div>
      {showTitleRow && (
        <div className="flex items-baseline justify-between gap-3 mb-1">
          <div className="font-semibold text-[15px]">
            {(item.kind === "hymn" || item.kind === "music") && <span className="mr-1.5">♪</span>}
            {item.title}
          </div>
          {item.reference && (
            <div className="text-xs text-zinc-500 shrink-0 text-right">{item.reference}</div>
          )}
        </div>
      )}
      {item.kind === "dialogue" && item.body ? (
        <div className="space-y-0.5">
          {item.body.split("\n").map((line, i) => {
            const m = line.match(/^([^:]{1,40}):\s*(.*)$/);
            if (!m) return <p key={i} className="text-[15px] leading-relaxed">{line}</p>;
            const bold = /people|all|congregation|assembly|response/i.test(m[1]);
            return (
              <p key={i} className="grid grid-cols-[7.5rem_1fr] gap-2 text-[15px] leading-relaxed">
                <span className="text-xs uppercase tracking-wide text-zinc-500 pt-0.5">{m[1]}</span>
                <span className={bold ? "font-semibold" : ""}>{m[2]}</span>
              </p>
            );
          })}
        </div>
      ) : (
        item.body && (
          <div>
            {item.speaker && (
              <div className="text-xs uppercase tracking-wide text-zinc-500 mb-0.5">{item.speaker}</div>
            )}
            <p className="text-[15px] leading-relaxed whitespace-pre-line">{item.body}</p>
          </div>
        )
      )}
      {!item.body && !showTitleRow && item.speaker && (
        <p className="text-sm text-zinc-600">{item.speaker}</p>
      )}
      {item.note && <p className="text-xs italic text-zinc-500 mt-1">{item.note}</p>}
    </div>
  );
}

function ItemEditor({
  item,
  onChange,
  onDelete,
}: {
  item: LiturgyItem;
  onChange: (patch: Partial<LiturgyItem>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="font-sans border border-zinc-300 rounded-lg p-3 bg-zinc-50 space-y-2">
      <div className="flex gap-2">
        <select
          value={item.kind}
          onChange={(e) => onChange({ kind: e.target.value as LiturgyItemKind })}
          className="px-2 py-1 bg-white border border-zinc-300 rounded text-xs text-zinc-800"
        >
          {KIND_OPTIONS.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        <input
          value={item.title ?? ""}
          onChange={(e) => onChange({ title: e.target.value || null })}
          placeholder="Title"
          className="flex-1 px-2 py-1 bg-white border border-zinc-300 rounded text-sm text-zinc-900 placeholder-zinc-400"
        />
        <input
          value={item.reference ?? ""}
          onChange={(e) => onChange({ reference: e.target.value || null })}
          placeholder="Reference"
          className="w-36 px-2 py-1 bg-white border border-zinc-300 rounded text-sm text-zinc-900 placeholder-zinc-400"
        />
        <button
          type="button"
          onClick={onDelete}
          className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 border border-zinc-300 rounded"
          title="Remove element"
        >
          ✕
        </button>
      </div>
      <input
        value={item.speaker ?? ""}
        onChange={(e) => onChange({ speaker: e.target.value || null })}
        placeholder="Speaker (Celebrant, People, All…)"
        className="w-full px-2 py-1 bg-white border border-zinc-300 rounded text-sm text-zinc-900 placeholder-zinc-400"
      />
      <textarea
        value={item.body ?? ""}
        onChange={(e) => onChange({ body: e.target.value || null })}
        placeholder="Text (for dialogue: one 'Speaker: line' per row)"
        rows={Math.min(8, Math.max(2, (item.body?.split("\n").length ?? 1) + 1))}
        className="w-full px-2 py-1 bg-white border border-zinc-300 rounded text-sm text-zinc-900 placeholder-zinc-400"
      />
      <input
        value={item.note ?? ""}
        onChange={(e) => onChange({ note: e.target.value || null })}
        placeholder="Note (optional)"
        className="w-full px-2 py-1 bg-white border border-zinc-300 rounded text-xs text-zinc-700 placeholder-zinc-400"
      />
    </div>
  );
}
