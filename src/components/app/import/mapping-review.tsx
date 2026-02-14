"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateColumnMapping,
  updateCategoryMapping,
  executeImportFromData,
} from "@/lib/actions/import";

const SHEPHERD_FIELDS = [
  { value: "", label: "— Skip —" },
  { value: "firstName", label: "First Name" },
  { value: "lastName", label: "Last Name" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "status", label: "Status" },
  { value: "dateOfBirth", label: "Date of Birth" },
  { value: "gender", label: "Gender" },
  { value: "notes", label: "Notes" },
  { value: "householdName", label: "Household Name" },
  { value: "householdRole", label: "Household Role" },
  { value: "address", label: "Address" },
  { value: "city", label: "City" },
  { value: "state", label: "State" },
  { value: "zip", label: "ZIP Code" },
  { value: "name", label: "Name (Group/Event)" },
  { value: "description", label: "Description" },
  { value: "type", label: "Type" },
  { value: "meetingDay", label: "Meeting Day" },
  { value: "meetingTime", label: "Meeting Time" },
  { value: "date", label: "Date" },
  { value: "endDate", label: "End Date" },
  { value: "personName", label: "Person Name (Attendance)" },
  { value: "personEmail", label: "Person Email (Attendance)" },
  { value: "eventName", label: "Event Name (Attendance)" },
  { value: "eventDate", label: "Event Date (Attendance)" },
];

interface MappingReviewProps {
  jobId: string;
  columns: {
    sourceColumn: string;
    targetField: string | null;
    confidence: number;
    detectedType: string;
    sampleValues?: string[];
  }[];
  categories: {
    field: string;
    sourceValues: string[];
    mappings: {
      sourceValue: string;
      suggestedMapping: string;
      suggestedLabel: string;
    }[];
    recommendation: string;
  }[];
  columnMapping: Record<string, { targetField: string | null; transform?: string }>;
  categoryMapping: Record<string, Record<string, string>>;
  detectedFormat: string;
  parsedHeaders: string[];
  parsedRows: string[][];
}

export function MappingReview({
  jobId,
  columns,
  categories,
  columnMapping: initialColumnMapping,
  categoryMapping: initialCategoryMapping,
  detectedFormat,
  parsedHeaders,
  parsedRows,
}: MappingReviewProps) {
  const [colMapping, setColMapping] = useState(initialColumnMapping);
  const [catMapping, setCatMapping] = useState(initialCategoryMapping);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function updateCol(sourceColumn: string, targetField: string) {
    setColMapping((prev) => ({
      ...prev,
      [sourceColumn]: {
        ...prev[sourceColumn],
        targetField: targetField || null,
      },
    }));
  }

  function updateCat(category: string, sourceValue: string, mappedValue: string) {
    setCatMapping((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category] ?? {}),
        [sourceValue]: mappedValue,
      },
    }));
  }

  async function handleImport() {
    setImporting(true);
    setError(null);

    try {
      // Save final mappings
      await updateColumnMapping(jobId, colMapping);
      await updateCategoryMapping(jobId, catMapping);

      // Execute import with the parsed data
      const result = await executeImportFromData(jobId, parsedHeaders, parsedRows);
      if (result.error) {
        setError(result.error);
        setImporting(false);
        return;
      }

      router.refresh();
    } catch (err) {
      setError(String(err));
      setImporting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Column Mappings */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
          Column Mappings
        </h2>
        <div className="border border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-900/50">
                <th className="text-left p-3 text-zinc-400 font-medium">
                  Source Column
                </th>
                <th className="text-left p-3 text-zinc-400 font-medium">
                  Type
                </th>
                <th className="text-left p-3 text-zinc-400 font-medium">
                  Maps To
                </th>
                <th className="text-left p-3 text-zinc-400 font-medium">
                  Confidence
                </th>
                <th className="text-left p-3 text-zinc-400 font-medium">
                  Sample
                </th>
              </tr>
            </thead>
            <tbody>
              {columns.map((col) => (
                <tr
                  key={col.sourceColumn}
                  className="border-t border-zinc-800/50"
                >
                  <td className="p-3 text-white font-medium">
                    {col.sourceColumn}
                  </td>
                  <td className="p-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {col.detectedType}
                    </span>
                  </td>
                  <td className="p-3">
                    <select
                      value={colMapping[col.sourceColumn]?.targetField ?? ""}
                      onChange={(e) =>
                        updateCol(col.sourceColumn, e.target.value)
                      }
                      className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-white w-full"
                    >
                      {SHEPHERD_FIELDS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <ConfidenceBar value={col.confidence} />
                  </td>
                  <td className="p-3 text-xs text-zinc-500 max-w-[200px] truncate">
                    {col.sampleValues?.slice(0, 3).join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Mappings */}
      {categories.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
            Category Mappings
          </h2>
          <div className="space-y-4">
            {categories.map((cat) => (
              <div
                key={cat.field}
                className="border border-zinc-800 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-medium text-sm">
                      {formatCategoryName(cat.field)}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {cat.recommendation}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {cat.mappings.map((m) => (
                    <div
                      key={m.sourceValue}
                      className="flex items-center gap-3"
                    >
                      <span className="text-sm text-zinc-400 w-1/3 truncate">
                        {m.sourceValue}
                      </span>
                      <span className="text-zinc-600">&rarr;</span>
                      <input
                        type="text"
                        value={
                          catMapping[cat.field]?.[m.sourceValue] ??
                          m.suggestedMapping
                        }
                        onChange={(e) =>
                          updateCat(cat.field, m.sourceValue, e.target.value)
                        }
                        className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-white"
                      />
                      <span className="text-xs text-zinc-600 w-32 truncate">
                        {m.suggestedLabel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Preview */}
      {parsedHeaders.length > 0 && parsedRows.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
            Data Preview (first 5 rows)
          </h2>
          <div className="border border-zinc-800 rounded-lg overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-zinc-900/50">
                  {parsedHeaders.map((h) => (
                    <th
                      key={h}
                      className="text-left p-2 text-zinc-400 font-medium whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedRows.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-t border-zinc-800/50">
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className="p-2 text-zinc-400 whitespace-nowrap max-w-[200px] truncate"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {error && (
        <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          disabled={importing}
          onClick={handleImport}
          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-medium rounded-lg transition-colors"
        >
          {importing ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">&#8987;</span>
              Importing...
            </span>
          ) : (
            `Import ${detectedFormat}`
          )}
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 80
      ? "bg-green-500"
      : pct >= 50
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-zinc-500">{pct}%</span>
    </div>
  );
}

function formatCategoryName(field: string): string {
  return field
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}
