import { useState, useEffect } from "react";
import AppLayout from "@/components/app-layout";
import DashboardCard from "@/components/dashboard-card";
import { 
  Clock, 
  FileText, 
  Calendar, 
  Bell, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Loader
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, PortalPost } from "@shared/api";

export default function EmployeePortal() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<PortalPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [clockedIn, setClockedIn] = useState(false);
  const [todayLog, setTodayLog] = useState<any>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Fetch Profile
      const meRes = await fetch("/api/v1/users/me/", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const meData = await meRes.json();
      setUser(meData);

      // Fetch Attendance Status
      const attRes = await fetch("/api/operations/attendance/", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const attData = await attRes.json();
      const today = new Date().toISOString().split("T")[0];
      const todayAtt = attData.find((a: any) => a.date === today && !a.clock_out);
      setClockedIn(!!todayAtt);

      // Fetch Daily Logs
      const logRes = await fetch("/api/operations/daily-logs/", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const logData = await logRes.json();
      setTodayLog(logData.find((l: any) => l.date === today));

      // Fetch Portal Posts (Updates)
      const postRes = await fetch("/api/operations/portal-posts/", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const postData = await postRes.json();
      setPosts(postData.slice(0, 5)); // Latest 5

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {user?.first_name || "Employee"}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening in your workspace today.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Actions and Logs */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Actions Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-green-600" />
                  Daily Operations
                </h2>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Attendance Action */}
                <Link 
                  to="/attendance"
                  className={`p-4 rounded-lg border transition-all flex flex-col gap-3 group ${
                    clockedIn 
                      ? "bg-green-50 border-green-200" 
                      : "bg-white border-gray-200 hover:border-green-500 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Clock size={24} className={clockedIn ? "text-green-600" : "text-gray-400 group-hover:text-green-500"} />
                    {clockedIn && <span className="text-[10px] font-bold uppercase tracking-wider bg-green-200 text-green-700 px-2 py-0.5 rounded">Clocked In</span>}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Attendance</h3>
                    <p className="text-sm text-gray-600">{clockedIn ? "Active session running" : "Mark your presence for today"}</p>
                  </div>
                  <div className="text-green-600 text-sm font-medium flex items-center gap-1 mt-auto">
                    Go to Attendance <ArrowRight size={14} />
                  </div>
                </Link>

                {/* Daily Logs Action */}
                <Link 
                  to="/daily-logs"
                  className={`p-4 rounded-lg border transition-all flex flex-col gap-3 group ${
                    todayLog?.sod_content && todayLog?.eod_content
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white border-gray-200 hover:border-blue-500 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <FileText size={24} className={todayLog?.sod_content ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500"} />
                    <div className="flex gap-1">
                      {todayLog?.sod_content && <span className="text-[10px] font-bold bg-blue-200 text-blue-700 px-1.5 py-0.5 rounded">SOD</span>}
                      {todayLog?.eod_content && <span className="text-[10px] font-bold bg-blue-200 text-blue-700 px-1.5 py-0.5 rounded">EOD</span>}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Daily Logs</h3>
                    <p className="text-sm text-gray-600">
                      {!todayLog?.sod_content ? "Submit your Start of Day log" : !todayLog?.eod_content ? "Submit your End of Day log" : "Daily logs completed"}
                    </p>
                  </div>
                  <div className="text-blue-600 text-sm font-medium flex items-center gap-1 mt-auto">
                    Manage Logs <ArrowRight size={14} />
                  </div>
                </Link>
              </div>
            </div>

            {/* Updates / News Feed */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Bell size={20} className="text-orange-500" />
                  Latest Updates
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {posts.length === 0 ? (
                  <div className="p-10 text-center text-gray-500">
                    No updates available at the moment.
                  </div>
                ) : (
                  posts.map((post) => (
                    <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded">
                          Update
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">{post.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {post.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar: Status Summary */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-green-600" />
                This Month
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Present Days</span>
                  <span className="font-bold text-gray-900">18</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Late Arrivals</span>
                  <span className="font-bold text-red-600">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending Logs</span>
                  <span className="font-bold text-orange-600">1</span>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <Link to="/attendance" className="text-sm font-medium text-green-600 hover:underline flex items-center gap-1">
                    View detailed attendance <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-xl text-white shadow-lg">
              <h3 className="font-bold mb-2">Help & Support</h3>
              <p className="text-sm text-green-50 mb-4">
                Facing any issues? Contact your HR or Admin team for assistance.
              </p>
              <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition-colors">
                Contact Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
