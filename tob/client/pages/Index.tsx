import AppLayout from "@/components/app-layout";
import DashboardCard from "@/components/dashboard-card";
import {
  Users,
  CheckCircle2,
  Clock,
  Activity,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const navigate = useNavigate();

  const [userRole, setUserRole] = useState<string | null>(null);
  const [userCount, setUserCount] = useState<number>(0);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch user profile to check role
    fetch("/api/v1/users/me/", {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setUserRole(data.role))
    .catch(() => {});

    // Fetch user count
    fetch("/api/v1/users/", {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setUserCount(data.length))
    .catch(() => {});
  }, [navigate]);
  // Sample data
  const stats = [
    {
      title: "Total Users",
      value: userCount.toString(),
      description: "Active team members",
      icon: <Users size={24} />,
      trend: { value: 0, isPositive: true },
    },
    {
      title: "Completed Tasks",
      value: "456",
      description: "This month",
      icon: <CheckCircle2 size={24} />,
      trend: { value: 8, isPositive: true },
    },
    {
      title: "In Progress",
      value: "89",
      description: "Current tasks",
      icon: <Clock size={24} />,
      trend: { value: 3, isPositive: false },
    },
    {
      title: "Team Activity",
      value: "2.4k",
      description: "Actions this week",
      icon: <Activity size={24} />,
      trend: { value: 5, isPositive: true },
    },
  ];

  const recentProjects = [
    {
      name: "Website Redesign",
      status: "In Progress",
      progress: 65,
      members: 4,
      dueDate: "Mar 15, 2024",
    },
    {
      name: "Mobile App",
      status: "Planning",
      progress: 20,
      members: 6,
      dueDate: "Apr 1, 2024",
    },
    {
      name: "Analytics Dashboard",
      status: "In Progress",
      progress: 45,
      members: 3,
      dueDate: "Feb 28, 2024",
    },
    {
      name: "API Integration",
      status: "Completed",
      progress: 100,
      members: 2,
      dueDate: "Feb 10, 2024",
    },
  ];

  const recentTasks = [
    {
      title: "Review design mockups",
      project: "Website Redesign",
      assignee: "Sarah",
      priority: "High",
      dueDate: "Today",
    },
    {
      title: "Fix login authentication",
      project: "Mobile App",
      assignee: "John",
      priority: "Critical",
      dueDate: "Today",
    },
    {
      title: "Write API documentation",
      project: "API Integration",
      assignee: "Emma",
      priority: "Medium",
      dueDate: "Tomorrow",
    },
    {
      title: "Setup database schema",
      project: "Analytics Dashboard",
      assignee: "Mike",
      priority: "High",
      dueDate: "Mar 5",
    },
  ];

  const statusColors = {
    "In Progress": "bg-blue-100 text-blue-800",
    Planning: "bg-gray-100 text-gray-800",
    Completed: "bg-green-100 text-green-800",
    "On Hold": "bg-yellow-100 text-yellow-800",
    Critical: "bg-red-100 text-red-800",
    High: "bg-orange-100 text-orange-800",
    Medium: "bg-blue-100 text-blue-800",
    Low: "bg-gray-100 text-gray-800",
  };

  return (
    <AppLayout>
      <div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Welcome back! Here's your workspace overview.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.map((stat, index) => (
            <DashboardCard key={index} {...stat} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Projects Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Projects
                </h2>
                <Link
                  to="/users"
                  className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                >
                  View all <ArrowRight size={16} />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                        Project
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                        Due Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentProjects.map((project, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {project.name}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              statusColors[
                                project.status as keyof typeof statusColors
                              ] || "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 mt-1 block">
                            {project.progress}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {project.dueDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            {/* Upcoming */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-green-600" />
                Top Performers
              </h3>
              <div className="space-y-3">
                {[
                  { name: "Sarah", score: "98%" },
                  { name: "John", score: "95%" },
                  { name: "Emma", score: "92%" },
                ].map((person, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-600 rounded-full text-white text-xs font-medium flex items-center justify-center">
                        {person.name[0]}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {person.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      {person.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors text-left">
                  + Create new project
                </button>
                <Link 
                  to="/users"
                  className="block w-full px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors text-left"
                >
                  + Manage team members
                </Link>
                <button className="w-full px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors text-left">
                  + Schedule meeting
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Tasks
            </h2>
            <Link
              to="/tasks"
              className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
            >
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentTasks.map((task, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {task.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {task.project}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {task.assignee}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          statusColors[
                            task.priority as keyof typeof statusColors
                          ] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {task.dueDate}
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
