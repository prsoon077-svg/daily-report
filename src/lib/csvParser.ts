// Parses Intercom's "Comparison of Teammate performance" CSV export.
//
// Structure (confirmed against a real export):
//   Row 1: title                         "Comparison of Teammate performance"
//   Row 2: blank
//   Row 3: meta header row                Metric,View by,Segment by,Export date,Time Zone,Time period from,Time period to
//   Row 4: meta values row                <the actual values, including dateFrom/dateTo>
//   Row 5: blank
//   Row 6: column header row              Teammate,Conversations assigned,...
//   Row 7: "Summary" row                  aggregate totals
//   Row 8+: one row per teammate

export const EXCLUDED_TEAMMATES = ["Preeti Adhikari", "Paritosh Verma"];

export interface TeammateMetrics {
  teammate: string;
  conversationsAssigned: number | null;
  conversationsRepliedTo: number | null;
  repliesSent: number | null;
  closedConversations: number | null;
  csatScore: number | null;
  slaMissRate: number | null;
  medianFirstResponseTime: number | null; // minutes
  medianAssignToFirstResponse: number | null; // minutes
  medianAssignToSubsequentResponse: number | null; // minutes
  medianAssignToClose: number | null; // minutes
  medianHandlingTime: number | null; // minutes
  notesCreated: number | null;
  mentions: number | null;
  assignedPerActiveHour: number | null;
  repliedPerActiveHour: number | null;
  closedPerActiveHour: number | null;
  avgTimeInProgress: number | null;
  avgTimeWaitingOnCustomer: number | null;
  openConversations: number | null;
}

export interface ParsedReport {
  dateFrom: string; // 'YYYY-MM-DD'
  dateTo: string; // 'YYYY-MM-DD'
  exportDate: string;
  timeZone: string;
  summary: TeammateMetrics;
  teammates: TeammateMetrics[]; // active teammates, excluded list already removed
  allRows: TeammateMetrics[]; // every row including excluded, for completeness/export
}

// Minimal RFC4180-ish CSV line parser: handles quoted fields and commas inside quotes.
function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}

function toNumberOrNull(raw: string | undefined): number | null {
  if (raw === undefined) return null;
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed === "-") return null;
  const num = Number(trimmed);
  return Number.isNaN(num) ? null : num;
}

function rowToMetrics(cells: string[]): TeammateMetrics {
  return {
    teammate: cells[0]?.trim() ?? "",
    conversationsAssigned: toNumberOrNull(cells[1]),
    conversationsRepliedTo: toNumberOrNull(cells[2]),
    repliesSent: toNumberOrNull(cells[3]),
    closedConversations: toNumberOrNull(cells[4]),
    csatScore: toNumberOrNull(cells[5]),
    slaMissRate: toNumberOrNull(cells[6]),
    medianFirstResponseTime: toNumberOrNull(cells[7]),
    medianAssignToFirstResponse: toNumberOrNull(cells[8]),
    medianAssignToSubsequentResponse: toNumberOrNull(cells[9]),
    medianAssignToClose: toNumberOrNull(cells[10]),
    medianHandlingTime: toNumberOrNull(cells[11]),
    notesCreated: toNumberOrNull(cells[12]),
    mentions: toNumberOrNull(cells[13]),
    assignedPerActiveHour: toNumberOrNull(cells[14]),
    repliedPerActiveHour: toNumberOrNull(cells[15]),
    closedPerActiveHour: toNumberOrNull(cells[16]),
    avgTimeInProgress: toNumberOrNull(cells[17]),
    avgTimeWaitingOnCustomer: toNumberOrNull(cells[18]),
    openConversations: toNumberOrNull(cells[19]),
  };
}

export class CsvParseError extends Error {}

export function parseIntercomCsv(raw: string): ParsedReport {
  // Normalize line endings and drop fully-empty trailing lines.
  const lines = raw.replace(/\r\n/g, "\n").split("\n");

  if (lines.length < 8) {
    throw new CsvParseError(
      "This file doesn't look like an Intercom teammate comparison export (too few rows)."
    );
  }

  const metaHeaderCells = parseCsvLine(lines[2] ?? "").map((c) => c.trim());
  const metaValueCells = parseCsvLine(lines[3] ?? "");

  const metaIndex = (label: string) => metaHeaderCells.findIndex((h) => h === label);

  const exportDateIdx = metaIndex("Export date");
  const timeZoneIdx = metaIndex("Time Zone");
  const fromIdx = metaIndex("Time period from");
  const toIdx = metaIndex("Time period to");

  if (fromIdx === -1 || toIdx === -1) {
    throw new CsvParseError(
      "Couldn't find 'Time period from' / 'Time period to' in the meta row — is this the right export type?"
    );
  }

  const rawFrom = (metaValueCells[fromIdx] ?? "").trim(); // e.g. "2026-07-07 00:00"
  const rawTo = (metaValueCells[toIdx] ?? "").trim();
  const dateFrom = rawFrom.split(" ")[0] ?? rawFrom;
  const dateTo = rawTo.split(" ")[0] ?? rawTo;

  const dataLines = lines.slice(6).filter((l) => l.trim() !== "");
  if (dataLines.length === 0) {
    throw new CsvParseError("No teammate data rows found after the header.");
  }

  const allRows = dataLines.map((line) => rowToMetrics(parseCsvLine(line)));

  const summary = allRows.find((r) => r.teammate.toLowerCase() === "summary");
  if (!summary) {
    throw new CsvParseError("No 'Summary' row found in the export.");
  }

  const teammates = allRows.filter(
    (r) => r.teammate.toLowerCase() !== "summary" && !EXCLUDED_TEAMMATES.includes(r.teammate)
  );

  return {
    dateFrom,
    dateTo,
    exportDate: (metaValueCells[exportDateIdx] ?? "").trim(),
    timeZone: (metaValueCells[timeZoneIdx] ?? "").trim(),
    summary,
    teammates,
    allRows: allRows.filter((r) => r.teammate.toLowerCase() !== "summary"),
  };
}
