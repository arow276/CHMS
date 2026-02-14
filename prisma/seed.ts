import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function sundayBefore(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(10, 0, 0, 0);
  return d;
}

async function main() {
  console.log("Seeding database...");

  // Admin user
  const passwordHash = await bcrypt.hash("shepherd2024", 12);
  await prisma.user.upsert({
    where: { email: "admin@shepherd.church" },
    update: {},
    create: {
      email: "admin@shepherd.church",
      name: "Pastor Admin",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log("  Created admin user");

  // Households
  const johnsonHousehold = await prisma.household.create({
    data: { name: "The Johnson Family", address: "123 Oak Street" },
  });
  const mitchellHousehold = await prisma.household.create({
    data: { name: "The Mitchell Family", address: "456 Elm Avenue" },
  });
  const kimHousehold = await prisma.household.create({
    data: { name: "The Kim Family", address: "789 Pine Road" },
  });
  console.log("  Created households");

  // People (matching the landing page demo data)
  const rachel = await prisma.person.create({
    data: {
      firstName: "Rachel",
      lastName: "Johnson",
      email: "rachel@email.com",
      phone: "555-0101",
      status: "MEMBER",
      gender: "FEMALE",
      warmthScore: 92,
      warmthLabel: "HOT",
      householdId: johnsonHousehold.id,
      householdRole: "HEAD",
    },
  });

  const mike = await prisma.person.create({
    data: {
      firstName: "Mike",
      lastName: "Johnson",
      email: "mike@email.com",
      phone: "555-0102",
      status: "MEMBER",
      gender: "MALE",
      warmthScore: 78,
      warmthLabel: "WARM",
      householdId: johnsonHousehold.id,
      householdRole: "SPOUSE",
    },
  });

  const tyler = await prisma.person.create({
    data: {
      firstName: "Tyler",
      lastName: "Johnson",
      phone: "555-0103",
      status: "REGULAR",
      gender: "MALE",
      warmthScore: 45,
      warmthLabel: "LUKEWARM",
      householdId: johnsonHousehold.id,
      householdRole: "CHILD",
    },
  });

  const sarah = await prisma.person.create({
    data: {
      firstName: "Sarah",
      lastName: "Mitchell",
      email: "sarah@email.com",
      phone: "555-0123",
      status: "MEMBER",
      gender: "FEMALE",
      warmthScore: 85,
      warmthLabel: "HOT",
      householdId: mitchellHousehold.id,
      householdRole: "HEAD",
    },
  });

  const james = await prisma.person.create({
    data: {
      firstName: "James",
      lastName: "Kim",
      email: "james@email.com",
      phone: "555-0456",
      status: "MEMBER",
      gender: "MALE",
      warmthScore: 68,
      warmthLabel: "WARM",
      householdId: kimHousehold.id,
      householdRole: "HEAD",
    },
  });

  const maria = await prisma.person.create({
    data: {
      firstName: "Maria",
      lastName: "Lopez",
      email: "maria@email.com",
      phone: "555-0789",
      status: "MEMBER",
      gender: "FEMALE",
      warmthScore: 55,
      warmthLabel: "LUKEWARM",
    },
  });

  const david = await prisma.person.create({
    data: {
      firstName: "David",
      lastName: "Reed",
      email: "david@email.com",
      phone: "555-0321",
      status: "REGULAR",
      gender: "MALE",
      warmthScore: 32,
      warmthLabel: "COOL",
    },
  });

  const tom = await prisma.person.create({
    data: {
      firstName: "Tom",
      lastName: "Wallace",
      email: "tom@email.com",
      phone: "555-0654",
      status: "MEMBER",
      gender: "MALE",
      warmthScore: 12,
      warmthLabel: "COLD",
    },
  });

  const lisa = await prisma.person.create({
    data: {
      firstName: "Lisa",
      lastName: "Park",
      email: "lisa@email.com",
      phone: "555-0987",
      status: "MEMBER",
      gender: "FEMALE",
      warmthScore: 71,
      warmthLabel: "WARM",
    },
  });

  const emily = await prisma.person.create({
    data: {
      firstName: "Emily",
      lastName: "Chen",
      email: "emily@email.com",
      phone: "555-0444",
      status: "VISITOR",
      gender: "FEMALE",
      warmthScore: 50,
      warmthLabel: "LUKEWARM",
    },
  });
  console.log("  Created 10 people");

  // Groups
  const lifeGroup = await prisma.group.create({
    data: {
      name: "Tuesday Life Group",
      description: "Weekly small group meeting for fellowship and Bible study",
      type: "LIFE_GROUP",
      meetingDay: "Tuesday",
      meetingTime: "7:00 PM",
    },
  });

  const womensMinistry = await prisma.group.create({
    data: {
      name: "Women's Ministry",
      description: "Monthly gatherings for women of the church",
      type: "MINISTRY",
      meetingDay: "Saturday",
      meetingTime: "10:00 AM",
    },
  });

  const youthGroup = await prisma.group.create({
    data: {
      name: "Youth Group",
      description: "Weekly meeting for teens",
      type: "LIFE_GROUP",
      meetingDay: "Wednesday",
      meetingTime: "6:30 PM",
    },
  });

  const worshipTeam = await prisma.group.create({
    data: {
      name: "Worship Team",
      description: "Sunday morning worship musicians and vocalists",
      type: "MINISTRY",
      meetingDay: "Thursday",
      meetingTime: "7:00 PM",
    },
  });
  console.log("  Created groups");

  // Group memberships
  await prisma.groupMember.createMany({
    data: [
      { personId: rachel.id, groupId: lifeGroup.id, role: "LEADER" },
      { personId: mike.id, groupId: lifeGroup.id, role: "MEMBER" },
      { personId: sarah.id, groupId: lifeGroup.id, role: "MEMBER" },
      { personId: james.id, groupId: lifeGroup.id, role: "MEMBER" },
      { personId: maria.id, groupId: lifeGroup.id, role: "MEMBER" },
      { personId: david.id, groupId: lifeGroup.id, role: "MEMBER" },

      { personId: rachel.id, groupId: womensMinistry.id, role: "LEADER" },
      { personId: sarah.id, groupId: womensMinistry.id, role: "CO_LEADER" },
      { personId: maria.id, groupId: womensMinistry.id, role: "MEMBER" },
      { personId: lisa.id, groupId: womensMinistry.id, role: "MEMBER" },

      { personId: tyler.id, groupId: youthGroup.id, role: "MEMBER" },

      { personId: lisa.id, groupId: worshipTeam.id, role: "LEADER" },
      { personId: sarah.id, groupId: worshipTeam.id, role: "MEMBER" },
    ],
  });
  console.log("  Created group memberships");

  // Events: 8 weeks of Sunday services
  const now = new Date();
  const sundays: { event: Awaited<ReturnType<typeof prisma.event.create>>; weeksAgo: number }[] = [];
  for (let i = 0; i < 8; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 7);
    const sunday = sundayBefore(date);

    const event = await prisma.event.create({
      data: {
        name: `Sunday Service`,
        type: "SUNDAY_SERVICE",
        date: sunday,
      },
    });
    sundays.push({ event, weeksAgo: i });
  }

  // A few life group meetings
  for (let i = 0; i < 6; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 7);
    // Tuesday
    const day = date.getDay();
    const diff = day >= 2 ? day - 2 : day + 5;
    date.setDate(date.getDate() - diff);
    date.setHours(19, 0, 0, 0);

    await prisma.event.create({
      data: {
        name: "Tuesday Life Group",
        type: "SMALL_GROUP",
        date,
        groupId: lifeGroup.id,
      },
    });
  }
  console.log("  Created events");

  // Attendance patterns for Sunday services
  // Rachel: all 8 (hot)
  // Sarah: 7 of 8 (hot)
  // Mike: 6 of 8 (warm)
  // James: 5 of 8 (warm)
  // Lisa: 5 of 8 (warm)
  // Maria: 4 of 8, mostly recent (lukewarm)
  // Tyler: 3 of 8 scattered (lukewarm)
  // David: attended first 4, missed last 4 (cool - declining)
  // Tom: attended only 2 earliest (cold)
  // Emily: attended last 2 (new visitor)

  const attendancePatterns: Record<string, number[]> = {
    [rachel.id]: [0, 1, 2, 3, 4, 5, 6, 7],
    [sarah.id]: [0, 1, 2, 3, 4, 5, 7],
    [mike.id]: [0, 1, 2, 4, 5, 6],
    [james.id]: [0, 1, 3, 5, 6],
    [lisa.id]: [0, 1, 2, 4, 7],
    [maria.id]: [0, 1, 2, 3],
    [tyler.id]: [1, 4, 6],
    [david.id]: [4, 5, 6, 7],
    [tom.id]: [6, 7],
    [emily.id]: [0, 1],
  };

  const attendanceData: { personId: string; eventId: string; status: "PRESENT" }[] = [];
  for (const [personId, weeks] of Object.entries(attendancePatterns)) {
    for (const week of weeks) {
      const sunday = sundays.find((s) => s.weeksAgo === week);
      if (sunday) {
        attendanceData.push({
          personId,
          eventId: sunday.event.id,
          status: "PRESENT",
        });
      }
    }
  }

  await prisma.attendance.createMany({ data: attendanceData });
  console.log("  Created attendance records");

  console.log("Seed complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
