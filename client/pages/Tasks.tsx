import { useState, useEffect } from "react";
import AppLayout from "@/components/app-layout";
import { ArrowLeft, CheckCircle2, AlertCircle, Clock, Loader, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { apiCall } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface TaskItem {
  id: string;
  employee: string;
  type: "completed" | "pending" | "blocker";
  task: string;
  date: string;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTasksFromLogs();
  }, []);

  const fetchTasksFromLogs = async () => {
    setLoading(true);
    try {
      const response = await apiCall("/api/operations/daily-logs/");
      if (!response.ok) throw new Error("Failed to fetch logs");
      const data = await response.json();

      if (Array.isArray(data)) {
        const extractedTasks: TaskItem[] = [];

        data.forEach((log: any) => {
          if (!log.eod_content) return;

          const employeeName = log.employee_name || "Unknown";
          const date = new Date(log.date).toLocaleDateString();

          // Helper to extract lines starting with '-'
          const extractLines = (content: string, type: "completed" | "pending" | "blocker") => {
            const lines = content.split("\n").filter(line => line.trim().startsWith("-"));
            lines.forEach((line, idx) => {
              extractedTasks.push({
                id: `${log.id}-${type}-${idx}`,
                employee: employeeName,
                type,
                task: line.replace(/^- /, "").trim(),
                date
              });
            });
          };

          if (log.eod_content.trim().startsWith("{") || log.eod_content.trim().startsWith("[")) {
            try {
              const eod = JSON.parse(log.eod_content);
              if (Array.isArray(eod.completedTasks)) {
                eod.completedTasks.forEach((t: string, idx: number) => {
                  extractedTasks.push({
                    id: `${log.id}-comp-${idx}`,
                    employee: employeeName,
                    type: "completed",
                    task: t,
                    date
                  });
                });
              }
              // Handle other JSON fields if any...
            } catch (e) {}
          } else {
            // Text parsing
            const completedMatch = log.eod_content.match(/Completed:\n([\s\S]*?)(?:\n\n|Notes:|$)/);
            if (completedMatch) extractLines(completedMatch[1], "completed");

            const blockersMatch = log.eod_content.match(/Blockers:\n([\s\S]*?)(?:\n\n|Pending Tasks:|$)/);
            if (blockersMatch) extractLines(blockersMatch[1], "blocker");

            const pendingMatch = log.eod_content.match(/Pending Tasks:\n([\s\S]*?)(?:\n\n|$)/);
            if (pendingMatch) extractLines(pendingMatch[1], "pending");
          }
        });

        setTasks(extractedTasks);
      }
    } catch (error) {
      toast.error("Could not load tasks from logs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(t => 
    t.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.employee.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-2"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Task Overview</h1>
            <p className="text-gray-600 mt-1">Consolidated tasks from employee End of Day logs</p>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search tasks or employees..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Loader className="animate-spin mb-4" size={32} />
            <p>Processing tasks from logs...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-gray-700">Task Details</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Employee</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{task.task}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {task.employee}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                            task.type === "completed" ? "bg-green-100 text-green-700" :
                            task.type === "blocker" ? "bg-red-100 text-red-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>
                            {task.type === "completed" && <CheckCircle2 size={12} />}
                            {task.type === "blocker" && <AlertCircle size={12} />}
                            {task.type === "pending" && <Clock size={12} />}
                            {task.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 tabular-nums">
                          {task.date}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        No tasks found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
