import {
  BaseConnector,
  type ConnectorCredentials,
  type PlatformPerson,
  type PlatformGroup,
  type PlatformEvent,
} from "./types";

// CCB uses XML API with HTTP Basic auth
// Note: In production, you'd use an XML parser like fast-xml-parser

export class CCBConnector extends BaseConnector {
  platform = "ccb";
  displayName = "Church Community Builder";

  private getBaseUrl(credentials: ConnectorCredentials): string {
    return `https://${credentials.subdomain}.ccbchurch.com/api.php`;
  }

  private async fetch(credentials: ConnectorCredentials, params: Record<string, string>): Promise<string> {
    const url = new URL(this.getBaseUrl(credentials));
    for (const [key, val] of Object.entries(params)) {
      url.searchParams.set(key, val);
    }

    const auth = Buffer.from(`${credentials.username}:${credentials.password}`).toString("base64");
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/xml",
      },
    });

    if (!res.ok) {
      throw new Error(`CCB API error: ${res.status} ${res.statusText}`);
    }
    return res.text();
  }

  async testConnection(credentials: ConnectorCredentials): Promise<boolean> {
    try {
      await this.fetch(credentials, { srv: "api_status" });
      return true;
    } catch {
      return false;
    }
  }

  async fetchPeople(credentials: ConnectorCredentials): Promise<PlatformPerson[]> {
    const xml = await this.fetch(credentials, { srv: "individual_profiles", per_page: "100" });
    return parseCCBPeople(xml);
  }

  async fetchGroups(credentials: ConnectorCredentials): Promise<PlatformGroup[]> {
    const xml = await this.fetch(credentials, { srv: "group_profiles", per_page: "100" });
    return parseCCBGroups(xml);
  }

  async fetchEvents(credentials: ConnectorCredentials): Promise<PlatformEvent[]> {
    const xml = await this.fetch(credentials, {
      srv: "event_profiles",
      date_start: "2020-01-01",
      date_end: "2030-12-31",
    });
    return parseCCBEvents(xml);
  }
}

// Simple XML extraction helpers (lightweight, no external dependency)
function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i");
  const match = xml.match(regex);
  return match?.[1]?.trim() ?? "";
}

function extractAllBlocks(xml: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}[^>]*>[\\s\\S]*?</${tag}>`, "gi");
  return xml.match(regex) ?? [];
}

function parseCCBPeople(xml: string): PlatformPerson[] {
  const individuals = extractAllBlocks(xml, "individual");
  return individuals.map((block) => ({
    externalId: extractTag(block, "id") || `ccb-${Math.random().toString(36).slice(2)}`,
    firstName: extractTag(block, "first_name"),
    lastName: extractTag(block, "last_name"),
    email: extractTag(block, "email") || undefined,
    phone: extractTag(block, "mobile_phone") || extractTag(block, "home_phone") || undefined,
    status: mapCCBStatus(extractTag(block, "membership_type")),
    dateOfBirth: extractTag(block, "birthday") || undefined,
    gender: extractTag(block, "gender") === "M" ? "MALE" : extractTag(block, "gender") === "F" ? "FEMALE" : undefined,
  }));
}

function parseCCBGroups(xml: string): PlatformGroup[] {
  const groups = extractAllBlocks(xml, "group");
  return groups.map((block) => ({
    externalId: extractTag(block, "id"),
    name: extractTag(block, "name"),
    description: extractTag(block, "description") || undefined,
    type: mapCCBGroupType(extractTag(block, "group_type")),
  }));
}

function parseCCBEvents(xml: string): PlatformEvent[] {
  const events = extractAllBlocks(xml, "event");
  return events.map((block) => ({
    externalId: extractTag(block, "id"),
    name: extractTag(block, "name"),
    date: extractTag(block, "start_datetime") || extractTag(block, "date"),
    endDate: extractTag(block, "end_datetime") || undefined,
    type: "OTHER",
  }));
}

function mapCCBStatus(status: string): string {
  const lower = status.toLowerCase();
  if (lower.includes("member")) return "MEMBER";
  if (lower.includes("regular") || lower.includes("active")) return "REGULAR";
  if (lower.includes("visitor") || lower.includes("guest") || lower.includes("prospect")) return "VISITOR";
  if (lower.includes("inactive")) return "INACTIVE";
  return "VISITOR";
}

function mapCCBGroupType(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes("small") || lower.includes("life") || lower.includes("connect") || lower.includes("care")) return "LIFE_GROUP";
  if (lower.includes("ministry") || lower.includes("serve") || lower.includes("team")) return "MINISTRY";
  if (lower.includes("class") || lower.includes("study") || lower.includes("course")) return "CLASS";
  if (lower.includes("committee") || lower.includes("board") || lower.includes("council")) return "COMMITTEE";
  return "OTHER";
}
