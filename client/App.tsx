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
import Tasks from "./pages/Tasks";
import Projects from "./pages/Projects";
import { useState, useEffect } from "react";
import { getRoleFromToken } from "@/lib/jwt";

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

    // First, try to get stored role
    let storedRole = localStorage.getItem("user_role");

    if (storedRole) {
      console.log("✅ Using stored role:", storedRole);
      setRole(storedRole);
      setLoading(false);
      return;
    }

    // If not stored, extract from JWT token
    const extractedRole = getRoleFromToken(token);
    if (extractedRole) {
      console.log("✅ Extracted role from token:", extractedRole);
      localStorage.setItem("user_role", extractedRole);
      setRole(extractedRole);
    } else {
      console.warn("⚠️ Could not determine user role");
    }

    setLoading(false);
  }, []);

  if (loading) return null;

  if (window.location.hostname === "localhost") return <Register />;

  const token = localStorage.getItem("access_token");
  if (!token) return <Login />;

  // Route based on role
  if (role === "admin") {
    console.log("🔑 Routing to Admin Dashboard");
    return <Index />;
  } else if (role === "employee") {
    console.log("👤 Routing to Employee Portal");
    return <EmployeePortal />;
  } else {
    console.warn("❌ Unknown role, redirecting to login");
    return <Login />;
  }
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
            element={<Projects />}
          />
          <Route
            path="/tasks"
            element={<Tasks />}
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
                description="Page Under Progress"
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
