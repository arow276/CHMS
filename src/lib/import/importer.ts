import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export interface ColumnMapping {
  [sourceColumn: string]: {
    targetField: string | null;
    transform?: string; // "uppercase", "lowercase", "date", "phone"
  };
}

export interface CategoryMapping {
  [sourceCategory: string]: {
    [sourceValue: string]: string; // mapped internal value
  };
}

export interface ImportResult {
  importedRows: number;
  skippedRows: number;
  errorRows: number;
  errors: { row: number; field: string; message: string }[];
  summary: {
    people: number;
    households: number;
    groups: number;
    events: number;
  };
}

export async function executeImport(
  jobId: string,
  headers: string[],
  rows: string[][],
  columnMapping: ColumnMapping,
  categoryMapping: CategoryMapping,
  detectedFormat: string,
): Promise<ImportResult> {
  const result: ImportResult = {
    importedRows: 0,
    skippedRows: 0,
    errorRows: 0,
    errors: [],
    summary: { people: 0, households: 0, groups: 0, events: 0 },
  };

  // Update job status
  await db.importJob.update({
    where: { id: jobId },
    data: { status: "importing" },
  });

  try {
    if (detectedFormat === "people" || detectedFormat === "mixed") {
      await importPeople(headers, rows, columnMapping, categoryMapping, result);
    } else if (detectedFormat === "groups") {
      await importGroups(headers, rows, columnMapping, categoryMapping, result);
    } else if (detectedFormat === "events") {
      await importEvents(headers, rows, columnMapping, result);
    } else if (detectedFormat === "attendance") {
      await importAttendance(headers, rows, columnMapping, result);
    } else {
      // Default to people import
      await importPeople(headers, rows, columnMapping, categoryMapping, result);
    }

    await db.importJob.update({
      where: { id: jobId },
      data: {
        status: "complete",
        importedRows: result.importedRows,
        skippedRows: result.skippedRows,
        errorRows: result.errorRows,
        errors: result.errors as unknown as Prisma.JsonArray,
        importedData: result.summary as unknown as Prisma.JsonObject,
      },
    });
  } catch (error) {
    await db.importJob.update({
      where: { id: jobId },
      data: {
        status: "error",
        importedRows: result.importedRows,
        skippedRows: result.skippedRows,
        errorRows: result.errorRows,
        errors: [
          ...result.errors,
          { row: -1, field: "system", message: String(error) },
        ] as unknown as Prisma.JsonArray,
      },
    });
    throw error;
  }

  return result;
}

