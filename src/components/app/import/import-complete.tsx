"use client";

import Link from "next/link";

interface ImportCompleteProps {
  job: {
    id: string;
    status: string;
    fileName: string | null;
    source: string;
    totalRows: number;
    importedRows: number;
    skippedRows: number;
    errorRows: number;
    errors: unknown;
    importedData: unknown;
    createdAt: Date;
  };
}

export function ImportComplete({ job }: ImportCompleteProps) {
  const errors = (job.errors as { row: number; field: string; message: string }[]) ?? [];
  const summary = (job.importedData as { people?: number; households?: number; groups?: number; events?: number }) ?? {};

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <div
        className={`rounded-lg p-6 border ${
          job.status === "complete"
            ? "border-green-800/50 bg-green-900/10"
            : "border-red-800/50 bg-red-900/10"
        }`}
      >
        <h2
          className={`text-lg font-bold ${
            job.status === "complete" ? "text-green-400" : "text-red-400"
          }`}
        >
          {job.status === "complete" ? "Import Complete" : "Import Failed"}
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          {job.status === "complete"
            ? `Successfully imported ${job.importedRows} of ${job.totalRows} records`
            : `Import encountered errors. ${job.importedRows} of ${job.totalRows} records were imported.`}
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border border-zinc-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{job.totalRows}</div>
          <div className="text-xs text-zinc-500">Total Rows</div>
        </div>
        <div className="border border-zinc-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">
            {job.importedRows}
          </div>
          <div className="text-xs text-zinc-500">Imported</div>
        </div>
        <div className="border border-zinc-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-amber-400">
            {job.skippedRows}
          </div>
          <div className="text-xs text-zinc-500">Skipped</div>
        </div>
        <div className="border border-zinc-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-400">
            {job.errorRows}
          </div>
          <div className="text-xs text-zinc-500">Errors</div>
        </div>
      </div>

      {/* Import breakdown */}
      {(summary.people || summary.households || summary.groups || summary.events) && (
        <div className="border border-zinc-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-zinc-400 mb-3">
            What was imported
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {summary.people !== undefined && summary.people > 0 && (
              <div className="text-sm">
                <span className="text-white font-bold">{summary.people}</span>{" "}
                <span className="text-zinc-500">people</span>
              </div>
            )}
            {summary.households !== undefined && summary.households > 0 && (
              <div className="text-sm">
                <span className="text-white font-bold">
                  {summary.households}
                </span>{" "}
                <span className="text-zinc-500">households</span>
              </div>
            )}
            {summary.groups !== undefined && summary.groups > 0 && (
              <div className="text-sm">
                <span className="text-white font-bold">{summary.groups}</span>{" "}
                <span className="text-zinc-500">groups</span>
              </div>
            )}
            {summary.events !== undefined && summary.events > 0 && (
              <div className="text-sm">
                <span className="text-white font-bold">{summary.events}</span>{" "}
                <span className="text-zinc-500">events</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="border border-zinc-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-zinc-400 mb-3">
            Errors ({errors.length})
          </h3>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {errors.slice(0, 50).map((err, i) => (
              <div key={i} className="text-xs text-zinc-500">
                <span className="text-red-400">Row {err.row}:</span>{" "}
                {err.message}
              </div>
            ))}
            {errors.length > 50 && (
              <div className="text-xs text-zinc-600">
                ...and {errors.length - 50} more errors
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href="/people"
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm transition-colors"
        >
          View People
        </Link>
        <Link
          href="/import"
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
        >
          Back to Imports
        </Link>
        <Link
          href="/import/upload"
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
        >
          Import Another File
        </Link>
      </div>
    </div>
  );
}
