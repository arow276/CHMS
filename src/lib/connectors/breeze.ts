import {
  BaseConnector,
  type ConnectorCredentials,
  type PlatformPerson,
  type PlatformGroup,
  type PlatformEvent,
} from "./types";

export class BreezeConnector extends BaseConnector {
  platform = "breeze";
  displayName = "Breeze ChMS";

  private getBaseUrl(credentials: ConnectorCredentials): string {
    const subdomain = credentials.subdomain ?? "api";
    return `https://${subdomain}.breezechms.com/api`;
  }

  private async fetch(path: string, credentials: ConnectorCredentials): Promise<Response> {
    const baseUrl = this.getBaseUrl(credentials);
    const res = await fetch(`${baseUrl}${path}`, {
      headers: {
        "Content-Type": "application/json",
        "Api-Key": credentials.apiKey ?? "",
      },
    });

    if (!res.ok) {
      throw new Error(`Breeze API error: ${res.status} ${res.statusText}`);
    }
    return res;
  }

  async testConnection(credentials: ConnectorCredentials): Promise<boolean> {
    try {
      const res = await this.fetch("/account/summary", credentials);
      const data = await res.json();
      return !!data;
    } catch {
      return false;
    }
  }

  async fetchPeople(credentials: ConnectorCredentials): Promise<PlatformPerson[]> {
    const res = await this.fetch("/people?details=1", credentials);
    const data = (await res.json()) as Record<string, unknown>[];

    return data.map((person) => ({
      externalId: String(person.id),
      firstName: String(person.first_name ?? ""),
      lastName: String(person.last_name ?? ""),
      email: extractBreezeField(person, "email_primary") ?? undefined,
      phone: extractBreezeField(person, "phone_mobile") ?? extractBreezeField(person, "phone_home") ?? undefined,
      status: mapBreezeStatus(String(person.status ?? "")),
      dateOfBirth: extractBreezeField(person, "birthdate") ?? undefined,
      gender: mapBreezeGender(extractBreezeField(person, "gender")),
    }));
  }

  async fetchGroups(credentials: ConnectorCredentials): Promise<PlatformGroup[]> {
    const res = await this.fetch("/tags/list_tags", credentials);
    const data = (await res.json()) as Record<string, unknown>[];

    // Breeze uses "tags" as their group system
    return data.map((tag) => ({
      externalId: String(tag.id),
      name: String(tag.name ?? ""),
      description: String(tag.description ?? ""),
      type: "OTHER",
    }));
  }

  async fetchEvents(credentials: ConnectorCredentials): Promise<PlatformEvent[]> {
    const res = await this.fetch("/events?start=2020-01-01&end=2030-12-31", credentials);
    const data = (await res.json()) as Record<string, unknown>[];

    return data.map((event) => ({
      externalId: String(event.id),
      name: String(event.name ?? ""),
      date: String(event.start_datetime ?? ""),
      endDate: event.end_datetime ? String(event.end_datetime) : undefined,
      type: "OTHER",
    }));
  }
}

function extractBreezeField(person: Record<string, unknown>, fieldName: string): string | null {
  const details = person.details as Record<string, unknown>[] | undefined;
  if (!details) return null;

  for (const detail of details) {
    const fields = detail.fields as Record<string, unknown>[] | undefined;
    if (!fields) continue;

    for (const field of fields) {
      if (String(field.field_id).includes(fieldName) || String(field.name).toLowerCase().includes(fieldName)) {
        return field.value ? String(field.value) : null;
      }
    }
  }
  return null;
}

function mapBreezeStatus(status: string): string {
  const lower = status.toLowerCase();
  if (lower.includes("member")) return "MEMBER";
  if (lower.includes("regular") || lower.includes("active")) return "REGULAR";
  if (lower.includes("visitor") || lower.includes("guest")) return "VISITOR";
  if (lower.includes("inactive")) return "INACTIVE";
  return "VISITOR";
}

function mapBreezeGender(gender: string | null): string | undefined {
  if (!gender) return undefined;
  const g = gender.toLowerCase();
  if (g.includes("male") || g === "m") return "MALE";
  if (g.includes("female") || g === "f") return "FEMALE";
  return undefined;
}
