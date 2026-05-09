import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  MessageSquare,
  Settings,
  ChevronDown,
  Users,
  Clock,
  FileText,
  Home
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { apiCall } from "@/lib/api";

const adminItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "Team Members", href: "/users" },
  { icon: FolderOpen, label: "Projects", href: "/projects" },
  { icon: CheckSquare, label: "Tasks", href: "/tasks" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const employeeItems = [
  { icon: Home, label: "Portal", href: "/" },
  { icon: Clock, label: "Attendance", href: "/attendance" },
  { icon: FileText, label: "Daily Logs", href: "/daily-logs" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    apiCall("/api/v1/users/me/")
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setRole(data.role);
      })
      .catch(() => {});
  }, []);

  const currentNavItems = role === "admin" ? adminItems : employeeItems;

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className={cn("font-bold text-xl", isCollapsed && "hidden")}>
            <span className="text-green-600">nexora</span>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            <ChevronDown
              size={20}
              className={cn(
                "transition-transform",
                isCollapsed ? "-rotate-90" : "rotate-90"
              )}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-2">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-green-100 text-green-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={20} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200">
          <div
            className={cn(
              "flex items-center gap-3",
              isCollapsed && "justify-center"
            )}
          >
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.first_name ? user.first_name[0] : "U"}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user ? `${user.first_name} ${user.last_name}` : "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email || "user@nexora.io"}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Hamburger - will be handled in navbar */}
    </>
  );
}
