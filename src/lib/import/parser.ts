import Papa from "papaparse";
import ExcelJS from "exceljs";

export interface ParsedFile {
  headers: string[];
  rows: string[][];
  totalRows: number;
}

export async function parseCSV(buffer: Buffer, fileName: string): Promise<ParsedFile> {
  const text = buffer.toString("utf-8");
  const result = Papa.parse<string[]>(text, {
    header: false,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0 && result.data.length === 0) {
    throw new Error(`CSV parse error: ${result.errors[0].message}`);
  }

  const [headers, ...rows] = result.data;
  return {
    headers: headers.map((h) => h.trim()),
    rows,
    totalRows: rows.length,
  };
}

export async function parseExcel(buffer: Buffer, fileName: string): Promise<ParsedFile> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);

  const sheet = workbook.worksheets[0];
  if (!sheet || sheet.rowCount === 0) {
    throw new Error("Excel file has no data");
  }

  const headers: string[] = [];
  const rows: string[][] = [];

  sheet.eachRow((row, rowNumber) => {
    const values = row.values as (string | number | Date | null)[];
    // ExcelJS row.values is 1-indexed (index 0 is empty)
    const cells = values.slice(1).map((v) => {
      if (v === null || v === undefined) return "";
      if (v instanceof Date) return v.toISOString().split("T")[0];
      return String(v).trim();
    });

    if (rowNumber === 1) {
      headers.push(...cells);
    } else {
      rows.push(cells);
    }
  });

  return { headers, rows, totalRows: rows.length };
}

export async function parseFile(buffer: Buffer, fileName: string): Promise<ParsedFile> {
  const ext = fileName.toLowerCase().split(".").pop();

  if (ext === "csv" || ext === "tsv" || ext === "txt") {
    return parseCSV(buffer, fileName);
  }

  if (ext === "xlsx" || ext === "xls") {
    return parseExcel(buffer, fileName);
  }

  throw new Error(`Unsupported file format: .${ext}. Please upload a CSV or Excel file.`);
}
