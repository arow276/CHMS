export type IntentName =
  | "add_person"
  | "add_gathering"
  | "open_registration"
  | "close_registration"
  | "add_volunteer_role"
  | "find_person"
  | "list_gatherings"
  | "list_volunteers"
  | "list_registrations"
  | "update_brand_color"
  | "set_church_name"
  | "show_website"
  | "show_help"
  | "unknown";

export type ParsedIntent = {
  name: IntentName;
  /** What was understood from the prompt, in plain English. */
  understood: string;
  /** Why we matched (which keywords / pattern). Helps the user trust it. */
  reason: string;
  args: Record<string, string | number | boolean | null | undefined>;
};

export type AssistantResult = {
  intent: IntentName;
  ok: boolean;
  /** One-sentence summary of what happened, written for a 75-yr-old admin. */
  summary: string;
  /** Optional second line explaining where to look, e.g. "Open Gatherings to see it." */
  nextStep?: string;
  /** Where to navigate the user, if they want to verify. */
  href?: string;
  /** Pieces of data the UI can render as a "receipt" card. */
  receipt?: Array<{ label: string; value: string }>;
};
