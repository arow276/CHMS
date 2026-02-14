import {
  BaseConnector,
  type ConnectorCredentials,
  type PlatformPerson,
  type PlatformGroup,
  type PlatformEvent,
} from "./types";

export class FellowshipOneConnector extends BaseConnector {
  platform = "fellowship_one";
  displayName = "Fellowship One";

  private getBaseUrl(credentials: ConnectorCredentials): string {
    return `https://${credentials.subdomain}.fellowshiponeapi.com/v1`;
  }

  private async fetch(path: string, credentials: ConnectorCredentials): Promise<Response> {
    const baseUrl = this.getBaseUrl(credentials);

    const res = await fetch(`${baseUrl}${path}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${credentials.accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Fellowship One API error: ${res.status} ${res.statusText}`);
    }
    return res;
  }

  async testConnection(credentials: ConnectorCredentials): Promise<boolean> {
    try {
      await this.fetch("/People/Search.json?searchFor=test&recordsPerPage=1", credentials);
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
      const res = await this.fetch(
        `/People/Search.json?recordsPerPage=100&page=${page}&include=communications,addresses`,
        credentials,
      );
      const data = (await res.json()) as { people?: { person?: Record<string, unknown>[] } };
      const people = data.people?.person ?? [];

      if (people.length === 0) {
        hasMore = false;
        break;
      }

      for (const p of people) {
        results.push({
          externalId: String(p["@id"] ?? p.id ?? ""),
          firstName: String(p.firstName ?? ""),
          lastName: String(p.lastName ?? ""),
          email: extractF1Email(p),
          phone: extractF1Phone(p),
          dateOfBirth: p.dateOfBirth ? String(p.dateOfBirth) : undefined,
          gender: String(p.gender ?? "").toUpperCase() === "MALE" ? "MALE" : String(p.gender ?? "").toUpperCase() === "FEMALE" ? "FEMALE" : undefined,
          status: mapF1Status(String((p.status as Record<string, unknown>)?.name ?? "")),
        });
      }

      page++;
      if (people.length < 100) hasMore = false;
    }

    return results;
  }

  async fetchGroups(credentials: ConnectorCredentials): Promise<PlatformGroup[]> {
    const res = await this.fetch("/Groups.json?recordsPerPage=500", credentials);
    const data = (await res.json()) as { groups?: { group?: Record<string, unknown>[] } };
    const groups = data.groups?.group ?? [];

    return groups.map((g) => ({
      externalId: String(g["@id"] ?? g.id ?? ""),
      name: String(g.name ?? ""),
      description: g.description ? String(g.description) : undefined,
      type: mapF1GroupType(String((g.groupType as Record<string, unknown>)?.name ?? "")),
    }));
  }

  async fetchEvents(credentials: ConnectorCredentials): Promise<PlatformEvent[]> {
    // Fellowship One doesn't have a strong events API
    // Events are typically managed through schedules
    return [];
  }
}

function extractF1Email(person: Record<string, unknown>): string | undefined {
  const comms = (person.communications as Record<string, unknown>)?.communication as Record<string, unknown>[] | undefined;
  if (!comms) return undefined;
  const email = comms.find((c) => String((c.communicationType as Record<string, unknown>)?.name ?? "").toLowerCase().includes("email"));
  return email ? String(email.communicationValue ?? "") : undefined;
}

function extractF1Phone(person: Record<string, unknown>): string | undefined {
  const comms = (person.communications as Record<string, unknown>)?.communication as Record<string, unknown>[] | undefined;
  if (!comms) return undefined;
  const phone = comms.find((c) => {
    const type = String((c.communicationType as Record<string, unknown>)?.name ?? "").toLowerCase();
    return type.includes("phone") || type.includes("mobile") || type.includes("cell");
  });
  return phone ? String(phone.communicationValue ?? "") : undefined;
}

function mapF1Status(status: string): string {
  const lower = status.toLowerCase();
  if (lower.includes("member")) return "MEMBER";
  if (lower.includes("regular") || lower.includes("active") || lower.includes("attendee")) return "REGULAR";
  if (lower.includes("visitor") || lower.includes("guest") || lower.includes("first")) return "VISITOR";
  if (lower.includes("inactive") || lower.includes("deceased") || lower.includes("dropped")) return "INACTIVE";
  return "VISITOR";
}

function mapF1GroupType(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes("small") || lower.includes("life") || lower.includes("connect") || lower.includes("home")) return "LIFE_GROUP";
  if (lower.includes("ministry") || lower.includes("serve") || lower.includes("volunteer")) return "MINISTRY";
  if (lower.includes("class") || lower.includes("study") || lower.includes("discipleship")) return "CLASS";
  if (lower.includes("committee") || lower.includes("board") || lower.includes("elder") || lower.includes("deacon")) return "COMMITTEE";
  return "OTHER";
}
