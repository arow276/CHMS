// Liturgical calendar engine.
//
// Pure date math — no I/O, safe to import on the client (the builder uses it
// for a live "what day is this liturgically?" preview) and on the server
// (where its output becomes authoritative context for the AI generator).
//
// All date arithmetic is done at UTC midnight so a calendar date means the
// same thing everywhere.

import type { CalendarSystem, LiturgicalDay } from "./types";

const DAY_MS = 86_400_000;

const WEEKDAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

const ORDINALS = [
  "", "First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh",
  "Eighth", "Ninth", "Tenth", "Eleventh", "Twelfth", "Thirteenth",
  "Fourteenth", "Fifteenth", "Sixteenth", "Seventeenth", "Eighteenth",
  "Nineteenth", "Twentieth", "Twenty-first", "Twenty-second", "Twenty-third",
  "Twenty-fourth", "Twenty-fifth", "Twenty-sixth", "Twenty-seventh",
  "Twenty-eighth", "Twenty-ninth", "Thirtieth", "Thirty-first",
  "Thirty-second", "Thirty-third", "Thirty-fourth",
];

function ymd(y: number, m: number, d: number): Date {
  return new Date(Date.UTC(y, m - 1, d));
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY_MS);
}

function diffDays(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

function dow(d: Date): number {
  return d.getUTCDay();
}

function same(a: Date, b: Date): boolean {
  return a.getTime() === b.getTime();
}

function sundayOnOrAfter(d: Date): Date {
  return addDays(d, (7 - dow(d)) % 7);
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return ymd(y, m, d);
}

// ──────────────────────────────────────────────
// Easter computus
// ──────────────────────────────────────────────

/** Gregorian (Western) Easter — Meeus/Jones/Butcher algorithm. */
export function westernEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return ymd(year, month, day);
}

/**
 * Orthodox Pascha — Julian computus (Meeus), converted to the civil
 * (Gregorian) calendar. The +13-day offset is correct for 1900–2099.
 */
export function orthodoxPascha(year: number): Date {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;
  return addDays(ymd(year, month, day), 13);
}

/** First Sunday of Advent for the liturgical year beginning in `year`. */
export function adventSunday(year: number): Date {
  const christmas = ymd(year, 12, 25);
  const w = dow(christmas);
  const sundayBefore = addDays(christmas, -(w === 0 ? 7 : w));
  return addDays(sundayBefore, -21);
}

// ──────────────────────────────────────────────
// Fixed feasts (Western)
// ──────────────────────────────────────────────

interface FixedFeast {
  month: number;
  day: number;
  name: string;
  color?: string;
  note?: string;
  /** If true, the feast names the day when it falls on a weekday. */
  principal?: boolean;
}

const WESTERN_FIXED_FEASTS: FixedFeast[] = [
  { month: 1, day: 1, name: "The Holy Name of Our Lord Jesus Christ", color: "white", principal: true, note: "Roman Catholic: Solemnity of Mary, Mother of God. Historic Lutheran: Circumcision and Name of Jesus." },
  { month: 1, day: 6, name: "The Epiphany of Our Lord", color: "white", principal: true, note: "In the US Roman calendar, Epiphany is transferred to the Sunday between January 2 and 8." },
  { month: 1, day: 18, name: "The Confession of St. Peter", color: "white" },
  { month: 1, day: 25, name: "The Conversion of St. Paul", color: "white" },
  { month: 2, day: 2, name: "The Presentation of Our Lord (Candlemas)", color: "white", principal: true, note: "A feast of Our Lord — in most calendars it takes precedence over an ordinary Sunday." },
  { month: 3, day: 19, name: "St. Joseph", color: "white" },
  { month: 3, day: 25, name: "The Annunciation of Our Lord", color: "white", principal: true, note: "Transferred when it falls in Holy Week or Easter Week." },
  { month: 4, day: 25, name: "St. Mark the Evangelist", color: "red" },
  { month: 5, day: 31, name: "The Visitation of the Blessed Virgin Mary", color: "white" },
  { month: 6, day: 24, name: "The Nativity of St. John the Baptist", color: "white", principal: true },
  { month: 6, day: 29, name: "St. Peter and St. Paul, Apostles", color: "red" },
  { month: 7, day: 22, name: "St. Mary Magdalene", color: "white" },
  { month: 7, day: 25, name: "St. James the Apostle", color: "red" },
  { month: 8, day: 6, name: "The Transfiguration of Our Lord", color: "white", principal: true },
  { month: 8, day: 15, name: "St. Mary the Virgin", color: "white", note: "Roman Catholic: Solemnity of the Assumption (holy day of obligation)." },
  { month: 9, day: 14, name: "Holy Cross Day", color: "red", principal: true },
  { month: 9, day: 21, name: "St. Matthew, Apostle and Evangelist", color: "red" },
  { month: 9, day: 29, name: "St. Michael and All Angels (Michaelmas)", color: "white", principal: true },
  { month: 10, day: 18, name: "St. Luke the Evangelist", color: "red" },
  { month: 10, day: 31, name: "Reformation Day", color: "red", note: "Lutheran churches commonly observe Reformation Sunday on the last Sunday of October." },
  { month: 11, day: 1, name: "All Saints' Day", color: "white", principal: true, note: "Widely observed on the first Sunday of November when not a Sunday." },
  { month: 11, day: 2, name: "Commemoration of All Faithful Departed (All Souls)", color: "violet", note: "Roman Catholic: white, violet, or black. Often kept with a requiem." },
  { month: 11, day: 30, name: "St. Andrew the Apostle", color: "red" },
  { month: 12, day: 21, name: "St. Thomas the Apostle", color: "red" },
  { month: 12, day: 26, name: "St. Stephen, Deacon and Martyr", color: "red" },
  { month: 12, day: 27, name: "St. John, Apostle and Evangelist", color: "white" },
  { month: 12, day: 28, name: "The Holy Innocents", color: "red" },
];

