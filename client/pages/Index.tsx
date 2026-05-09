import AppLayout from "@/components/app-layout";
import DashboardCard from "@/components/dashboard-card";
import {
  Users,
  CheckCircle2,
  Clock,
  Activity,
  ArrowRight,
  Plus,
  Send,
  Calendar,
  Pencil,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { User, Attendance, PortalPost } from "@shared/api";
import { apiCall, fetchPortalPosts } from "@/lib/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [userRole, setUserRole] = useState<string | null>(null);
  const [userCount, setUserCount] = useState<number>(0);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [posts, setPosts] = useState<PortalPost[]>([]);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isAddPostOpen, setIsAddPostOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    personal_email: "",
    first_name: "",
    last_name: "",
    role: "employee" as "admin" | "employee",
    password: "",
  });
  const [postData, setPostData] = useState({
    title: "",
    content: "",
  });
  const [editingPost, setEditingPost] = useState<any>(null);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch user count
    apiCall("/api/v1/users/")
      .then(res => res.json())
      .then(data => setUserCount(Array.isArray(data) ? data.length : 0))
      .catch((err) => console.error("Failed to fetch user count:", err));

    // Fetch attendance records
    apiCall("/api/operations/attendance/")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAttendance(data.slice(0, 10)); // Latest 10
        }
      })
      .catch((err) => console.error("Failed to fetch attendance:", err));

    // Fetch portal posts
    fetchPortalPosts()
      .then(data => {
        if (Array.isArray(data)) {
          setPosts(data.slice(0, 5)); // Latest 5
        }
      })
      .catch((err) => console.error("Failed to fetch posts:", err));

    // Fetch daily logs to extract tasks
    apiCall("/api/operations/daily-logs/")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const allTasks: any[] = [];
          data.forEach((log: any) => {
            const emp = log.employee_name || "Unknown";
            
            // SOD Tasks
            if (log.sod_content) {
              if (log.sod_content.trim().startsWith('{') || log.sod_content.trim().startsWith('[')) {
                try {
                  const sod = JSON.parse(log.sod_content);
                  if (Array.isArray(sod.tasks)) {
                    sod.tasks.forEach((t: any, idx: number) => allTasks.push({
                      id: `sod-json-${log.id}-${idx}`,
                      title: t.task || t.title || "Unnamed Task",
                      assignee: emp,
                      status: "Planned",
                    }));
                  }
                } catch (e) {}
              } else {
                const tasksMatch = log.sod_content.match(/Tasks:\n([\s\S]*?)(?:\n\n|$)/);
                if (tasksMatch) {
                  const lines = tasksMatch[1].split('\n').filter((l: string) => l.trim().startsWith('-'));
                  lines.forEach((line: string, idx: number) => {
                    allTasks.push({
                      id: `sod-text-${log.id}-${idx}`,
                      title: line.replace(/^- /, '').split('[')[0].trim(),
                      assignee: emp,
                      status: "Planned",
                    });
                  });
                }
              }
            }

            // EOD Blockers and Pending
            if (log.eod_content && !log.eod_content.trim().startsWith('{')) {
              const blockersMatch = log.eod_content.match(/Blockers:\n([\s\S]*?)(?:\n\n|Pending Tasks:|$)/);
              if (blockersMatch) {
                blockersMatch[1].split('\n').filter(l => l.trim().startsWith('-')).forEach((line, idx) => {
                  allTasks.push({
                    id: `blocker-${log.id}-${idx}`,
                    title: line.replace(/^- /, '').trim(),
                    assignee: emp,
                    status: "Blocker",
                  });
                });
              }

              const pendingMatch = log.eod_content.match(/Pending Tasks:\n([\s\S]*?)(?:\n\n|$)/);
              if (pendingMatch) {
                pendingMatch[1].split('\n').filter(l => l.trim().startsWith('-')).forEach((line, idx) => {
                  allTasks.push({
                    id: `pending-${log.id}-${idx}`,
                    title: line.replace(/^- /, '').trim(),
                    assignee: emp,
                    status: "Pending",
                  });
                });
              }
            }
          });
          setRecentTasks(allTasks.slice(0, 10)); // Show more since we have more types

        }
      })
      .catch(err => console.error("Failed to fetch daily logs:", err));
  }, [navigate]);

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Not authenticated");
        return;
      }

      const response = await apiCall("/api/v1/users/", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let errorMessage = "Failed to add person";
        try {
          const error = await response.json();
          errorMessage = error.detail || error.error || errorMessage;
        } catch {
          // ignore parse error
        }
        toast.error(errorMessage);
        return;
      }

      toast.success("Person added successfully!");
      setIsAddPersonOpen(false);
      setFormData({ username: "", personal_email: "", first_name: "", last_name: "", role: "employee", password: "" });

      // Refresh user count
      const usersRes = await apiCall("/api/v1/users/");
      const usersData = await usersRes.json();
      setUserCount(Array.isArray(usersData) ? usersData.length : 0);
    } catch (err) {
      console.error(err);
      toast.error("Error adding person");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Not authenticated");
        return;
      }

      let response;
      if (editingPost) {
        response = await apiCall(`/api/operations/portal-posts/${editingPost.id}/`, {
          method: "PATCH",
          body: JSON.stringify(postData),
        });
      } else {
        response = await apiCall("/api/operations/portal-posts/", {
          method: "POST",
          body: JSON.stringify(postData),
        });
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        toast.error(error.detail || error.error || "Failed to save post");
        return;
      }

      toast.success(editingPost ? "Post updated successfully!" : "Post created successfully!");
      setIsAddPostOpen(false);
      setEditingPost(null);
      setPostData({ title: "", content: "" });
      
      // Refresh posts
      fetchPortalPosts().then(data => {
        if (Array.isArray(data)) {
          setPosts(data.slice(0, 5));
        }
      });
    } catch (err) {
      console.error(err);
      toast.error("Error saving post");
    } finally {
      setLoading(false);
    }
  };
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
          {/* Recent Posts Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Posts & Announcements
                </h2>
              </div>
              <div className="divide-y divide-gray-200 overflow-y-auto flex-1">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <div key={post.id} className="p-6 hover:bg-gray-50 group relative">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {post.title}
                        </h3>
                        <button
                          onClick={() => {
                            setEditingPost(post);
                            setPostData({ title: post.title, content: post.content });
                            setIsAddPostOpen(true);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all text-gray-500"
                          title="Edit Post"
                        >
                          <Pencil size={14} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>By {post.author}</span>
                        <span>
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-gray-500">
                    <Activity className="w-12 h-12 text-gray-300 mb-3 mx-auto" />
                    <p>No posts yet. Create one to get started!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Dialog open={isAddPersonOpen} onOpenChange={setIsAddPersonOpen}>
                  <DialogTrigger asChild>
                    <button className="w-full px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors text-left">
                      + Add new person
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Team Member</DialogTitle>
                      <DialogDescription>
                        Fill in the details to add a new person to your team.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddPerson} className="space-y-4">
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          type="text"
                          placeholder="johndoe"
                          value={formData.username}
                          onChange={(e) =>
                            setFormData({ ...formData, username: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="personal_email">Personal Email</Label>
                        <Input
                          id="personal_email"
                          type="email"
                          placeholder="john.doe@gmail.com"
                          value={formData.personal_email}
                          onChange={(e) =>
                            setFormData({ ...formData, personal_email: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="first_name">First Name</Label>
                          <Input
                            id="first_name"
                            placeholder="John"
                            value={formData.first_name}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                first_name: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="last_name">Last Name</Label>
                          <Input
                            id="last_name"
                            placeholder="Doe"
                            value={formData.last_name}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                last_name: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Create a password"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              role: value as "admin" | "employee",
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">Employee</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {loading ? "Adding..." : "Add Person"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={isAddPostOpen} onOpenChange={setIsAddPostOpen}>
                  <DialogTrigger asChild>
                    <button 
                      onClick={() => {
                        setEditingPost(null);
                        setPostData({ title: "", content: "" });
                      }}
                      className="w-full px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors text-left"
                    >
                      + Add new post
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New Post</DialogTitle>
                      <DialogDescription>
                        Share updates and announcements with your team.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddPost} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          placeholder="e.g., New Attendance Policy"
                          value={postData.title}
                          onChange={(e) =>
                            setPostData({ ...postData, title: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                          id="content"
                          placeholder="Share your message here..."
                          value={postData.content}
                          onChange={(e) =>
                            setPostData({
                              ...postData,
                              content: e.target.value,
                            })
                          }
                          required
                          rows={4}
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {loading ? "Saving..." : editingPost ? "Update Post" : "Create Post"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Link 
                  to="/users"
                  className="block w-full px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors text-left"
                >
                  + Manage team members
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Attendance and Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Attendance */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Attendance
              </h2>
              <Link
                to="/attendance"
                className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
              >
                View all <ArrowRight size={16} />
              </Link>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {attendance.length > 0 ? (
                attendance.map((record) => (
                  <div key={record.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">
                        {record.employee_name || record.user || "Unknown"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="text-blue-600" />
                        <span className="text-gray-600">
                          In: {new Date(record.clock_in).toLocaleTimeString()}
                        </span>
                      </div>
                      {record.clock_out && (
                        <div className="flex items-center gap-1">
                          <Clock size={14} className="text-red-600" />
                          <span className="text-gray-600">
                            Out: {new Date(record.clock_out).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                      {!record.clock_out && (
                        <span className="text-green-600 text-xs font-medium">
                          ● Active
                        </span>
                      )}
                      <div className="flex gap-1 ml-auto">
                        {(record as any).sod_submitted && <span className="text-[10px] bg-green-100 text-green-700 px-1 rounded font-bold" title="Start of Day Submitted">SOD ✓</span>}
                        {(record as any).eod_submitted && <span className="text-[10px] bg-green-100 text-green-700 px-1 rounded font-bold" title="End of Day Submitted">EOD ✓</span>}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No attendance records found.
                </div>
              )}
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
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
            <div className="overflow-x-auto flex-1">
              {recentTasks.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-gray-700">Task</th>
                      <th className="px-6 py-3 font-semibold text-gray-700">Assignee</th>
                      <th className="px-6 py-3 font-semibold text-gray-700 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900 truncate max-w-[200px]" title={task.title}>
                          {task.title}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {task.assignee}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            task.status === 'Blocker' ? 'bg-red-100 text-red-700' :
                            task.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            task.status === 'Planned' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {task.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-10 flex-1 flex flex-col items-center justify-center text-center text-gray-500">
                  <CheckCircle2 className="w-12 h-12 text-gray-300 mb-3" />
                  <p>No tasks found in logs.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
