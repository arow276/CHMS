import {
  BaseConnector,
  type ConnectorCredentials,
  type PlatformPerson,
  type PlatformGroup,
  type PlatformEvent,
} from "./types";

const API_BASE = "https://api.elvanto.com/v1";

export class ElvantoConnector extends BaseConnector {
  platform = "elvanto";
  displayName = "Elvanto (Tithe.ly)";

  private async fetch(path: string, credentials: ConnectorCredentials, body?: Record<string, unknown>): Promise<Record<string, unknown>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (credentials.accessToken) {
      headers["Authorization"] = `Bearer ${credentials.accessToken}`;
    } else if (credentials.apiKey) {
      headers["Authorization"] = `Basic ${Buffer.from(`${credentials.apiKey}:`).toString("base64")}`;
    }

    const res = await fetch(`${API_BASE}${path}.json`, {
      method: "POST",
      headers,
      body: JSON.stringify(body ?? {}),
    });

    if (!res.ok) {
      throw new Error(`Elvanto API error: ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<Record<string, unknown>>;
  }

  async testConnection(credentials: ConnectorCredentials): Promise<boolean> {
    try {
      await this.fetch("/people/getInfo", credentials);
      return true;
    } catch {
      return false;
    }
  }

  async fetchPeople(credentials: ConnectorCredentials): Promise<PlatformPerson[]> {
    const results: PlatformPerson[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const data = await this.fetch("/people/getAll", credentials, {
        page,
        page_size: 100,
        fields: ["gender", "birthday", "phone", "email", "home_address"],
      });

      const people = ((data.people as Record<string, unknown>)?.person ?? []) as Record<string, unknown>[];
      if (people.length === 0) {
        hasMore = false;
        break;
      }

      for (const p of people) {
        results.push({
          externalId: String(p.id),
          firstName: String(p.firstname ?? ""),
          lastName: String(p.lastname ?? ""),
          email: p.email ? String(p.email) : undefined,
          phone: p.phone ? String(p.phone) : undefined,
          dateOfBirth: p.birthday ? String(p.birthday) : undefined,
          gender: mapElvantoGender(String(p.gender ?? "")),
          status: "VISITOR",
          address: p.home_address ? String((p.home_address as Record<string, unknown>).line1 ?? "") : undefined,
          city: p.home_address ? String((p.home_address as Record<string, unknown>).city ?? "") : undefined,
          state: p.home_address ? String((p.home_address as Record<string, unknown>).state ?? "") : undefined,
          zip: p.home_address ? String((p.home_address as Record<string, unknown>).postcode ?? "") : undefined,
        });
      }

      page++;
      if (people.length < 100) hasMore = false;
    }

    return results;
  }

  async fetchGroups(credentials: ConnectorCredentials): Promise<PlatformGroup[]> {
    const data = await this.fetch("/groups/getAll", credentials, { page_size: 100 });
    const groups = ((data.groups as Record<string, unknown>)?.group ?? []) as Record<string, unknown>[];

    return groups.map((g) => ({
      externalId: String(g.id),
      name: String(g.name ?? ""),
      description: String(g.description ?? ""),
      type: "OTHER",
    }));
  }

  async fetchEvents(credentials: ConnectorCredentials): Promise<PlatformEvent[]> {
    const data = await this.fetch("/services/getAll", credentials, { page_size: 100 });
    const services = ((data.services as Record<string, unknown>)?.service ?? []) as Record<string, unknown>[];

    return services.map((s) => ({
      externalId: String(s.id),
      name: String(s.name ?? ""),
      date: String(s.date ?? ""),
      type: "SUNDAY_SERVICE",
    }));
  }
}

function mapElvantoGender(gender: string): string | undefined {
  if (gender === "Male" || gender === "M") return "MALE";
  if (gender === "Female" || gender === "F") return "FEMALE";
  return undefined;
}