function westernFixedFeasts(d: Date): FixedFeast[] {
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const found = WESTERN_FIXED_FEASTS.filter((f) => f.month === m && f.day === day);
  // US Thanksgiving — 4th Thursday of November
  if (m === 11 && dow(d) === 4 && day >= 22 && day <= 28) {
    found.push({ month: m, day, name: "Thanksgiving Day (USA)", color: "white", note: "National day of thanksgiving; harvest propers are customary." });
  }
  return found;
}

// ──────────────────────────────────────────────
// Western day classification
// ──────────────────────────────────────────────

const LENT_LATIN = ["Invocabit", "Reminiscere", "Oculi", "Laetare", "Judica"];
const EASTER_LATIN = [
  "", "Quasimodogeniti", "Misericordias Domini", "Jubilate", "Cantate", "Rogate", "Exaudi",
];

export function westernLiturgicalDay(date: Date): LiturgicalDay {
  const year = date.getUTCFullYear();
  const easter = westernEaster(year);
  const ashWednesday = addDays(easter, -46);
  const lent1 = addDays(easter, -42);
  const palmSunday = addDays(easter, -7);
  const ascension = addDays(easter, 39);
  const pentecost = addDays(easter, 49);
  const trinity = addDays(easter, 56);
  const adv1 = adventSunday(year);
  const litYearStart = date >= adv1 ? year : year - 1;
  const sundayCycle = (["A", "B", "C"] as const)[((litYearStart % 3) + 3) % 3];
  // Roman weekday cycle is named for the calendar year containing the bulk of
  // Ordinary Time; Advent/Christmas weekdays belong to the coming year.
  const cycleYear = date >= adv1 ? year + 1 : year;
  const weekdayCycle = cycleYear % 2 === 1 ? ("I" as const) : ("II" as const);

  const isSunday = dow(date) === 0;
  const weekday = WEEKDAYS[dow(date)];
  const feasts = westernFixedFeasts(date);
  const notes: string[] = [];
  feasts.forEach((f) => f.note && notes.push(`${f.name}: ${f.note}`));

  const base: LiturgicalDay = {
    iso: toIso(date),
    calendar: "western",
    dayName: "",
    season: "",
    weekInSeason: null,
    color: "green",
    colorAlternates: [],
    sundayCycle,
    weekdayCycle,
    properNumber: null,
    ordinaryTimeWeek: null,
    feasts: feasts.map((f) => f.name),
    notes,
  };

  const result = classifyWestern(date, base, {
    year, easter, ashWednesday, lent1, palmSunday, ascension, pentecost, trinity, adv1,
    isSunday, weekday,
  });

  // A principal fixed feast names a weekday outright (Sundays keep their
  // own name; the feast is listed and the transfer rule noted).
  const principal = feasts.find((f) => f.principal);
  if (principal && !isSunday && !result.dayName.startsWith("The Nativity")) {
    const inProtectedTime =
      (date >= palmSunday && date <= addDays(easter, 7)) || same(date, ashWednesday);
    if (!inProtectedTime) {
      result.dayName = principal.name;
      if (principal.color) {
        result.color = principal.color;
        result.colorAlternates = [];
      }
    }
  }
  if (principal && isSunday) {
    result.notes.push(
      `${principal.name} falls on this Sunday — feasts of Our Lord ordinarily take precedence; other feasts are transferred. Follow your tradition's rules of precedence.`,
    );
  }

  return result;
}

