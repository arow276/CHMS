// Shared types for the Liturgy Builder.
// These are used on both the server (generation, persistence) and the
// client (builder wizard, bulletin rendering), so keep this file free of
// server-only imports.

export type CalendarSystem = "western" | "byzantine";

/**
 * Deterministic liturgical-calendar data computed for a single date.
 * This is the authoritative input handed to the AI generator — the model
 * is instructed never to contradict it.
 */
export interface LiturgicalDay {
  iso: string; // yyyy-mm-dd
  calendar: CalendarSystem;
  dayName: string; // "The Fifth Sunday in Lent"
  season: string; // "Lent", "Easter", "Season after Pentecost", "Great Lent"…
  weekInSeason: number | null;
  color: string; // primary color suggestion, lowercase ("violet", "white"…)
  colorAlternates: string[]; // e.g. ["blue"] in Advent, ["rose"] on Gaudete
  /** Western: RCL / Roman Sunday cycle */
  sundayCycle?: "A" | "B" | "C";
  /** Western: Roman weekday lectionary cycle */
  weekdayCycle?: "I" | "II";
  /** Western: BCP/RCL proper number for Sundays after Pentecost */
  properNumber?: number | null;
  /** Western: Roman Ordinary Time week (Sundays) */
  ordinaryTimeWeek?: number | null;
  /** Byzantine: Octoechos tone of the week (1–8) */
  tone?: number | null;
  /** Fixed feasts and observances coinciding with this date */
  feasts: string[];
  /** Extra planning facts: Latin names, fasting seasons, transfer rules… */
  notes: string[];
}

export type LiturgyItemKind =
  | "heading"
  | "rubric"
  | "text"
  | "dialogue"
  | "prayer"
  | "reading"
  | "psalm"
  | "hymn"
  | "music"
  | "note";

export interface LiturgyItem {
  kind: LiturgyItemKind;
  title: string | null; // "The Collect of the Day", "Hymn of the Day"
  speaker: string | null; // "Celebrant", "Deacon", "People", "All", "Priest"
  body: string | null; // Full text. Dialogue uses "Speaker: line" per line.
  reference: string | null; // "BCP p. 355", "LSB 184", "John 12:1-8", "ELW Setting 4"
  note: string | null; // Usage/copyright/planning note for this item
}

export interface LiturgySection {
  title: string; // "The Liturgy of the Word"
  items: LiturgyItem[];
}

export interface HymnOption {
  title: string;
  source: string; // "The Hymnal 1982", "LSB", "ELW"…
  number: string | null;
  note: string | null; // tune name, why it fits the day, etc.
}

export interface HymnSuggestion {
  slot: string; // "Processional", "Hymn of the Day", "Offertory", "Communion", "Sending"
  suggestions: HymnOption[];
}

/** The structured order of service produced by the generator. */
export interface LiturgyDocument {
  title: string;
  subtitle: string | null;
  liturgicalDayName: string;
  color: string;
  sections: LiturgySection[];
  hymnSuggestions: HymnSuggestion[];
  planningNotes: string[]; // sacristy/altar guild/staffing checklist
  copyrightNotes: string[]; // what was quoted vs. referenced; licenses to verify
}

/** Payload sent to POST /api/liturgy/generate */
export interface GenerateLiturgyRequest {
  tradition: string;
  serviceType: string;
  date: string; // yyyy-mm-dd
  options: Record<string, string | boolean>;
  notes?: string;
  eventId?: string | null;
}

/** NDJSON events streamed back by the generate route. */
export type GenerateStreamEvent =
  | { type: "calendar"; day: LiturgicalDay }
  | { type: "delta"; text: string }
  | { type: "done"; id: string }
  | { type: "error"; message: string };
