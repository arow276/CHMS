"use server";

import { db } from "@/lib/db";
import { getConnector, type ConnectorCredentials } from "@/lib/connectors";
import { PLATFORM_CONFIGS } from "@/lib/connectors/types";
import { executeImport, type ColumnMapping, type CategoryMapping } from "@/lib/import/importer";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

export async function getConnectors() {
  return db.chmsConnector.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      platform: true,
      displayName: true,
      status: true,
      lastSyncAt: true,
      lastError: true,
      syncSchedule: true,
      createdAt: true,
    },
  });
}

export async function saveConnector(
  platform: string,
  credentials: ConnectorCredentials,
  displayName?: string,
) {
  const config = PLATFORM_CONFIGS[platform];
  if (!config) return { error: `Unknown platform: ${platform}` };

  // Test the connection
  const connector = getConnector(platform);
  if (!connector) return { error: `No connector for platform: ${platform}` };

  let connected = false;
  try {
    connected = await connector.testConnection(credentials);
  } catch {
    connected = false;
  }

  // Check if a connector for this platform already exists
  const existing = await db.chmsConnector.findFirst({
    where: { platform },
  });

  if (existing) {
    await db.chmsConnector.update({
      where: { id: existing.id },
      data: {
        credentials: credentials as unknown as Prisma.JsonObject,
        status: connected ? "connected" : "error",
        lastError: connected ? null : "Could not connect with provided credentials",
        displayName: displayName ?? config.displayName,
      },
    });
    revalidatePath("/import/connectors");
    return { id: existing.id, connected };
  }

  const record = await db.chmsConnector.create({
    data: {
      platform,
      displayName: displayName ?? config.displayName,
      credentials: credentials as unknown as Prisma.JsonObject,
      status: connected ? "connected" : "error",
      lastError: connected ? null : "Could not connect with provided credentials",
    },
  });

  revalidatePath("/import/connectors");
  return { id: record.id, connected };
}

export async function testConnectorConnection(connectorId: string) {
  const record = await db.chmsConnector.findUnique({ where: { id: connectorId } });
  if (!record) return { error: "Connector not found" };

  const connector = getConnector(record.platform);
  if (!connector) return { error: `No connector for platform: ${record.platform}` };

  const credentials = record.credentials as unknown as ConnectorCredentials;

  try {
    const connected = await connector.testConnection(credentials);
    await db.chmsConnector.update({
      where: { id: connectorId },
      data: {
        status: connected ? "connected" : "error",
        lastError: connected ? null : "Connection test failed",
      },
    });
    revalidatePath("/import/connectors");
    return { connected };
  } catch (error) {
    await db.chmsConnector.update({
      where: { id: connectorId },
      data: {
        status: "error",
        lastError: String(error),
      },
    });
    revalidatePath("/import/connectors");
    return { connected: false, error: String(error) };
  }
}

