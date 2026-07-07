import type { TeammateMetrics } from "../lib/csvParser";

interface Props {
  teammates: TeammateMetrics[];
  selected: string | null;
  onSelect: (name: string) => void;
}

export default function TeammateTable({ teammates, selected, onSelect }: Props) {
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-line">
        <h2 className="font-display text-xl">All teammates</h2>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left label-eyebrow">
            <th className="px-5 py-3 font-normal">Teammate</th>
            <th className="px-5 py-3 font-normal text-right">Assigned</th>
            <th className="px-5 py-3 font-normal text-right">Closed</th>
            <th className="px-5 py-3 font-normal text-right">Open</th>
          </tr>
        </thead>
        <tbody>
          {teammates.map((t) => (
            <tr
              key={t.teammate}
              onClick={() => onSelect(t.teammate)}
              className={`cursor-pointer border-t border-line transition-colors hover:bg-signal/5 ${
                selected === t.teammate ? "bg-signal/10" : ""
              }`}
            >
              <td className="px-5 py-3 font-medium">{t.teammate}</td>
              <td className="px-5 py-3 text-right font-mono tabular-nums">
                {t.conversationsAssigned ?? "—"}
              </td>
              <td className="px-5 py-3 text-right font-mono tabular-nums">
                {t.closedConversations ?? "—"}
              </td>
              <td className="px-5 py-3 text-right font-mono tabular-nums">
                {t.openConversations ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