function getFieldValue(
  row: string[],
  headers: string[],
  columnMapping: ColumnMapping,
  targetField: string,
): string | null {
  for (const [sourceCol, mapping] of Object.entries(columnMapping)) {
    if (mapping.targetField === targetField) {
      const idx = headers.indexOf(sourceCol);
      if (idx === -1) continue;
      let val = row[idx]?.trim() ?? "";
      if (!val) return null;

      // Apply transforms
      if (mapping.transform === "uppercase") val = val.toUpperCase();
      if (mapping.transform === "lowercase") val = val.toLowerCase();
      if (mapping.transform === "phone") val = normalizePhone(val);

      return val;
    }
  }
  return null;
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === "1") {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

function mapCategoryValue(
  categoryMapping: CategoryMapping,
  category: string,
  sourceValue: string,
): string {
  return categoryMapping[category]?.[sourceValue] ?? sourceValue;
}

async function importPeople(
  headers: string[],
  rows: string[][],
  columnMapping: ColumnMapping,
  categoryMapping: CategoryMapping,
  result: ImportResult,
) {
  const householdsToCreate = new Map<string, { name: string; address: string | null }>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const firstName = getFieldValue(row, headers, columnMapping, "firstName");
      const lastName = getFieldValue(row, headers, columnMapping, "lastName");

      if (!firstName && !lastName) {
        result.skippedRows++;
        result.errors.push({ row: i + 2, field: "name", message: "No first or last name found" });
        continue;
      }

      const email = getFieldValue(row, headers, columnMapping, "email");
      const phone = getFieldValue(row, headers, columnMapping, "phone");
      const statusRaw = getFieldValue(row, headers, columnMapping, "status");
      const dobRaw = getFieldValue(row, headers, columnMapping, "dateOfBirth");
      const genderRaw = getFieldValue(row, headers, columnMapping, "gender");
      const notes = getFieldValue(row, headers, columnMapping, "notes");
      const householdName = getFieldValue(row, headers, columnMapping, "householdName");
      const householdRoleRaw = getFieldValue(row, headers, columnMapping, "householdRole");
      const address = getFieldValue(row, headers, columnMapping, "address");
      const city = getFieldValue(row, headers, columnMapping, "city");
      const state = getFieldValue(row, headers, columnMapping, "state");
      const zip = getFieldValue(row, headers, columnMapping, "zip");

      // Parse date of birth
      let dateOfBirth: Date | null = null;
      if (dobRaw) {
        const parsed = new Date(dobRaw);
        if (!isNaN(parsed.getTime())) dateOfBirth = parsed;
      }

      // Map status through category mapping
      const status = statusRaw
        ? mapCategoryValue(categoryMapping, "person_status", statusRaw)
        : "VISITOR";

      // Map gender
      let gender: "MALE" | "FEMALE" | "NOT_SPECIFIED" = "NOT_SPECIFIED";
      if (genderRaw) {
        const g = genderRaw.toUpperCase().trim();
        if (g === "M" || g === "MALE") gender = "MALE";
        else if (g === "F" || g === "FEMALE") gender = "FEMALE";
      }

      // Map household role
      const householdRole = householdRoleRaw
        ? mapCategoryValue(categoryMapping, "household_role", householdRoleRaw)
        : "MEMBER";

      // Handle household creation
      let householdId: string | null = null;
      if (householdName) {
        const fullAddress = [address, city, state, zip].filter(Boolean).join(", ");
        if (!householdsToCreate.has(householdName)) {
          householdsToCreate.set(householdName, {
            name: householdName,
            address: fullAddress || null,
          });
        }
      }

      // Check for duplicate by email or name
      const existingPerson = email
        ? await db.person.findFirst({ where: { email } })
        : await db.person.findFirst({
            where: { firstName: firstName ?? "", lastName: lastName ?? "" },
          });

      if (existingPerson) {
        // Update existing person with new data
        await db.person.update({
          where: { id: existingPerson.id },
          data: {
            ...(phone && { phone }),
            ...(dateOfBirth && { dateOfBirth }),
            ...(notes && { notes: existingPerson.notes ? `${existingPerson.notes}\n${notes}` : notes }),
            ...(gender !== "NOT_SPECIFIED" && { gender }),
          },
        });
        result.importedRows++;
      } else {
        // Create new person
        const validStatuses = ["VISITOR", "REGULAR", "MEMBER", "INACTIVE"];
        const personStatus = validStatuses.includes(status) ? status : "VISITOR";

        const validHouseholdRoles = ["HEAD", "SPOUSE", "CHILD", "MEMBER", "OTHER"];
        const personHouseholdRole = validHouseholdRoles.includes(householdRole)
          ? householdRole
          : "MEMBER";

        await db.person.create({
          data: {
            firstName: firstName ?? "Unknown",
            lastName: lastName ?? "",
            email: email || null,
            phone: phone || null,
            status: personStatus as "VISITOR" | "REGULAR" | "MEMBER" | "INACTIVE",
            dateOfBirth,
            gender,
            notes: notes || null,
            householdRole: personHouseholdRole as "HEAD" | "SPOUSE" | "CHILD" | "MEMBER" | "OTHER",
          },
        });
        result.importedRows++;
        result.summary.people++;
      }
    } catch (error) {
      result.errorRows++;
      result.errors.push({
        row: i + 2,
        field: "unknown",
        message: String(error),
      });
    }
  }

  // Create households and link members
  for (const [name, data] of householdsToCreate) {
    try {
      const household = await db.household.create({
        data: { name: data.name, address: data.address },
      });
      result.summary.households++;

      // Find people who belong to this household and update them
      // (Re-scan rows to find which people belong to this household)
      for (let i = 0; i < rows.length; i++) {
        const hhName = getFieldValue(rows[i], headers, columnMapping, "householdName");
        if (hhName === name) {
          const firstName = getFieldValue(rows[i], headers, columnMapping, "firstName") ?? "";
          const lastName = getFieldValue(rows[i], headers, columnMapping, "lastName") ?? "";
          const email = getFieldValue(rows[i], headers, columnMapping, "email");

          const person = email
            ? await db.person.findFirst({ where: { email } })
            : await db.person.findFirst({ where: { firstName, lastName } });

          if (person) {
            await db.person.update({
              where: { id: person.id },
              data: { householdId: household.id },
            });
          }
        }
      }
    } catch {
      // Household creation error — non-fatal
    }
  }
}

async function importGroups(
  headers: string[],
  rows: string[][],
  columnMapping: ColumnMapping,
  categoryMapping: CategoryMapping,
  result: ImportResult,
) {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const name = getFieldValue(row, headers, columnMapping, "name");
      if (!name) {
        result.skippedRows++;
        continue;
      }

      const description = getFieldValue(row, headers, columnMapping, "description");
      const typeRaw = getFieldValue(row, headers, columnMapping, "type") || "OTHER";
      const meetingDay = getFieldValue(row, headers, columnMapping, "meetingDay");
      const meetingTime = getFieldValue(row, headers, columnMapping, "meetingTime");

      const type = mapCategoryValue(categoryMapping, "group_type", typeRaw);
      const validTypes = ["LIFE_GROUP", "MINISTRY", "CLASS", "COMMITTEE", "OTHER"];
      const groupType = validTypes.includes(type) ? type : "OTHER";

      const existing = await db.group.findFirst({ where: { name } });
      if (existing) {
        result.skippedRows++;
        continue;
      }

      await db.group.create({
        data: {
          name,
          description: description || null,
          type: groupType as "LIFE_GROUP" | "MINISTRY" | "CLASS" | "COMMITTEE" | "OTHER",
          meetingDay: meetingDay || null,
          meetingTime: meetingTime || null,
        },
      });
      result.importedRows++;
      result.summary.groups++;
    } catch (error) {
      result.errorRows++;
      result.errors.push({ row: i + 2, field: "unknown", message: String(error) });
    }
  }
}

