import { useState, useEffect } from "react";
import AppLayout from "@/components/app-layout";
import DashboardCard from "@/components/dashboard-card";
import { CheckCircle2, Clock, AlertCircle, FileText, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { apiCall } from "@/lib/api";

interface DailyLog {
  id: string;
  date: string;
  sod_content: string;
  eod_content: string;
  // UI helper fields
  tasksPlanned?: number;
  tasksCompleted?: number;
  completionRate?: number;
}

export default function DailyLogs() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await apiCall("/api/operations/daily-logs/");
      if (!response.ok) throw new Error("Failed to fetch logs");
      const data = await response.json();
      
      // Process logs to extract stats
      const processed = Array.isArray(data) ? data.map((log: any) => {
        let tasksPlanned = 0;
        let tasksCompleted = 0;
        
        try {
          if (log.sod_content) {
            if (log.sod_content.trim().startsWith('{') || log.sod_content.trim().startsWith('[')) {
              const sod = JSON.parse(log.sod_content);
              tasksPlanned = sod.tasks?.length || 0;
            } else {
              const tasksMatch = log.sod_content.match(/Tasks:\n([\s\S]*)/);
              if (tasksMatch) {
                tasksPlanned = tasksMatch[1].split('\n').filter((l: string) => l.trim().startsWith('-')).length;
              }
            }
          }
          if (log.eod_content) {
            if (log.eod_content.trim().startsWith('{') || log.eod_content.trim().startsWith('[')) {
              const eod = JSON.parse(log.eod_content);
              tasksCompleted = eod.completedTasks?.length || 0;
            } else {
              const completedMatch = log.eod_content.match(/Completed:\n([\s\S]*?)(?:\n\n|$)/);
              if (completedMatch) {
                tasksCompleted = completedMatch[1].split('\n').filter((l: string) => l.trim().startsWith('-')).length;
              }
            }
          }
        } catch (e) {}

        return {
          ...log,
          tasksPlanned,
          tasksCompleted,
          completionRate: tasksPlanned > 0 ? Math.round((tasksCompleted / tasksPlanned) * 100) : 0
        };
      }) : [];

      setLogs(processed);
    } catch (err) {
      toast.error("Could not load daily logs");
    } finally {
      setLoading(false);
    }
  };

  const today = Array.isArray(logs) ? logs.find(l => l.date === new Date().toISOString().split("T")[0]) : null;
  const todayStats = today || {
    tasksPlanned: 0,
    tasksCompleted: 0,
    completionRate: 0,
    sod_content: "",
    eod_content: ""
  };
  
  const averageCompletion = (Array.isArray(logs) && logs.length > 0)
    ? Math.round(logs.reduce((sum, log) => sum + (log.completionRate || 0), 0) / logs.length)
    : 0;

  const sodSubmittedCount = Array.isArray(logs) ? logs.filter((log) => log.sod_content).length : 0;
  const eodSubmittedCount = Array.isArray(logs) ? logs.filter((log) => log.eod_content).length : 0;

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Daily Logs</h1>
          <p className="text-gray-600 mt-2">Track your daily progress and learnings</p>
        </div>

        {/* Today Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <DashboardCard
            title="Tasks Planned"
            value={todayStats.tasksPlanned}
            description="for today"
            icon={<FileText size={24} />}
          />
          <DashboardCard
            title="Tasks Completed"
            value={todayStats.tasksCompleted}
            description={`${todayStats.completionRate}% completion`}
            icon={<CheckCircle2 size={24} />}
          />
          <DashboardCard
            title="SOD Status"
            value={todayStats.sod_content ? "DONE" : "PENDING"}
            description={todayStats.sod_content ? "Submitted" : "Not yet"}
            icon={<Clock size={24} />}
          />
          <DashboardCard
            title="EOD Status"
            value={todayStats.eod_content ? "DONE" : "PENDING"}
            description={todayStats.eod_content ? "Submitted" : "Not yet"}
            icon={<Clock size={24} />}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link
            to="/sod"
            className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Start Your Day</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {todayStats.sod_content
                    ? "Already submitted today"
                    : "Plan your tasks for today"}
                </p>
              </div>
              <span className="text-2xl">{todayStats.sod_content ? "✓" : "→"}</span>
            </div>
          </Link>

          <Link
            to="/eod"
            className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">End Your Day</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {todayStats.eod_content
                    ? "Already submitted today"
                    : "Review your progress"}
                </p>
              </div>
              <span className="text-2xl">{todayStats.eod_content ? "✓" : "→"}</span>
            </div>
          </Link>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Completion Rate</p>
              <p className="text-3xl font-bold text-green-600">{averageCompletion}%</p>
              <p className="text-xs text-gray-500 mt-2">Last {logs.length} days</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">SOD Submissions</p>
              <p className="text-3xl font-bold text-blue-600">{sodSubmittedCount}</p>
              <p className="text-xs text-gray-500 mt-2">of {logs.length} days</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">EOD Submissions</p>
              <p className="text-3xl font-bold text-blue-600">{eodSubmittedCount}</p>
              <p className="text-xs text-gray-500 mt-2">of {logs.length} days</p>
            </div>
          </div>
        </div>

        {/* Recent Logs Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Daily Logs</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Tasks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Completion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    SOD
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    EOD
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {new Date(log.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.tasksCompleted}/{log.tasksPlanned}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${log.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-10">
                          {log.completionRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {log.sod_content ? "YES" : "NO"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {log.eod_content ? "YES" : "NO"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
