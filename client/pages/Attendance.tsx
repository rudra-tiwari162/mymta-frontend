import { useState, useEffect } from "react";
import AppLayout from "@/components/app-layout";
import DashboardCard from "@/components/dashboard-card";
import { Calendar, Users, CheckCircle2, AlertCircle, Clock, Loader } from "lucide-react";
import { toast } from "sonner";

type AttendanceStatus = "present" | "wfh" | "leave" | "absent";

interface AttendanceRecord {
  id?: string;
  date: string;
  status: AttendanceStatus;
  clock_in?: string;
  clock_out?: string;
  sodSubmitted: boolean;
  eodSubmitted: boolean;
  notes?: string;
}

export default function Attendance() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 4)); // May 2024
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [clocking, setClocking] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, [currentMonth]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/operations/attendance/", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch attendance");
      const data = await response.json();
      
      const mapped = Array.isArray(data) ? data.map((item: any) => ({
        id: item.id,
        date: item.clock_in ? item.clock_in.split("T")[0] : "",
        status: "present" as AttendanceStatus,
        clock_in: item.clock_in,
        clock_out: item.clock_out,
        sodSubmitted: false,
        eodSubmitted: false,
      })) : [];
      setRecords(mapped);
      
      const today = new Date().toISOString().split("T")[0];
      const todayRecord = mapped.find((r: any) => r.date === today && !r.clock_out);
      setIsClockedIn(!!todayRecord);
    } catch (err) {
      toast.error("Could not load attendance data");
    } finally {
      setLoading(false);
    }
  };

  const handleClockAction = async () => {
    setClocking(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/operations/attendance/", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) throw new Error("Action failed");
      
      toast.success(isClockedIn ? "Clocked out successfully" : "Clocked in successfully");
      fetchAttendance();
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setClocking(false);
    }
  };



  // Generate dummy attendance data (Disabled for live data)
  const generateDummyData = (): AttendanceRecord[] => {
    return records;
  };

  // Calculate statistics
  const attendanceData = Array.isArray(records) ? records : [];
  const presentDays = attendanceData.filter((r) => r.status === "present").length;
  const wfhDays = attendanceData.filter((r) => r.status === "wfh").length;
  const leaveDays = attendanceData.filter((r) => r.status === "leave").length;
  const absentDays = attendanceData.filter((r) => r.status === "absent").length;
  const totalWorkingDays = presentDays + wfhDays + leaveDays + absentDays;

  const getDaysInCurrentMonth = (): Date[] => {
    const firstDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const lastDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );

    const days: Date[] = [];
    for (let i = firstDay.getDate(); i <= lastDay.getDate(); i++) {
      days.push(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i)
      );
    }
    return days;
  };

  const getStatusColor = (status: AttendanceStatus): string => {
    switch (status) {
      case "present":
        return "bg-green-100 border-green-300 text-green-700";
      case "wfh":
        return "bg-blue-100 border-blue-300 text-blue-700";
      case "leave":
        return "bg-red-100 border-red-300 text-red-700";
      case "absent":
        return "bg-gray-100 border-gray-300 text-gray-700";
    }
  };

  const getStatusBadge = (status: AttendanceStatus): string => {
    switch (status) {
      case "present":
        return "Present";
      case "wfh":
        return "Work From Home";
      case "leave":
        return "Leave";
      case "absent":
        return "Absent";
    }
  };

  const getPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const getNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
            <p className="text-gray-600 mt-2">Track your attendance and work patterns</p>
          </div>
          <button
            onClick={handleClockAction}
            disabled={clocking}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-all shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 ${
              isClockedIn ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {clocking ? <Loader className="animate-spin" size={20} /> : <Clock size={20} />}
            {isClockedIn ? "Clock Out" : "Clock In"}
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
          <DashboardCard
            title="Total Working Days"
            value={totalWorkingDays}
            icon={<Calendar size={24} />}
          />
          <DashboardCard
            title="Days Present"
            value={presentDays}
            description="In office"
            icon={<CheckCircle2 size={24} className="text-green-600" />}
          />
          <DashboardCard
            title="WFH Days"
            value={wfhDays}
            description="Remote work"
            icon={<Users size={24} className="text-blue-600" />}
          />
          <DashboardCard
            title="Leave Days"
            value={leaveDays}
            description="Approved"
            icon={<AlertCircle size={24} className="text-red-600" />}
          />
          <DashboardCard
            title="Absent Days"
            value={absentDays}
            description="Not marked"
            icon={<AlertCircle size={24} className="text-gray-600" />}
          />
        </div>

        {/* Calendar View */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={getPreviousMonth}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Prev
              </button>
              <button
                onClick={getNextMonth}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-gray-700 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {getDaysInCurrentMonth().map((day) => {
              const record = attendanceData.find(
                (r) => r.date === day.toISOString().split("T")[0]
              );

              const isWeekend = day.getDay() === 0 || day.getDay() === 6;

              return (
                <div
                  key={day.toISOString()}
                  className={`p-2 rounded-lg text-center text-sm h-24 flex flex-col items-center justify-center border-2 ${
                    isWeekend
                      ? "bg-gray-50 border-gray-200"
                      : record
                      ? `${getStatusColor(record.status)} border`
                      : "bg-white border-gray-200 border"
                  }`}
                  title={record ? getStatusBadge(record.status) : ""}
                >
                  <span className="font-bold text-base">{day.getDate()}</span>
                  {record && (
                    <div className="mt-1 text-xs flex gap-0.5">
                      {record.sodSubmitted && <span className="bg-green-600 text-white px-1 rounded">SOD</span>}
                      {record.eodSubmitted && <span className="bg-green-600 text-white px-1 rounded">EOD</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-sm text-gray-700">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
              <span className="text-sm text-gray-700">WFH</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span className="text-sm text-gray-700">Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
              <span className="text-sm text-gray-700">Absent</span>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Detailed Records</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">
                    SOD
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">
                    EOD
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendanceData.map((record) => (
                  <tr key={record.date} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {new Date(record.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        weekday: "short",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          record.status === "present"
                            ? "bg-green-100 text-green-800"
                            : record.status === "wfh"
                            ? "bg-blue-100 text-blue-800"
                            : record.status === "leave"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getStatusBadge(record.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {record.sodSubmitted ? (
                        <span className="text-green-600 font-bold">✓</span>
                      ) : (
                        <span className="text-gray-400">○</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {record.eodSubmitted ? (
                        <span className="text-green-600 font-bold">✓</span>
                      ) : (
                        <span className="text-gray-400">○</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {record.notes || "-"}
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
