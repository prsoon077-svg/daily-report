import type { TeammateMetrics } from "../lib/csvParser";

interface Props {
  teammates: TeammateMetrics[];
  dateFrom: string;
  dateTo: string;
}

const COLUMNS: { key: keyof TeammateMetrics; label: string }[] = [
  { key: "teammate", label: "Teammate" },
  { key: "conversationsAssigned", label: "Assigned" },
  { key: "conversationsRepliedTo", label: "Replied to" },
  { key: "repliesSent", label: "Replies sent" },
  { key: "closedConversations", label: "Closed" },
  { key: "csatScore", label: "CSAT" },
  { key: "slaMissRate", label: "SLA miss rate" },
  { key: "medianFirstResponseTime", label: "Median FRT" },
  { key: "medianAssignToFirstResponse", label: "Assign→1st resp" },
  { key: "medianAssignToSubsequentResponse", label: "Assign→subseq resp" },
  { key: "medianAssignToClose", label: "Assign→close" },
  { key: "medianHandlingTime", label: "Handling time" },
  { key: "notesCreated", label: "Notes" },
  { key: "mentions", label: "Mentions" },
  { key: "assignedPerActiveHour", label: "Assigned/hr" },
  { key: "repliedPerActiveHour", label: "Replied/hr" },
  { key: "closedPerActiveHour", label: "Closed/hr" },
  { key: "avgTimeInProgress", label: "Time in progress" },
  { key: "avgTimeWaitingOnCustomer", label: "Waiting on customer" },
  { key: "openConversations", label: "Open" },
];

function toCsv(teammates: TeammateMetrics[]): string {
  const header = COLUMNS.map((c) => c.label).join(",");
  const rows = teammates.map((t) =>
    COLUMNS.map((c) => {
      const v = t[c.key];
      return v === null || v === undefined ? "" : String(v);
    }).join(",")
  );
  return [header, ...rows].join("\n");
}

export default function FullDataTable({ teammates, dateFrom, dateTo }: Props) {
  const handleExport = () => {
    const csv = toCsv(teammates);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `teammate-report_${dateFrom}_${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-line flex items-center justify-between">
        <h2 className="font-display text-xl">Full data</h2>
        <button
          onClick={handleExport}
          className="px-3 py-1.5 text-xs font-medium rounded-sm border border-line hover:bg-ink/5"
        >
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="text-left label-eyebrow">
              {COLUMNS.map((c) => (
                <th key={c.key} className="px-4 py-3 font-normal">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teammates.map((t) => (
              <tr key={t.teammate} className="border-t border-line">
                {COLUMNS.map((c) => (
                  <td
                    key={c.key}
                    className={`px-4 py-2.5 font-mono ${c.key === "teammate" ? "font-medium" : "tabular-nums"}`}
                  >
                    {t[c.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
