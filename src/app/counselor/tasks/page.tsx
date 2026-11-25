"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskPriority } from "@/types/database.types";
import {
  CheckSquare,
  Plus,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  Building,
} from "lucide-react";

export default function CounselorTasksPage() {
  const { user } = useCurrentUser();
  const counselorId = user?.role === "counselor" ? user.id : "usr-counselor-01";

  const [assignedStudents, setAssignedStudents] = useState(() => dataStore.getAssignedStudents(counselorId));
  const [tasks, setTasks] = useState(() => dataStore.getAllCounselorTasks(counselorId));

  const [createModal, setCreateModal] = useState(false);
  const [targetStudentId, setTargetStudentId] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [dueDate, setDueDate] = useState("2026-11-28");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [isInternal, setIsInternal] = useState(false);

  // Subscribe to real-time store updates
  useEffect(() => {
    const students = dataStore.getAssignedStudents(counselorId);
    setAssignedStudents(students);
    setTasks(dataStore.getAllCounselorTasks(counselorId));
    if (students.length > 0) {
      setTargetStudentId(students[0].id);
    }

    const unsubscribe = dataStore.subscribe(() => {
      const liveStudents = dataStore.getAssignedStudents(counselorId);
      setAssignedStudents(liveStudents);
      setTasks(dataStore.getAllCounselorTasks(counselorId));
      if (liveStudents.length > 0 && !targetStudentId) {
        setTargetStudentId(liveStudents[0].id);
      }
    });
    return () => unsubscribe();
  }, [counselorId]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    dataStore.createTask(
      targetStudentId,
      title,
      desc,
      dueDate,
      priority,
      counselorId,
      isInternal
    );
    setTasks(dataStore.getAllCounselorTasks(counselorId));
    setCreateModal(false);
    setTitle("");
    setDesc("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-lg bg-gvk-navy-50 text-gvk-navy">
                <CheckSquare className="w-5 h-5 text-gvk-navy" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-gvk-navy tracking-tight">
                Task Dispatcher & Monitor ({tasks.length})
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gvk-text-secondary">
              Assign deliverables to candidates or create private counselor reminders with deadlines.
            </p>
          </div>

          <Button
            onClick={() => setCreateModal(true)}
            size="sm"
            className="font-bold flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Assign New Task</span>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gvk-border p-12 text-center shadow-card">
            <CheckSquare className="w-10 h-10 opacity-40 mx-auto mb-3 text-gvk-navy" />
            <h3 className="text-base font-bold text-gvk-navy">No Tasks in Queue</h3>
            <p className="text-xs text-gvk-text-secondary mt-1 max-w-sm mx-auto">
              {assignedStudents.length === 0
                ? "Your desk is fresh and ready. When candidates are allocated to you by administration, their onboarding deliverables will appear here."
                : "All assigned deliverables are up to date! You can assign a new task using the button above."}
            </p>
          </div>
        ) : (
          tasks.map((task) => (
          <div
            key={task.id}
            className="p-5 rounded-2xl border border-gvk-border bg-white shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
          >
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge type="priority" status={task.priority} />
                <StatusBadge type="task" status={task.status} />
                {task.title.toLowerCase().includes("counseling") && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                    <Building className="w-3 h-3 text-blue-600" />
                    Offline In-Person Milestone
                  </span>
                )}
                {((task as any).completionType === "counselor_signoff" || task.title.toLowerCase().includes("counseling session")) && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-600" />
                    Counselor Sign-off Required
                  </span>
                )}
                {task.isCounselorInternal && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    🔒 Counselor Internal
                  </span>
                )}
                {task.isOverdue && task.status !== "completed" && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-gvk-red border border-red-200">
                    Overdue
                  </span>
                )}
              </div>

              <strong className="text-base font-bold text-gvk-navy block">
                {task.title}
              </strong>
              {task.description && <p className="text-gvk-text-secondary">{task.description}</p>}

              <div className="flex flex-wrap items-center gap-4 text-xs text-gvk-text-secondary pt-1">
                <span>Student: <strong className="text-gvk-navy">{task.studentName}</strong></span>
                <span>Due: <strong className={task.priority === "urgent" ? "text-red-600 font-bold" : "text-gvk-navy"}>{task.dueDate}</strong></span>
              </div>

              {task.studentSubmissionNotes && (
                <div className="p-2 rounded bg-slate-50 border border-slate-200 text-gvk-navy">
                  Candidate Submission: {task.studentSubmissionNotes}
                </div>
              )}
            </div>

            <div className="shrink-0 self-end sm:self-center">
              {task.status !== "completed" ? (
                <Button
                  onClick={() => {
                    dataStore.completeTaskByCounselor(task.id, counselorId);
                    setTasks(dataStore.getAllCounselorTasks(counselorId));
                  }}
                  size="sm"
                  className="font-bold text-xs bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {task.title.toLowerCase().includes("counseling")
                      ? "Mark In-Person Session Completed"
                      : "Sign Off & Complete"}
                  </span>
                </Button>
              ) : (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {task.title.toLowerCase().includes("counseling")
                      ? "In-Person Session Verified & Completed"
                      : "Verified Complete"}
                  </span>
                </span>
              )}
            </div>
          </div>
        ))
      )}
      </div>

      {/* Modal */}
      {createModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gvk-border shadow-2xl p-6">
            <h3 className="text-lg font-bold text-gvk-navy mb-1">Assign Task</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs mt-3">
              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Student</label>
                <select
                  value={targetStudentId}
                  onChange={(e) => setTargetStudentId(e.target.value)}
                  className="w-full h-10 px-3 rounded border border-gvk-border bg-white"
                >
                  {assignedStudents.map((s) => (
                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>

              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Due Date</label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
              </div>

              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full h-10 px-3 rounded border border-gvk-border bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Instructions</label>
                <textarea rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full p-2 rounded border border-gvk-border" />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="internalModalCheck" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} />
                <label htmlFor="internalModalCheck" className="font-semibold text-gvk-text-secondary">Internal reminder (Hidden from student)</label>
              </div>

              <div className="pt-3 border-t border-gvk-border flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setCreateModal(false)}>Cancel</Button>
                <Button type="submit" size="sm" className="font-bold">Assign Task</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
