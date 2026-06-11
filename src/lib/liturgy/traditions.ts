// Registry of liturgical traditions supported by the Liturgy Builder.
//
// Everything here is static metadata: it drives the builder wizard UI
// (tradition → service → options) and supplies the generator with each
// tradition's ordo, source books, and text-licensing rules.
//
// Pure data — safe to import on the client.

import type { CalendarSystem } from "./types";

export interface TraditionOption {
  id: string;
  label: string;
  type: "select" | "toggle";
  choices?: { value: string; label: string }[];
  default: string | boolean;
  help?: string;
}

export interface ServiceDefinition {
  id: string;
  name: string;
  description: string;
  /** Ordo outline — the skeleton the generator must follow. */
  ordo: string[];
  options: TraditionOption[];
}

export interface Tradition {
  id: string;
  name: string;
  shortName: string;
  family: string;
  calendar: CalendarSystem;
  tagline: string;
  description: string;
  books: string[];
  hymnals: string[];
  lectionary: string;
  /** Copyright & text-sourcing rules passed verbatim to the generator. */
  textGuidance: string;
  services: ServiceDefinition[];
}

// Options shared across several traditions
const READINGS_TEXT_OPTION: TraditionOption = {
  id: "includeReadingsText",
  label: "Print full Scripture texts",
  type: "toggle",
  default: false,
  help: "Includes complete readings from a public-domain translation (World English Bible / KJV). Otherwise citations only, so you can drop in your licensed translation.",
};

const HYMN_SUGGESTIONS_OPTION: TraditionOption = {
  id: "includeHymns",
  label: "Suggest hymns & service music",
  type: "toggle",
  default: true,
  help: "Adds seasonally appropriate hymn suggestions from your tradition's hymnal for each slot.",
};

const dailyOfficeOptions = (psalterNote: string): TraditionOption[] => [
  {
    id: "languageStyle",
    label: "Language style",
    type: "select",
    choices: [
      { value: "contemporary", label: "Contemporary (you/your)" },
      { value: "traditional", label: "Traditional (thee/thou)" },
    ],
    default: "contemporary",
    help: psalterNote,
  },
  READINGS_TEXT_OPTION,
  HYMN_SUGGESTIONS_OPTION,
];

