"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  ShieldAlert,
  ArrowRight,
  Eye,
  CheckCircle2,
  Clock,
  Layers,
  Compass,
  CheckSquare,
  Users,
  Lock,
} from "lucide-react";

export default function ActivityLogsPage() {
  const [tick, setTick] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<
    "all" | "stages" | "tasks" | "counselor" | "student" | "admin"
  >("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsub = dataStore.subscribe(() => setTick((t) => t + 1));
    return () => unsub();
  }, []);

  const logs = dataStore.getActivityLogs();
  const students = dataStore.getAllStudents();

  // Category counts
  const counselorCount = logs.filter((l) => l.role === "counselor").length;
  const studentCount = logs.filter((l) => l.role === "student").length;
  const adminCount = logs.filter((l) => l.role === "admin").length;
  const stageCount = logs.filter(
    (l) =>
      l.entityType === "journey_stage" ||
      l.action.includes("STAGE") ||
      (l.title && l.title.toLowerCase().includes("stage"))
  ).length;
  const taskCount = logs.filter(
    (l) =>
      l.entityType === "task" ||
      l.action.includes("TASK") ||
      (l.title && l.title.toLowerCase().includes("task"))
  ).length;

  const entityTypes = useMemo(() => {
    const set = new Set(logs.map((l) => l.entityType || "system"));
    return Array.from(set).sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Quick filter
      if (quickFilter === "counselor" && log.role !== "counselor") return false;
      if (quickFilter === "student" && log.role !== "student") return false;
      if (quickFilter === "admin" && log.role !== "admin") return false;
      if (
        quickFilter === "stages" &&
        log.entityType !== "journey_stage" &&
        !log.action.includes("STAGE") &&
        !(log.title && log.title.toLowerCase().includes("stage"))
      ) {
        return false;
      }
      if (
        quickFilter === "tasks" &&
        log.entityType !== "task" &&
        !log.action.includes("TASK") &&
        !(log.title && log.title.toLowerCase().includes("task"))
      ) {
        return false;
      }

      const title = log.title || log.action || "";
      const desc = log.description || "";
      const userName = log.userName || log.userId || "";

      const matchSearch =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.affectedStudentId && log.affectedStudentId.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchRole = roleFilter === "all" || log.role === roleFilter;

      const ent = log.entityType || "system";
      const matchEntity = entityFilter === "all" || ent === entityFilter;

      return matchSearch && matchRole && matchEntity;
    });
  }, [logs, searchQuery, quickFilter, roleFilter, entityFilter]);

  const handleOpenDetail = (log: any) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        ["Log ID", "Timestamp", "Actor Name", "Role", "Action", "Title", "Entity Type", "Affected Student", "Description"].join(","),
        ...filteredLogs.map((l) =>
          [
            l.id,
            l.createdAt,
            l.userName || l.userId,
            l.role,
            l.action,
            l.title || l.action,
            l.entityType || "system",
            l.affectedStudentId || "N/A",
            l.description || "",
          ]
            .map((val) => `"${val}"`)
            .join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GVK_Audit_Logs_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Institutional Audit Trail & Activity Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable central ledger of administrative overrides, admissions milestones, security logins, and document reviews.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#253775] text-white rounded-lg text-xs font-semibold hover:bg-[#1c2a5e] shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" /> Export Audit CSV
        </button>
      </div>

      {/* Quick Category & Role Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setQuickFilter("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            quickFilter === "all"
              ? "bg-[#253775] text-white shadow-xs"
              : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
          }`}
        >
          All Activities ({logs.length})
        </button>

        <button
          type="button"
          onClick={() => setQuickFilter("stages")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            quickFilter === "stages"
              ? "bg-emerald-700 text-white shadow-xs"
              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Stages Finished ({stageCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setQuickFilter("tasks")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            quickFilter === "tasks"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200"
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Tasks Completed / Ticked ({taskCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setQuickFilter("counselor")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            quickFilter === "counselor"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Counselor Actions ({counselorCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setQuickFilter("student")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            quickFilter === "student"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Student Actions ({studentCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setQuickFilter("admin")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            quickFilter === "admin"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Admin Directives ({adminCount})</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, user name, title, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#253775]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs px-3 py-2 outline-none focus:border-[#253775] bg-white text-slate-700"
          >
            <option value="all">All Actor Roles</option>
            <option value="admin">Super Admin</option>
            <option value="counselor">Counselors</option>
            <option value="student">Students</option>
            <option value="system">System Engine</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs px-3 py-2 outline-none focus:border-[#253775] bg-white text-slate-700"
          >
            <option value="all">All Entity Domains</option>
            {entityTypes.map((ent) => (
              <option key={ent} value={ent}>
                {ent.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Audit Trail Table */}
      <AdminCard
        title="Central Audit Stream"
        subtitle={`Showing ${filteredLogs.length} of ${logs.length} immutable activity records`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action Domain</th>
                <th className="py-3 px-4">Activity Summary</th>
                <th className="py-3 px-4">Affected Candidate</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No activity logs match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const ent = log.entityType || "system";
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleString([], {
                          dateStyle: "short",
                          timeStyle: "medium",
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{log.userName}</div>
                        <span
                          className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                            log.role === "admin"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : log.role === "counselor"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {log.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700">
                            {ent}
                          </span>
                          {(log.entityType === "journey_stage" ||
                            log.action.includes("STAGE") ||
                            (log.title && log.title.toLowerCase().includes("stage"))) && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              <Compass className="w-2.5 h-2.5 text-emerald-600" />
                              Stage Finished
                            </span>
                          )}
                          {(log.entityType === "task" ||
                            log.action.includes("TASK") ||
                            (log.title && log.title.toLowerCase().includes("task"))) && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                              <CheckSquare className="w-2.5 h-2.5 text-blue-600" />
                              Task Action
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="font-bold text-slate-900">{log.title}</div>
                        {log.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {log.description}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {log.affectedStudentId ? (() => {
                          const stu = students.find((s) => s.id === log.affectedStudentId);
                          return (
                            <div>
                              <Link
                                href={`/admin/students/${log.affectedStudentId}`}
                                className="font-bold text-[#253775] hover:underline block"
                              >
                                {stu ? `${stu.firstName} ${stu.lastName}` : log.affectedStudentId}
                              </Link>
                              {stu && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {stu.studentIdCode}
                                </span>
                              )}
                            </div>
                          );
                        })() : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenDetail(log)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-[#253775] hover:text-white text-slate-700 rounded text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {/* INSPECT LOG MODAL */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Audit Log Detail & Telemetry"
        description={`Record ID: ${selectedLog?.id}`}
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-400 font-medium">Recorded At:</span>
              <p className="font-mono font-bold text-slate-800 mt-0.5">
                {selectedLog?.createdAt && new Date(selectedLog.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Actor:</span>
              <p className="font-bold text-slate-800 mt-0.5">
                {selectedLog?.userName} ({selectedLog?.role})
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Action Key:</span>
              <p className="font-mono text-blue-700 font-bold mt-0.5">{selectedLog?.action}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Entity Type:</span>
              <p className="font-mono text-slate-800 font-bold mt-0.5">
                {selectedLog?.entityType || "system"}
              </p>
            </div>
          </div>

          <div>
            <span className="text-slate-500 font-semibold">Title:</span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedLog?.title}</p>
          </div>

          <div>
            <span className="text-slate-500 font-semibold">Description / Remarks:</span>
            <p className="text-slate-700 mt-0.5 p-2 bg-slate-50 rounded border border-slate-100">
              {selectedLog?.description || "No extended narrative recorded for this entry."}
            </p>
          </div>

          {selectedLog?.newValue && (
            <div>
              <span className="text-slate-500 font-semibold">Payload Delta:</span>
              <pre className="mt-1 p-3 bg-slate-900 text-slate-100 rounded-lg text-[11px] overflow-x-auto font-mono">
                {JSON.stringify(selectedLog.newValue, null, 2)}
              </pre>
            </div>
          )}

          <div className="pt-4 flex justify-end border-t border-slate-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-[#253775] text-white rounded-lg text-xs font-semibold hover:bg-[#1c2a5e]"
            >
              Close Inspector
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
