// JSON Schema for the generator's structured output.
//
// Passed to the Messages API via `output_config.format` so the model is
// guaranteed to return a parseable LiturgyDocument. Structured outputs
// require `additionalProperties: false` and every property listed in
// `required`; optionality is expressed with nullable types.

const NULLABLE_STRING = { type: ["string", "null"] } as const;

const LITURGY_ITEM_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["kind", "title", "speaker", "body", "reference", "note"],
  properties: {
    kind: {
      type: "string",
      enum: [
        "heading", "rubric", "text", "dialogue", "prayer",
        "reading", "psalm", "hymn", "music", "note",
      ],
      description:
        "heading=sub-title inside a section; rubric=italic ceremonial direction; text=congregational/leader text; dialogue=versicle-response exchange; prayer=collect or prayer text; reading=scripture lesson; psalm=psalmody; hymn=congregational hymn; music=choir/instrumental piece; note=planning remark printed small",
    },
    title: { ...NULLABLE_STRING, description: "Element name as printed, e.g. 'The Collect of the Day'" },
    speaker: { ...NULLABLE_STRING, description: "Who speaks: 'Celebrant', 'Priest', 'Deacon', 'Assisting Minister', 'People', 'All'…" },
    body: {
      ...NULLABLE_STRING,
      description:
        "Full text with \\n line breaks. For kind=dialogue, each line is 'Speaker: text'. Null when the element is reference-only.",
    },
    reference: { ...NULLABLE_STRING, description: "Source citation: 'BCP p. 355', 'LSB 184', 'ELW 504', 'John 12:1-8', 'Lectionary 36'" },
    note: { ...NULLABLE_STRING, description: "Brief usage, licensing, or planning note for this element" },
  },
} as const;

export const LITURGY_DOCUMENT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "title", "subtitle", "liturgicalDayName", "color",
    "sections", "hymnSuggestions", "planningNotes", "copyrightNotes",
  ],
  properties: {
    title: { type: "string", description: "Service title, e.g. 'The Holy Eucharist: Rite Two'" },
    subtitle: { ...NULLABLE_STRING, description: "Liturgical day + date line, e.g. 'The Fifth Sunday in Lent · April 6, 2025'" },
    liturgicalDayName: { type: "string", description: "The liturgical day exactly as provided in the calendar data" },
    color: { type: "string", description: "Liturgical color for the day (lowercase)" },
    sections: {
      type: "array",
      description: "Major divisions of the service in order",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "items"],
        properties: {
          title: { type: "string", description: "Section title, e.g. 'The Liturgy of the Word'" },
          items: { type: "array", items: LITURGY_ITEM_SCHEMA },
        },
      },
    },
    hymnSuggestions: {
      type: "array",
      description: "Hymn/music suggestions per slot (empty array if not requested)",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["slot", "suggestions"],
        properties: {
          slot: { type: "string", description: "Where it is sung: 'Processional', 'Hymn of the Day', 'Offertory', 'Communion', 'Sending'" },
          suggestions: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["title", "source", "number", "note"],
              properties: {
                title: { type: "string" },
                source: { type: "string", description: "Hymnal or source name" },
                number: { ...NULLABLE_STRING, description: "Hymnal number — null if not certain" },
                note: { ...NULLABLE_STRING, description: "Tune, season fit, or performance note" },
              },
            },
          },
        },
      },
    },
    planningNotes: {
      type: "array",
      items: { type: "string" },
      description: "Sacristy/altar guild/staffing checklist: paraments & vestment color, special items, ministers needed, rehearsal pointers",
    },
    copyrightNotes: {
      type: "array",
      items: { type: "string" },
      description: "What is quoted verbatim vs. cited by reference, and which licenses the church should verify",
    },
  },
} as const;
