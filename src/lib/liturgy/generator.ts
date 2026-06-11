// Liturgy generation via the Anthropic API (server-only).
//
// The deterministic calendar engine computes the liturgical facts; Claude
// turns those facts + the tradition's ordo + the church's choices into a
// complete, print-ready order of service. Structured outputs guarantee the
// response parses into a LiturgyDocument; streaming keeps the long
// generation inside HTTP timeouts and lets the UI show live progress.

import Anthropic from "@anthropic-ai/sdk";
import { LITURGY_DOCUMENT_SCHEMA } from "./schema";
import type { GenerateLiturgyRequest, LiturgicalDay, LiturgyDocument } from "./types";
import type { ServiceDefinition, Tradition } from "./traditions";

const SYSTEM_PROMPT = `You are the liturgy engine of Shepherd, a church management platform. You are a master liturgist with deep working knowledge of Western and Byzantine rites: the Book of Common Prayer (1979 and 2019), Lutheran Service Book, Evangelical Lutheran Worship, Christian Worship 2021, the Roman Missal and Lectionary for Mass, the Byzantine service books, the United Methodist Hymnal, and the Book of Common Worship. You prepare complete, accurate, print-ready orders of service that a parish administrator can hand to clergy, musicians, and the altar guild.

Authoritative inputs
- The CALENDAR DATA in the request was computed deterministically. Treat it as authoritative: never contradict the day name, season, color options, lectionary cycle, proper number, or tone. Choose among provided color alternates only when the tradition prefers one (e.g. blue Advent for Lutherans/Episcopalians).
- Follow the ORDO outline for the chosen rite, applying the church's selected options exactly. Apply seasonal rules the tradition expects (e.g. omit Gloria/Alleluia in Lent; Trisagion substitutions on Byzantine feasts; proper prefaces).

Texts and copyright — strict rules
- Follow the tradition's TEXT GUIDANCE exactly. Quote in full only what it permits (public-domain or expressly-permitted texts). For copyrighted service books, give precise page/number references with a one-line rubric instead of quoting, and put the licensing reminder in copyrightNotes.
- Ecumenical common texts (Kyrie, Gloria, Creeds, Sanctus, Lord's Prayer) may be printed in ELLC or traditional public-domain wording when the service book text cannot be quoted; mark them with a note.
- Scripture: cite the appointed readings precisely for the given lectionary, year, and day. Print full reading texts ONLY when the request says so, and then from the World English Bible (or KJV for traditional-language services), noting the translation. Otherwise give citations with a one-line summary of each reading's theme.
- If you are not fully certain of a citation or hymn number, give your best standard answer and add a brief verify note rather than inventing specifics.

Craft
- Write real rubrics (concise, in the tradition's voice) as kind=rubric items. Mark who speaks. For dialogue items, format the body as one exchange per line: 'Speaker: text'.
- Include the propers: collect/prayer of the day (quoted only if permitted), readings, psalm, proper preface; Byzantine services need the troparia/kontakia with tones and the prokeimenon/alleluia verses.
- Hymn suggestions (when requested): 2–3 options per slot from the tradition's hymnals, seasonally and lectionary-apt, with numbers when confident (null otherwise) and a short reason.
- planningNotes: practical checklist — vestment/parament color, special items (ashes, palms, paschal candle, incense, extra vessels), ministers to schedule, rehearsal or setup pointers, fasting notes where relevant.
- copyrightNotes: state plainly what was printed in full vs. referenced, and which licenses to verify (e.g. CPH/Lutheran Service Builder, Augsburg Fortress/Sundays and Seasons, ICEL/USCCB, OneLicense, CCLI).
- Honor the church's special notes (baptisms, occasions, guest preachers) by weaving them into the right places in the order.
- Subtitle format: '<Liturgical day> · <Month D, YYYY>'.

Output: a single LiturgyDocument JSON object matching the provided schema. No commentary outside the JSON.`;

export interface GenerationContext {
  request: GenerateLiturgyRequest;
  day: LiturgicalDay;
  tradition: Tradition;
  service: ServiceDefinition;
  eventName?: string | null;
}

function describeOptions(service: ServiceDefinition, chosen: Record<string, string | boolean>): string {
  const lines: string[] = [];
  for (const opt of service.options) {
    const value = chosen[opt.id] ?? opt.default;
    if (opt.type === "toggle") {
      lines.push(`- ${opt.label}: ${value === true || value === "true" ? "yes" : "no"}`);
    } else {
      const choice = opt.choices?.find((c) => c.value === value);
      lines.push(`- ${opt.label}: ${choice ? choice.label : String(value)}`);
    }
  }
  return lines.length ? lines.join("\n") : "(none)";
}

export function buildUserPrompt(ctx: GenerationContext): string {
  const { request, day, tradition, service, eventName } = ctx;
  const dateLabel = new Date(`${request.date}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  });

  return `Prepare a complete order of service.

CHURCH & RITE
- Tradition: ${tradition.name} (${tradition.family})
- Service: ${service.name} — ${service.description}
- Date: ${dateLabel} (${request.date})
${eventName ? `- Linked church event: ${eventName}\n` : ""}- Service books: ${tradition.books.join("; ")}
- Hymnals: ${tradition.hymnals.join("; ")}
- Lectionary: ${tradition.lectionary}

CALENDAR DATA (authoritative — computed, do not contradict)
${JSON.stringify(day, null, 2)}

ORDO OUTLINE (follow this structure)
${service.ordo.map((s, i) => `${i + 1}. ${s}`).join("\n")}

SELECTED OPTIONS
${describeOptions(service, request.options)}

TEXT GUIDANCE (copyright rules for this tradition — follow strictly)
${tradition.textGuidance}

SPECIAL NOTES FROM THE CHURCH
${request.notes?.trim() ? request.notes.trim() : "(none)"}

Produce the LiturgyDocument now.`;
}

/**
 * Kick off a streaming generation. Caller is responsible for consuming the
 * stream (text deltas for progress) and awaiting `finalMessage()`.
 */
export function streamLiturgyGeneration(ctx: GenerationContext, signal?: AbortSignal) {
  const client = new Anthropic();
  return client.messages.stream(
    {
      model: "claude-opus-4-8",
      max_tokens: 24000,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(ctx) }],
      output_config: {
        format: { type: "json_schema", schema: LITURGY_DOCUMENT_SCHEMA as unknown as Record<string, unknown> },
      },
    },
    { signal },
  );
}

/** Extract and parse the LiturgyDocument from a completed message. */
export function extractDocument(message: Anthropic.Message): LiturgyDocument {
  if (message.stop_reason === "refusal") {
    throw new Error("The model declined to generate this liturgy. Please adjust your notes and try again.");
  }
  if (message.stop_reason === "max_tokens") {
    throw new Error("The liturgy was too long to finish. Try fewer printed texts (use citations) and regenerate.");
  }
  const text = message.content.find((b) => b.type === "text");
  if (!text || !("text" in text)) {
    throw new Error("The model returned no liturgy content.");
  }
  return JSON.parse(text.text) as LiturgyDocument;
}
