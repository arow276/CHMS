import { type BaseConnector } from "./types";
import { PlanningCenterConnector } from "./planning-center";
import { BreezeConnector } from "./breeze";
import { CCBConnector } from "./ccb";
import { ElvantoConnector } from "./elvanto";
import { RockConnector } from "./rock";
import { FellowshipOneConnector } from "./fellowship-one";
import { MinistryPlatformConnector } from "./ministry-platform";
import { RealmConnector } from "./realm";

const connectors: Record<string, BaseConnector> = {
  planning_center: new PlanningCenterConnector(),
  breeze: new BreezeConnector(),
  ccb: new CCBConnector(),
  elvanto: new ElvantoConnector(),
  rock_rms: new RockConnector(),
  fellowship_one: new FellowshipOneConnector(),
  ministry_platform: new MinistryPlatformConnector(),
  realm: new RealmConnector(),
};

export function getConnector(platform: string): BaseConnector | null {
  return connectors[platform] ?? null;
}

export function getAllConnectors(): BaseConnector[] {
  return Object.values(connectors);
}

export { PLATFORM_CONFIGS, getAllPlatforms, getPlatformConfig } from "./types";
export type { ConnectorConfig, ConnectorCredentials, SyncResult, PlatformPerson, PlatformGroup, PlatformEvent } from "./types";
