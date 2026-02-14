import { db } from "@/lib/db";

export async function getGroups(options?: {
  search?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}) {
  const { search, type, page = 1, pageSize = 25 } = options ?? {};

  const where: Record<string, unknown> = {};
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (type) where.type = type;

  const [groups, total] = await Promise.all([
    db.group.findMany({
      where,
      include: {
        members: {
          include: {
            person: {
              select: { id: true, firstName: true, lastName: true, warmthScore: true, warmthLabel: true },
            },
          },
        },
        _count: { select: { events: true } },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.group.count({ where }),
  ]);

  return { groups, total, page, totalPages: Math.ceil(total / pageSize) };
}

export async function getGroupById(id: string) {
  return db.group.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          person: true,
        },
        orderBy: { role: "asc" },
      },
      events: {
        orderBy: { date: "desc" },
        take: 10,
        include: { _count: { select: { attendances: true } } },
      },
    },
  });
}