interface WesternCtx {
  year: number;
  easter: Date;
  ashWednesday: Date;
  lent1: Date;
  palmSunday: Date;
  ascension: Date;
  pentecost: Date;
  trinity: Date;
  adv1: Date;
  isSunday: boolean;
  weekday: string;
}

function classifyWestern(date: Date, day: LiturgicalDay, ctx: WesternCtx): LiturgicalDay {
  const {
    year, easter, ashWednesday, lent1, palmSunday, ascension, pentecost, trinity, adv1,
    isSunday, weekday,
  } = ctx;
  const m = date.getUTCMonth() + 1;
  const dnum = date.getUTCDate();

  // ── Christmas (Dec 25 – Jan 5) ──
  if ((m === 12 && dnum >= 25) || (m === 1 && dnum <= 5)) {
    day.season = "Christmas";
    day.color = "white";
    if (m === 12 && dnum === 25) {
      day.dayName = "The Nativity of Our Lord: Christmas Day";
      day.colorAlternates = ["gold"];
      return day;
    }
    const christmas = m === 12 ? ymd(year, 12, 25) : ymd(year - 1, 12, 25);
    if (isSunday) {
      const n = Math.ceil(diffDays(christmas, date) / 7);
      day.weekInSeason = n;
      day.dayName = `The ${ORDINALS[n]} Sunday after Christmas Day`;
      return day;
    }
    day.dayName = `${weekday} in Christmastide`;
    if (m === 12 && dnum === 31) day.notes.push("New Year's Eve — Eve of the Holy Name; Watch Night services are customary in some communities.");
    return day;
  }

  // ── Epiphany Day ──
  if (m === 1 && dnum === 6) {
    day.season = "Epiphany";
    day.dayName = "The Epiphany of Our Lord";
    day.color = "white";
    return day;
  }

  // ── Advent ──
  if (date >= adv1 && date < ymd(year, 12, 25)) {
    day.season = "Advent";
    day.color = "violet";
    day.colorAlternates = ["blue"];
    day.notes.push("Blue (Sarum) is a widely used Advent alternative in Episcopal and Lutheran churches; Roman Catholic use is violet.");
    const n = Math.floor(diffDays(adv1, date) / 7) + 1;
    day.weekInSeason = n;
    if (isSunday) {
      day.dayName = `The ${ORDINALS[n]} Sunday of Advent`;
      if (n === 1) day.notes.push("Advent I — the liturgical new year begins; the lectionary cycle changes today.");
      if (n === 3) {
        day.colorAlternates.unshift("rose");
        day.notes.push("Gaudete Sunday — rose vestments are a traditional option.");
      }
      if (n === 4) day.notes.push("Advent IV — Annunciation/Magnificat themes; the Great O Antiphons run Dec 17–23.");
    } else {
      day.dayName = `${weekday} in the ${ORDINALS[n]} Week of Advent`;
      if (m === 12 && dnum >= 17) day.notes.push("Late Advent weekday (Dec 17–24) — the Great O Antiphons accompany the Magnificat at Evening Prayer.");
      if (m === 12 && dnum === 24) day.dayName = "The Eve of the Nativity (Christmas Eve)";
    }
    return day;
  }

  // ── Lent & Holy Week ──
  if (date >= ashWednesday && date < easter) {
    day.season = date >= palmSunday ? "Holy Week" : "Lent";
    day.color = "violet";
    if (same(date, ashWednesday)) {
      day.dayName = "Ash Wednesday";
      day.notes.push("Imposition of ashes; the Litany/Decalogue and penitential propers are customary. Fast day.");
      return day;
    }
    if (same(date, palmSunday)) {
      day.dayName = "The Sunday of the Passion: Palm Sunday";
      day.color = "red";
      day.colorAlternates = ["violet"];
      day.notes.push("Liturgy of the Palms with procession; the Passion is read. Historic name: Palmarum.");
      return day;
    }
    if (date > palmSunday) {
      const offset = diffDays(palmSunday, date);
      const names: Record<number, string> = {
        1: "Monday in Holy Week",
        2: "Tuesday in Holy Week",
        3: "Wednesday in Holy Week (Spy Wednesday)",
        4: "Maundy Thursday",
        5: "Good Friday",
        6: "Holy Saturday",
      };
      day.dayName = names[offset] ?? `${weekday} in Holy Week`;
      if (offset === 3) day.notes.push("Tenebrae is often kept on Wednesday or Thursday evening of Holy Week.");
      if (offset === 4) {
        day.color = "white";
        day.colorAlternates = ["scarlet"];
        day.notes.push("Maundy Thursday — footwashing, institution of the Eucharist, stripping of the altar. The Triduum begins.");
      }
      if (offset === 5) {
        day.color = "red";
        day.colorAlternates = ["black", "none (bare altar)"];
        day.notes.push("Good Friday — Solemn Collects, veneration of the cross; Mass/Eucharist is not celebrated (Presanctified communion in some traditions). Fast day.");
      }
      if (offset === 6) {
        day.color = "none (bare altar)";
        day.colorAlternates = ["white at the Vigil"];
        day.notes.push("Holy Saturday — bare church by day; the Great Vigil of Easter begins after nightfall (white/gold, first Eucharist of Easter).");
      }
      return day;
    }
    const n = Math.floor(diffDays(lent1, date) / 7) + 1;
    day.weekInSeason = n;
    if (isSunday) {
      day.dayName = `The ${ORDINALS[n]} Sunday in Lent`;
      day.notes.push(`Historic (one-year) name: ${LENT_LATIN[n - 1]}.`);
      if (n === 4) {
        day.colorAlternates = ["rose"];
        day.notes.push("Laetare Sunday (Mothering Sunday) — rose vestments are a traditional option.");
      }
      if (n === 5) day.notes.push("Passion Sunday in the historic calendar — veiling of crosses and images begins in parishes that keep Passiontide.");
    } else {
      day.dayName = n <= 0
        ? `${weekday} after Ash Wednesday`
        : `${weekday} in the ${ORDINALS[n]} Week of Lent`;
    }
    day.notes.push("Lent — Alleluia and (in most uses) the Gloria in excelsis are omitted; Lenten fast applies.");
    return day;
  }

  // ── Easter season ──
  if (date >= easter && date < pentecost) {
    day.season = "Easter";
    day.color = "white";
    day.colorAlternates = ["gold"];
    if (same(date, easter)) {
      day.dayName = "The Sunday of the Resurrection: Easter Day";
      day.notes.push("The Paschal candle burns at all services through the Day of Pentecost.");
      return day;
    }
    if (same(date, ascension)) {
      day.dayName = "Ascension Day";
      day.notes.push("Fortieth day of Easter; widely transferred to the following Sunday in Roman Catholic dioceses of the US.");
      return day;
    }
    const n = Math.floor(diffDays(easter, date) / 7) + 1;
    day.weekInSeason = n;
    if (isSunday) {
      day.dayName = `The ${ORDINALS[n]} Sunday of Easter`;
      if (n >= 2 && n <= 7) day.notes.push(`Historic (one-year) name: ${EASTER_LATIN[n - 1]}.`);
      if (n === 2) day.notes.push("St. Thomas Gospel (John 20) — also kept as Divine Mercy Sunday in the Roman calendar.");
      if (n === 4) day.notes.push("Good Shepherd Sunday (John 10).");
      if (n === 7) day.notes.push("The Sunday after Ascension Day; in US Roman dioceses this Sunday is usually kept as the Ascension.");
    } else {
      day.dayName = n === 1
        ? `${weekday} in Easter Week`
        : `${weekday} in the ${ORDINALS[n]} Week of Easter`;
      if (date >= addDays(ascension, -3) && date < ascension) {
        day.notes.push("Rogation Day — prayers for fruitful seasons and human labor are traditional.");
      }
    }
    return day;
  }

  // ── Pentecost ──
  if (same(date, pentecost)) {
    day.season = "Pentecost";
    day.dayName = "The Day of Pentecost (Whitsunday)";
    day.color = "red";
    day.weekInSeason = null;
    day.notes.push("The Paschal candle is extinguished/removed after this day; red for the Holy Spirit.");
    return day;
  }

  // ── Season after Pentecost / Ordinary Time (summer–fall) ──
  if (date > pentecost && date < adv1) {
    day.season = "Season after Pentecost";
    day.color = "green";
    const nextAdv1 = adv1; // adv1 of this calendar year is the next Advent here
    const christTheKing = addDays(nextAdv1, -7);
    if (same(date, trinity)) {
      day.dayName = "Trinity Sunday (The First Sunday after Pentecost)";
      day.color = "white";
      day.notes.push("Athanasian Creed is traditional in Lutheran churches today; Corpus Christi follows on Thursday (kept Sunday next in US Roman dioceses).");
      return day;
    }
    if (isSunday) {
      const pentecostN = Math.floor(diffDays(pentecost, date) / 7);
      const trinityN = Math.floor(diffDays(trinity, date) / 7);
      const may11 = ymd(year, 5, 11);
      const proper = Math.min(29, Math.max(1, Math.round(diffDays(may11, date) / 7) + 1));
      const otWeek = 34 - Math.floor(diffDays(date, christTheKing) / 7);
      day.weekInSeason = pentecostN;
      day.properNumber = proper;
      day.ordinaryTimeWeek = otWeek;
      if (same(date, christTheKing)) {
        day.dayName = "The Last Sunday after Pentecost: Christ the King";
        day.color = "white";
        day.notes.push("Roman calendar: Our Lord Jesus Christ, King of the Universe (34th Sunday in Ordinary Time). RCL/BCP: Proper 29.");
        return day;
      }
      day.dayName = `The ${ORDINALS[pentecostN]} Sunday after Pentecost`;
      day.notes.push(`RCL/BCP: Proper ${proper}. Roman calendar: ${ORDINALS[otWeek] ? `${ordinalWord(otWeek)} Sunday in Ordinary Time` : `Ordinary Time week ${otWeek}`}. Historic (one-year): ${trinityN >= 1 ? `${ordinalWord(trinityN)} Sunday after Trinity` : "Trinitytide"}.`);
      if (same(date, addDays(trinity, 7))) {
        day.notes.push("US Roman dioceses keep Corpus Christi (The Most Holy Body and Blood of Christ) this Sunday — white.");
      }
      const lastOct = lastSundayOfMonth(year, 10);
      const firstNov = sundayOnOrAfter(ymd(year, 11, 1));
      if (same(date, lastOct)) day.notes.push("Reformation Sunday (Lutheran observance) — red.");
      if (same(date, firstNov)) day.notes.push("All Saints' Sunday observance is customary today — white.");
      return day;
    }
    const sn = Math.floor(diffDays(pentecost, sundayOnOrBeforeDate(date)) / 7);
    day.dayName = sn === 0
      ? `${weekday} after the Day of Pentecost`
      : `${weekday} after the ${ordinalWord(sn)} Sunday after Pentecost`;
    return day;
  }

  // ── Season after Epiphany / Ordinary Time (winter) ──
  day.season = "Season after the Epiphany";
  day.color = "green";
  const baptism = sundayOnOrAfter(ymd(year, 1, 7));
  const lastEpiphany = addDays(ashWednesday, -3);
  if (same(date, baptism)) {
    day.dayName = "The First Sunday after the Epiphany: The Baptism of Our Lord";
    day.color = "white";
    day.weekInSeason = 1;
    day.ordinaryTimeWeek = 1;
    day.notes.push("Renewal of baptismal vows / Thanksgiving at the font is fitting today.");
    return day;
  }
  if (isSunday && same(date, lastEpiphany)) {
    day.dayName = "The Last Sunday after the Epiphany: The Transfiguration of Our Lord";
    day.color = "white";
    day.notes.push("Episcopal & Lutheran calendars keep Transfiguration today; the Roman calendar keeps an ordinary Sunday (Transfiguration is Aug 6). 'Alleluia' farewells are customary before Lent.");
    return day;
  }
  if (isSunday) {
    const n = Math.floor(diffDays(baptism, date) / 7) + 1;
    day.weekInSeason = n;
    day.ordinaryTimeWeek = n;
    day.dayName = `The ${ORDINALS[n]} Sunday after the Epiphany`;
    day.notes.push(`Roman calendar: ${ordinalWord(n)} Sunday in Ordinary Time.`);
    return day;
  }
  const wk = Math.max(1, Math.floor(diffDays(baptism, sundayOnOrBeforeDate(date)) / 7) + 1);
  day.weekInSeason = wk;
  day.dayName = `${weekday} in the ${ORDINALS[wk]} Week after the Epiphany`;
  return day;
}