export async function syncFromConnector(connectorId: string) {
  const record = await db.chmsConnector.findUnique({ where: { id: connectorId } });
  if (!record) return { error: "Connector not found" };

  const connector = getConnector(record.platform);
  if (!connector) return { error: `No connector for platform: ${record.platform}` };

  const credentials = record.credentials as unknown as ConnectorCredentials;

  // Update status
  await db.chmsConnector.update({
    where: { id: connectorId },
    data: { status: "syncing" },
  });

  // Create import job for tracking
  const job = await db.importJob.create({
    data: {
      source: record.platform,
      status: "importing",
      connectorId,
    },
  });

  try {
    // Fetch all data from the platform
    const [people, groups, events] = await Promise.all([
      connector.fetchPeople(credentials),
      connector.fetchGroups(credentials),
      connector.fetchEvents(credentials),
    ]);

    // Build headers and rows from platform data for the importer
    let totalImported = 0;
    let totalErrors = 0;
    const errors: { row: number; field: string; message: string }[] = [];

    // Import people
    for (const person of people) {
      try {
        const validStatuses = ["VISITOR", "REGULAR", "MEMBER", "INACTIVE"];
        const status = validStatuses.includes(person.status ?? "") ? person.status! : "VISITOR";

        let gender: "MALE" | "FEMALE" | "NOT_SPECIFIED" = "NOT_SPECIFIED";
        if (person.gender === "MALE") gender = "MALE";
        else if (person.gender === "FEMALE") gender = "FEMALE";

        let dateOfBirth: Date | null = null;
        if (person.dateOfBirth) {
          const d = new Date(person.dateOfBirth);
          if (!isNaN(d.getTime())) dateOfBirth = d;
        }

        // Check for existing person by email or name
        const existing = person.email
          ? await db.person.findFirst({ where: { email: person.email } })
          : await db.person.findFirst({
              where: { firstName: person.firstName, lastName: person.lastName },
            });

        if (existing) {
          await db.person.update({
            where: { id: existing.id },
            data: {
              ...(person.phone && { phone: person.phone }),
              ...(dateOfBirth && { dateOfBirth }),
              ...(gender !== "NOT_SPECIFIED" && { gender }),
            },
          });
        } else {
          await db.person.create({
            data: {
              firstName: person.firstName,
              lastName: person.lastName,
              email: person.email || null,
              phone: person.phone || null,
              status: status as "VISITOR" | "REGULAR" | "MEMBER" | "INACTIVE",
              dateOfBirth,
              gender,
            },
          });
        }
        totalImported++;
      } catch (error) {
        totalErrors++;
        errors.push({
          row: totalImported,
          field: "person",
          message: `Failed to import ${person.firstName} ${person.lastName}: ${String(error)}`,
        });
      }
    }

    // Import groups
    for (const group of groups) {
      try {
        const existing = await db.group.findFirst({ where: { name: group.name } });
        if (!existing) {
          const validTypes = ["LIFE_GROUP", "MINISTRY", "CLASS", "COMMITTEE", "OTHER"];
          const type = validTypes.includes(group.type ?? "") ? group.type! : "OTHER";

          await db.group.create({
            data: {
              name: group.name,
              description: group.description || null,
              type: type as "LIFE_GROUP" | "MINISTRY" | "CLASS" | "COMMITTEE" | "OTHER",
            },
          });
          totalImported++;
        }
      } catch (error) {
        totalErrors++;
        errors.push({
          row: totalImported,
          field: "group",
          message: `Failed to import group ${group.name}: ${String(error)}`,
        });
      }
    }

    // Import events
    for (const event of events) {
      try {
        const date = new Date(event.date);
        if (isNaN(date.getTime())) continue;

        const validTypes = ["SUNDAY_SERVICE", "SMALL_GROUP", "SPECIAL_EVENT", "CLASS", "OTHER"];
        const type = validTypes.includes(event.type ?? "") ? event.type! : "OTHER";

        await db.event.create({
          data: {
            name: event.name,
            date,
            endDate: event.endDate ? new Date(event.endDate) : null,
            type: type as "SUNDAY_SERVICE" | "SMALL_GROUP" | "SPECIAL_EVENT" | "CLASS" | "OTHER",
          },
        });
        totalImported++;
      } catch (error) {
        totalErrors++;
        errors.push({
          row: totalImported,
          field: "event",
          message: `Failed to import event ${event.name}: ${String(error)}`,
        });
      }
    }

    // Update job and connector status
    await db.importJob.update({
      where: { id: job.id },
      data: {
        status: "complete",
        totalRows: people.length + groups.length + events.length,
        importedRows: totalImported,
        errorRows: totalErrors,
        errors: errors as unknown as Prisma.JsonArray,
        importedData: {
          people: people.length,
          groups: groups.length,
          events: events.length,
        } as unknown as Prisma.JsonObject,
      },
    });

    await db.chmsConnector.update({
      where: { id: connectorId },
      data: {
        status: "connected",
        lastSyncAt: new Date(),
        lastError: null,
      },
    });

    revalidatePath("/import");
    revalidatePath("/import/connectors");
    revalidatePath("/people");
    revalidatePath("/groups");
    revalidatePath("/events");

    return {
      success: true,
      imported: totalImported,
      errors: totalErrors,
    };
  } catch (error) {
    await db.importJob.update({
      where: { id: job.id },
      data: {
        status: "error",
        errors: [{
          row: -1,
          field: "system",
          message: String(error),
        }] as unknown as Prisma.JsonArray,
      },
    });

    await db.chmsConnector.update({
      where: { id: connectorId },
      data: {
        status: "error",
        lastError: String(error),
      },
    });

    revalidatePath("/import/connectors");
    return { error: String(error) };
  }
}

export async function deleteConnector(connectorId: string) {
  await db.chmsConnector.delete({ where: { id: connectorId } });
  revalidatePath("/import/connectors");
}

export async function updateSyncSchedule(connectorId: string, schedule: string) {
  await db.chmsConnector.update({
    where: { id: connectorId },
    data: { syncSchedule: schedule },
  });
  revalidatePath("/import/connectors");
}
