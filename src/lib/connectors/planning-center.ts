import {
  BaseConnector,
  type ConnectorCredentials,
  type PlatformPerson,
  type PlatformGroup,
  type PlatformEvent,
} from "./types";

const API_BASE = "https://api.planningcenteronline.com";

export class PlanningCenterConnector extends BaseConnector {
  platform = "planning_center";
  displayName = "Planning Center";

  private async fetch(path: string, credentials: ConnectorCredentials): Promise<Response> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (credentials.accessToken) {
      headers["Authorization"] = `Bearer ${credentials.accessToken}`;
    } else if (credentials.apiKey && credentials.apiSecret) {
      // Personal Access Token (app_id:secret as Basic auth)
      const encoded = Buffer.from(`${credentials.apiKey}:${credentials.apiSecret}`).toString("base64");
      headers["Authorization"] = `Basic ${encoded}`;
    }

    const res = await fetch(`${API_BASE}${path}`, { headers });
    if (!res.ok) {
      throw new Error(`Planning Center API error: ${res.status} ${res.statusText}`);
    }
    return res;
  }

  private async fetchAllPages(path: string, credentials: ConnectorCredentials): Promise<Record<string, unknown>[]> {
    const results: Record<string, unknown>[] = [];
    let nextUrl: string | null = path;

    while (nextUrl) {
      const res = await this.fetch(nextUrl, credentials);
      const json = await res.json() as { data: Record<string, unknown>[]; links?: { next?: string } };
      results.push(...json.data);
      nextUrl = json.links?.next?.replace(API_BASE, "") ?? null;
    }

    return results;
  }

  async testConnection(credentials: ConnectorCredentials): Promise<boolean> {
    try {
      await this.fetch("/people/v2/me", credentials);
      return true;
    } catch {
      return false;
    }
  }

  async fetchPeople(credentials: ConnectorCredentials): Promise<PlatformPerson[]> {
    const data = await this.fetchAllPages(
      "/people/v2/people?include=emails,phone_numbers,addresses,households&per_page=100",
      credentials,
    );

    return data.map((person) => {
      const attrs = person.attributes as Record<string, string>;
      return {
        externalId: person.id as string,
        firstName: attrs.first_name ?? "",
        lastName: attrs.last_name ?? "",
        email: attrs.primary_email ?? undefined,
        phone: attrs.primary_phone ?? undefined,
        status: mapPCOStatus(attrs.membership ?? attrs.status ?? ""),
        dateOfBirth: attrs.birthdate ?? undefined,
        gender: attrs.gender === "M" ? "MALE" : attrs.gender === "F" ? "FEMALE" : undefined,
      };
    });
  }

  async fetchGroups(credentials: ConnectorCredentials): Promise<PlatformGroup[]> {
    const data = await this.fetchAllPages("/groups/v2/groups?per_page=100", credentials);

    return data.map((group) => {
      const attrs = group.attributes as Record<string, string>;
      return {
        externalId: group.id as string,
        name: attrs.name ?? "",
        description: attrs.description ?? undefined,
        type: mapPCOGroupType(attrs.group_type ?? ""),
      };
    });
  }

  async fetchEvents(credentials: ConnectorCredentials): Promise<PlatformEvent[]> {
    const data = await this.fetchAllPages(
      "/calendar/v2/events?per_page=100&order=-starts_at",
      credentials,
    );

    return data.map((event) => {
      const attrs = event.attributes as Record<string, string>;
      return {
        externalId: event.id as string,
        name: attrs.name ?? "",
        date: attrs.starts_at ?? "",
        endDate: attrs.ends_at ?? undefined,
        type: "OTHER",
      };
    });
  }
}

function mapPCOStatus(status: string): string {
  const lower = status.toLowerCase();
  if (lower.includes("member")) return "MEMBER";
  if (lower.includes("regular") || lower.includes("active")) return "REGULAR";
  if (lower.includes("visitor") || lower.includes("guest")) return "VISITOR";
  if (lower.includes("inactive")) return "INACTIVE";
  return "VISITOR";
}

function mapPCOGroupType(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes("small") || lower.includes("life") || lower.includes("connect")) return "LIFE_GROUP";
  if (lower.includes("ministry") || lower.includes("serve")) return "MINISTRY";
  if (lower.includes("class") || lower.includes("study")) return "CLASS";
  if (lower.includes("committee") || lower.includes("board")) return "COMMITTEE";
  return "OTHER";
}
