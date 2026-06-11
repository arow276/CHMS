import { db } from "@/lib/db";
import { computeLiturgicalDay, nextSundayIso } from "@/lib/liturgy/calendar";
import { getTradition } from "@/lib/liturgy/traditions";

export async function getDashboardData() {
  const now = new Date();
  const todayUtc = new Date(now.toISOString().slice(0, 10));
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
    upcomingLiturgy,
    latestLiturgy,
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

    db.liturgy.findFirst({
      where: { date: { gte: todayUtc } },
      orderBy: { date: "asc" },
      select: {
        id: true,
        title: true,
        date: true,
        status: true,
        tradition: true,
        liturgicalDay: true,
      },
    }),

    // Most recently touched liturgy — its tradition decides which calendar
    // (Western vs. Byzantine) the "plan your next Sunday" teaser uses.
    db.liturgy.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { tradition: true },
    }),
  ]);

  const teaserCalendar =
    (latestLiturgy && getTradition(latestLiturgy.tradition)?.calendar) ?? "western";
  const nextSunday = nextSundayIso(now);

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
    upcomingLiturgy,
    nextSundayDay: { iso: nextSunday, ...pickTeaser(computeLiturgicalDay(nextSunday, teaserCalendar)) },
  };
}

function pickTeaser(day: { dayName: string; season: string; color: string }) {
  return { dayName: day.dayName, season: day.season, color: day.color };
}
