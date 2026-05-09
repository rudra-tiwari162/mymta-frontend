import { useState, useEffect } from "react";
import AppLayout from "@/components/app-layout";
import { 
  Briefcase, 
  Plus, 
  Users, 
  Calendar, 
  Clock, 
  Search, 
  MoreVertical, 
  Pencil, 
  UserPlus, 
  UserMinus,
  Loader,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { apiCall } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface ProjectMember {
  id: number;
  user: number;
  user_email: string;
  user_name: string;
  role_in_project: string;
  assigned_at: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  status: "planning" | "active" | "on_hold" | "completed";
  created_by: number;
  created_by_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  members: ProjectMember[];
}

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    status: "planning",
    start_date: "",
    end_date: "",
  });

  const [assignForm, setAssignForm] = useState({
    user_id: "",
    role: "Contributor",
  });

  useEffect(() => {
    fetchData();
    const role = localStorage.getItem("user_role");
    setIsAdmin(role === "admin");
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projRes, userRes] = await Promise.all([
        apiCall("/api/operations/projects/"),
        apiCall("/api/v1/users/")
      ]);

      if (projRes.ok) {
        const projData = await projRes.json();
        setProjects(Array.isArray(projData) ? projData : []);
      }
      
      if (userRes.ok) {
        const userData = await userRes.json();
        setUsers(Array.isArray(userData) ? userData : []);
      }
    } catch (error) {
      toast.error("Failed to fetch project data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Clean payload: remove empty end_date to prevent backend 500
      const payload: any = { 
        name: projectForm.name,
        description: projectForm.description,
        status: projectForm.status,
        start_date: projectForm.start_date
      };
      
      if (projectForm.end_date) {
        payload.end_date = projectForm.end_date;
      }

      const res = await apiCall("/api/operations/projects/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to create project");
      }
      
      toast.success("Project created successfully");
      setIsCreateOpen(false);
      setProjectForm({ name: "", description: "", status: "planning", start_date: "", end_date: "" });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Error creating project");
    }
  };

  const handleUpdateStatus = async (projectId: number, newStatus: string) => {
    try {
      const res = await apiCall(`/api/operations/projects/${projectId}/`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success("Status updated");
      fetchData();
    } catch (error) {
      toast.error("Error updating status");
    }
  };

  const handleAssignMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      const res = await apiCall(`/api/operations/projects/${selectedProject.id}/assign/`, {
        method: "POST",
        body: JSON.stringify({
          user_id: parseInt(assignForm.user_id),
          role: assignForm.role
        }),
      });
      if (!res.ok) throw new Error("Failed to assign member");
      toast.success("Member aligned to project");
      setIsAssignOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Error assigning member");
    }
  };

  const handleUnassignMember = async (projectId: number, userId: number) => {
    try {
      const res = await apiCall(`/api/operations/projects/${projectId}/unassign/`, {
        method: "POST",
        body: JSON.stringify({ user_id: userId }),
      });
      if (!res.ok) throw new Error("Failed to unassign");
      toast.success("Member removed from project");
      fetchData();
    } catch (error) {
      toast.error("Error removing member");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700 border-green-200";
      case "planning": return "bg-blue-100 text-blue-700 border-blue-200";
      case "on_hold": return "bg-orange-100 text-orange-700 border-orange-200";
      case "completed": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-2">
              <ArrowLeft size={18} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-1">Manage initiatives and team alignment</p>
          </div>

          {isAdmin && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 gap-2">
                  <Plus size={20} /> New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>Define the project details and schedule.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateProject} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input 
                      id="name" 
                      required 
                      value={projectForm.name} 
                      onChange={e => setProjectForm({...projectForm, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desc">Description</Label>
                    <Textarea 
                      id="desc" 
                      required 
                      value={projectForm.description}
                      onChange={e => setProjectForm({...projectForm, description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start">Start Date</Label>
                      <Input 
                        id="start" 
                        type="date" 
                        required
                        value={projectForm.start_date}
                        onChange={e => setProjectForm({...projectForm, start_date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end">End Date</Label>
                      <Input 
                        id="end" 
                        type="date"
                        value={projectForm.end_date}
                        onChange={e => setProjectForm({...projectForm, end_date: e.target.value})}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-green-600">Create Project</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader className="animate-spin mb-4" size={40} />
            <p>Loading projects...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length > 0 ? projects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className={`capitalize ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUpdateStatus(project.id, "active")}>Mark Active</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(project.id, "on_hold")}>On Hold</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(project.id, "completed")}>Completed</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3>
                  <p className="text-gray-600 text-sm mb-6 line-clamp-3">{project.description}</p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={16} />
                      <span>{new Date(project.start_date).toLocaleDateString()} - {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Ongoing'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users size={16} />
                      <span>{project.members.length} Members Aligned</span>
                    </div>
                  </div>

                  {/* Member Avatars */}
                  <div className="flex -space-x-2 overflow-hidden mb-4">
                    {project.members.map((m) => (
                      <div 
                        key={m.id} 
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-green-600 flex items-center justify-center text-[10px] font-bold text-white uppercase"
                        title={`${m.user_name} (${m.role_in_project})`}
                      >
                        {m.user_name.substring(0, 2)}
                      </div>
                    ))}
                    {isAdmin && (
                      <button 
                        onClick={() => {
                          setSelectedProject(project);
                          setIsAssignOpen(true);
                        }}
                        className="h-8 w-8 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                        title="Align New Person"
                      >
                        <Plus size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-200 mt-auto">
                  <div className="flex flex-wrap gap-2">
                    {project.members.map((m) => (
                      <div key={m.id} className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded text-[10px] font-medium text-gray-600 group">
                        <span>{m.user_name}</span>
                        <span className="text-gray-400">({m.role_in_project})</span>
                        {isAdmin && (
                          <button 
                            onClick={() => handleUnassignMember(project.id, m.user)}
                            className="text-red-400 hover:text-red-600 ml-1"
                          >
                            <UserMinus size={10} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-gray-300">
                <Briefcase className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
                <p className="text-gray-500">Get started by creating a new initiative.</p>
              </div>
            )}
          </div>
        )}

        {/* Align Member Dialog */}
        <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Align Team Member</DialogTitle>
              <DialogDescription>
                Assign an employee to <strong>{selectedProject?.name}</strong>.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAssignMember} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Select Employee</Label>
                <Select onValueChange={(v) => setAssignForm({...assignForm, user_id: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a person..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(u => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        {u.first_name} {u.last_name} ({u.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Role in Project</Label>
                <Input 
                  placeholder="e.g. Lead, Contributor, QA" 
                  value={assignForm.role}
                  onChange={e => setAssignForm({...assignForm, role: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full bg-green-600">Align to Project</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
