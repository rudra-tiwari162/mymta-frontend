import { useState } from "react";
import AppLayout from "@/components/app-layout";
import { Plus, Trash2, Save, AlertCircle } from "lucide-react";

interface Task {
  id: string;
  title: string;
  priority: "Low" | "Medium" | "High";
  estimatedTime: number; // in minutes
}

export default function StartOfDay() {
  const today = new Date().toISOString().split("T")[0];

  const [goals, setGoals] = useState("");
  const [focusArea, setFocusArea] = useState("");
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "", priority: "Medium", estimatedTime: 60 },
  ]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const addTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: "",
      priority: "Medium",
      estimatedTime: 60,
    };
    setTasks([...tasks, newTask]);
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const updateTask = (
    id: string,
    field: keyof Task,
    value: string | number
  ) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, [field]: value } : task
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!goals.trim()) {
      setError("Please enter your goals for today");
      setLoading(false);
      return;
    }

    if (tasks.some((task) => !task.title.trim())) {
      setError("All tasks must have a title");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      
      // 1. Check if a record for today already exists
      const listResponse = await fetch("/api/operations/daily-logs/", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const logs = await listResponse.json();
      const todayLog = logs.find((l: any) => l.date === today);

      const payload = {
        sod_content: JSON.stringify({ goals, focusArea, tasks }),
        eod_content: todayLog?.eod_content || ""
      };

      let response;
      if (todayLog) {
        response = await fetch(`/api/operations/daily-logs/${todayLog.id}/`, {
          method: "PATCH",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ sod_content: payload.sod_content })
        });
      } else {
        response = await fetch("/api/operations/daily-logs/", {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to save SOD");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save SOD. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const totalEstimatedTime = tasks.reduce(
    (sum, task) => sum + task.estimatedTime,
    0
  );

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Start of Day</h1>
          <p className="text-gray-600 mt-2">Plan your day ahead</p>
          <p className="text-sm text-gray-500 mt-1">Date: {today}</p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-medium">
              ✓ Your SOD has been saved successfully!
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
          {/* Goals Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Today's Goals
            </h2>
            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="What do you want to accomplish today? (e.g., Complete design mockups, Fix bugs, Prepare presentation...)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
              rows={4}
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-2">
              Be specific about what you want to achieve
            </p>
          </div>

          {/* Focus Area */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Focus Area (Optional)
            </h2>
            <input
              type="text"
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              placeholder="What will you focus on the most? (e.g., Deep work, Meetings, Admin tasks)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              disabled={loading}
            />
          </div>

          {/* Task List */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Task List</h2>
              <div className="text-sm text-gray-600">
                Est. Time: <span className="font-medium">{totalEstimatedTime} min</span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {/* Task # */}
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-medium text-green-700">
                    {index + 1}
                  </div>

                  {/* Task Details */}
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) =>
                        updateTask(task.id, "title", e.target.value)
                      }
                      placeholder={`Task ${index + 1} (e.g., Review pull requests)`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      disabled={loading}
                    />

                    <div className="flex gap-3">
                      {/* Priority */}
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Priority
                        </label>
                        <select
                          value={task.priority}
                          onChange={(e) =>
                            updateTask(
                              task.id,
                              "priority",
                              e.target.value as "Low" | "Medium" | "High"
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                          disabled={loading}
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>

                      {/* Estimated Time */}
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Est. Time (min)
                        </label>
                        <input
                          type="number"
                          min="5"
                          step="5"
                          value={task.estimatedTime}
                          onChange={(e) =>
                            updateTask(
                              task.id,
                              "estimatedTime",
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                          disabled={loading}
                        />
                      </div>

                      {/* Delete Button */}
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeTask(task.id)}
                          disabled={tasks.length === 1 || loading}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Task Button */}
            <button
              type="button"
              onClick={addTask}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Plus size={18} />
              Add another task
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              💡 <strong>Tip:</strong> Breaking down your goals into specific tasks helps you stay
              focused. Estimate time realistically to avoid overcommitting.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {loading ? "Saving..." : "Save Start of Day"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
