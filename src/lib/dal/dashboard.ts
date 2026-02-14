import { db } from "@/lib/db";

export async function getDashboardData() {
  const now = new Date();
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(now.getDate() - 28);
  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(now.getDate() - 8 * 7);

  const [
    totalPeople,
    warmthDistribution,
    avgWarmthResult,
    coolingPeople,
    recentVisitors,
    activeGroups,
    attendanceTrend,
  ] = await Promise.all([
    db.person.count({ where: { status: { not: "INACTIVE" } } }),

    db.person.groupBy({
      by: ["warmthLabel"],
      _count: true,
      where: { status: { not: "INACTIVE" } },
    }),

    db.person.aggregate({
      _avg: { warmthScore: true },
      where: { status: { not: "INACTIVE" } },
    }),

    db.person.findMany({
      where: {
        warmthLabel: { in: ["COOL", "COLD"] },
        status: { not: "INACTIVE" },
      },
      orderBy: { warmthScore: "asc" },
      take: 8,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        warmthScore: true,
        warmthLabel: true,
        attendances: {
          include: { event: { select: { date: true } } },
          orderBy: { event: { date: "desc" } },
          take: 1,
        },
      },
    }),

    db.person.findMany({
      where: {
        status: "VISITOR",
        createdAt: { gte: fourWeeksAgo },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, firstName: true, lastName: true, createdAt: true },
    }),

    db.group.count({ where: { isActive: true } }),

    db.event.findMany({
      where: {
        type: "SUNDAY_SERVICE",
        date: { gte: eightWeeksAgo, lte: now },
      },
      orderBy: { date: "asc" },
      select: {
        id: true,
        date: true,
        _count: { select: { attendances: true } },
      },
    }),
  ]);

  // Get last Sunday's attendance
  const lastSunday = attendanceTrend.at(-1);

  return {
    totalPeople,
    avgWarmth: Math.round(avgWarmthResult._avg.warmthScore ?? 0),
    lastSundayAttendance: lastSunday?._count.attendances ?? 0,
    activeGroups,
    warmthDistribution: warmthDistribution.map((w) => ({
      label: w.warmthLabel,
      count: w._count,
    })),
    coolingPeople: coolingPeople.map((p) => ({
      ...p,
      lastAttended: p.attendances[0]?.event.date ?? null,
    })),
    recentVisitors,
    attendanceTrend: attendanceTrend.map((e) => ({
      date: e.date,
      count: e._count.attendances,
    })),
  };
}