async function importEvents(
  headers: string[],
  rows: string[][],
  columnMapping: ColumnMapping,
  result: ImportResult,
) {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const name = getFieldValue(row, headers, columnMapping, "name");
      const dateRaw = getFieldValue(row, headers, columnMapping, "date");

      if (!name || !dateRaw) {
        result.skippedRows++;
        continue;
      }

      const date = new Date(dateRaw);
      if (isNaN(date.getTime())) {
        result.errorRows++;
        result.errors.push({ row: i + 2, field: "date", message: `Invalid date: ${dateRaw}` });
        continue;
      }

      const description = getFieldValue(row, headers, columnMapping, "description");
      const typeRaw = getFieldValue(row, headers, columnMapping, "type") || "OTHER";
      const endDateRaw = getFieldValue(row, headers, columnMapping, "endDate");

      const validTypes = ["SUNDAY_SERVICE", "SMALL_GROUP", "SPECIAL_EVENT", "CLASS", "OTHER"];
      const eventType = validTypes.includes(typeRaw.toUpperCase())
        ? typeRaw.toUpperCase()
        : "OTHER";

      let endDate: Date | null = null;
      if (endDateRaw) {
        const parsed = new Date(endDateRaw);
        if (!isNaN(parsed.getTime())) endDate = parsed;
      }

      await db.event.create({
        data: {
          name,
          description: description || null,
          type: eventType as "SUNDAY_SERVICE" | "SMALL_GROUP" | "SPECIAL_EVENT" | "CLASS" | "OTHER",
          date,
          endDate,
        },
      });
      result.importedRows++;
      result.summary.events++;
    } catch (error) {
      result.errorRows++;
      result.errors.push({ row: i + 2, field: "unknown", message: String(error) });
    }
  }
}

async function importAttendance(
  headers: string[],
  rows: string[][],
  columnMapping: ColumnMapping,
  result: ImportResult,
) {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const personName = getFieldValue(row, headers, columnMapping, "personName");
      const personEmail = getFieldValue(row, headers, columnMapping, "personEmail");
      const eventName = getFieldValue(row, headers, columnMapping, "eventName");
      const eventDateRaw = getFieldValue(row, headers, columnMapping, "eventDate");
      const statusRaw = getFieldValue(row, headers, columnMapping, "status") || "PRESENT";

      if (!eventDateRaw) {
        result.skippedRows++;
        continue;
      }

      // Find the person
      let person = null;
      if (personEmail) {
        person = await db.person.findFirst({ where: { email: personEmail } });
      }
      if (!person && personName) {
        const parts = personName.split(/\s+/);
        const firstName = parts[0];
        const lastName = parts.slice(1).join(" ");
        person = await db.person.findFirst({ where: { firstName, lastName } });
      }

      if (!person) {
        result.skippedRows++;
        result.errors.push({
          row: i + 2,
          field: "person",
          message: `Person not found: ${personEmail || personName}`,
        });
        continue;
      }

      // Find the event
      const eventDate = new Date(eventDateRaw);
      if (isNaN(eventDate.getTime())) {
        result.errorRows++;
        result.errors.push({ row: i + 2, field: "eventDate", message: `Invalid date: ${eventDateRaw}` });
        continue;
      }

      let event = null;
      if (eventName) {
        event = await db.event.findFirst({
          where: { name: eventName, date: eventDate },
        });
      }
      if (!event) {
        // Try finding by date only
        event = await db.event.findFirst({
          where: {
            date: {
              gte: new Date(eventDate.setHours(0, 0, 0, 0)),
              lte: new Date(eventDate.setHours(23, 59, 59, 999)),
            },
          },
        });
      }

      if (!event) {
        result.skippedRows++;
        result.errors.push({
          row: i + 2,
          field: "event",
          message: `Event not found for date: ${eventDateRaw}`,
        });
        continue;
      }

      const validStatuses = ["PRESENT", "ABSENT", "LATE"];
      const status = validStatuses.includes(statusRaw.toUpperCase())
        ? statusRaw.toUpperCase()
        : "PRESENT";

      await db.attendance.upsert({
        where: {
          personId_eventId: { personId: person.id, eventId: event.id },
        },
        create: {
          personId: person.id,
          eventId: event.id,
          status: status as "PRESENT" | "ABSENT" | "LATE",
        },
        update: {
          status: status as "PRESENT" | "ABSENT" | "LATE",
        },
      });
      result.importedRows++;
    } catch (error) {
      result.errorRows++;
      result.errors.push({ row: i + 2, field: "unknown", message: String(error) });
    }
  }
}
