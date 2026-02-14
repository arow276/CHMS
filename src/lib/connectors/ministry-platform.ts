import {
  BaseConnector,
  type ConnectorCredentials,
  type PlatformPerson,
  type PlatformGroup,
  type PlatformEvent,
} from "./types";

export class MinistryPlatformConnector extends BaseConnector {
  platform = "ministry_platform";
  displayName = "Ministry Platform";

  private getBaseUrl(credentials: ConnectorCredentials): string {
    return `https://${credentials.subdomain}/ministryplatformapi`;
  }

  private async fetch(path: string, credentials: ConnectorCredentials): Promise<Response> {
    const baseUrl = this.getBaseUrl(credentials);

    const res = await fetch(`${baseUrl}${path}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${credentials.accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Ministry Platform API error: ${res.status} ${res.statusText}`);
    }
    return res;
  }

  async testConnection(credentials: ConnectorCredentials): Promise<boolean> {
    try {
      await this.fetch("/tables/Contacts?$top=1", credentials);
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
        `/tables/Contacts?$top=${top}&$skip=${skip}&$select=Contact_ID,First_Name,Last_Name,Email_Address,Mobile_Phone,Date_of_Birth,Gender_ID`,
        credentials,
      );
      const data = (await res.json()) as Record<string, unknown>[];

      if (data.length === 0) {
        hasMore = false;
        break;
      }

      for (const p of data) {
        results.push({
          externalId: String(p.Contact_ID),
          firstName: String(p.First_Name ?? ""),
          lastName: String(p.Last_Name ?? ""),
          email: p.Email_Address ? String(p.Email_Address) : undefined,
          phone: p.Mobile_Phone ? String(p.Mobile_Phone) : undefined,
          dateOfBirth: p.Date_of_Birth ? String(p.Date_of_Birth) : undefined,
          gender: Number(p.Gender_ID) === 1 ? "MALE" : Number(p.Gender_ID) === 2 ? "FEMALE" : undefined,
          status: "VISITOR",
        });
      }

      skip += top;
      if (data.length < top) hasMore = false;
    }

    return results;
  }

  async fetchGroups(credentials: ConnectorCredentials): Promise<PlatformGroup[]> {
    const res = await this.fetch(
      "/tables/Groups?$select=Group_ID,Group_Name,Description,Group_Type_ID&$top=500",
      credentials,
    );
    const data = (await res.json()) as Record<string, unknown>[];

    return data.map((g) => ({
      externalId: String(g.Group_ID),
      name: String(g.Group_Name ?? ""),
      description: g.Description ? String(g.Description) : undefined,
      type: "OTHER",
    }));
  }

  async fetchEvents(credentials: ConnectorCredentials): Promise<PlatformEvent[]> {
    const res = await this.fetch(
      "/tables/Events?$select=Event_ID,Event_Title,Event_Start_Date,Event_End_Date,Event_Type_ID&$top=200&$orderby=Event_Start_Date desc",
      credentials,
    );
    const data = (await res.json()) as Record<string, unknown>[];

    return data.map((e) => ({
      externalId: String(e.Event_ID),
      name: String(e.Event_Title ?? ""),
      date: String(e.Event_Start_Date ?? ""),
      endDate: e.Event_End_Date ? String(e.Event_End_Date) : undefined,
      type: "OTHER",
    }));
  }
}
