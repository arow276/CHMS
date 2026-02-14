import { db } from "@/lib/db";

export async function getHouseholds(options?: {
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const { search, page = 1, pageSize = 25 } = options ?? {};

  const where = search
    ? { name: { contains: search, mode: "insensitive" as const } }
    : {};

  const [households, total] = await Promise.all([
    db.household.findMany({
      where,
      include: {
        members: {
          select: { id: true, firstName: true, lastName: true, warmthScore: true, warmthLabel: true, householdRole: true },
          orderBy: { householdRole: "asc" },
        },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.household.count({ where }),
  ]);

  return { households, total, page, totalPages: Math.ceil(total / pageSize) };
}

export async function getHouseholdById(id: string) {
  return db.household.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          groupMemberships: { include: { group: true } },
        },
        orderBy: { householdRole: "asc" },
      },
    },
  });
}
