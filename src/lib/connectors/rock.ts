import {
  BaseConnector,
  type ConnectorCredentials,
  type PlatformPerson,
  type PlatformGroup,
  type PlatformEvent,
} from "./types";

export class RockConnector extends BaseConnector {
  platform = "rock_rms";
  displayName = "Rock RMS";

  private getBaseUrl(credentials: ConnectorCredentials): string {
    return `https://${credentials.subdomain}/api`;
  }

  private async fetch(path: string, credentials: ConnectorCredentials): Promise<Response> {
    const baseUrl = this.getBaseUrl(credentials);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (credentials.apiKey) {
      headers["Authorization-Token"] = credentials.apiKey;
    }

    const res = await fetch(`${baseUrl}${path}`, { headers });
    if (!res.ok) {
      throw new Error(`Rock RMS API error: ${res.status} ${res.statusText}`);
    }
    return res;
  }

  async testConnection(credentials: ConnectorCredentials): Promise<boolean> {
    try {
      await this.fetch("/People?$top=1", credentials);
      return true;
    } catch {
      return false;
    }
  }

  async fetchPeople(credentials: ConnectorCredentials): Promise<PlatformPerson[]> {
    const results: PlatformPerson[] = [];
    let skip = 0;
    const top = 100;
    let hasMore = true;

    while (hasMore) {
      const res = await this.fetch(
        `/People?$top=${top}&$skip=${skip}&$select=Id,FirstName,LastName,Email,Gender,BirthDate&$filter=IsDeceased eq false`,
        credentials,
      );
      const data = (await res.json()) as Record<string, unknown>[];

      if (data.length === 0) {
        hasMore = false;
        break;
      }

      for (const p of data) {
        results.push({
          externalId: String(p.Id),
          firstName: String(p.FirstName ?? ""),
          lastName: String(p.LastName ?? ""),
          email: p.Email ? String(p.Email) : undefined,
          dateOfBirth: p.BirthDate ? String(p.BirthDate) : undefined,
          gender: mapRockGender(p.Gender as number),
          status: mapRockConnectionStatus(String(p.ConnectionStatusValueId ?? "")),
        });
      }

      skip += top;
      if (data.length < top) hasMore = false;
    }

    // Fetch phone numbers separately
    for (const person of results.slice(0, 500)) {
      try {
        const res = await this.fetch(
          `/PhoneNumbers?$filter=PersonId eq ${person.externalId}&$select=Number,NumberTypeValueId&$top=1`,
          credentials,
        );
        const phones = (await res.json()) as Record<string, unknown>[];
        if (phones.length > 0) {
          person.phone = String(phones[0].Number ?? "");
        }
      } catch {
        // Non-fatal
      }
    }

    return results;
  }

  async fetchGroups(credentials: ConnectorCredentials): Promise<PlatformGroup[]> {
    const res = await this.fetch(
      "/Groups?$select=Id,Name,Description,GroupTypeId&$filter=IsActive eq true&$top=500",
      credentials,
    );
    const data = (await res.json()) as Record<string, unknown>[];

    return data.map((g) => ({
      externalId: String(g.Id),
      name: String(g.Name ?? ""),
      description: g.Description ? String(g.Description) : undefined,
      type: "OTHER",
    }));
  }

  async fetchEvents(credentials: ConnectorCredentials): Promise<PlatformEvent[]> {
    const res = await this.fetch(
      "/EventItems?$select=Id,Name,DateTime&$orderby=DateTime desc&$top=200",
      credentials,
    );
    const data = (await res.json()) as Record<string, unknown>[];

    return data.map((e) => ({
      externalId: String(e.Id),
      name: String(e.Name ?? ""),
      date: String(e.DateTime ?? ""),
      type: "OTHER",
    }));
  }
}

function mapRockGender(gender: number | undefined): string | undefined {
  if (gender === 1) return "MALE";
  if (gender === 2) return "FEMALE";
  return undefined;
}

function mapRockConnectionStatus(statusId: string): string {
  // Rock RMS uses numeric IDs for connection status
  // These vary by installation; defaults: 65=Member, 66=Attendee, 67=Visitor, 146=Prospect
  // We'll default to VISITOR and let the AI mapping handle the rest
  return "VISITOR";
}
