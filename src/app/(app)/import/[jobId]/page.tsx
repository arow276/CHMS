import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MappingReview } from "@/components/app/import/mapping-review";
import { ImportComplete } from "@/components/app/import/import-complete";
import Link from "next/link";

export default async function ImportJobPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const job = await db.importJob.findUnique({ where: { id: jobId } });

  if (!job) notFound();

  const analysis = job.aiAnalysis as Record<string, unknown> | null;
  const columnMapping = (job.columnMapping ?? {}) as Record<
    string,
    { targetField: string | null; transform?: string }
  >;
  const categoryMapping = (job.categoryMapping ?? {}) as Record<
    string,
    Record<string, string>
  >;

  // Completed or error state
  if (job.status === "complete" || job.status === "error") {
    return (
      <div>
        <div className="mb-6">
          <Link href="/import" className="text-xs text-zinc-500 hover:text-white">
            &larr; Back to imports
          </Link>
          <h1 className="text-2xl font-bold mt-2">
            {job.fileName ?? job.source}
          </h1>
        </div>
        <ImportComplete job={job} />
      </div>
    );
  }

  // Analysis/mapping review state
  if (
    job.status === "mapped" ||
    job.status === "reviewing" ||
    job.status === "analyzing"
  ) {
    const columns = (analysis?.columns ?? []) as {
      sourceColumn: string;
      targetField: string | null;
      confidence: number;
      detectedType: string;
      sampleValues?: string[];
    }[];

    const categories = (analysis?.categories ?? []) as {
      field: string;
      sourceValues: string[];
      mappings: {
        sourceValue: string;
        suggestedMapping: string;
        suggestedLabel: string;
      }[];
      recommendation: string;
    }[];

    const recommendations = (analysis?.recommendations ?? []) as string[];
    const confidence = (analysis?.confidence ?? 0) as number;
    const detectedFormat = (analysis?.detectedFormat ?? "unknown") as string;
    const parsedHeaders = (analysis?.parsedHeaders ?? []) as string[];
    const parsedRows = (analysis?.parsedRows ?? []) as string[][];

    return (
      <div>
        <div className="mb-6">
          <Link href="/import" className="text-xs text-zinc-500 hover:text-white">
            &larr; Back to imports
          </Link>
          <h1 className="text-2xl font-bold mt-2">
            Review: {job.fileName ?? job.source}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-zinc-500">
              {job.totalRows} rows detected
            </span>
            <span className="text-xs text-zinc-500">
              Format: {detectedFormat}
            </span>
            <span className="text-xs text-zinc-500">
              Confidence: {Math.round(confidence * 100)}%
            </span>
          </div>
        </div>

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <div className="mb-6 border border-amber-800/50 bg-amber-900/10 rounded-lg p-4">
            <h2 className="text-sm font-medium text-amber-400 mb-2">
              AI Recommendations
            </h2>
            <ul className="space-y-1">
              {recommendations.map((rec, i) => (
                <li key={i} className="text-xs text-zinc-400 flex gap-2">
                  <span className="text-amber-500">&#8226;</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        <MappingReview
          jobId={job.id}
          columns={columns}
          categories={categories}
          columnMapping={columnMapping}
          categoryMapping={categoryMapping}
          detectedFormat={detectedFormat}
          parsedHeaders={parsedHeaders}
          parsedRows={parsedRows}
        />
      </div>
    );
  }

  // Importing/pending state
  return (
    <div>
      <div className="mb-6">
        <Link href="/import" className="text-xs text-zinc-500 hover:text-white">
          &larr; Back to imports
        </Link>
        <h1 className="text-2xl font-bold mt-2">
          {job.fileName ?? job.source}
        </h1>
      </div>
      <div className="border border-zinc-800 rounded-lg p-8 text-center">
        <div className="text-amber-500 text-2xl mb-2 animate-spin inline-block">
          &#8987;
        </div>
        <p className="text-zinc-400">
          {job.status === "importing" ? "Importing data..." : "Processing..."}
        </p>
        <p className="text-xs text-zinc-600 mt-2">
          {job.importedRows} of {job.totalRows} rows processed
        </p>
      </div>
    </div>
  );
}
