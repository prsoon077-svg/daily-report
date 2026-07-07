// Manual fields (Inprogress Meta/Tech) persisted to localStorage, keyed by
// teammate + date. Pure client-side -- no backend/database required.

export interface ManualFieldEntry {
  inprogressMeta: string;
  inprogressTech: string;
  updatedAt: string;
}

export type ManualFieldsByTeammate = Record<string, ManualFieldEntry>;

const storageKey = (date: string) => `drt_manual_fields_${date}`;

export async function fetchManualFields(date: string): Promise<ManualFieldsByTeammate> {
  const raw = localStorage.getItem(storageKey(date));
  return raw ? JSON.parse(raw) : {};
}

export async function saveManualField(
  teammate: string,
  date: string,
  field: "inprogressMeta" | "inprogressTech",
  value: string
): Promise<void> {
  const key = storageKey(date);
  const existing: ManualFieldsByTeammate = JSON.parse(localStorage.getItem(key) ?? "{}");
  const current = existing[teammate] ?? { inprogressMeta: "", inprogressTech: "", updatedAt: "" };
  existing[teammate] = {
    ...current,
    [field]: value,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(key, JSON.stringify(existing));
}
