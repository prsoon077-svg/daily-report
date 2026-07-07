import { useEffect, useState } from "react";
import type { TeammateMetrics } from "../lib/csvParser";
import type { ManualFieldEntry } from "../lib/api";
import {
  fetchEventsForDate,
  getStoredClientId,
  getStoredToken,
  requestGoogleAccessToken,
  type CalendarEventSummary,
} from "../lib/googleCalendar";

interface Props {
  teammate: TeammateMetrics;
  date: string; // YYYY-MM-DD, for calendar + saved-field lookups
  manualFields: ManualFieldEntry | undefined;
  onSaveField: (field: "inprogressMeta" | "inprogressTech", value: string) => void;
  onOpenCalendarSetup: () => void;
}

function EditableCell({
  value,
  onSave,
}: {
  value: string;
  onSave: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onSave(draft);
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className="w-full bg-amber/5 border border-amber/40 rounded-sm px-2 py-1 text-sm font-mono outline-none focus:ring-1 focus:ring-amber"
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="w-full text-left px-2 py-1 rounded-sm text-sm font-mono hover:bg-amber/5 border border-transparent hover:border-amber/30"
      title="Click to edit"
    >
      {value || <span className="text-ink/30">— click to add —</span>}
    </button>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-t border-line">
      <td className="px-4 py-2.5 text-sm text-ink/60 w-1/2">{label}</td>
      <td className="px-4 py-2.5 text-sm font-mono">{children}</td>
    </tr>
  );
}

export default function ReportCard({
  teammate,
  date,
  manualFields,
  onSaveField,
  onOpenCalendarSetup,
}: Props) {
  const [events, setEvents] = useState<CalendarEventSummary[] | null>(null);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  const loadMeetings = async () => {
    setCalendarError(null);
    const clientId = getStoredClientId();
    if (!clientId) {
      onOpenCalendarSetup();
      return;
    }
    setLoadingCalendar(true);
    try {
      let token = getStoredToken();
      if (!token) {
        token = await requestGoogleAccessToken(clientId);
      }
      const items = await fetchEventsForDate(token, date);
      setEvents(items);
    } catch (err) {
      setCalendarError(err instanceof Error ? err.message : "Failed to load calendar events.");
    } finally {
      setLoadingCalendar(false);
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-line flex items-center justify-between">
        <h2 className="font-display text-xl">{teammate.teammate}</h2>
        <span className="label-eyebrow">{date}</span>
      </div>

      <table className="w-full">
        <tbody>
          <Row label="Conversations assigned">{teammate.conversationsAssigned ?? "—"}</Row>
          <Row label="Conversations replied to">{teammate.conversationsRepliedTo ?? "—"}</Row>
          <Row label="Closed conversations">{teammate.closedConversations ?? "—"}</Row>
          <Row label="Teammate CSAT score">{teammate.csatScore ?? "—"}</Row>
          <Row label="Median first response time (min)">
            {teammate.medianFirstResponseTime ?? "—"}
          </Row>
          <Row label="Median handling time (min)">{teammate.medianHandlingTime ?? "—"}</Row>

          <Row label="Inprogress Meta Dependent">
            <EditableCell
              value={manualFields?.inprogressMeta ?? ""}
              onSave={(v) => onSaveField("inprogressMeta", v)}
            />
          </Row>
          <Row label="Inprogress Tech Dependent">
            <EditableCell
              value={manualFields?.inprogressTech ?? ""}
              onSave={(v) => onSaveField("inprogressTech", v)}
            />
          </Row>

          <Row label="Open conversations">{teammate.openConversations ?? "—"}</Row>

          <tr className="border-t border-line">
            <td className="px-4 py-2.5 text-sm text-ink/60 align-top">Meeting aligned</td>
            <td className="px-4 py-2.5 text-sm">
              {events === null && (
                <button
                  onClick={loadMeetings}
                  disabled={loadingCalendar}
                  className="px-3 py-1.5 text-xs font-medium rounded-sm bg-ink text-paper hover:bg-ink/85 disabled:opacity-50"
                >
                  {loadingCalendar ? "Checking calendar…" : "Check Google Calendar"}
                </button>
              )}
              {calendarError && (
                <p className="text-xs text-red-700 mt-1">
                  {calendarError}{" "}
                  <button onClick={onOpenCalendarSetup} className="underline">
                    Set up access
                  </button>
                </p>
              )}
              {events !== null && events.length === 0 && (
                <p className="text-ink/50 font-mono text-sm">No meetings found for this date.</p>
              )}
              {events !== null && events.length > 0 && (
                <ul className="space-y-1">
                  {events.map((e) => (
                    <li key={e.id} className="font-mono text-sm">
                      {e.summary}
                    </li>
                  ))}
                </ul>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
