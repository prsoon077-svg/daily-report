import { useEffect, useState } from "react";
import { CsvParseError, parseIntercomCsv, type ParsedReport } from "../lib/csvParser";
import { fetchManualFields, saveManualField, type ManualFieldsByTeammate } from "../lib/api";
import UploadPage from "../components/UploadPage";
import StatCards from "../components/StatCards";
import TeammateTable from "../components/TeammateTable";
import ReportCard from "../components/ReportCard";
import FullDataTable from "../components/FullDataTable";
import GoogleCalendarSetup from "../components/GoogleCalendarSetup";
import { VolumeChart, PerActiveHourChart, ResponseTimeChart } from "../components/Charts";

export default function Dashboard() {
  const [report, setReport] = useState<ParsedReport | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedTeammate, setSelectedTeammate] = useState<string | null>(null);
  const [manualFields, setManualFields] = useState<ManualFieldsByTeammate>({});
  const [calendarSetupOpen, setCalendarSetupOpen] = useState(false);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [fieldsError, setFieldsError] = useState<string | null>(null);

  useEffect(() => {
    if (!report) return;
    setFieldsLoading(true);
    setFieldsError(null);
    fetchManualFields(report.dateFrom)
      .then(setManualFields)
      .catch((err) => setFieldsError(err instanceof Error ? err.message : "Failed to load saved fields."))
      .finally(() => setFieldsLoading(false));
  }, [report?.dateFrom]);

  const handleFile = (text: string, filename: string) => {
    if (!text) {
      setUploadError(`"${filename}" isn't a .csv file. Please upload the Intercom export.`);
      return;
    }
    try {
      const parsed = parseIntercomCsv(text);
      setReport(parsed);
      setUploadError(null);
      setSelectedTeammate(parsed.teammates[0]?.teammate ?? null);
    } catch (err) {
      setUploadError(
        err instanceof CsvParseError
          ? err.message
          : "Couldn't parse this file. Make sure it's an unmodified Intercom teammate comparison export."
      );
    }
  };

  const handleSaveField = async (field: "inprogressMeta" | "inprogressTech", value: string) => {
    if (!report || !selectedTeammate) return;
    // Optimistic update
    setManualFields((prev) => ({
      ...prev,
      [selectedTeammate]: {
        inprogressMeta: field === "inprogressMeta" ? value : prev[selectedTeammate]?.inprogressMeta ?? "",
        inprogressTech: field === "inprogressTech" ? value : prev[selectedTeammate]?.inprogressTech ?? "",
        updatedAt: new Date().toISOString(),
      },
    }));
    try {
      await saveManualField(selectedTeammate, report.dateFrom, field, value);
    } catch (err) {
      setFieldsError(err instanceof Error ? err.message : "Failed to save — try again.");
    }
  };

  if (!report) {
    return <UploadPage onFile={handleFile} error={uploadError} />;
  }

  const selected = report.teammates.find((t) => t.teammate === selectedTeammate) ?? report.teammates[0];

  return (
    <div className="min-h-screen pb-16">
      <header className="border-b border-line bg-white">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="label-eyebrow">Daily Report Tracker</p>
            <h1 className="font-display text-2xl">
              {report.dateFrom === report.dateTo ? report.dateFrom : `${report.dateFrom} → ${report.dateTo}`}
            </h1>
          </div>
          <button
            onClick={() => {
              setReport(null);
              setUploadError(null);
            }}
            className="px-3 py-1.5 text-sm rounded-sm border border-line hover:bg-ink/5"
          >
            Upload a different report
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-8 space-y-8">
        <StatCards report={report} />

        {fieldsError && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-4 py-3">
            {fieldsError}
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <TeammateTable
            teammates={report.teammates}
            selected={selected?.teammate ?? null}
            onSelect={setSelectedTeammate}
          />

          {selected && (
            <div>
              <label className="block mb-3">
                <span className="label-eyebrow">Individual report</span>
                <select
                  value={selected.teammate}
                  onChange={(e) => setSelectedTeammate(e.target.value)}
                  className="mt-1.5 w-full border border-line rounded-sm px-3 py-2 text-sm bg-white outline-none focus:ring-1 focus:ring-signal"
                >
                  {report.teammates.map((t) => (
                    <option key={t.teammate} value={t.teammate}>
                      {t.teammate}
                    </option>
                  ))}
                </select>
              </label>
              <ReportCard
                teammate={selected}
                date={report.dateFrom}
                manualFields={fieldsLoading ? undefined : manualFields[selected.teammate]}
                onSaveField={handleSaveField}
                onOpenCalendarSetup={() => setCalendarSetupOpen(true)}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <VolumeChart teammates={report.teammates} />
          <PerActiveHourChart teammates={report.teammates} />
          <ResponseTimeChart teammates={report.teammates} />
        </div>

        <FullDataTable teammates={report.allRows} dateFrom={report.dateFrom} dateTo={report.dateTo} />
      </main>

      <GoogleCalendarSetup open={calendarSetupOpen} onClose={() => setCalendarSetupOpen(false)} />
    </div>
  );
}