export const TRADITIONS: Tradition[] = [
  // ───────────────────────────── Episcopal ─────────────────────────────
  {
    id: "episcopal",
    name: "Episcopal (TEC)",
    shortName: "Episcopal",
    family: "Anglican",
    calendar: "western",
    tagline: "Book of Common Prayer 1979 · Rite I & Rite II",
    description:
      "The Episcopal Church's prayer book tradition: reverent common prayer in traditional or contemporary idiom, the Revised Common Lectionary, and the full round of Eucharist and Daily Office.",
    books: ["The Book of Common Prayer (1979)", "Lesser Feasts and Fasts", "The Book of Occasional Services"],
    hymnals: ["The Hymnal 1982", "Lift Every Voice and Sing II", "Wonder, Love, and Praise"],
    lectionary: "Revised Common Lectionary (Sundays); BCP Daily Office Lectionary",
    textGuidance:
      "The 1979 Book of Common Prayer is in the public domain: quote its texts in full and cite page numbers (e.g. 'BCP p. 355'). Use Rite I (traditional) or Rite II (contemporary) idiom consistently as selected. Psalms from the BCP Psalter. Hymn numbers from The Hymnal 1982 ('H82 690'); service music with S-numbers (e.g. 'S 128').",
    services: [
      {
        id: "eucharist_rite2",
        name: "The Holy Eucharist: Rite Two",
        description: "The principal Sunday liturgy in contemporary language (BCP p. 355).",
        ordo: [
          "The Word of God: Entrance hymn & opening acclamation",
          "Collect for Purity · Song of Praise (Gloria / Kyrie / Trisagion, per season)",
          "The Collect of the Day",
          "The Lessons: First Reading · Psalm · Second Reading · Sequence hymn · Holy Gospel",
          "The Sermon",
          "The Nicene Creed",
          "The Prayers of the People · Confession of Sin & Absolution · The Peace",
          "The Holy Communion: Offertory · The Great Thanksgiving · The Lord's Prayer",
          "The Breaking of the Bread · Communion of the People",
          "Postcommunion Prayer · Blessing · Dismissal",
        ],
        options: [
          {
            id: "eucharisticPrayer",
            label: "Eucharistic Prayer",
            type: "select",
            choices: [
              { value: "A", label: "Prayer A (p. 361)" },
              { value: "B", label: "Prayer B (p. 367) — incarnational, Advent/Christmas" },
              { value: "C", label: "Prayer C (p. 369) — responsive, 'star prayer'" },
              { value: "D", label: "Prayer D (p. 372) — ancient Basil anaphora" },
            ],
            default: "A",
          },
          {
            id: "prayersOfThePeople",
            label: "Prayers of the People",
            type: "select",
            choices: [
              { value: "I", label: "Form I" },
              { value: "II", label: "Form II" },
              { value: "III", label: "Form III" },
              { value: "IV", label: "Form IV" },
              { value: "V", label: "Form V" },
              { value: "VI", label: "Form VI" },
              { value: "seasonal", label: "Seasonal / locally composed" },
            ],
            default: "IV",
          },
          {
            id: "penitentialOrder",
            label: "Begin with the Penitential Order",
            type: "toggle",
            default: false,
            help: "Customary in Lent; places the Confession at the start of the liturgy.",
          },
          { id: "holyBaptism", label: "Include Holy Baptism", type: "toggle", default: false, help: "Inserts the Baptismal liturgy (BCP p. 299) in place of the Creed." },
          READINGS_TEXT_OPTION,
          HYMN_SUGGESTIONS_OPTION,
        ],
      },
      {
        id: "eucharist_rite1",
        name: "The Holy Eucharist: Rite One",
        description: "Traditional-language Eucharist in the Cranmerian idiom (BCP p. 323).",
        ordo: [
          "The Word of God: Entrance · Collect for Purity · Summary of the Law / Decalogue",
          "Kyrie / Gloria in excelsis · The Collect of the Day",
          "The Lessons · Sequence hymn · Holy Gospel · Sermon · Nicene Creed",
          "Prayers of the People · Confession · Comfortable Words · The Peace",
          "The Holy Communion: Offertory · The Great Thanksgiving (Prayer I or II)",
          "The Lord's Prayer · Prayer of Humble Access · Communion",
          "Postcommunion Prayer (p. 339) · Blessing · Dismissal",
        ],
        options: [
          {
            id: "eucharisticPrayer",
            label: "Eucharistic Prayer",
            type: "select",
            choices: [
              { value: "I", label: "Prayer I (p. 333)" },
              { value: "II", label: "Prayer II (p. 340)" },
            ],
            default: "I",
          },
          { id: "decalogue", label: "Include the Decalogue", type: "toggle", default: false, help: "Customary in Advent and Lent." },
          READINGS_TEXT_OPTION,
          HYMN_SUGGESTIONS_OPTION,
        ],
      },
      {
        id: "morning_prayer",
        name: "Daily Morning Prayer",
        description: "The Daily Office of Morning Prayer, Rite I or Rite II (BCP p. 37/75).",
        ordo: [
          "Opening Sentence · Confession of Sin (optional)",
          "Invitatory: Venite / Jubilate (Pascha Nostrum in Easter)",
          "The Psalter appointed",
          "First Lesson · Canticle · Second Lesson · Canticle",
          "The Apostles' Creed · The Prayers · Suffrages · Collects",
          "Anthem/Hymn · Intercessions · General Thanksgiving · Grace",
        ],
        options: dailyOfficeOptions("Rite I uses traditional language (p. 37); Rite II contemporary (p. 75)."),
      },
      {
        id: "evening_prayer",
        name: "Daily Evening Prayer / Evensong",
        description: "Evening Office with Phos hilaron, Magnificat, and Nunc dimittis — chorally, an Evensong.",
        ordo: [
          "Opening Sentence · Confession (optional) · O Gracious Light (Phos hilaron)",
          "The Psalter appointed",
          "First Lesson · Magnificat · Second Lesson · Nunc dimittis",
          "The Apostles' Creed · The Prayers · Suffrages · Collects",
          "Anthem · Intercessions · The General Thanksgiving · Grace",
        ],
        options: dailyOfficeOptions("Rite I (p. 61) or Rite II (p. 115); choral settings make this Evensong."),
      },
      {
        id: "compline",
        name: "Compline",
        description: "Quiet night prayer to end the day (BCP p. 127).",
        ordo: [
          "Opening versicles · Confession",
          "Psalms (4, 31, 91, 134 as appointed)",
          "Short Lesson · Hymn · Versicles",
          "The Lord's Prayer · Collects · Nunc dimittis with antiphon ('Guide us waking…')",
          "Concluding versicle & blessing",
        ],
        options: [HYMN_SUGGESTIONS_OPTION],
      },
      {
        id: "burial_rite2",
        name: "The Burial of the Dead: Rite Two",
        description: "The Easter liturgy of Christian burial (BCP p. 491), with or without Eucharist.",
        ordo: [
          "Reception of the Body / Opening Anthems ('I am Resurrection and I am Life')",
          "Collect · The Lessons & Psalms · Gospel · Homily",
          "The Apostles' Creed · The Prayers of the People (p. 497)",
          "[At the Eucharist: Offertory through Communion, Proper Preface of the Commemoration of the Dead]",
          "The Commendation ('Give rest, O Christ') · The Committal",
        ],
        options: [
          { id: "withEucharist", label: "Celebrate the Eucharist", type: "toggle", default: true },
          READINGS_TEXT_OPTION,
          HYMN_SUGGESTIONS_OPTION,
        ],
      },
    ],
  },

  // ───────────────────────────── ACNA ─────────────────────────────
  {
    id: "acna",
    name: "Anglican (ACNA)",
    shortName: "ACNA",
    family: "Anglican",
    calendar: "western",
    tagline: "Book of Common Prayer 2019",
    description:
      "The Anglican Church in North America's 2019 Book of Common Prayer: classical Anglican worship renewed — the Anglican Standard and Renewed Ancient eucharistic texts, with a robust Daily Office.",
    books: ["The Book of Common Prayer (2019)", "To Be a Christian: An Anglican Catechism"],
    hymnals: ["The Book of Common Praise (2017)", "The Hymnal 1982"],
    lectionary: "ACNA Sunday Lectionary (3-year, RCL-derived); 2019 Daily Office Lectionary",
    textGuidance:
      "The BCP 2019 is copyrighted by the ACNA but expressly permitted for reproduction in service bulletins for worship; quote texts in full with the attribution line 'Texts from The Book of Common Prayer (2019), Anglican Church in North America. Used by permission.' Cite page numbers. Scripture: the ACNA customarily uses the ESV — print citations only and note the church's own license if full texts are requested (offer WEB/KJV as public-domain alternatives). Psalms from the New Coverdale Psalter (BCP 2019, free to reproduce with the same attribution).",
    services: [
      {
        id: "eucharist_standard",
        name: "Holy Eucharist: Anglican Standard Text",
        description: "The classical Cranmer-shaped Communion service (BCP 2019 p. 105).",
        ordo: [
          "Acclamation · Collect for Purity · Summary of the Law / Decalogue · Kyrie / Trisagion · Gloria",
          "The Collect of the Day · The Lessons · Psalm · Gospel · Sermon",
          "The Nicene Creed · Prayers of the People · Confession & Absolution · Comfortable Words · The Peace",
          "The Offertory · The Sursum Corda & Proper Preface · Sanctus",
          "The Prayer of Consecration · The Lord's Prayer · The Fraction · Prayer of Humble Access · Agnus Dei",
          "Ministration of Communion · Post Communion Prayer · Blessing · Dismissal",
        ],
        options: [
          { id: "decalogue", label: "Include the Decalogue", type: "toggle", default: false, help: "Recommended in Advent and Lent." },
          {
            id: "creedText",
            label: "Creed wording",
            type: "select",
            choices: [
              { value: "we", label: "Nicene Creed — 'We believe'" },
              { value: "i", label: "Nicene Creed — 'I believe'" },
            ],
            default: "we",
          },
          READINGS_TEXT_OPTION,
          HYMN_SUGGESTIONS_OPTION,
        ],
      },
      {
        id: "eucharist_renewed",
        name: "Holy Eucharist: Renewed Ancient Text",
        description: "The eucharistic liturgy in the shape of the early church, with epiclesis (BCP 2019 p. 123).",
        ordo: [
          "Acclamation · Collect for Purity · Summary of the Law · Kyrie / Gloria",
          "The Collect of the Day · The Lessons · Psalm · Gospel · Sermon",
          "The Nicene Creed · Prayers of the People · Confession · The Peace",
          "The Offertory · The Great Thanksgiving (Renewed Ancient Canon) · Sanctus · Memorial Acclamation",
          "The Lord's Prayer · The Fraction · Agnus Dei · Communion",
          "Post Communion Prayer · Blessing · Dismissal",
        ],
        options: [READINGS_TEXT_OPTION, HYMN_SUGGESTIONS_OPTION],
      },
      {
        id: "morning_prayer",
        name: "Daily Morning Prayer",
        description: "The 2019 Daily Office (p. 11) — confession, psalter, lessons, canticles, prayers.",
        ordo: [
          "Opening Sentence · Confession & Absolution",
          "Invitatory: Venite / Jubilate (Pascha Nostrum in Eastertide)",
          "The Psalms Appointed (New Coverdale)",
          "First Lesson · Te Deum / Benedictus es · Second Lesson · Benedictus",
          "The Apostles' Creed · The Lord's Prayer · Suffrages · Collects of the Day & for Mission",
          "Anthem/Hymn · Intercessions · General Thanksgiving · Prayer of St. Chrysostom · Grace",
        ],
        options: [READINGS_TEXT_OPTION, HYMN_SUGGESTIONS_OPTION],
      },
      {
        id: "evening_prayer",
        name: "Daily Evening Prayer",
        description: "The evening office (BCP 2019 p. 41) with Phos hilaron, Magnificat, and Nunc dimittis.",
        ordo: [
          "Opening Sentence · Confession & Absolution · Phos hilaron",
          "The Psalms Appointed · First Lesson · Magnificat · Second Lesson · Nunc dimittis",
          "The Apostles' Creed · The Lord's Prayer · Suffrages · Collects",
          "Anthem/Hymn · Intercessions · General Thanksgiving · Grace",
        ],
        options: [READINGS_TEXT_OPTION, HYMN_SUGGESTIONS_OPTION],
      },
      {
        id: "compline",
        name: "Compline",
        description: "Prayers at the close of day (BCP 2019 p. 63).",
        ordo: [
          "Opening versicles · Confession",
          "Psalms 4, 31, 91, 134 (as appointed) · Short Lesson · Hymn",
          "Versicles · Kyrie · The Lord's Prayer · Collects",
          "Nunc dimittis with antiphon · Concluding versicle & blessing",
        ],
        options: [HYMN_SUGGESTIONS_OPTION],
      },
    ],
  },

  // ───────────────────────────── LCMS ─────────────────────────────
  {
    id: "lcms",
    name: "Lutheran (LCMS)",
    shortName: "LCMS",
    family: "Lutheran",
    calendar: "western",
    tagline: "Lutheran Service Book · Divine Service Settings 1–5",
    description:
      "The Lutheran Church—Missouri Synod's Divine Service: Law-and-Gospel liturgy centered in Word and Sacrament, with the historic Western mass-order preserved in five musical settings.",
    books: ["Lutheran Service Book (2006)", "LSB Altar Book", "LSB Agenda"],
    hymnals: ["Lutheran Service Book (LSB)"],
    lectionary: "LSB Three-Year (RCL-related) or Historic One-Year Lectionary",
    textGuidance:
      "Lutheran Service Book texts are copyrighted by Concordia Publishing House — do NOT reproduce LSB-specific texts verbatim. Instead: give precise page/number references (e.g. 'LSB p. 151', 'LSB 184', hymn 'LSB 656') with concise rubrics describing each element. Historic texts in the common tradition (Kyrie, Gloria, Creeds, Sanctus, Agnus Dei, Lord's Prayer) may be printed using public-domain/ELLC ecumenical wording, clearly noted. Scripture: cite ESV references (the LCMS standard) without printing full text unless asked, then use WEB/KJV with a note. Remind the church that bulletin reproduction requires an LSB/Lutheran Service Builder license from CPH.",
    services: [
      {
        id: "divine_service",
        name: "Divine Service",
        description: "The chief service of Word and Sacrament, in your choice of LSB setting.",
        ordo: [
          "Confession and Absolution (Invocation · Exhortation · Confession · Absolution)",
          "Service of the Word: Introit/Entrance Hymn · Kyrie · Hymn of Praise (Gloria in Excelsis / This Is the Feast)",
          "Salutation & Collect of the Day",
          "Old Testament Reading · Gradual/Psalm · Epistle · Alleluia and Verse · Holy Gospel",
          "Hymn of the Day · Sermon · Creed",
          "Prayer of the Church · Offering & Offertory",
          "Service of the Sacrament: Preface · Sanctus · Prayer of Thanksgiving · Lord's Prayer · Words of Our Lord · Pax Domini · Agnus Dei",
          "Distribution & Distribution Hymns · Nunc Dimittis / 'Thank the Lord' · Post-Communion Collect · Benediction",
        ],
        options: [
          {
            id: "setting",
            label: "Musical setting",
            type: "select",
            choices: [
              { value: "one", label: "Setting One (LSB p. 151)" },
              { value: "two", label: "Setting Two (LSB p. 167)" },
              { value: "three", label: "Setting Three (LSB p. 184) — historic TLH order" },
              { value: "four", label: "Setting Four (LSB p. 203)" },
              { value: "five", label: "Setting Five (LSB p. 213) — chorale service" },
            ],
            default: "one",
          },
          {
            id: "lectionary",
            label: "Lectionary",
            type: "select",
            choices: [
              { value: "three_year", label: "Three-Year Lectionary" },
              { value: "one_year", label: "Historic One-Year Lectionary" },
            ],
            default: "three_year",
            help: "The one-year lectionary uses the historic propers (Introit, Gradual) and Latin Sunday names.",
          },
          {
            id: "hymnOfPraise",
            label: "Hymn of Praise",
            type: "select",
            choices: [
              { value: "gloria", label: "Gloria in Excelsis" },
              { value: "feast", label: "This Is the Feast" },
              { value: "omit", label: "Omit (Advent/Lent)" },
            ],
            default: "gloria",
          },
          {
            id: "creed",
            label: "Creed",
            type: "select",
            choices: [
              { value: "nicene", label: "Nicene Creed (communion Sundays)" },
              { value: "apostles", label: "Apostles' Creed" },
              { value: "athanasian", label: "Athanasian Creed (Trinity Sunday)" },
            ],
            default: "nicene",
          },
          READINGS_TEXT_OPTION,
          HYMN_SUGGESTIONS_OPTION,
        ],
      },
      {
        id: "matins",
        name: "Matins",
        description: "The historic morning office (LSB p. 219) with the Te Deum.",
        ordo: [
          "Versicles · Invitatory & Venite",
          "Office Hymn · Psalmody",
          "Readings · Common Responsory",
          "Sermon/Catechesis (optional) · Canticle: Te Deum or Benedictus",
          "Offering · Kyrie · Lord's Prayer · Collects · Benedicamus · Benediction",
        ],
        options: [READINGS_TEXT_OPTION, HYMN_SUGGESTIONS_OPTION],
      },
      {
        id: "vespers",
        name: "Vespers",
        description: "The historic evening office (LSB p. 229) with the Magnificat.",
        ordo: [
          "Versicles · Psalmody · Office Hymn",
          "Readings · Common Responsory · Sermon (optional)",
          "Canticle: Magnificat or Nunc Dimittis",
          "Offering · Kyrie · Lord's Prayer · Collects · Benedicamus · Benediction",
        ],
        options: [READINGS_TEXT_OPTION, HYMN_SUGGESTIONS_OPTION],
      },
      {
        id: "evening_prayer",
        name: "Evening Prayer",
        description: "Service of Light and evening thanksgiving (LSB p. 243).",
        ordo: [
          "Service of Light (Phos Hilaron) · Thanksgiving for Light",
          "Psalm 141 with incense · Additional Psalms",
          "Readings · Response · Sermon (optional) · Magnificat",
          "Litany · Lord's Prayer · Collects · Benedicamus · Blessing",
        ],
        options: [READINGS_TEXT_OPTION, HYMN_SUGGESTIONS_OPTION],
      },
      {
        id: "compline",
        name: "Compline",
        description: "Prayer at the close of the day (LSB p. 253).",
        ordo: [
          "Versicles · Confession",
          "Psalmody (Psalms 4, 91, 134) · Hymn",
          "Reading · Responsory ('Into Your hands, O Lord')",
          "Prayers · Lord's Prayer · Nunc Dimittis · Blessing",
        ],
        options: [HYMN_SUGGESTIONS_OPTION],
      },
    ],
  },

  // ───────────────────────────── ELCA ─────────────────────────────
  {
    id: "elca",
    name: "Lutheran (ELCA)",
    shortName: "ELCA",
    family: "Lutheran",
    calendar: "western",
    tagline: "Evangelical Lutheran Worship · Settings 1–10",
    description:
      "The Evangelical Lutheran Church in America's pattern of Gathering, Word, Meal, and Sending — Evangelical Lutheran Worship's ten musical settings plus All Creation Sings.",
    books: ["Evangelical Lutheran Worship (2006)", "All Creation Sings (2020)", "ELW Leaders Edition"],
    hymnals: ["Evangelical Lutheran Worship (ELW)", "All Creation Sings (ACS)"],
    lectionary: "Revised Common Lectionary",
    textGuidance:
      "Evangelical Lutheran Worship texts are copyrighted by Augsburg Fortress — do NOT reproduce ELW-specific composed texts verbatim. Give precise references (e.g. 'ELW p. 94', 'ELW Setting 3', hymn 'ELW 504', 'ACS 1089') with clear rubrics. Ecumenical texts (Kyrie, Gloria, Creeds, Sanctus, Lord's Prayer) may be printed in ELLC wording with a note. Remind the church that bulletin reproduction requires an Augsburg Fortress / Sundays and Seasons license (or OneLicense). Scripture: NRSV citations; print full texts only on request using WEB/KJV with a note.",
    services: [
      {
        id: "holy_communion",
        name: "Holy Communion",
        description: "The full Gathering–Word–Meal–Sending liturgy in your chosen ELW setting.",
        ordo: [
          "Gathering: Confession and Forgiveness (or Thanksgiving for Baptism) · Gathering Song · Greeting · Kyrie · Canticle of Praise",
          "Prayer of the Day",
          "Word: First Reading · Psalm · Second Reading · Gospel Acclamation · Gospel · Sermon",
          "Hymn of the Day · Creed · Prayers of Intercession · Peace",
          "Meal: Offering & Setting the Table · Great Thanksgiving (Dialogue · Preface · Holy · Thanksgiving) · Lord's Prayer",
          "Communion & Communion Songs · Prayer after Communion",
          "Sending: Blessing · Sending Song · Dismissal",
        ],
        options: [
          {
            id: "setting",
            label: "Musical setting",
            type: "select",
            choices: [
              { value: "1", label: "ELW Setting One" },
              { value: "2", label: "ELW Setting Two" },
              { value: "3", label: "ELW Setting Three" },
              { value: "4", label: "ELW Setting Four" },
              { value: "8", label: "ELW Setting Eight" },
              { value: "10", label: "ELW Setting Ten" },
              { value: "acs11", label: "All Creation Sings Setting Eleven" },
              { value: "acs12", label: "All Creation Sings Setting Twelve" },
            ],
            default: "3",
          },
          {
            id: "gatheringRite",
            label: "Gathering rite",
            type: "select",
            choices: [
              { value: "confession", label: "Confession and Forgiveness" },
              { value: "thanksgiving_baptism", label: "Thanksgiving for Baptism" },
              { value: "none", label: "Entrance hymn only" },
            ],
            default: "confession",
          },
          {
            id: "canticle",
            label: "Canticle of Praise",
            type: "select",
            choices: [
              { value: "glory", label: "Glory to God" },
              { value: "feast", label: "This Is the Feast" },
              { value: "omit", label: "Omit (Advent/Lent)" },
            ],
            default: "glory",
          },
          {
            id: "creed",
            label: "Creed",
            type: "select",
            choices: [
              { value: "nicene", label: "Nicene Creed" },
              { value: "apostles", label: "Apostles' Creed" },
              { value: "omit", label: "Omit" },
            ],
            default: "apostles",
          },
          READINGS_TEXT_OPTION,
          HYMN_SUGGESTIONS_OPTION,
        ],
      },
      {
        id: "service_word",
        name: "Service of the Word",
        description: "The liturgy of Gathering, Word, and Sending when communion is not celebrated.",
        ordo: [
          "Gathering Song · Greeting · Dialogue/Kyrie · Canticle",
          "Prayer of the Day · Readings · Gospel · Sermon",
          "Hymn of the Day · Creed · Prayers of Intercession · Peace",
          "Offering · Thanksgiving for the Word · Lord's Prayer",
          "Blessing · Sending Song · Dismissal",
        ],
        options: [READINGS_TEXT_OPTION, HYMN_SUGGESTIONS_OPTION],
      },
      {
        id: "morning_prayer",
        name: "Morning Prayer (Matins)",
        description: "Daily prayer at morning (ELW p. 298).",
        ordo: [
          "Opening Dialogue · Venite/Psalmody",
          "Hymn · Reading · Response",
          "Gospel Canticle: Benedictus",
          "Prayers · Lord's Prayer · Blessing",
        ],
        options: [READINGS_TEXT_OPTION, HYMN_SUGGESTIONS_OPTION],
      },
      {
        id: "evening_prayer",
        name: "Evening Prayer (Vespers)",
        description: "Daily prayer at evening with the Service of Light (ELW p. 309).",
        ordo: [
          "Service of Light: Dialogue · Joyous Light of Glory · Thanksgiving for Light",
          "Psalm 141 · Additional Psalms · Hymn",
          "Reading · Response · Gospel Canticle: Magnificat",
          "Prayers · Lord's Prayer · Blessing",
        ],
        options: [READINGS_TEXT_OPTION, HYMN_SUGGESTIONS_OPTION],
      },
      {
        id: "night_prayer",
        name: "Night Prayer (Compline)",
        description: "Quiet prayer at the close of day (ELW p. 320).",
        ordo: [
          "Opening Dialogue · Confession",
          "Psalmody · Hymn · Reading · Response",
          "Gospel Canticle: Nunc Dimittis",
          "Prayers · Lord's Prayer · Blessing",
        ],
        options: [HYMN_SUGGESTIONS_OPTION],
      },
    ],
  },

  // ───────────────────────────── WELS ─────────────────────────────
  {
    id: "wels",
    name: "Lutheran (WELS)",
    shortName: "WELS",
    family: "Lutheran",
    calendar: "western",
    tagline: "Christian Worship 2021 · The Service",
    description:
      "The Wisconsin Evangelical Lutheran Synod's Christian Worship (2021): the historic liturgy of Word and Sacrament in three musical settings, with strong congregational song.",
    books: ["Christian Worship: Hymnal (2021)", "Christian Worship: Service Builder resources"],
    hymnals: ["Christian Worship (CW21)"],
    lectionary: "Christian Worship Three-Year Lectionary (or One-Year)",
    textGuidance:
      "Christian Worship (2021) texts are copyrighted by Northwestern Publishing House — do NOT reproduce CW-specific texts verbatim. Give references (e.g. 'CW p. 154', 'The Service, Setting One', hymn 'CW 511') with concise rubrics. Common ecumenical texts (Creeds, Lord's Prayer, Gloria) may be printed in ELLC/public-domain wording with a note. Remind the church to use their NPH Service Builder / OneLicense coverage. Scripture: EHV or NIV citations are customary; print only citations unless full text requested (then WEB/KJV with note).",
    services: [
      {
        id: "the_service",
        name: "The Service (Word and Sacrament)",
        description: "The principal communion liturgy of CW21 in one of three settings.",
        ordo: [
          "Hymn · Invocation · Confession and Absolution",
          "Lord, Have Mercy (Kyrie) · Glory to God in the Highest / festival canticle",
          "The Word: Salutation & Prayer of the Day · First Reading · Psalm · Second Reading · Gospel Acclamation · Gospel",
          "Hymn of the Day · Sermon · Creed",
          "Prayer of the Church · Offering",
          "The Sacrament: Preface · Holy, Holy, Holy · Prayer of Thanksgiving · Words of Institution · O Christ, Lamb of God",
          "Distribution & Hymns · Thanksgiving · Blessing",
        ],
        options: [
          {
            id: "setting",
            label: "Musical setting",
            type: "select",
            choices: [
              { value: "one", label: "Setting One" },
              { value: "two", label: "Setting Two" },
              { value: "three", label: "Setting Three (chorale)" },
            ],
            default: "one",
          },
          {
            id: "communion",
            label: "Holy Communion celebrated",
            type: "toggle",
            default: true,
          },
          READINGS_TEXT_OPTION,
          HYMN_SUGGESTIONS_OPTION,
        ],
      },
      {
        id: "morning_prayer",
        name: "Morning Prayer",
        description: "The morning office adapted from Matins (CW21).",
        ordo: [
          "O Lord, Open My Lips · Venite",
          "Psalmody · Office Hymn · Readings",
          "Seasonal Response · Sermon (optional) · Te Deum / Benedictus",
          "Prayers · Lord's Prayer · Blessing",
        ],
        options: [READINGS_TEXT_OPTION, HYMN_SUGGESTIONS_OPTION],
      },
      {
        id: "evening_prayer",
        name: "Evening Prayer (Vespers)",
        description: "Evening office with the Service of Light and Magnificat.",
        ordo: [
          "Service of Light · O Joyous Light",
          "Psalm 141 · Psalmody · Hymn",
          "Readings · Response · Magnificat",
          "Litany & Prayers · Lord's Prayer · Blessing",
        ],
        options: [READINGS_TEXT_OPTION, HYMN_SUGGESTIONS_OPTION],
      },
    ],
  },

  // ───────────────────────────── Roman Catholic ─────────────────────────────
  {
    id: "roman_catholic",
    name: "Roman Catholic",
    shortName: "Catholic",
    family: "Roman Rite",
    calendar: "western",
    tagline: "The Roman Missal, Third Edition",
    description:
      "The Order of Mass of the Roman Rite — Introductory Rites, Liturgy of the Word, Liturgy of the Eucharist, and Concluding Rites — planned around the General Roman Calendar and Lectionary for Mass.",
    books: ["The Roman Missal, Third Edition (2011)", "Lectionary for Mass", "GIRM (General Instruction)"],
    hymnals: ["Gather (GIA)", "Worship IV", "Journeysongs / Breaking Bread (OCP)", "The Saint Michael Hymnal"],
    lectionary: "Lectionary for Mass — Sunday cycle A/B/C; weekday cycle I/II",
    textGuidance:
      "The English translation of the Roman Missal is copyrighted by ICEL — do NOT reproduce Missal texts beyond brief incipits and the people's short responses needed for participation (e.g. 'And with your spirit'). Structure the order with precise element names and options (e.g. 'Penitential Act, Form A: Confiteor', 'Eucharistic Prayer II with its proper Preface') plus rubrics referencing the Missal and GIRM. Cite readings by Lectionary number and biblical citation (e.g. 'Lectionary 33: Isaiah 43:16-21'). Entrance/Communion antiphons: cite the source ('Entrance Antiphon, cf. Ps 43:1-2') without full Missal text. Note that worship-aid reproduction requires an ICEL/USCCB license and music requires OneLicense/CCLI coverage.",
    services: [
      {
        id: "sunday_mass",
        name: "Holy Mass (Sunday or Solemnity)",
        description: "The full Order of Mass with proper antiphons, readings, and chants for the day.",
        ordo: [
          "Introductory Rites: Entrance Chant · Greeting · Penitential Act (or Rite of Sprinkling) · Kyrie · Gloria · Collect",
          "Liturgy of the Word: First Reading · Responsorial Psalm · Second Reading · Gospel Acclamation · Gospel · Homily",
          "Profession of Faith (Creed) · Universal Prayer",
          "Liturgy of the Eucharist: Preparation of the Gifts · Prayer over the Offerings",
          "Eucharistic Prayer (Preface · Sanctus · Institution · Memorial Acclamation · Doxology)",
          "Communion Rite: Lord's Prayer · Rite of Peace · Lamb of God · Communion · Prayer after Communion",
          "Concluding Rites: Blessing · Dismissal",
        ],
        options: [
          {
            id: "penitentialAct",
            label: "Penitential Act",
            type: "select",
            choices: [
              { value: "A", label: "Form A — Confiteor" },
              { value: "B", label: "Form B — 'Have mercy on us, O Lord'" },
              { value: "C", label: "Form C — invocations with Kyrie" },
              { value: "asperges", label: "Rite of Sprinkling (Easter)" },
            ],
            default: "A",
          },
          {
            id: "eucharisticPrayer",
            label: "Eucharistic Prayer",
            type: "select",
            choices: [
              { value: "I", label: "EP I — The Roman Canon (solemnities)" },
              { value: "II", label: "EP II — brief, ancient (Hippolytus)" },
              { value: "III", label: "EP III — Sundays & feasts" },
              { value: "IV", label: "EP IV — fixed preface, salvation history" },
            ],
            default: "III",
          },
          {
            id: "memorialAcclamation",
            label: "Memorial Acclamation",
            type: "select",
            choices: [
              { value: "A", label: "A — 'We proclaim your Death…'" },
              { value: "B", label: "B — 'When we eat this Bread…'" },
              { value: "C", label: "C — 'Save us, Savior of the world…'" },
            ],
            default: "A",
          },
          {
            id: "creed",
            label: "Profession of Faith",
            type: "select",
            choices: [
              { value: "nicene", label: "Niceno-Constantinopolitan Creed" },
              { value: "apostles", label: "Apostles' Creed (Lent & Easter option)" },
            ],
            default: "nicene",
          },
          { id: "incense", label: "Incense used", type: "toggle", default: false },
          READINGS_TEXT_OPTION,
          HYMN_SUGGESTIONS_OPTION,
        ],
      },
      {
        id: "daily_mass",
        name: "Daily Mass (Ferial)",
        description: "Weekday Mass with weekday lectionary cycle and simpler order.",
        ordo: [
          "Entrance · Greeting · Penitential Act · Collect",
          "First Reading · Responsorial Psalm · Gospel Acclamation · Gospel · (Brief Homily)",
          "Preparation of the Gifts · Eucharistic Prayer · Communion Rite",
          "Prayer after Communion · Blessing · Dismissal",
        ],
        options: [
          {
            id: "eucharisticPrayer",
            label: "Eucharistic Prayer",
            type: "select",
            choices: [
              { value: "II", label: "EP II (customary on weekdays)" },
              { value: "III", label: "EP III" },
            ],
            default: "II",
          },
          READINGS_TEXT_OPTION,
        ],
      },
      {
        id: "vespers",
        name: "Sunday Vespers (Evening Prayer II)",
        description: "Evening Prayer from the Liturgy of the Hours, suitable for a sung parish celebration.",
        ordo: [
          "Introductory Verse · Hymn",
          "Psalmody: two psalms and a New Testament canticle with antiphons",
          "Short Reading · Responsory · Magnificat with antiphon",
          "Intercessions · Lord's Prayer · Concluding Prayer · Blessing",
        ],
        options: [HYMN_SUGGESTIONS_OPTION],
      },
      {
        id: "compline",
        name: "Night Prayer (Compline)",
        description: "The Church's prayer before sleep, with examination of conscience and the Nunc dimittis.",
        ordo: [
          "Introductory Verse · Examination of Conscience / Penitential Act",
          "Hymn · Psalmody",
          "Short Reading · Responsory ('Into your hands…')",
          "Nunc Dimittis with antiphon · Concluding Prayer · Marian Antiphon",
        ],
        options: [HYMN_SUGGESTIONS_OPTION],
      },
    ],
  },

  // ───────────────────────────── Eastern Orthodox ─────────────────────────────
  {
    id: "orthodox",
    name: "Eastern Orthodox",
    shortName: "Orthodox",
    family: "Byzantine Rite",
    calendar: "byzantine",
    tagline: "Divine Liturgy of St. John Chrysostom & the Byzantine office",
    description:
      "The Byzantine Rite as served in Greek, Antiochian, OCA, and Slavic parishes: the Divine Liturgy with its proper troparia and kontakia, the resurrectional tones, and the cycle of fasts and feasts reckoned with the traditional Paschalion.",
    books: ["The Divine Liturgy (Hieratikon)", "Octoechos", "Triodion & Pentecostarion", "Menaion", "Horologion"],
    hymnals: ["Byzantine chant / parish music tradition (no numbered hymnal)"],
    lectionary: "Byzantine lectionary (Apostolos & Gospel cycle from Pascha)",
    textGuidance:
      "Use a dignified public-domain-style English rendering of the fixed Byzantine texts (litanies, antiphons, Trisagion, Cherubic Hymn, Creed without filioque, anaphora responses) — translations vary by jurisdiction, so add a note that the parish's own service books take precedence. Provide the proper troparia/kontakia for the day (resurrectional troparion in the tone of the week, plus festal/temple/saint as applicable) with tone numbers. Readings cited from the Byzantine lectionary (Epistle & Gospel). Do not suggest Western hymn numbers; suggest chant pieces by name. Respect fasting rules in planning notes.",
    services: [
      {
        id: "liturgy_chrysostom",
        name: "Divine Liturgy of St. John Chrysostom",
        description: "The eucharistic liturgy served on most Sundays and feasts of the year.",
        ordo: [
          "Enarxis: Great Litany · First & Second Antiphons · Hymn of Justinian ('Only-begotten Son') · Third Antiphon / Beatitudes",
          "Little Entrance · Troparia & Kontakia of the day · Trisagion",
          "Liturgy of the Word: Prokeimenon · Epistle · Alleluia · Gospel · Homily",
          "Litany of Fervent Supplication · (Litanies of the Catechumens & Faithful)",
          "Great Entrance with the Cherubic Hymn · Litany of Completion · The Peace · Creed",
          "Holy Anaphora: 'Let us stand well' · Sursum corda · 'Holy, holy, holy' · Words of Institution · Epiclesis · Megalynarion",
          "Litany before the Lord's Prayer · The Lord's Prayer · 'Holy things are for the holy'",
          "Communion of clergy & faithful · 'We have seen the true light' · Litany of Thanksgiving",
          "Prayer before the Ambo · Dismissal · Antidoron",
        ],
        options: [
          {
            id: "antiphons",
            label: "Antiphons",
            type: "select",
            choices: [
              { value: "typical", label: "Typical Psalms & Beatitudes (Slavic practice)" },
              { value: "festal", label: "Festal/daily antiphons (Greek practice)" },
            ],
            default: "typical",
          },
          { id: "catechumenLitany", label: "Include Litany of the Catechumens", type: "toggle", default: false },
          { id: "memorial", label: "Include memorial litany (for the departed)", type: "toggle", default: false },
          READINGS_TEXT_OPTION,
        ],
      },
      {
        id: "liturgy_basil",
        name: "Divine Liturgy of St. Basil the Great",
        description: "The longer anaphora appointed ten times a year — Lenten Sundays, Holy Thursday & Saturday, the eves of Nativity and Theophany, and St. Basil's day.",
        ordo: [
          "Enarxis with antiphons · Little Entrance · Troparia & Kontakia · Trisagion",
          "Prokeimenon · Epistle · Alleluia · Gospel · Homily",
          "Great Entrance · Creed",
          "The Anaphora of St. Basil (extended) · 'All of creation rejoices in you' (in place of the Megalynarion)",
          "Lord's Prayer · Communion · Thanksgiving · Dismissal",
        ],
        options: [
          { id: "antiphons", label: "Antiphons", type: "select", choices: [
            { value: "typical", label: "Typical Psalms & Beatitudes" },
            { value: "festal", label: "Festal antiphons" },
          ], default: "typical" },
          READINGS_TEXT_OPTION,
        ],
      },
      {
        id: "presanctified",
        name: "Liturgy of the Presanctified Gifts",
        description: "The solemn Lenten evening communion service of Wednesdays and Fridays in Great Lent.",
        ordo: [
          "Vespers opening: Psalm 103 · Great Litany · Kathisma 18 (with transfer of the Gifts)",
          "'Lord, I have cried' with Lenten stichera · Entrance · 'O Gladsome Light'",
          "Old Testament readings (Genesis & Proverbs) · 'Let my prayer arise' (Psalm 140)",
          "Prayer of St. Ephraim with prostrations",
          "Litanies · Great Entrance ('Now the powers of heaven') · Lord's Prayer",
          "Communion of the Presanctified Gifts · Thanksgiving · Prayer before the Ambo · Dismissal",
        ],
        options: [],
      },
      {
        id: "great_vespers",
        name: "Great Vespers",
        description: "The evening service that opens the liturgical day, served on Saturday evenings and feast eves.",
        ordo: [
          "Psalm 103 ('Bless the Lord, O my soul') · Great Litany",
          "Kathisma ('Blessed is the man') · 'Lord, I have cried' with stichera of the day",
          "Entrance with censer · 'O Gladsome Light' · Prokeimenon (· Old Testament readings on feasts)",
          "Litany of Fervent Supplication · 'Vouchsafe, O Lord' · Litany of Completion",
          "(Litiya & Artoklasia on great feasts) · Aposticha",
          "St. Symeon's Prayer (Nunc dimittis) · Trisagion Prayers · Troparia (Resurrectional/festal)",
          "Dismissal",
        ],
        options: [
          { id: "litiya", label: "Include Litiya (blessing of loaves)", type: "toggle", default: false },
        ],
      },
      {
        id: "orthros",
        name: "Orthros (Matins)",
        description: "The morning office preceding the Divine Liturgy, with the canon and Great Doxology.",
        ordo: [
          "Royal Beginning · Six Psalms · Great Litany · 'God is the Lord' with troparia",
          "Kathismata & Sessional Hymns · (Polyeleos on feasts) · Resurrectional Evlogetaria",
          "Hypakoe · Anabathmoi · Prokeimenon · Matins Gospel · 'Having beheld the Resurrection'",
          "Psalm 50 · The Canon (Odes with Katavasiai) · Magnificat & 'More honorable than the Cherubim'",
          "Exaposteilarion · Praises ('Let every breath') with stichera · Great Doxology",
          "Troparion · Litanies · Dismissal (→ Divine Liturgy)",
        ],
        options: [],
      },
    ],
  },

  // ───────────────────────────── United Methodist ─────────────────────────────
  {
    id: "umc",
    name: "United Methodist",
    shortName: "UMC",
    family: "Methodist/Wesleyan",
    calendar: "western",
    tagline: "Word and Table · The United Methodist Hymnal & Book of Worship",
    description:
      "The United Methodist pattern of Entrance, Proclamation and Response, Thanksgiving and Communion, and Sending Forth — Wesleyan warmth within the ecumenical shape of Word and Table.",
    books: ["The United Methodist Hymnal (1989)", "The United Methodist Book of Worship (1992)"],
    hymnals: ["The United Methodist Hymnal (UMH)", "The Faith We Sing (TFWS)", "Worship & Song"],
    lectionary: "Revised Common Lectionary",
    textGuidance:
      "Word and Table services and the Great Thanksgiving texts are copyrighted by The United Methodist Publishing House — reference them precisely (e.g. 'UMH p. 6, Word and Table I'; 'A Service of Word and Table II, UMH p. 12'; hymn 'UMH 57', 'TFWS 2025') rather than quoting composed texts at length. The people's brief responses and ecumenical texts (Apostles' Creed UMH 881, Lord's Prayer) may be printed in ELLC/traditional wording with a note. Note that reproduction requires permission from UMPH and music coverage via OneLicense/CCLI.",
    services: [
      {
        id: "word_table1",
        name: "A Service of Word and Table I",
        description: "The full text service with the complete Great Thanksgiving (UMH p. 6).",
        ordo: [
          "Entrance: Gathering · Greeting · Hymn of Praise · Opening Prayer",
          "Proclamation: Prayer for Illumination · Scripture Lessons · Psalm · Gospel · Sermon",
          "Response: Invitation · Confession & Pardon · The Peace · Affirmation of Faith",
          "Thanksgiving & Communion: Offering · The Great Thanksgiving (with Sanctus & Memorial Acclamation) · The Lord's Prayer",
          "Breaking the Bread · Giving the Bread and Cup · Prayer after Communion",
          "Sending Forth: Hymn · Dismissal with Blessing",
        ],
        options: [
          {
            id: "creed",
            label: "Affirmation of Faith",
            type: "select",
            choices: [
              { value: "apostles", label: "Apostles' Creed (UMH 881)" },
              { value: "nicene", label: "Nicene Creed (UMH 880)" },
              { value: "modern", label: "A Modern Affirmation (UMH 885)" },
              { value: "uca", label: "Statement of Faith of the United Church of Canada (UMH 883)" },
            ],
            default: "apostles",
          },
          {
            id: "greatThanksgivingMusic",
            label: "Sung Great Thanksgiving setting",
            type: "select",
            choices: [
              { value: "spoken", label: "Spoken" },
              { value: "A", label: "Musical Setting A (UMH p. 17)" },
              { value: "B", label: "Musical Setting B (UMH p. 18)" },
            ],
            default: "spoken",
          },
          READINGS_TEXT_OPTION,
          HYMN_SUGGESTIONS_OPTION,
        ],
      },
      {
        id: "service_word",
        name: "A Service of the Word",
        description: "The basic pattern when Holy Communion is not celebrated.",
        ordo: [
          "Entrance: Gathering · Greeting · Hymn · Opening Prayer",
          "Proclamation: Prayer for Illumination · Lessons · Psalm · Gospel · Sermon",
          "Response: Affirmation of Faith · Concerns & Prayers · Confession & Pardon · The Peace",
          "Offering with Doxology",
          "Sending Forth: Hymn · Dismissal with Blessing",
        ],
        options: [
          {
            id: "creed",
            label: "Affirmation of Faith",
            type: "select",
            choices: [
              { value: "apostles", label: "Apostles' Creed (UMH 881)" },
              { value: "modern", label: "A Modern Affirmation (UMH 885)" },
            ],
            default: "apostles",
          },
          READINGS_TEXT_OPTION,
          HYMN_SUGGESTIONS_OPTION,
        ],
      },
    ],
  },

  // ───────────────────────────── PC(USA) ─────────────────────────────
  {
    id: "pcusa",
    name: "Presbyterian (PCUSA)",
    shortName: "PC(USA)",
    family: "Reformed",
    calendar: "western",
    tagline: "Book of Common Worship · Service for the Lord's Day",
    description:
      "The Presbyterian Church (U.S.A.)'s Service for the Lord's Day: Reformed worship in the ecumenical fourfold shape — Gathering, Word, Eucharist, and Sending.",
    books: ["Book of Common Worship (2018)", "Glory to God: The Presbyterian Hymnal (2013)"],
    hymnals: ["Glory to God (GtG)"],
    lectionary: "Revised Common Lectionary",
    textGuidance:
      "Book of Common Worship (2018) composed texts are copyrighted by Westminster John Knox Press — reference them ('BCW p. 35', 'Great Thanksgiving B') with rubrics rather than long verbatim quotes; brief congregational responses are fine. Ecumenical texts (Creeds, Lord's Prayer) may be printed in ELLC wording; the Brief Statement of Faith and confessional excerpts cite the Book of Confessions. Hymns from Glory to God ('GtG 610'). Note OneLicense/CCLI for music and WJK permissions for extended texts.",
    services: [
      {
        id: "lords_day",
        name: "Service for the Lord's Day",
        description: "The full Sunday liturgy, with or without the Lord's Supper.",
        ordo: [
          "Gathering: Call to Worship · Hymn · Prayer of Confession & Declaration of Forgiveness · The Peace",
          "Word: Prayer for Illumination · First Reading · Psalm · Second Reading · Gospel · Sermon",
          "Response: Hymn · Affirmation of Faith · Prayers of the People",
          "Eucharist (when celebrated): Offering · Invitation to the Table · Great Thanksgiving · Lord's Prayer · Communion",
          "Sending: Hymn · Charge and Blessing",
        ],
        options: [
          { id: "communion", label: "Celebrate the Lord's Supper", type: "toggle", default: false },
          {
            id: "creed",
            label: "Affirmation of Faith",
            type: "select",
            choices: [
              { value: "apostles", label: "Apostles' Creed" },
              { value: "nicene", label: "Nicene Creed" },
              { value: "brief", label: "A Brief Statement of Faith (excerpt)" },
            ],
            default: "apostles",
          },
          READINGS_TEXT_OPTION,
          HYMN_SUGGESTIONS_OPTION,
        ],
      },
      {
        id: "daily_morning",
        name: "Daily Prayer: Morning",
        description: "Morning prayer from the BCW Daily Prayer services.",
        ordo: [
          "Opening Sentences · Morning Hymn or Psalm 95",
          "Psalmody · Scripture Reading · Silence",
          "Canticle: Benedictus · Thanksgivings & Intercessions · Lord's Prayer · Blessing",
        ],
        options: [READINGS_TEXT_OPTION],
      },
      {
        id: "daily_evening",
        name: "Daily Prayer: Evening",
        description: "Evening prayer with thanksgiving for light.",
        ordo: [
          "Service of Light · Evening Hymn (Phos hilaron) · Thanksgiving for Light",
          "Psalm 141 · Psalmody · Reading · Silence",
          "Canticle: Magnificat · Intercessions · Lord's Prayer · Blessing",
        ],
        options: [READINGS_TEXT_OPTION],
      },
    ],
  },

  // ───────────────────────────── Free liturgical / Convergence ─────────────────────────────
  {
    id: "free_liturgical",
    name: "Free Liturgical / Convergence",
    shortName: "Convergence",
    family: "Non-denominational",
    calendar: "western",
    tagline: "Ancient-future worship from public-domain sources",
    description:
      "For congregations outside the historic denominations who keep the church year: liturgies assembled from public-domain prayer-book sources (1662/1928/1979 BCP, ancient texts) that you can adapt and print freely.",
    books: ["Book of Common Prayer 1662 & 1979 (public domain sources)", "Ancient hymns & canticles"],
    hymnals: ["Open/public-domain hymnody (or your CCLI catalog)"],
    lectionary: "Revised Common Lectionary",
    textGuidance:
      "Build entirely from public-domain sources (BCP 1979, BCP 1662/1928, ancient creeds and canticles, KJV/WEB Scripture) so the congregation may reproduce everything freely — say so in the copyright notes. Keep language warm and accessible; offer contemporary wording with traditional options. Where modern worship songs would fit, name the slot and suggest public-domain hymns, leaving space for the church's own CCLI selections.",
    services: [
      {
        id: "word_table",
        name: "Word & Table (Ancient-Future Communion)",
        description: "A full communion liturgy in the classic fourfold shape, free to reproduce.",
        ordo: [
          "Gathering: Call to Worship · Songs of Praise · Collect for Purity · Confession & Assurance",
          "Word: Old Testament · Psalm · Epistle · Gospel · Sermon",
          "Nicene Creed · Prayers of the People · The Peace",
          "Table: Offertory · The Great Thanksgiving (Sursum corda · Sanctus · Institution · Epiclesis) · Lord's Prayer",
          "Breaking of the Bread · Communion · Post-communion prayer",
          "Sending: Blessing · Sending Song · Dismissal",
        ],
        options: [
          {
            id: "languageStyle",
            label: "Language style",
            type: "select",
            choices: [
              { value: "contemporary", label: "Contemporary" },
              { value: "traditional", label: "Traditional (thee/thou)" },
            ],
            default: "contemporary",
          },
          READINGS_TEXT_OPTION,
          HYMN_SUGGESTIONS_OPTION,
        ],
      },
      {
        id: "evening_taize",
        name: "Contemplative Evening Prayer (Taizé-style)",
        description: "Candlelit evening prayer built around repeated sung refrains, psalmody, and silence.",
        ordo: [
          "Gathering in candlelight · Opening chant",
          "Psalm with sung response · Scripture reading",
          "Extended silence · Sung refrains",
          "Intercessions with sung Kyrie · Lord's Prayer",
          "Blessing · Quiet departure",
        ],
        options: [HYMN_SUGGESTIONS_OPTION],
      },
      {
        id: "lessons_carols",
        name: "Service of Lessons & Carols",
        description: "The beloved nine-lessons pattern, adaptable for Advent or Christmas.",
        ordo: [
          "Processional carol ('Once in Royal David's City' is traditional) · Bidding Prayer",
          "Nine Lessons from Genesis to John, each followed by a carol or anthem",
          "Collect · The Lord's Prayer",
          "Blessing · Recessional carol",
        ],
        options: [
          {
            id: "festival",
            label: "Festival",
            type: "select",
            choices: [
              { value: "christmas", label: "Christmas Lessons & Carols" },
              { value: "advent", label: "Advent Lessons & Carols" },
            ],
            default: "christmas",
          },
          READINGS_TEXT_OPTION,
          HYMN_SUGGESTIONS_OPTION,
        ],
      },
    ],
  },
];

export function getTradition(id: string): Tradition | undefined {
  return TRADITIONS.find((t) => t.id === id);
}

export function getService(traditionId: string, serviceId: string): ServiceDefinition | undefined {
  return getTradition(traditionId)?.services.find((s) => s.id === serviceId);
}
