import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseFile } from "@/lib/import/parser";
import { analyzeFile } from "@/lib/import/analyzer";
import type { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = file.name.toLowerCase().split(".").pop();
    if (!["csv", "tsv", "txt", "xlsx", "xls"].includes(ext ?? "")) {
      return NextResponse.json(
        { error: "Unsupported file format. Please upload a CSV or Excel file." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseFile(buffer, file.name);

    if (parsed.headers.length === 0 || parsed.totalRows === 0) {
      return NextResponse.json(
        { error: "File appears to be empty or has no data rows." },
        { status: 400 },
      );
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

    // Build initial column mapping
    const columnMapping: Record<string, { targetField: string | null }> = {};
    for (const col of analysis.columns) {
      columnMapping[col.sourceColumn] = { targetField: col.targetField };
    }

    // Build initial category mapping
    const categoryMapping: Record<string, Record<string, string>> = {};
    for (const cat of analysis.categories) {
      categoryMapping[cat.field] = {};
      for (const m of cat.mappings) {
        categoryMapping[cat.field][m.sourceValue] = m.suggestedMapping;
      }
    }

    // Store parsed data for later execution
    // In production, use blob storage. For MVP, store in the job's aiAnalysis.
    const fullAnalysis = {
      ...analysis,
      parsedHeaders: parsed.headers,
      parsedRows: parsed.rows.slice(0, 5000), // Cap at 5000 rows for JSON storage
    };

    await db.importJob.update({
      where: { id: job.id },
      data: {
        status: "mapped",
        aiAnalysis: fullAnalysis as unknown as Prisma.JsonObject,
        columnMapping: columnMapping as unknown as Prisma.JsonObject,
        categoryMapping: categoryMapping as unknown as Prisma.JsonObject,
      },
    });

    return NextResponse.json({
      jobId: job.id,
      analysis,
      totalRows: parsed.totalRows,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 },
    );
  }
}
