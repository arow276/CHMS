export interface ConnectorConfig {
  platform: string;
  displayName: string;
  description: string;
  authType: "oauth2" | "api_key" | "basic" | "oauth1";
  website: string;
  logo?: string;
  capabilities: string[];
}

export interface ConnectorCredentials {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  subdomain?: string; // for platforms that use subdomain-based URLs
  username?: string;
  password?: string;
}

export interface SyncResult {
  people: number;
  households: number;
  groups: number;
  events: number;
  attendance: number;
  errors: string[];
}

export interface PlatformPerson {
  externalId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  status?: string;
  dateOfBirth?: string;
  gender?: string;
  householdName?: string;
  householdRole?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface PlatformGroup {
  externalId: string;
  name: string;
  description?: string;
  type?: string;
  members?: { externalId: string; role: string }[];
}

export interface PlatformEvent {
  externalId: string;
  name: string;
  date: string;
  endDate?: string;
  type?: string;
  attendance?: { externalId: string; status: string }[];
}

export abstract class BaseConnector {
  abstract platform: string;
  abstract displayName: string;

  abstract testConnection(credentials: ConnectorCredentials): Promise<boolean>;
  abstract fetchPeople(credentials: ConnectorCredentials): Promise<PlatformPerson[]>;
  abstract fetchGroups(credentials: ConnectorCredentials): Promise<PlatformGroup[]>;
  abstract fetchEvents(credentials: ConnectorCredentials): Promise<PlatformEvent[]>;

  getConfig(): ConnectorConfig {
    return PLATFORM_CONFIGS[this.platform];
  }
}

export const PLATFORM_CONFIGS: Record<string, ConnectorConfig> = {
  planning_center: {
    platform: "planning_center",
    displayName: "Planning Center",
    description: "Full-featured ChMS with people, groups, services, and check-ins. The most popular cloud-based church management platform.",
    authType: "oauth2",
    website: "https://www.planningcenter.com",
    capabilities: ["people", "households", "groups", "events", "attendance"],
  },
  breeze: {
    platform: "breeze",
    displayName: "Breeze ChMS",
    description: "Simple, intuitive church management software focused on ease of use.",
    authType: "api_key",
    website: "https://www.breezechms.com",
    capabilities: ["people", "groups", "events", "attendance"],
  },
  ccb: {
    platform: "ccb",
    displayName: "Church Community Builder",
    description: "Comprehensive church management by Pushpay with strong community features.",
    authType: "basic",
    website: "https://www.churchcommunitybuilder.com",
    capabilities: ["people", "households", "groups", "events", "attendance"],
  },
  elvanto: {
    platform: "elvanto",
    displayName: "Elvanto (Tithe.ly)",
    description: "All-in-one church management now part of the Tithe.ly platform.",
    authType: "oauth2",
    website: "https://www.tithe.ly",
    capabilities: ["people", "groups", "events", "attendance"],
  },
  rock_rms: {
    platform: "rock_rms",
    displayName: "Rock RMS",
    description: "Open-source relationship management system built for churches. Highly customizable.",
    authType: "api_key",
    website: "https://www.rockrms.com",
    capabilities: ["people", "households", "groups", "events", "attendance"],
  },
  fellowship_one: {
    platform: "fellowship_one",
    displayName: "Fellowship One",
    description: "Ministry-focused platform by Ministry Brands for church management and engagement.",
    authType: "oauth2",
    website: "https://fellowshipone.com",
    capabilities: ["people", "households", "groups", "events"],
  },
  ministry_platform: {
    platform: "ministry_platform",
    displayName: "Ministry Platform",
    description: "Enterprise church management by Ministry Brands with deep reporting and workflow tools.",
    authType: "oauth2",
    website: "https://www.ministryplatform.com",
    capabilities: ["people", "households", "groups", "events", "attendance"],
  },
  realm: {
    platform: "realm",
    displayName: "Realm (ACS Technologies)",
    description: "Cloud-based church management platform combining administrative and community features.",
    authType: "oauth2",
    website: "https://www.acstechnologies.com/realm",
    capabilities: ["people", "households", "groups", "events", "attendance"],
  },
};

export function getPlatformConfig(platform: string): ConnectorConfig | null {
  return PLATFORM_CONFIGS[platform] ?? null;
}

export function getAllPlatforms(): ConnectorConfig[] {
  return Object.values(PLATFORM_CONFIGS);
}
