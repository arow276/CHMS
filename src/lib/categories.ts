import { db } from "@/lib/db";

// Default category definitions that come with Shepherd
// Churches can customize labels, add new values, or replace entirely
export const DEFAULT_CATEGORIES: {
  category: string;
  value: string;
  label: string;
  isSystem: boolean;
  sortOrder: number;
  color?: string;
}[] = [
  // Person Status
  { category: "person_status", value: "VISITOR", label: "Visitor", isSystem: true, sortOrder: 0 },
  { category: "person_status", value: "REGULAR", label: "Regular", isSystem: true, sortOrder: 1 },
  { category: "person_status", value: "MEMBER", label: "Member", isSystem: true, sortOrder: 2 },
  { category: "person_status", value: "INACTIVE", label: "Inactive", isSystem: true, sortOrder: 3 },

  // Group Type
  { category: "group_type", value: "LIFE_GROUP", label: "Life Group", isSystem: false, sortOrder: 0 },
  { category: "group_type", value: "MINISTRY", label: "Ministry", isSystem: false, sortOrder: 1 },
  { category: "group_type", value: "CLASS", label: "Class", isSystem: false, sortOrder: 2 },
  { category: "group_type", value: "COMMITTEE", label: "Committee", isSystem: false, sortOrder: 3 },
  { category: "group_type", value: "OTHER", label: "Other", isSystem: false, sortOrder: 4 },

  // Event Type
  { category: "event_type", value: "SUNDAY_SERVICE", label: "Sunday Service", isSystem: true, sortOrder: 0 },
  { category: "event_type", value: "SMALL_GROUP", label: "Small Group", isSystem: false, sortOrder: 1 },
  { category: "event_type", value: "SPECIAL_EVENT", label: "Special Event", isSystem: false, sortOrder: 2 },
  { category: "event_type", value: "CLASS", label: "Class", isSystem: false, sortOrder: 3 },
  { category: "event_type", value: "OTHER", label: "Other", isSystem: false, sortOrder: 4 },

  // Group Member Role
  { category: "group_member_role", value: "LEADER", label: "Leader", isSystem: true, sortOrder: 0 },
  { category: "group_member_role", value: "CO_LEADER", label: "Co-Leader", isSystem: false, sortOrder: 1 },
  { category: "group_member_role", value: "MEMBER", label: "Member", isSystem: true, sortOrder: 2 },

  // Household Role
  { category: "household_role", value: "HEAD", label: "Head", isSystem: true, sortOrder: 0 },
  { category: "household_role", value: "SPOUSE", label: "Spouse", isSystem: true, sortOrder: 1 },
  { category: "household_role", value: "CHILD", label: "Child", isSystem: false, sortOrder: 2 },
  { category: "household_role", value: "MEMBER", label: "Member", isSystem: false, sortOrder: 3 },
  { category: "household_role", value: "OTHER", label: "Other", isSystem: false, sortOrder: 4 },
];

export async function getCategoryOptions(category: string) {
  const definitions = await db.categoryDefinition.findMany({
    where: { category },
    orderBy: { sortOrder: "asc" },
  });

  // If no custom definitions exist, return defaults
  if (definitions.length === 0) {
    return DEFAULT_CATEGORIES.filter((c) => c.category === category).map(
      (c) => ({ value: c.value, label: c.label })
    );
  }

  return definitions.map((d) => ({ value: d.value, label: d.label }));
}

export async function getAllCategoryOptions() {
  const definitions = await db.categoryDefinition.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  if (definitions.length === 0) {
    // Group defaults by category
    const grouped: Record<string, { value: string; label: string }[]> = {};
    for (const c of DEFAULT_CATEGORIES) {
      if (!grouped[c.category]) grouped[c.category] = [];
      grouped[c.category].push({ value: c.value, label: c.label });
    }
    return grouped;
  }

  const grouped: Record<string, { value: string; label: string }[]> = {};
  for (const d of definitions) {
    if (!grouped[d.category]) grouped[d.category] = [];
    grouped[d.category].push({ value: d.value, label: d.label });
  }
  return grouped;
}

export async function seedDefaultCategories() {
  const existing = await db.categoryDefinition.count();
  if (existing > 0) return;

  await db.categoryDefinition.createMany({
    data: DEFAULT_CATEGORIES,
  });
}

export function getCategoryLabel(
  definitions: { value: string; label: string }[],
  value: string,
): string {
  return definitions.find((d) => d.value === value)?.label ?? value;
}
