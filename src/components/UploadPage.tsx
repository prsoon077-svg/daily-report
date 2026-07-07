import { useCallback, useRef, useState } from "react";

interface Props {
  onFile: (text: string, filename: string) => void;
  error: string | null;
}

export default function UploadPage({ onFile, error }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        onFile("", file.name); // let parent surface a type error via error state
        return;
      }
      const reader = new FileReader();
      reader.onload = () => onFile(String(reader.result ?? ""), file.name);
      reader.readAsText(file);
    },
    [onFile]
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <p className="label-eyebrow mb-3">Daily Report Tracker</p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            Upload today's teammate report
          </h1>
          <p className="mt-3 text-ink/60 max-w-lg mx-auto">
            Drop in Intercom's "Comparison of Teammate performance" CSV export to build the
            dashboard for that date range.
          </p>
        </div>

        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          className={`block cursor-pointer rounded-sm border-2 border-dashed p-12 text-center transition-colors ${
            isDragging ? "border-signal bg-signal/5" : "border-line bg-white hover:border-ink/30"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <div className="font-mono text-sm text-ink/50 mb-2">.CSV</div>
          <p className="font-medium">Drag & drop your export here, or click to browse</p>
          <p className="text-sm text-ink/50 mt-1">Only .csv files are accepted</p>
        </label>

        {error && (
          <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-4 py-3">
            {error}
          </p>
        )}

        <details className="mt-8 text-sm text-ink/70">
          <summary className="cursor-pointer font-medium text-ink/80">
            How to export this from Intercom
          </summary>
          <ol className="mt-3 space-y-1.5 list-decimal list-inside">
            <li>In Intercom, go to Reports → Teammates.</li>
            <li>Set the date range you want to report on.</li>
            <li>Choose "Comparison of Teammate performance" as the metric view.</li>
            <li>Click Export → Export as CSV.</li>
            <li>Upload the downloaded file here.</li>
          </ol>
        </details>
      </div>
    </div>
  );
}
