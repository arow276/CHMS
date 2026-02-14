import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export type PersonWithRelations = Prisma.PersonGetPayload<{
  include: {
    household: true;
    groupMemberships: { include: { group: true } };
  };
}>;

export async function getPeople(options?: {
  search?: string;
  status?: string;
  warmth?: string;
  page?: number;
  pageSize?: number;
}) {
  const { search, status, warmth, page = 1, pageSize = 25 } = options ?? {};

  const where: Prisma.PersonWhereInput = {};

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status as Prisma.EnumPersonStatusFilter;
  if (warmth) where.warmthLabel = warmth as Prisma.EnumWarmthLevelFilter;

  const [people, total] = await Promise.all([
    db.person.findMany({
      where,
      include: {
        household: true,
        groupMemberships: { include: { group: true } },
      },
      orderBy: { lastName: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.person.count({ where }),
  ]);

  return {
    people,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getPersonById(id: string) {
  return db.person.findUnique({
    where: { id },
    include: {
      household: { include: { members: true } },
      groupMemberships: { include: { group: true } },
      attendances: {
        include: { event: true },
        orderBy: { event: { date: "desc" } },
        take: 20,
      },
    },
  });
}
