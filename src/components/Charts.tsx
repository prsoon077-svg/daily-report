import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TeammateMetrics } from "../lib/csvParser";

const COLORS = { assigned: "#1E7A6E", closed: "#C77D2E", open: "#171B21", replied: "#8A8578" };

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h3 className="label-eyebrow mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        {children as any}
      </ResponsiveContainer>
    </div>
  );
}

export function VolumeChart({ teammates }: { teammates: TeammateMetrics[] }) {
  const data = teammates.map((t) => ({
    name: t.teammate.split(" ")[0],
    Assigned: t.conversationsAssigned ?? 0,
    Closed: t.closedConversations ?? 0,
    Open: t.openConversations ?? 0,
  }));

  return (
    <ChartCard title="Conversations — assigned / closed / open">
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#DEDAD0" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: "IBM Plex Mono" }} />
        <YAxis tick={{ fontSize: 12, fontFamily: "IBM Plex Mono" }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Assigned" fill={COLORS.assigned} radius={[2, 2, 0, 0]} />
        <Bar dataKey="Closed" fill={COLORS.closed} radius={[2, 2, 0, 0]} />
        <Bar dataKey="Open" fill={COLORS.open} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ChartCard>
  );
}

export function PerActiveHourChart({ teammates }: { teammates: TeammateMetrics[] }) {
  const data = teammates.map((t) => ({
    name: t.teammate.split(" ")[0],
    "Assigned/hr": t.assignedPerActiveHour ?? 0,
    "Replied/hr": t.repliedPerActiveHour ?? 0,
    "Closed/hr": t.closedPerActiveHour ?? 0,
  }));

  return (
    <ChartCard title="Conversations per active hour">
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#DEDAD0" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: "IBM Plex Mono" }} />
        <YAxis tick={{ fontSize: 12, fontFamily: "IBM Plex Mono" }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Assigned/hr" fill={COLORS.assigned} radius={[2, 2, 0, 0]} />
        <Bar dataKey="Replied/hr" fill={COLORS.replied} radius={[2, 2, 0, 0]} />
        <Bar dataKey="Closed/hr" fill={COLORS.closed} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ChartCard>
  );
}

export function ResponseTimeChart({ teammates }: { teammates: TeammateMetrics[] }) {
  const data = teammates.map((t) => ({
    name: t.teammate.split(" ")[0],
    "FRT (min)": t.medianFirstResponseTime ?? 0,
    "Assign→Close (min)": t.medianAssignToClose ?? 0,
  }));

  return (
    <ChartCard title="Response times (minutes)">
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#DEDAD0" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: "IBM Plex Mono" }} />
        <YAxis tick={{ fontSize: 12, fontFamily: "IBM Plex Mono" }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="FRT (min)" fill={COLORS.assigned} radius={[2, 2, 0, 0]} />
        <Bar dataKey="Assign→Close (min)" fill={COLORS.closed} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ChartCard>
  );
}
