import { db } from "@/lib/db";
import type { WarmthLevel } from "@prisma/client";

// ─── WARMTH FORMULA ───
// Total score: 0-100
//
// Components:
//   1. Attendance Recency  (40% weight, max 40 points)
//   2. Attendance Frequency (25% weight, max 25 points)
//   3. Group Involvement   (20% weight, max 20 points)
//   4. Trend               (15% weight, max 15 points)
//
// Thresholds: HOT ≥80, WARM ≥60, LUKEWARM ≥40, COOL ≥20, COLD <20

const LOOKBACK_WEEKS = 12;
const RECENCY_WEIGHT = 0.4;
const FREQUENCY_WEIGHT = 0.25;
const GROUP_WEIGHT = 0.2;
const TREND_WEIGHT = 0.15;

export interface WarmthResult {
  score: number;
  label: WarmthLevel;
  components: {
    recency: number;
    frequency: number;
    groupInvolvement: number;
    trend: number;
  };
}

export async function calculateWarmth(personId: string): Promise<WarmthResult> {
  const now = new Date();
  const lookbackStart = new Date();
  lookbackStart.setDate(now.getDate() - LOOKBACK_WEEKS * 7);

  const [attendances, groupMemberships, totalEvents] = await Promise.all([
    db.attendance.findMany({
      where: {
        personId,
        status: "PRESENT",
        event: { date: { gte: lookbackStart } },
      },
      include: { event: true },
      orderBy: { event: { date: "desc" } },
    }),
    db.groupMember.findMany({
      where: { personId },
      include: { group: true },
    }),
    db.event.count({
      where: {
        date: { gte: lookbackStart, lte: now },
        type: { in: ["SUNDAY_SERVICE", "SMALL_GROUP"] },
      },
    }),
  ]);

  // 1. Attendance Recency (0-100 raw)
  let recencyRaw = 0;
  if (attendances.length > 0) {
    const lastAttendance = attendances[0].event.date;
    const daysSince = Math.floor(
      (now.getTime() - lastAttendance.getTime()) / (1000 * 60 * 60 * 24)
    );
    recencyRaw = Math.max(0, 100 - (daysSince * 100) / (LOOKBACK_WEEKS * 7));
  }

  // 2. Attendance Frequency (0-100 raw)
  const frequencyRaw =
    totalEvents > 0
      ? Math.min(100, (attendances.length / totalEvents) * 100)
      : 50;

  // 3. Group Involvement (0-100 raw)
  const activeGroups = groupMemberships.filter((gm) => gm.group.isActive);
  let groupRaw = 0;
  if (activeGroups.length === 1) groupRaw = 50;
  else if (activeGroups.length === 2) groupRaw = 75;
  else if (activeGroups.length >= 3) groupRaw = 100;
  const leadershipBonus =
    activeGroups.filter(
      (gm) => gm.role === "LEADER" || gm.role === "CO_LEADER"
    ).length * 15;
  groupRaw = Math.min(100, groupRaw + leadershipBonus);

  // 4. Trend (0-100 raw) — compare recent 4 weeks vs prior 4 weeks
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(now.getDate() - 28);
  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(now.getDate() - 56);

  const recentCount = attendances.filter(
    (a) => a.event.date >= fourWeeksAgo
  ).length;
  const priorCount = attendances.filter(
    (a) => a.event.date >= eightWeeksAgo && a.event.date < fourWeeksAgo
  ).length;

  let trendRaw = 50;
  if (priorCount > 0) {
    const ratio = recentCount / priorCount;
    if (ratio >= 1.25) trendRaw = 100;
    else if (ratio >= 0.9) trendRaw = 65;
    else if (ratio >= 0.5) trendRaw = 30;
    else trendRaw = 0;
  } else if (recentCount > 0) {
    trendRaw = 80;
  }

  // Composite
  const score = Math.round(
    recencyRaw * RECENCY_WEIGHT +
      frequencyRaw * FREQUENCY_WEIGHT +
      groupRaw * GROUP_WEIGHT +
      trendRaw * TREND_WEIGHT
  );

  const clampedScore = Math.max(0, Math.min(100, score));

  return {
    score: clampedScore,
    label: scoreToLabel(clampedScore),
    components: {
      recency: Math.round(recencyRaw * RECENCY_WEIGHT),
      frequency: Math.round(frequencyRaw * FREQUENCY_WEIGHT),
      groupInvolvement: Math.round(groupRaw * GROUP_WEIGHT),
      trend: Math.round(trendRaw * TREND_WEIGHT),
    },
  };
}

function scoreToLabel(score: number): WarmthLevel {
  if (score >= 80) return "HOT";
  if (score >= 60) return "WARM";
  if (score >= 40) return "LUKEWARM";
  if (score >= 20) return "COOL";
  return "COLD";
}

export async function recalculateAllWarmth(): Promise<number> {
  const people = await db.person.findMany({
    where: { status: { not: "INACTIVE" } },
    select: { id: true },
  });

  let updated = 0;
  for (const person of people) {
    const result = await calculateWarmth(person.id);
    await db.person.update({
      where: { id: person.id },
      data: {
        warmthScore: result.score,
        warmthLabel: result.label,
        warmthUpdatedAt: new Date(),
      },
    });
    updated++;
  }

  return updated;
}
