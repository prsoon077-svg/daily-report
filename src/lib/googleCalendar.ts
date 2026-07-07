// Thin wrapper around Google Identity Services (GIS) for a one-time,
// client-side-only OAuth flow. The Client ID and resulting access token are
// session/auth state (not report data), so they intentionally stay in
// localStorage rather than the D1 backend.

const CLIENT_ID_KEY = "drt_google_client_id";
const TOKEN_KEY = "drt_google_access_token";
const TOKEN_EXPIRY_KEY = "drt_google_token_expiry";

const SCOPE = "https://www.googleapis.com/auth/calendar.readonly";

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (resp: { access_token?: string; error?: string; expires_in?: number }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

export function getStoredClientId(): string {
  return localStorage.getItem(CLIENT_ID_KEY) ?? "";
}

export function setStoredClientId(clientId: string) {
  localStorage.setItem(CLIENT_ID_KEY, clientId.trim());
}

export function getStoredToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = Number(localStorage.getItem(TOKEN_EXPIRY_KEY) ?? 0);
  if (!token || Date.now() > expiry) return null;
  return token;
}

export function requestGoogleAccessToken(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject(new Error("Google Identity Services script hasn't loaded yet. Try again in a moment."));
      return;
    }
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: (resp) => {
        if (resp.error || !resp.access_token) {
          reject(new Error(resp.error ?? "Google sign-in was cancelled or failed."));
          return;
        }
        localStorage.setItem(TOKEN_KEY, resp.access_token);
        localStorage.setItem(
          TOKEN_EXPIRY_KEY,
          String(Date.now() + (resp.expires_in ?? 3500) * 1000)
        );
        resolve(resp.access_token);
      },
    });
    client.requestAccessToken();
  });
}

export interface CalendarEventSummary {
  id: string;
  summary: string;
  start: string;
  end: string;
}

// Fetches events on the primary calendar for a single date (YYYY-MM-DD).
export async function fetchEventsForDate(
  token: string,
  date: string
): Promise<CalendarEventSummary[]> {
  const timeMin = `${date}T00:00:00Z`;
  const timeMax = `${date}T23:59:59Z`;
  const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  url.searchParams.set("timeMin", timeMin);
  url.searchParams.set("timeMax", timeMax);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
    }
    throw new Error(`Google Calendar request failed (${res.status})`);
  }

  const data = await res.json();
  return (data.items ?? []).map((item: any) => ({
    id: item.id,
    summary: item.summary ?? "(No title)",
    start: item.start?.dateTime ?? item.start?.date ?? "",
    end: item.end?.dateTime ?? item.end?.date ?? "",
  }));
}
