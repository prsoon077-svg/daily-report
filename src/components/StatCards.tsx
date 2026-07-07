import type { ParsedReport } from "../lib/csvParser";

interface Props {
  report: ParsedReport;
}

export default function StatCards({ report }: Props) {
  const stats = [
    { label: "Total teammates", value: report.teammates.length },
    { label: "Conversations assigned", value: report.summary.conversationsAssigned },
    { label: "Closed", value: report.summary.closedConversations },
    { label: "Open", value: report.summary.openConversations },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="card p-5">
          <p className="label-eyebrow mb-2">{s.label}</p>
          <p className="stat-number">{s.value ?? "—"}</p>
        </div>
      ))}
    </div>
  );
}
