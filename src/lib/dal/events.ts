import { db } from "@/lib/db";

export async function getEvents(options?: {
  type?: string;
  groupId?: string;
  page?: number;
  pageSize?: number;
}) {
  const { type, groupId, page = 1, pageSize = 25 } = options ?? {};

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (groupId) where.groupId = groupId;

  const [events, total] = await Promise.all([
    db.event.findMany({
      where,
      include: {
        group: { select: { id: true, name: true } },
        _count: { select: { attendances: true } },
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.event.count({ where }),
  ]);

  return { events, total, page, totalPages: Math.ceil(total / pageSize) };
}

export async function getEventById(id: string) {
  return db.event.findUnique({
    where: { id },
    include: {
      group: { select: { id: true, name: true } },
      attendances: {
        include: {
          person: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              warmthScore: true,
              warmthLabel: true,
            },
          },
        },
        orderBy: { person: { lastName: "asc" } },
      },
    },
  });
}
