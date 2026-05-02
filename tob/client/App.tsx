import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Placeholder from "./pages/Placeholder";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Logs from "./pages/Logs";
import UsersPage from "./pages/Users";
import Attendance from "./pages/Attendance";
import DailyLogs from "./pages/DailyLogs";
import StartOfDay from "./pages/StartOfDay";
import EndOfDay from "./pages/EndOfDay";
import EmployeePortal from "./pages/EmployeePortal";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

const Home = () => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch("/api/v1/users/me/", {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setRole(data.role))
    .catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  if (window.location.hostname === "localhost") return <Register />;
  
  const token = localStorage.getItem("access_token");
  if (!token) return <Login />;

  return role === "admin" ? <Index /> : <EmployeePortal />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/daily-logs" element={<DailyLogs />} />
          <Route path="/sod" element={<StartOfDay />} />
          <Route path="/eod" element={<EndOfDay />} />

          {/* Protected/Dashboard routes */}
          <Route
            path="/projects"
            element={
              <Placeholder
                title="Projects"
                description="Manage all your projects in one place. Continue prompting to build out this page."
              />
            }
          />
          <Route
            path="/tasks"
            element={
              <Placeholder
                title="Tasks"
                description="View and manage all tasks across your projects. Continue prompting to build out this page."
              />
            }
          />
          <Route
            path="/activity"
            element={
              <Placeholder
                title="Activity"
                description="Track all team activities and updates. Continue prompting to build out this page."
              />
            }
          />
          <Route
            path="/settings"
            element={
              <Placeholder
                title="Settings"
                description="Customize your workspace preferences. Continue prompting to build out this page."
              />
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
