import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export interface ColumnAnalysis {
  sourceColumn: string;
  targetField: string | null;
  confidence: number; // 0-1
  sampleValues: string[];
  detectedType: "text" | "email" | "phone" | "date" | "number" | "category" | "address" | "name" | "unknown";
}

export interface CategoryAnalysis {
  field: string; // e.g. "person_status", "group_type"
  sourceValues: string[]; // unique values found
  mappings: { sourceValue: string; suggestedMapping: string; suggestedLabel: string }[];
  recommendation: string; // AI explanation
}

export interface FileAnalysis {
  columns: ColumnAnalysis[];
  categories: CategoryAnalysis[];
  detectedFormat: string; // "people", "groups", "events", "attendance", "mixed", "unknown"
  totalRows: number;
  recommendations: string[];
  confidence: number;
}

const SHEPHERD_FIELDS = {
  person: [
    "firstName", "lastName", "email", "phone", "status",
    "dateOfBirth", "gender", "notes", "householdName", "householdRole",
    "address", "city", "state", "zip",
  ],
  group: ["name", "description", "type", "meetingDay", "meetingTime"],
  event: ["name", "description", "type", "date", "endDate"],
  attendance: ["personName", "personEmail", "eventName", "eventDate", "status"],
};

export async function analyzeFile(
  headers: string[],
  sampleRows: string[][],
  fileName: string,
): Promise<FileAnalysis> {
  const sampleData = sampleRows.slice(0, 10).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] ?? "";
    });
    return obj;
  });

  // Collect unique values for potential category columns
  const uniqueValues: Record<string, Set<string>> = {};
  headers.forEach((h, i) => {
    uniqueValues[h] = new Set();
    sampleRows.forEach((row) => {
      if (row[i]) uniqueValues[h].add(row[i]);
    });
  });

  const categoryLikeColumns = Object.entries(uniqueValues)
    .filter(([, vals]) => vals.size > 0 && vals.size <= 20)
    .map(([col, vals]) => ({ column: col, values: [...vals] }));

  const prompt = `You are analyzing a data file being imported into Shepherd, a church management system.

File name: "${fileName}"
Column headers: ${JSON.stringify(headers)}
Sample data (first ${sampleData.length} rows): ${JSON.stringify(sampleData, null, 2)}

Columns with few unique values (potential categories):
${JSON.stringify(categoryLikeColumns, null, 2)}

Shepherd's data fields:
- Person: ${SHEPHERD_FIELDS.person.join(", ")}
- Group: ${SHEPHERD_FIELDS.group.join(", ")}
- Event: ${SHEPHERD_FIELDS.event.join(", ")}
- Attendance: ${SHEPHERD_FIELDS.attendance.join(", ")}

Shepherd's default categories:
- person_status: VISITOR, REGULAR, MEMBER, INACTIVE
- group_type: LIFE_GROUP, MINISTRY, CLASS, COMMITTEE, OTHER
- event_type: SUNDAY_SERVICE, SMALL_GROUP, SPECIAL_EVENT, CLASS, OTHER
- household_role: HEAD, SPOUSE, CHILD, MEMBER, OTHER
- group_member_role: LEADER, CO_LEADER, MEMBER

Analyze this file and respond with ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "detectedFormat": "people|groups|events|attendance|mixed|unknown",
  "confidence": 0.0 to 1.0,
  "columns": [
    {
      "sourceColumn": "exact column header from file",
      "targetField": "shepherdFieldName or null if no match",
      "confidence": 0.0 to 1.0,
      "detectedType": "text|email|phone|date|number|category|address|name|unknown"
    }
  ],
  "categories": [
    {
      "field": "person_status|group_type|event_type|household_role|group_member_role",
      "sourceValues": ["unique values found in the data"],
      "mappings": [
        {
          "sourceValue": "value from source data",
          "suggestedMapping": "SHEPHERD_INTERNAL_VALUE or NEW_CUSTOM_VALUE",
          "suggestedLabel": "Human-readable label"
        }
      ],
      "recommendation": "Brief explanation of why this mapping makes sense or if the church should keep their own terminology"
    }
  ],
  "recommendations": [
    "List of actionable recommendations for the import, e.g. 'This church uses Cell Groups instead of Life Groups - recommend keeping their terminology'"
  ]
}

Important:
- Map source columns to Shepherd fields by meaning, not by exact name match
- For category values that don't match Shepherd defaults, suggest keeping the church's own labels with a new internal value
- If the church uses richer categories than Shepherd defaults (e.g. "Active Member", "Associate Member", "Prospective"), recommend they keep their own and explain why
- Be specific about what each recommendation means for the church`;

  // If no API key is configured, fall back to heuristic analysis
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("ANTHROPIC_API_KEY not set — using heuristic file analysis");
    return fallbackAnalysis(headers, sampleRows, uniqueValues);
  }

  try {
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-5-20250929"),
      prompt,
      maxOutputTokens: 4000,
    });

    // Parse the JSON response, stripping any markdown fences
    const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const analysis = JSON.parse(jsonStr);

    // Add sample values from actual data
    const columns: ColumnAnalysis[] = (analysis.columns || []).map((col: ColumnAnalysis) => ({
      ...col,
      sampleValues: [...(uniqueValues[col.sourceColumn] || [])].slice(0, 5),
    }));

    return {
      columns,
      categories: analysis.categories || [],
      detectedFormat: analysis.detectedFormat || "unknown",
      totalRows: sampleRows.length,
      recommendations: analysis.recommendations || [],
      confidence: analysis.confidence || 0,
    };
  } catch (error) {
    console.error("AI analysis failed:", error);
    // Fallback: basic heuristic mapping
    return fallbackAnalysis(headers, sampleRows, uniqueValues);
  }
}

function fallbackAnalysis(
  headers: string[],
  sampleRows: string[][],
  uniqueValues: Record<string, Set<string>>,
): FileAnalysis {
  const namePatterns = /^(first\s*name|fname|given\s*name|first)$/i;
  const lastNamePatterns = /^(last\s*name|lname|surname|family\s*name|last)$/i;
  const emailPatterns = /^(email|e-mail|email\s*address)$/i;
  const phonePatterns = /^(phone|telephone|mobile|cell|home\s*phone)$/i;

  const columns: ColumnAnalysis[] = headers.map((h, i) => {
    let targetField: string | null = null;
    let detectedType: ColumnAnalysis["detectedType"] = "text";
    let confidence = 0.3;

    if (namePatterns.test(h)) { targetField = "firstName"; detectedType = "name"; confidence = 0.9; }
    else if (lastNamePatterns.test(h)) { targetField = "lastName"; detectedType = "name"; confidence = 0.9; }
    else if (emailPatterns.test(h)) { targetField = "email"; detectedType = "email"; confidence = 0.95; }
    else if (phonePatterns.test(h)) { targetField = "phone"; detectedType = "phone"; confidence = 0.9; }

    return {
      sourceColumn: h,
      targetField,
      confidence,
      sampleValues: [...(uniqueValues[h] || [])].slice(0, 5),
      detectedType,
    };
  });

  return {
    columns,
    categories: [],
    detectedFormat: "people",
    totalRows: sampleRows.length,
    recommendations: ["AI analysis was unavailable. Please review mappings carefully."],
    confidence: 0.3,
  };
}
