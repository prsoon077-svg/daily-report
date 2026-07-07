import { useState } from "react";
import { getStoredClientId, setStoredClientId } from "../lib/googleCalendar";

interface Props {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  "Go to console.cloud.google.com and create a new project (or pick an existing one).",
  "Open 'APIs & Services' → 'Library', search for 'Google Calendar API', and enable it.",
  "Go to 'APIs & Services' → 'OAuth consent screen'. Choose 'External', fill in the required fields, and add your own email as a test user.",
  "Go to 'Credentials' → 'Create credentials' → 'OAuth client ID'.",
  "Choose 'Web application' as the application type.",
  "Under 'Authorized JavaScript origins', add the exact URL this app is running on (e.g. https://your-project.pages.dev).",
  "Click Create — copy the Client ID it shows you and paste it below.",
];

export default function GoogleCalendarSetup({ open, onClose }: Props) {
  const [clientId, setClientId] = useState(getStoredClientId());

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-50">
      <div className="card max-w-lg w-full max-h-[85vh] overflow-y-auto">
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <h2 className="font-display text-xl">Connect Google Calendar</h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink text-sm">
            Close
          </button>
        </div>
        <div className="p-5">
          <p className="text-sm text-ink/60 mb-4">
            "Meeting aligned" checks a teammate's Google Calendar for the report date. This is a
            one-time setup, done once per person using the app — your Client ID stays in this
            browser only.
          </p>
          <ol className="space-y-2.5 text-sm list-decimal list-inside">
            {STEPS.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>

          <label className="block mt-5">
            <span className="label-eyebrow">Google OAuth Client ID</span>
            <input
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="xxxxxxxx-xxxxxxxxxxxxxxx.apps.googleusercontent.com"
              className="mt-1.5 w-full border border-line rounded-sm px-3 py-2 text-sm font-mono outline-none focus:ring-1 focus:ring-signal"
            />
          </label>

          <div className="mt-4 flex justify-end gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-sm hover:bg-ink/5">
              Cancel
            </button>
            <button
              onClick={() => {
                setStoredClientId(clientId);
                onClose();
              }}
              className="px-3 py-1.5 text-sm rounded-sm bg-ink text-paper hover:bg-ink/85"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