function ordinalWord(n: number): string {
  return ORDINALS[n] ?? `${n}th`;
}

function sundayOnOrBeforeDate(d: Date): Date {
  return addDays(d, -dow(d));
}

function lastSundayOfMonth(year: number, month: number): Date {
  const lastDay = ymd(year, month + 1, 0 + 1); // first of next month
  const last = addDays(lastDay, -1);
  return addDays(last, -dow(last));
}

// ──────────────────────────────────────────────
// Byzantine (Eastern Orthodox) day classification
// ──────────────────────────────────────────────

const BYZ_FIXED_FEASTS: FixedFeast[] = [
  { month: 1, day: 1, name: "The Circumcision of Christ; St. Basil the Great", note: "The Liturgy of St. Basil is appointed." },
  { month: 1, day: 6, name: "The Theophany of Our Lord", note: "Great Blessing of the Waters." },
  { month: 2, day: 2, name: "The Meeting of Our Lord in the Temple" },
  { month: 3, day: 25, name: "The Annunciation of the Theotokos", note: "Liturgy is celebrated even on Lenten weekdays." },
  { month: 6, day: 24, name: "The Nativity of St. John the Forerunner" },
  { month: 6, day: 29, name: "Ss. Peter and Paul, Chiefs of the Apostles", note: "Concludes the Apostles' Fast." },
  { month: 8, day: 6, name: "The Transfiguration of Our Lord", note: "Blessing of grapes and first fruits." },
  { month: 8, day: 15, name: "The Dormition of the Theotokos", note: "Concludes the Dormition Fast." },
  { month: 9, day: 8, name: "The Nativity of the Theotokos" },
  { month: 9, day: 14, name: "The Universal Exaltation of the Precious Cross", note: "Strict fast day." },
  { month: 11, day: 21, name: "The Entrance of the Theotokos into the Temple" },
  { month: 12, day: 25, name: "The Nativity of Our Lord (Christmas)" },
];

