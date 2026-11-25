"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { Button } from "@/components/ui/button";
import {
  History,
  Search,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Compass,
  CheckSquare,
  FileText,
  MessageSquare,
  Lock,
  Download,
  ArrowRight,
  Filter,
  GraduationCap,
  Users,
} from "lucide-react";

export default function CounselorActivityLogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "counselor" | "student" | "admin" | "stages" | "tasks"
  >("all");
  const [tick, setTick] = useState(0);

  const logs = dataStore.getActivityLogs();
  const students = dataStore.getAllStudents();

  useEffect(() => {
    const unsub = dataStore.subscribe(() => setTick((t) => t + 1));
    return () => unsub();
  }, []);

  // Filter calculations
  const counselorActionsCount = logs.filter((l) => l.role === "counselor").length;
  const studentActionsCount = logs.filter((l) => l.role === "student").length;
  const adminActionsCount = logs.filter((l) => l.role === "admin").length;
  const stageActionsCount = logs.filter(
    (l) =>
      l.entityType === "journey_stage" ||
      l.action.includes("STAGE") ||
      (l.title && l.title.toLowerCase().includes("stage"))
  ).length;
  const taskActionsCount = logs.filter(
    (l) =>
      l.entityType === "task" ||
      l.action.includes("TASK") ||
      (l.title && l.title.toLowerCase().includes("task"))
  ).length;

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Role & Category Filter
      if (activeFilter === "counselor" && log.role !== "counselor") return false;
      if (activeFilter === "student" && log.role !== "student") return false;
      if (activeFilter === "admin" && log.role !== "admin") return false;
      if (
        activeFilter === "stages" &&
        log.entityType !== "journey_stage" &&
        !log.action.includes("STAGE") &&
        !(log.title && log.title.toLowerCase().includes("stage"))
      ) {
        return false;
      }
      if (
        activeFilter === "tasks" &&
        log.entityType !== "task" &&
        !log.action.includes("TASK") &&
        !(log.title && log.title.toLowerCase().includes("task"))
      ) {
        return false;
      }

      // Search Filter
      const q = searchQuery.toLowerCase();
      const title = (log.title || log.action || "").toLowerCase();
      const desc = (log.description || "").toLowerCase();
      const actor = (log.userName || log.userId || "").toLowerCase();
      const role = (log.role || "").toLowerCase();

      return (
        title.includes(q) ||
        desc.includes(q) ||
        actor.includes(q) ||
        role.includes(q) ||
        (log.affectedStudentId && log.affectedStudentId.toLowerCase().includes(q))
      );
    });
  }, [logs, activeFilter, searchQuery]);

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        ["Log ID", "Timestamp", "Actor Name", "Role", "Action Domain", "Title", "Affected Student", "Description"].join(","),
        ...filteredLogs.map((l) => {
          const stu = students.find((s) => s.id === l.affectedStudentId);
          const studentName = stu ? `${stu.firstName} ${stu.lastName} (${stu.studentIdCode})` : l.affectedStudentId || "N/A";
          return [
            l.id,
            l.createdAt,
            l.userName || l.userId,
            l.role,
            l.entityType || "general",
            l.title || l.action,
            studentName,
            l.description || "",
          ]
            .map((val) => `"${val}"`)
            .join(",");
        }),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GVK_Counselor_Activity_Logs_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-lg bg-gvk-navy-50 text-gvk-navy">
                <History className="w-5 h-5 text-gvk-navy" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-gvk-navy tracking-tight">
                Activity Log & Institutional Milestone Stream
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gvk-text-secondary">
              Real-time chronological activity ledger tracking counselor milestones, candidate task completions, stage sign-offs, and documents.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 px-3.5 rounded-xl border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Multi-User Stream ({logs.length})</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="font-bold text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="mt-6 pt-4 border-t border-gvk-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === "all"
                  ? "bg-gvk-navy text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              All Activities ({logs.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("stages")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === "stages"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Stages Finished ({stageActionsCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("tasks")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === "tasks"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200"
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Tasks Completed / Ticked ({taskActionsCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("counselor")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === "counselor"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Counselor Actions ({counselorActionsCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("student")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === "student"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Student Actions ({studentActionsCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("admin")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === "admin"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Actions ({adminActionsCount})</span>
            </button>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by actor, student, stage, or task..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gvk-navy/20 focus:border-gvk-navy focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Activity Logs Stream */}
      <div className="space-y-3.5">
        {filteredLogs.map((log) => {
          const isStudent = log.role === "student";
          const isCounselor = log.role === "counselor";
          const isAdmin = log.role === "admin";

          const isStage =
            log.entityType === "journey_stage" ||
            log.action.includes("STAGE") ||
            (log.title && log.title.toLowerCase().includes("stage"));
          const isTask =
            log.entityType === "task" ||
            log.action.includes("TASK") ||
            (log.title && log.title.toLowerCase().includes("task"));
          const isComm =
            log.entityType === "communication" ||
            log.action.includes("MESSAGE") ||
            (log.title && log.title.toLowerCase().includes("message"));
          const isDoc =
            log.entityType === "document" ||
            log.action.includes("DOC") ||
            (log.title && log.title.toLowerCase().includes("document"));

          const affectedStudent = students.find((s) => s.id === log.affectedStudentId);

          return (
            <div
              key={log.id}
              className={`p-5 rounded-2xl border bg-white shadow-card transition-all hover:shadow-elevated flex flex-col md:flex-row md:items-start justify-between gap-4 text-xs ${
                isStage
                  ? "border-emerald-200 bg-gradient-to-r from-emerald-50/20 via-white to-white"
                  : isTask
                  ? "border-blue-200 bg-gradient-to-r from-blue-50/20 via-white to-white"
                  : "border-gvk-border"
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                {/* Actor Avatar */}
                <div className="relative shrink-0 mt-0.5">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-xs ${
                      isCounselor
                        ? "bg-emerald-600"
                        : isStudent
                        ? "bg-blue-600"
                        : isAdmin
                        ? "bg-purple-600"
                        : "bg-gvk-navy"
                    }`}
                  >
                    {(log.userName || log.userId || "U").charAt(0).toUpperCase()}
                  </div>
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  {/* Top Bar: Actor & Category Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-xs font-bold text-gvk-navy">
                      {log.userName || log.userId}
                    </strong>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isCounselor
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : isStudent
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : isAdmin
                          ? "bg-purple-100 text-purple-800 border border-purple-200"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {log.role}
                    </span>

                    {/* Specific Action Domain Badge */}
                    {isStage && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <Compass className="w-3 h-3 text-emerald-600" />
                        Stage Finished
                      </span>
                    )}

                    {isTask && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-300 flex items-center gap-1">
                        <CheckSquare className="w-3 h-3 text-blue-600" />
                        {isStudent ? "Task Tick-Marked" : "Task Verified"}
                      </span>
                    )}

                    {isComm && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-amber-600" />
                        Communication
                      </span>
                    )}

                    {isDoc && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-300 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-purple-600" />
                        Document
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-gvk-navy">
                    {log.title || log.action}
                  </h3>

                  {/* Description */}
                  {log.description && (
                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {log.description}
                    </p>
                  )}

                  {/* Affected Candidate Capsule */}
                  {affectedStudent && (
                    <div className="pt-1 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                      <span>Candidate:</span>
                      <strong className="text-gvk-navy font-bold">
                        {affectedStudent.firstName} {affectedStudent.lastName}
                      </strong>
                      <span className="font-mono text-[10px] text-slate-400">
                        ({affectedStudent.studentIdCode})
                      </span>
                      <span>•</span>
                      <Link
                        href={`/counselor/students/${affectedStudent.id}`}
                        className="text-gvk-navy hover:underline font-bold inline-flex items-center gap-0.5"
                      >
                        <span>Open Workspace</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamp */}
              <div className="shrink-0 text-right self-start md:self-auto font-mono text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span suppressHydrationWarning>
                  {new Date(log.createdAt).toLocaleString("en-IN", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="bg-white rounded-2xl border border-gvk-border p-12 text-center text-slate-400 space-y-2 shadow-card">
            <History className="w-10 h-10 opacity-40 mx-auto text-gvk-navy" />
            <p className="font-bold text-gvk-navy text-sm">No activity records match your filter</p>
            <p className="text-xs">Try selecting &ldquo;All Activities&rdquo; or clearing your search keywords.</p>
          </div>
        )}
      </div>
    </div>
  );
}
