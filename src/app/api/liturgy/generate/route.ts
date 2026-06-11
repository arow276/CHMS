import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { computeLiturgicalDay } from "@/lib/liturgy/calendar";
import { getService, getTradition } from "@/lib/liturgy/traditions";
import { extractDocument, streamLiturgyGeneration } from "@/lib/liturgy/generator";
import type { GenerateStreamEvent } from "@/lib/liturgy/types";

export const runtime = "nodejs";
// Opus generations of a full bulletin routinely run a few minutes; streaming
// keeps the connection alive up to this limit on Vercel.
export const maxDuration = 300;

const bodySchema = z.object({
  tradition: z.string().min(1),
  serviceType: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  options: z.record(z.string(), z.union([z.string(), z.boolean()])).default({}),
  notes: z.string().max(2000).optional().default(""),
  eventId: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured. The liturgy builder requires an Anthropic API key." },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const body = parsed.data;

  const tradition = getTradition(body.tradition);
  const service = tradition && getService(body.tradition, body.serviceType);
  if (!tradition || !service) {
    return NextResponse.json({ error: "Unknown tradition or service type" }, { status: 400 });
  }

  let eventName: string | null = null;
  if (body.eventId) {
    const event = await db.event.findUnique({ where: { id: body.eventId }, select: { name: true } });
    if (!event) return NextResponse.json({ error: "Linked event not found" }, { status: 400 });
    eventName = event.name;
  }

  const day = computeLiturgicalDay(body.date, tradition.calendar);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: GenerateStreamEvent) =>
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));

      try {
        send({ type: "calendar", day });

        const generation = streamLiturgyGeneration(
          { request: body, day, tradition, service, eventName },
          req.signal,
        );
        generation.on("text", (delta) => send({ type: "delta", text: delta }));

        const message = await generation.finalMessage();
        const document = extractDocument(message);

        const liturgy = await db.liturgy.create({
          data: {
            title: document.title,
            tradition: tradition.id,
            serviceType: service.id,
            date: new Date(`${body.date}T00:00:00Z`),
            liturgicalDay: day as unknown as Prisma.JsonObject,
            options: { choices: body.options, notes: body.notes } as unknown as Prisma.JsonObject,
            document: document as unknown as Prisma.JsonObject,
            eventId: body.eventId || null,
          },
        });

        revalidatePath("/liturgy");
        send({ type: "done", id: liturgy.id });
      } catch (error) {
        console.error("Liturgy generation failed:", error);
        const message = error instanceof Error ? error.message : "Generation failed unexpectedly.";
        try {
          send({ type: "error", message });
        } catch {
          // Stream already closed (e.g. client aborted) — nothing to report.
        }
      } finally {
        try {
          controller.close();
        } catch {
          // Already closed.
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
