"use server";

import { db } from "@/lib/db";
import { parseFile } from "@/lib/import/parser";
import { analyzeFile } from "@/lib/import/analyzer";
import { executeImport, type ColumnMapping, type CategoryMapping } from "@/lib/import/importer";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

export async function createImportJob(formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file) {
    return { error: "No file provided" };
  }

  const allowedTypes = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "text/tab-separated-values",
  ];

  const ext = file.name.toLowerCase().split(".").pop();
  if (!["csv", "tsv", "txt", "xlsx", "xls"].includes(ext ?? "")) {
    return { error: "Unsupported file format. Please upload a CSV or Excel file." };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseFile(buffer, file.name);

    if (parsed.headers.length === 0) {
      return { error: "File appears to be empty or has no headers." };
    }

    if (parsed.totalRows === 0) {
      return { error: "File has headers but no data rows." };
    }

    // Create the import job
    const job = await db.importJob.create({
      data: {
        source: "file_upload",
        fileName: file.name,
        status: "analyzing",
        totalRows: parsed.totalRows,
      },
    });

    // Run AI analysis
    const analysis = await analyzeFile(parsed.headers, parsed.rows, file.name);

    // Build initial column mapping from AI analysis
    const columnMapping: Record<string, { targetField: string | null; transform?: string }> = {};
    for (const col of analysis.columns) {
      columnMapping[col.sourceColumn] = {
        targetField: col.targetField,
      };
    }

    // Build initial category mapping from AI analysis
    const categoryMapping: Record<string, Record<string, string>> = {};
    for (const cat of analysis.categories) {
      categoryMapping[cat.field] = {};
      for (const m of cat.mappings) {
        categoryMapping[cat.field][m.sourceValue] = m.suggestedMapping;
      }
    }

    // Update job with analysis results
    await db.importJob.update({
      where: { id: job.id },
      data: {
        status: "mapped",
        aiAnalysis: analysis as unknown as Prisma.JsonObject,
        columnMapping: columnMapping as unknown as Prisma.JsonObject,
        categoryMapping: categoryMapping as unknown as Prisma.JsonObject,
      },
    });

    revalidatePath("/import");
    return { jobId: job.id };
  } catch (error) {
    console.error("Import job creation failed:", error);
    return { error: String(error) };
  }
}

export async function updateColumnMapping(
  jobId: string,
  columnMapping: ColumnMapping,
) {
  await db.importJob.update({
    where: { id: jobId },
    data: {
      columnMapping: columnMapping as unknown as Prisma.JsonObject,
    },
  });
  revalidatePath(`/import/${jobId}`);
}

export async function updateCategoryMapping(
  jobId: string,
  categoryMapping: CategoryMapping,
) {
  await db.importJob.update({
    where: { id: jobId },
    data: {
      categoryMapping: categoryMapping as unknown as Prisma.JsonObject,
    },
  });
  revalidatePath(`/import/${jobId}`);
}

export async function confirmAndExecuteImport(jobId: string) {
  const job = await db.importJob.findUnique({ where: { id: jobId } });
  if (!job) return { error: "Import job not found" };
  if (job.status !== "mapped" && job.status !== "reviewing") {
    return { error: `Cannot import: job is in "${job.status}" status` };
  }

  // Re-parse the file data from the stored analysis
  // In a production app, we'd store the parsed data in a temp file or blob storage
  // For now, we'll use the data stored in the AI analysis
  const analysis = job.aiAnalysis as Record<string, unknown> | null;
  if (!analysis) return { error: "No analysis data found" };

  const columnMapping = (job.columnMapping ?? {}) as unknown as ColumnMapping;
  const categoryMapping = (job.categoryMapping ?? {}) as unknown as CategoryMapping;
  const detectedFormat = (analysis.detectedFormat as string) ?? "people";

  // We need the original file data - store it temporarily
  // Since we can't re-read the uploaded file, mark as reviewing for the UI
  await db.importJob.update({
    where: { id: jobId },
    data: { status: "reviewing" },
  });

  revalidatePath(`/import/${jobId}`);
  revalidatePath("/import");
  return { success: true };
}

export async function executeImportFromData(
  jobId: string,
  headers: string[],
  rows: string[][],
) {
  const job = await db.importJob.findUnique({ where: { id: jobId } });
  if (!job) return { error: "Import job not found" };

  const columnMapping = (job.columnMapping ?? {}) as unknown as ColumnMapping;
  const categoryMapping = (job.categoryMapping ?? {}) as unknown as CategoryMapping;
  const analysis = job.aiAnalysis as Record<string, unknown> | null;
  const detectedFormat = (analysis?.detectedFormat as string) ?? "people";

  try {
    const result = await executeImport(
      jobId,
      headers,
      rows,
      columnMapping,
      categoryMapping,
      detectedFormat,
    );

    revalidatePath(`/import/${jobId}`);
    revalidatePath("/import");
    revalidatePath("/people");
    revalidatePath("/groups");
    revalidatePath("/events");

    return { success: true, result };
  } catch (error) {
    return { error: String(error) };
  }
}

export async function getImportJob(jobId: string) {
  return db.importJob.findUnique({ where: { id: jobId } });
}

export async function getImportJobs() {
  return db.importJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function deleteImportJob(jobId: string) {
  await db.importJob.delete({ where: { id: jobId } });
  revalidatePath("/import");
}
