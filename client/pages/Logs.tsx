import { useEffect, useState } from "react";

export default function Logs() {
  const [logs, setLogs] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadLogs = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/logs");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to load logs.");
      } else {
        setLogs(data.logs || "");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(`Unable to load logs: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLogs();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Application Logs</h1>
          <p className="text-slate-600 mt-2">
            All server-side logs are written to <code>logs/app.log</code>.
          </p>
        </div>

        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            onClick={loadLogs}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh logs"}
          </button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <pre className="whitespace-pre-wrap break-words text-sm text-slate-800">
            {logs || "No logs available yet."}
          </pre>
        </div>
      </div>
    </div>
  );
}
