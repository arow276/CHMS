// Verification suite for the liturgical calendar engine.
//
// Run with: npm run check:calendar
//
// Every expectation below is a externally verifiable fact (published church
// calendars, the Paschalion, the BCP), so this doubles as regression
// protection for the engine that feeds authoritative data to the generator.

import {
  westernEaster,
  orthodoxPascha,
  adventSunday,
  computeLiturgicalDay,
} from "../src/lib/liturgy/calendar";
import { TRADITIONS } from "../src/lib/liturgy/traditions";

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`  ✓ ${label}`);
  } else {
    failures++;
    console.log(`  ✗ ${label}\n      expected ${e}\n      got      ${a}`);
  }
}
const iso = (d: Date) => d.toISOString().slice(0, 10);

console.log("Easter computus (Gregorian):");
check("Easter 2024", iso(westernEaster(2024)), "2024-03-31");
check("Easter 2025", iso(westernEaster(2025)), "2025-04-20");
check("Easter 2026", iso(westernEaster(2026)), "2026-04-05");
check("Easter 2027", iso(westernEaster(2027)), "2027-03-28");
check("Easter 2030", iso(westernEaster(2030)), "2030-04-21");

console.log("Pascha computus (Julian → Gregorian):");
check("Pascha 2024", iso(orthodoxPascha(2024)), "2024-05-05");
check("Pascha 2025 (coincides with Western)", iso(orthodoxPascha(2025)), "2025-04-20");
check("Pascha 2026", iso(orthodoxPascha(2026)), "2026-04-12");
check("Pascha 2027", iso(orthodoxPascha(2027)), "2027-05-02");

console.log("Advent:");
check("Advent 1, 2024", iso(adventSunday(2024)), "2024-12-01");
check("Advent 1, 2025", iso(adventSunday(2025)), "2025-11-30");
check("Advent 1, 2026", iso(adventSunday(2026)), "2026-11-29");

console.log("Western day classification:");
const lent5 = computeLiturgicalDay("2025-04-06", "western");
check("2025-04-06 is Lent V", lent5.dayName, "The Fifth Sunday in Lent");
check("2025-04-06 is Year C", lent5.sundayCycle, "C");
check("2025-04-06 is violet", lent5.color, "violet");
check(
  "2025-04-06 carries the Judica note",
  lent5.notes.some((n) => n.includes("Judica")),
  true,
);

check(
  "2026-03-29 is Palm Sunday",
  computeLiturgicalDay("2026-03-29", "western").dayName,
  "The Sunday of the Passion: Palm Sunday",
);
check(
  "2026-04-03 is Good Friday",
  computeLiturgicalDay("2026-04-03", "western").dayName,
  "Good Friday",
);

const pent3 = computeLiturgicalDay("2026-06-14", "western");
check("2026-06-14 is Pentecost III", pent3.dayName, "The Third Sunday after Pentecost");
check("2026-06-14 is Proper 6", pent3.properNumber, 6);
check("2026-06-14 is OT week 11", pent3.ordinaryTimeWeek, 11);
check("2026-06-14 is Year A", pent3.sundayCycle, "A");

const ctk = computeLiturgicalDay("2025-11-23", "western");
check("2025-11-23 is Christ the King", ctk.dayName, "The Last Sunday after Pentecost: Christ the King");
check("2025-11-23 is Proper 29", ctk.properNumber, 29);

const adv3 = computeLiturgicalDay("2025-12-14", "western");
check("2025-12-14 is Advent III", adv3.dayName, "The Third Sunday of Advent");
check("2025-12-14 offers rose", adv3.colorAlternates.includes("rose"), true);

check(
  "Christmas Day",
  computeLiturgicalDay("2025-12-25", "western").dayName,
  "The Nativity of Our Lord: Christmas Day",
);
check(
  "Epiphany",
  computeLiturgicalDay("2026-01-06", "western").dayName,
  "The Epiphany of Our Lord",
);
check(
  "Baptism of Our Lord 2026",
  computeLiturgicalDay("2026-01-11", "western").dayName,
  "The First Sunday after the Epiphany: The Baptism of Our Lord",
);
check(
  "Last Epiphany 2026 (Ash Wednesday = Feb 18)",
  computeLiturgicalDay("2026-02-15", "western").dayName,
  "The Last Sunday after the Epiphany: The Transfiguration of Our Lord",
);
check(
  "Ash Wednesday 2026",
  computeLiturgicalDay("2026-02-18", "western").dayName,
  "Ash Wednesday",
);
check(
  "Easter II 2026",
  computeLiturgicalDay("2026-04-12", "western").dayName,
  "The Second Sunday of Easter",
);
check(
  "Pentecost 2026",
  computeLiturgicalDay("2026-05-24", "western").dayName,
  "The Day of Pentecost (Whitsunday)",
);
check(
  "Trinity 2026",
  computeLiturgicalDay("2026-05-31", "western").dayName,
  "Trinity Sunday (The First Sunday after Pentecost)",
);
check(
  "Aug 6 named Transfiguration on a weekday",
  computeLiturgicalDay("2026-08-06", "western").dayName,
  "The Transfiguration of Our Lord",
);

console.log("Byzantine day classification:");
check(
  "Pascha 2026",
  computeLiturgicalDay("2026-04-12", "byzantine").dayName,
  "PASCHA: The Resurrection of Our Lord",
);
const thomas = computeLiturgicalDay("2026-04-19", "byzantine");
check("Thomas Sunday 2026", thomas.dayName, "Thomas Sunday (Antipascha)");
check("Thomas Sunday begins Tone 1", thomas.tone, 1);

const byzPent2 = computeLiturgicalDay("2026-06-14", "byzantine");
check("2026-06-14 (byz) is Pentecost II", byzPent2.dayName, "The Second Sunday after Pentecost");
check("2026-06-14 (byz) is Tone 1", byzPent2.tone, 1);

check(
  "Orthodoxy Sunday 2026",
  computeLiturgicalDay("2026-03-01", "byzantine").dayName,
  "First Sunday of Great Lent: The Triumph of Orthodoxy",
);
check(
  "Forgiveness Sunday 2026",
  computeLiturgicalDay("2026-02-22", "byzantine").dayName,
  "Sunday of Forgiveness (Cheesefare)",
);
check(
  "Great and Holy Friday 2026",
  computeLiturgicalDay("2026-04-10", "byzantine").dayName,
  "Great and Holy Friday",
);
check(
  "Lenten Wednesday mentions Presanctified",
  computeLiturgicalDay("2026-03-04", "byzantine").notes.some((n) => n.includes("Presanctified")),
  true,
);
check(
  "Pentecost 2026 (byz) is green",
  computeLiturgicalDay("2026-05-31", "byzantine").color,
  "green",
);

console.log("Registry integrity:");
const serviceCount = TRADITIONS.reduce((n, t) => n + t.services.length, 0);
check("10 traditions", TRADITIONS.length, 10);
check("every tradition has services", TRADITIONS.every((t) => t.services.length > 0), true);
check(
  "unique tradition ids",
  new Set(TRADITIONS.map((t) => t.id)).size,
  TRADITIONS.length,
);
check(
  "unique service ids within each tradition",
  TRADITIONS.every((t) => new Set(t.services.map((s) => s.id)).size === t.services.length),
  true,
);
check(
  "every date computes for every tradition calendar",
  TRADITIONS.every((t) => Boolean(computeLiturgicalDay("2026-12-25", t.calendar).dayName)),
  true,
);
console.log(`  (registry: ${TRADITIONS.length} traditions, ${serviceCount} services)`);

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
