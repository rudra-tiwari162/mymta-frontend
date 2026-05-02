import { useState, useEffect } from "react";
import AppLayout from "@/components/app-layout";
import { CheckCircle2, AlertCircle, Save, Clock, Loader } from "lucide-react";
import { toast } from "sonner";

interface PlannedTask {
  id: string;
  title: string;
  priority: "Low" | "Medium" | "High";
  estimatedTime: number;
  completed: boolean;
}

export default function EndOfDay() {
  const today = new Date().toISOString().split("T")[0];

  const [plannedTasks, setPlannedTasks] = useState<PlannedTask[]>([]);
  const [blockers, setBlockers] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [logId, setLogId] = useState<string | null>(null);

  useEffect(() => {
    fetchTodaySOD();
  }, []);

  const fetchTodaySOD = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/operations/daily-logs/", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const logs = await response.json();
      const todayLog = logs.find((l: any) => l.date === today);
      
      if (todayLog) {
        setLogId(todayLog.id);
        if (todayLog.sod_content) {
          try {
            const sodData = JSON.parse(todayLog.sod_content);
            if (sodData.tasks) {
              setPlannedTasks(sodData.tasks.map((t: any) => ({ ...t, completed: false })));
            }
          } catch (e) {
            console.error("Failed to parse SOD content", e);
          }
        }
      }
    } catch (err) {
      toast.error("Could not load today's tasks");
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = (id: string) => {
    setPlannedTasks(
      plannedTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const completedCount = plannedTasks.filter((t) => t.completed).length;
  const completionRate = Math.round(
    (completedCount / plannedTasks.length) * 100
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      const eodData = {
        completedTasks: plannedTasks.filter((t) => t.completed).map((t) => t.title),
        pendingTasks: plannedTasks.filter((t) => !t.completed).map((t) => t.title),
        blockers,
        notes,
      };

      if (!logId) {
        throw new Error("No SOD record found for today. Please submit SOD first.");
      }

      const response = await fetch(`/api/operations/daily-logs/${logId}/`, {
        method: "PATCH",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ eod_content: JSON.stringify(eodData) })
      });

      if (!response.ok) throw new Error("Failed to save EOD");

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save EOD. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">End of Day</h1>
          <p className="text-gray-600 mt-2">Review your day's progress</p>
          <p className="text-sm text-gray-500 mt-1">Date: {today}</p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-medium">
              ✓ Your EOD has been saved successfully!
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Completion Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Today's Progress
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {/* Total Tasks */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {plannedTasks.length}
                </p>
              </div>

              {/* Completed */}
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700 mb-1">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {completedCount}
                </p>
              </div>

              {/* Completion Rate */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 mb-1">Completion Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {completionRate}%
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>

          {/* Task Completion */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Task Completion
            </h2>

            <div className="space-y-3">
              {plannedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleTaskCompletion(task.id)}
                    disabled={loading}
                    className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      task.completed
                        ? "bg-green-600 border-green-600"
                        : "border-gray-300 hover:border-green-600"
                    } disabled:opacity-50`}
                  >
                    {task.completed && (
                      <CheckCircle2 size={18} className="text-white" />
                    )}
                  </button>

                  {/* Task Info */}
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        task.completed
                          ? "text-gray-500 line-through"
                          : "text-gray-900"
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          task.priority === "High"
                            ? "bg-red-100 text-red-700"
                            : task.priority === "Medium"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={12} />
                        {task.estimatedTime} min
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    {task.completed ? (
                      <span className="text-green-600 font-medium">✓</span>
                    ) : (
                      <span className="text-gray-400">○</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {completedCount < plannedTasks.length && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠ You have{" "}
                  <strong>{plannedTasks.length - completedCount} pending task(s)</strong> that will be
                  carried forward.
                </p>
              </div>
            )}
          </div>

          {/* Blockers */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Blockers
            </h2>
            <textarea
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              placeholder="What blocked you today? (e.g., Waiting for feedback, System issues, Dependency delays...)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
              rows={4}
              disabled={saving}
            />
          </div>

          {/* Learnings / Notes */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Learnings & Notes
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you learn today? Any notes for tomorrow? (e.g., Process improvements, insights, reminders...)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
              rows={4}
              disabled={saving}
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              💡 <strong>Tip:</strong> Use this section to capture what went well and what could be
              improved. This helps you build better habits and learn from your daily work.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving || loading}
            className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
            {saving ? "Saving..." : "Save End of Day"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
