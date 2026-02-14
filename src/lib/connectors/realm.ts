import {
  BaseConnector,
  type ConnectorCredentials,
  type PlatformPerson,
  type PlatformGroup,
  type PlatformEvent,
} from "./types";

const API_BASE = "https://api.realm.io/v1";

export class RealmConnector extends BaseConnector {
  platform = "realm";
  displayName = "Realm (ACS Technologies)";

  private async fetch(path: string, credentials: ConnectorCredentials): Promise<Response> {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${credentials.accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Realm API error: ${res.status} ${res.statusText}`);
    }
    return res;
  }

  async testConnection(credentials: ConnectorCredentials): Promise<boolean> {
    try {
      await this.fetch("/individuals?page=1&pageSize=1", credentials);
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
      const res = await this.fetch(`/individuals?page=${page}&pageSize=100`, credentials);
      const data = (await res.json()) as { results?: Record<string, unknown>[]; totalPageCount?: number };
      const people = data.results ?? [];

      if (people.length === 0) {
        hasMore = false;
        break;
      }

      for (const p of people) {
        results.push({
          externalId: String(p.individualId ?? p.id ?? ""),
          firstName: String(p.firstName ?? p.first ?? ""),
          lastName: String(p.lastName ?? p.last ?? ""),
          email: p.email ? String(p.email) : undefined,
          phone: p.phone ? String(p.phone) : undefined,
          dateOfBirth: p.dateOfBirth ? String(p.dateOfBirth) : undefined,
          gender: mapRealmGender(String(p.gender ?? "")),
          status: mapRealmStatus(String(p.memberStatus ?? "")),
        });
      }

      page++;
      if (data.totalPageCount && page > data.totalPageCount) hasMore = false;
      if (people.length < 100) hasMore = false;
    }

    return results;
  }

  async fetchGroups(credentials: ConnectorCredentials): Promise<PlatformGroup[]> {
    const res = await this.fetch("/groups?pageSize=500", credentials);
    const data = (await res.json()) as { results?: Record<string, unknown>[] };
    const groups = data.results ?? [];

    return groups.map((g) => ({
      externalId: String(g.groupId ?? g.id ?? ""),
      name: String(g.name ?? ""),
      description: g.description ? String(g.description) : undefined,
      type: mapRealmGroupType(String(g.groupType ?? "")),
    }));
  }

  async fetchEvents(credentials: ConnectorCredentials): Promise<PlatformEvent[]> {
    const res = await this.fetch("/events?pageSize=200", credentials);
    const data = (await res.json()) as { results?: Record<string, unknown>[] };
    const events = data.results ?? [];

    return events.map((e) => ({
      externalId: String(e.eventId ?? e.id ?? ""),
      name: String(e.name ?? e.title ?? ""),
      date: String(e.startDate ?? e.date ?? ""),
      endDate: e.endDate ? String(e.endDate) : undefined,
      type: "OTHER",
    }));
  }
}

function mapRealmGender(gender: string): string | undefined {
  const g = gender.toLowerCase();
  if (g === "male" || g === "m") return "MALE";
  if (g === "female" || g === "f") return "FEMALE";
  return undefined;
}

function mapRealmStatus(status: string): string {
  const lower = status.toLowerCase();
  if (lower.includes("member")) return "MEMBER";
  if (lower.includes("regular") || lower.includes("active") || lower.includes("attendee")) return "REGULAR";
  if (lower.includes("visitor") || lower.includes("guest") || lower.includes("prospect")) return "VISITOR";
  if (lower.includes("inactive") || lower.includes("former")) return "INACTIVE";
  return "VISITOR";
}

function mapRealmGroupType(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes("small") || lower.includes("life") || lower.includes("connect")) return "LIFE_GROUP";
  if (lower.includes("ministry") || lower.includes("serve")) return "MINISTRY";
  if (lower.includes("class") || lower.includes("study")) return "CLASS";
  if (lower.includes("committee") || lower.includes("board")) return "COMMITTEE";
  return "OTHER";
}
