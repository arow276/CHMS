import Link from "next/link";
import { db } from "@/lib/db";
import { getAllPlatforms } from "@/lib/connectors";

export default async function ImportPage() {
  const [jobs, connectors] = await Promise.all([
    db.importJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.chmsConnector.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        platform: true,
        displayName: true,
        status: true,
        lastSyncAt: true,
      },
    }),
  ]);

  const platforms = getAllPlatforms();
  const connectedPlatforms = new Set(connectors.map((c) => c.platform));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Import & Sync</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Import your church data from files or connect to your existing ChMS
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          href="/import/upload"
          className="border border-zinc-800 rounded-lg p-6 hover:border-zinc-600 transition-colors group"
        >
          <div className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">
            Upload a File
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            CSV or Excel file — AI will analyze columns and map them automatically
          </p>
          <div className="mt-3 text-xs text-zinc-600">
            Supports: .csv, .xlsx, .xls, .tsv
          </div>
        </Link>

        <Link
          href="/import/connectors"
          className="border border-zinc-800 rounded-lg p-6 hover:border-zinc-600 transition-colors group"
        >
          <div className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">
            Connect a Platform
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Auto-pull data from Planning Center, Breeze, CCB, and more
          </p>
          <div className="mt-3 text-xs text-zinc-600">
            {connectors.length > 0
              ? `${connectors.length} platform${connectors.length !== 1 ? "s" : ""} connected`
              : `${platforms.length} platforms available`}
          </div>
        </Link>
      </div>

      {/* Connected Platforms */}
      {connectors.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
            Connected Platforms
          </h2>
          <div className="space-y-2">
            {connectors.map((c) => (
              <div
                key={c.id}
                className="border border-zinc-800 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <StatusDot status={c.status} />
                  <div>
                    <span className="text-white text-sm font-medium">
                      {c.displayName}
                    </span>
                    {c.lastSyncAt && (
                      <span className="text-xs text-zinc-500 ml-2">
                        Last sync: {new Date(c.lastSyncAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/import/connectors/${c.platform}`}
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Manage
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Imports */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
          Import History
        </h2>
        {jobs.length > 0 ? (
          <div className="space-y-2">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/import/${job.id}`}
                className="border border-zinc-800 rounded-lg p-4 flex items-center justify-between hover:border-zinc-700 transition-colors block"
              >
                <div className="flex items-center gap-3">
                  <StatusDot status={job.status} />
                  <div>
                    <span className="text-white text-sm font-medium">
                      {job.fileName ?? job.source}
                    </span>
                    <span className="text-xs text-zinc-500 ml-2">
                      {job.totalRows} rows
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ImportStatusBadge status={job.status} />
                  <span className="text-xs text-zinc-600">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border border-zinc-800 rounded-lg p-8 text-center">
            <p className="text-zinc-500 text-sm">No imports yet</p>
            <p className="text-zinc-600 text-xs mt-1">
              Upload a file or connect a platform to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === "connected" || status === "complete"
      ? "bg-green-500"
      : status === "syncing" || status === "importing" || status === "analyzing"
        ? "bg-amber-500 animate-pulse"
        : status === "error"
          ? "bg-red-500"
          : "bg-zinc-600";

  return <div className={`w-2 h-2 rounded-full ${color}`} />;
}

function ImportStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-zinc-800 text-zinc-400",
    analyzing: "bg-amber-900/50 text-amber-400",
    mapped: "bg-blue-900/50 text-blue-400",
    reviewing: "bg-blue-900/50 text-blue-400",
    importing: "bg-amber-900/50 text-amber-400",
    complete: "bg-green-900/50 text-green-400",
    error: "bg-red-900/50 text-red-400",
  };

  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full ${styles[status] ?? styles.pending}`}
    >
      {status}
    </span>
  );
}
