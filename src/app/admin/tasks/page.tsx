"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  ExternalLink,
  Edit,
  UserCheck,
  AlertTriangle,
} from "lucide-react";

export default function TasksManagementPage() {
  const [tick, setTick] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [studentFilter, setStudentFilter] = useState("all");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // New Task Form
  const [newTaskForm, setNewTaskForm] = useState({
    studentId: "",
    title: "",
    description: "",
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
    priority: "high" as "urgent" | "high" | "medium" | "low",
    isInternal: false,
  });

  // Update Status Form
  const [updateStatus, setUpdateStatus] = useState<"pending" | "in_progress" | "submitted" | "completed">("completed");
  const [adminNotes, setAdminNotes] = useState("");

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const unsub = dataStore.subscribe(() => setTick((t) => t + 1));
    return () => unsub();
  }, []);

  const tasks = dataStore.getAllPlatformTasks();
  const students = dataStore.getAllStudents();
  const counselors = dataStore.getAllCounselors();

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const today = new Date().toISOString().split("T")[0];

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.studentIdCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchStatus = true;
      if (statusFilter === "overdue") {
        matchStatus = t.isOverdue;
      } else if (statusFilter !== "all") {
        matchStatus = t.status === statusFilter;
      }

      const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
      const matchStudent = studentFilter === "all" || t.studentId === studentFilter;

      return matchSearch && matchStatus && matchPriority && matchStudent;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, studentFilter]);

  // KPI Calculations
  const kpiStats = useMemo(() => {
    const total = tasks.length;
    const overdue = tasks.filter((t) => t.isOverdue).length;
    const inProgress = tasks.filter((t) => t.status === "in_progress" || t.status === "pending").length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    return { total, overdue, inProgress, completed };
  }, [tasks]);

  const handleOpenAdd = () => {
    setNewTaskForm({
      studentId: students[0]?.id || "",
      title: "",
      description: "",
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
      priority: "high",
      isInternal: false,
    });
    setIsAddOpen(true);
  };

  const handleOpenUpdate = (task: any) => {
    setSelectedTask(task);
    setUpdateStatus(task.status === "completed" ? "completed" : "completed");
    setAdminNotes(task.studentSubmissionNotes || "");
    setIsUpdateOpen(true);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskForm.studentId || !newTaskForm.title) return;

    dataStore.createTask(
      newTaskForm.studentId,
      newTaskForm.title,
      newTaskForm.description,
      newTaskForm.dueDate,
      newTaskForm.priority,
      "usr-admin-01",
      newTaskForm.isInternal
    );

    setIsAddOpen(false);
    showToast(`Task "${newTaskForm.title}" dispatched successfully.`);
  };

  const handleCommitStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    dataStore.updateTaskStatus(selectedTask.id, updateStatus, adminNotes);
    setIsUpdateOpen(false);
    showToast(`Task status updated to "${updateStatus}".`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Institutional Task & Follow-up Desk
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Task distribution engine across candidates and counselors, tracking deadlines, document requests, and urgent follow-ups.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#253775] text-white rounded-lg text-xs font-semibold hover:bg-[#1c2a5e] shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Assign New Task
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Total Action Items
            </span>
            <CheckSquare className="w-4 h-4 text-[#253775]" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{kpiStats.total}</div>
          <p className="text-[11px] text-slate-400 mt-1">Tracked across all candidates</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-700 uppercase">Overdue Tasks</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-700 mt-2">{kpiStats.overdue}</div>
          <p className="text-[11px] text-red-600 mt-1">Past scheduled due dates</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 uppercase">
              Pending / In Progress
            </span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-2">{kpiStats.inProgress}</div>
          <p className="text-[11px] text-blue-600 mt-1">Active items pending completion</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase">
              Completed Tasks
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{kpiStats.completed}</div>
          <p className="text-[11px] text-emerald-600 mt-1">Signed off and verified</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks by title, student name, or instructions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#253775]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs px-3 py-2 outline-none focus:border-[#253775] bg-white text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="overdue">Overdue Items ({kpiStats.overdue})</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="submitted">Submitted for Signoff</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs px-3 py-2 outline-none focus:border-[#253775] bg-white text-slate-700"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <select
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs px-3 py-2 outline-none focus:border-[#253775] bg-white text-slate-700 max-w-[180px]"
          >
            <option value="all">All Candidates</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Tasks Table */}
      <AdminCard
        title="Tasks Master Directory"
        subtitle={`Showing ${filteredTasks.length} of ${tasks.length} action items`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Task Deliverable</th>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Assigned By</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No tasks match your search or filter selection.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-bold text-slate-900">{t.title}</div>
                      {t.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {t.description}
                        </p>
                      )}
                      {t.isCounselorInternal && (
                        <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 uppercase">
                          Internal Desk Note
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/admin/students/${t.studentId}`}
                        className="font-bold text-slate-800 hover:text-[#253775]"
                      >
                        {t.studentName}
                      </Link>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {t.studentIdCode}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {t.counselorName || "Admissions Desk"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold ${
                          t.isOverdue ? "text-red-600 font-bold" : "text-slate-700"
                        }`}
                      >
                        {t.dueDate}
                      </span>
                      {t.isOverdue && (
                        <div className="text-[10px] text-red-600 font-bold uppercase">
                          Overdue
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          t.priority === "urgent"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : t.priority === "high"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          t.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : t.status === "submitted"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenUpdate(t)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-[#253775] hover:text-white text-slate-700 rounded text-xs font-semibold transition-colors"
                        >
                          <Edit className="w-3 h-3" />
                          Update
                        </button>
                        <Link
                          href={`/admin/students/${t.studentId}`}
                          className="p-1 text-slate-400 hover:text-[#253775]"
                          title="Open Student Profile"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {/* CREATE TASK MODAL */}
      <AdminModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Assign Candidate Action Item"
        description="Dispatch a mandatory deliverable or follow-up task to a student candidate."
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Candidate
            </label>
            <select
              required
              value={newTaskForm.studentId}
              onChange={(e) => setNewTaskForm({ ...newTaskForm, studentId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white text-slate-800"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.studentId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Task Title / Action Item
            </label>
            <input
              type="text"
              required
              value={newTaskForm.title}
              onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
              placeholder="e.g. Upload Final Semester Transcripts with University Seal"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Instructions
            </label>
            <textarea
              rows={3}
              value={newTaskForm.description}
              onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
              placeholder="Provide exact guidelines, format requirements, and next steps for the student..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                required
                value={newTaskForm.dueDate}
                onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={newTaskForm.priority}
                onChange={(e) =>
                  setNewTaskForm({
                    ...newTaskForm,
                    priority: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white text-slate-800"
              >
                <option value="urgent">Urgent (48-hr Deadline)</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isInternal"
                checked={newTaskForm.isInternal}
                onChange={(e) =>
                  setNewTaskForm({ ...newTaskForm, isInternal: e.target.checked })
                }
                className="w-4 h-4 text-[#253775] rounded border-slate-300"
              />
              <label htmlFor="isInternal" className="text-xs font-medium text-slate-700">
                Internal Counselor Reminder (do not notify student)
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#253775] text-white rounded-lg text-xs font-semibold hover:bg-[#1c2a5e]"
            >
              Dispatch Task
            </button>
          </div>
        </form>
      </AdminModal>

      {/* UPDATE TASK STATUS MODAL */}
      <AdminModal
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
        title={`Update Task: ${selectedTask?.title}`}
        description={`Candidate: ${selectedTask?.studentName} (${selectedTask?.studentIdCode})`}
      >
        <form onSubmit={handleCommitStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Status
            </label>
            <select
              value={updateStatus}
              onChange={(e) => setUpdateStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white text-slate-800"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="submitted">Submitted for Sign-off</option>
              <option value="completed">Completed & Verified</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admin / Sign-off Remarks
            </label>
            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. Transcripts verified with original degree issuing university registrar..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsUpdateOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#253775] text-white rounded-lg text-xs font-semibold hover:bg-[#1c2a5e]"
            >
              Commit Status Update
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