export function byzantineLiturgicalDay(date: Date): LiturgicalDay {
  const year = date.getUTCFullYear();
  const thisP = orthodoxPascha(year);
  const prevP = date >= thisP ? thisP : orthodoxPascha(year - 1);
  const nextP = date >= thisP ? orthodoxPascha(year + 1) : thisP;
  const fromPrev = diffDays(prevP, date);
  const toNext = diffDays(date, nextP);
  const isSunday = dow(date) === 0;
  const weekday = WEEKDAYS[dow(date)];
  const m = date.getUTCMonth() + 1;
  const dnum = date.getUTCDate();

  const feasts = BYZ_FIXED_FEASTS.filter((f) => f.month === m && f.day === dnum);
  const notes: string[] = ["New (Revised Julian) calendar dates are used for fixed feasts, with Pascha reckoned by the traditional (Julian) paschalion — the prevailing practice in most US jurisdictions. Old Calendar parishes add 13 days to fixed feasts."];
  feasts.forEach((f) => f.note && notes.push(`${f.name}: ${f.note}`));

  // Octoechos tone — resets at Pascha; Thomas Sunday begins Tone 1.
  let tone: number | null = null;
  const weeksFromPascha = Math.floor(fromPrev / 7);
  if (fromPrev >= 7) tone = ((weeksFromPascha - 1) % 8) + 1;

  const day: LiturgicalDay = {
    iso: toIso(date),
    calendar: "byzantine",
    dayName: "",
    season: "",
    weekInSeason: null,
    color: "gold",
    colorAlternates: [],
    tone,
    feasts: feasts.map((f) => f.name),
    notes,
  };

  // ── Paschal cycle: Triodion → Great Lent → Holy Week ──
  if (toNext <= 70 && toNext > 0) {
    const sundayOffsets: Record<number, [string, string]> = {
      70: ["Sunday of the Publican and the Pharisee", "Triodion begins; fast-free week follows."],
      63: ["Sunday of the Prodigal Son", ""],
      56: ["Sunday of the Last Judgment (Meatfare)", "Last day of meat before Pascha."],
      49: ["Sunday of Forgiveness (Cheesefare)", "Forgiveness Vespers tonight; Great Lent begins tomorrow."],
      42: ["First Sunday of Great Lent: The Triumph of Orthodoxy", "Procession with icons; Liturgy of St. Basil."],
      35: ["Second Sunday of Great Lent: St. Gregory Palamas", "Liturgy of St. Basil."],
      28: ["Third Sunday of Great Lent: The Veneration of the Cross", "Liturgy of St. Basil."],
      21: ["Fourth Sunday of Great Lent: St. John Climacus", "Liturgy of St. Basil."],
      14: ["Fifth Sunday of Great Lent: St. Mary of Egypt", "Liturgy of St. Basil."],
      7: ["The Entrance of Our Lord into Jerusalem (Palm Sunday)", "Feast of the Lord; fish permitted. Bridegroom Matins begins tonight."],
    };
    if (sundayOffsets[toNext]) {
      const [name, note] = sundayOffsets[toNext];
      day.dayName = name;
      day.season = toNext >= 49 ? "Triodion (Pre-Lent)" : toNext > 7 ? "Great Lent" : "Holy Week";
      day.color = toNext > 7 && toNext <= 42 ? "violet" : toNext === 7 ? "green" : "gold";
      if (toNext === 28) day.color = "violet";
      if (note) day.notes.push(note);
      if (toNext <= 42 && toNext >= 14) day.notes.push("The Divine Liturgy of St. Basil the Great is appointed on the Sundays of Great Lent.");
      return day;
    }
    if (toNext === 8) {
      day.dayName = "Lazarus Saturday";
      day.season = "Great Lent";
      day.color = "gold";
      day.notes.push("The raising of Lazarus; Liturgy of St. John Chrysostom.");
      return day;
    }
    if (toNext === 48) {
      day.dayName = "Clean Monday — Great Lent begins";
      day.season = "Great Lent";
      day.color = "violet";
      day.notes.push("Strict fast; Great Canon of St. Andrew is read Mon–Thu at Great Compline this week.");
      return day;
    }
    if (toNext < 7) {
      const names: Record<number, string> = {
        6: "Great and Holy Monday",
        5: "Great and Holy Tuesday",
        4: "Great and Holy Wednesday",
        3: "Great and Holy Thursday",
        2: "Great and Holy Friday",
        1: "Great and Holy Saturday",
      };
      day.dayName = names[toNext];
      day.season = "Holy Week";
      day.color = toNext <= 2 ? "black" : "violet";
      if (toNext === 3) { day.color = "red"; day.notes.push("Vesperal Liturgy of St. Basil; the Mystical Supper. Twelve Passion Gospels at Matins tonight."); }
      if (toNext === 2) day.notes.push("Royal Hours; Vespers of the Taking-Down from the Cross; Lamentations at Matins. Strict fast.");
      if (toNext === 1) { day.color = "white"; day.notes.push("Vesperal Liturgy of St. Basil with Old Testament readings; the first Resurrection proclamation."); }
      if (toNext >= 4) day.notes.push("Bridegroom Matins; Presanctified Liturgy may be served Mon–Wed.");
      return day;
    }
    // Lenten / Triodion weekday
    day.season = toNext > 49 ? "Triodion (Pre-Lent)" : "Great Lent";
    day.color = toNext > 49 ? "gold" : "violet";
    day.dayName = `${weekday} of ${day.season === "Great Lent" ? "Great Lent" : "the Triodion"}`;
    if (day.season === "Great Lent" && (dow(date) === 3 || dow(date) === 5)) {
      day.notes.push("The Liturgy of the Presanctified Gifts is customarily served on Wednesdays and Fridays of Great Lent.");
    }
    return day;
  }

  // ── Pentecostarion: Pascha → All Saints ──
  if (fromPrev >= 0 && fromPrev <= 56) {
    day.season = "Pentecostarion";
    day.color = "white";
    const sundayOffsets: Record<number, [string, string, string]> = {
      0: ["PASCHA: The Resurrection of Our Lord", "white", "Paschal Matins and Liturgy; Artos blessed. Bright Week is fast-free."],
      7: ["Thomas Sunday (Antipascha)", "white", "Tone 1 begins the Octoechos cycle."],
      14: ["Sunday of the Myrrh-bearing Women", "white", ""],
      21: ["Sunday of the Paralytic", "white", ""],
      28: ["Sunday of the Samaritan Woman", "white", "Mid-Pentecost falls this week."],
      35: ["Sunday of the Blind Man", "white", ""],
      42: ["Sunday of the Holy Fathers of the First Ecumenical Council", "white", ""],
      49: ["Holy Pentecost: The Descent of the Holy Spirit", "green", "Kneeling Vespers follows the Liturgy; green vestments and greenery."],
      56: ["The Sunday of All Saints", "gold", "The Apostles' Fast begins tomorrow."],
    };
    if (sundayOffsets[fromPrev]) {
      const [name, color, note] = sundayOffsets[fromPrev];
      day.dayName = name;
      day.color = color;
      if (note) day.notes.push(note);
      return day;
    }
    if (fromPrev < 7) {
      day.dayName = `Bright ${weekday}`;
      day.notes.push("Bright Week — the Paschal canon replaces the usual psalmody; royal doors remain open.");
      return day;
    }
    if (fromPrev === 39) {
      day.dayName = "The Ascension of Our Lord";
      day.color = "white";
      day.notes.push("Fortieth day of Pascha; leave-taking of Pascha was yesterday.");
      return day;
    }
    day.dayName = `${weekday} of the ${ordinalWord(Math.floor(fromPrev / 7) + 1)} Week of Pascha`;
    return day;
  }

  // ── Sundays/weeks after Pentecost ──
  const pentecost = addDays(prevP, 49);
  const n = Math.floor(diffDays(pentecost, date) / 7);
  day.season = "After Pentecost";
  day.color = "gold";
  day.weekInSeason = n;
  day.dayName = isSunday
    ? `The ${ordinalWord(n)} Sunday after Pentecost`
    : `${weekday} of the ${ordinalWord(n + 1)} Week after Pentecost`;

  // Fasting seasons & fixed-feast framing
  if (m === 11 && dnum >= 15) day.notes.push("Nativity Fast (Nov 15 – Dec 24).");
  if (m === 12 && dnum <= 24) day.notes.push("Nativity Fast (Nov 15 – Dec 24).");
  if (m === 8 && dnum <= 14) day.notes.push("Dormition Fast (Aug 1–14).");
  const allSaints = addDays(prevP, 56);
  const peterPaul = ymd(year, 6, 29);
  if (date > allSaints && date < peterPaul) day.notes.push("Apostles' Fast (from the Monday after All Saints through June 28).");
  if (m === 12 && dnum >= 25) {
    day.season = "Nativity";
    day.dayName = dnum === 25 ? "The Nativity of Our Lord (Christmas)" : `${weekday} after the Nativity`;
    day.color = "white";
  }
  if (m === 1 && dnum <= 14 && date < addDays(nextP, -70)) {
    if (dnum === 1) { day.dayName = "The Circumcision of Christ; St. Basil the Great"; day.color = "white"; }
    else if (dnum === 6) { day.dayName = "The Theophany of Our Lord"; day.color = "white"; day.season = "Theophany"; }
    else if (dnum < 6) { day.season = "Forefeast of Theophany"; }
  }
  if (isSunday && m === 12 && dnum >= 11 && dnum <= 17) day.notes.push("Sunday of the Holy Forefathers falls in this period (two Sundays before Nativity).");
  if (isSunday && m === 12 && dnum >= 18 && dnum <= 24) day.dayName = "Sunday before the Nativity: of the Holy Fathers (Genealogy)";

  return day;
}

// ──────────────────────────────────────────────
// Public entry point
// ──────────────────────────────────────────────

export function computeLiturgicalDay(iso: string, calendar: CalendarSystem): LiturgicalDay {
  const date = parseIsoDate(iso);
  return calendar === "byzantine" ? byzantineLiturgicalDay(date) : westernLiturgicalDay(date);
}

/** Next Sunday (or today if today is Sunday) as yyyy-mm-dd, for form defaults. */
export function nextSundayIso(from = new Date()): string {
  const today = ymd(from.getUTCFullYear(), from.getUTCMonth() + 1, from.getUTCDate());
  return toIso(sundayOnOrAfter(today));
}
