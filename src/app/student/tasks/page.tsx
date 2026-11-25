"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { TaskItem } from "@/types/domain";
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  User,
  Building,
  CheckCircle2,
  Send,
  X,
  FileText,
  Video,
  ExternalLink,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export default function StudentTasksPage() {
  const { user } = useCurrentUser();
  const studentId = user?.role === "student" ? user.id : "usr-student-01";

  const [tasks, setTasks] = useState<TaskItem[]>(() =>
    dataStore.getStudentTasks(studentId, false)
  );
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "submitted" | "completed">("all");
  const [submittingTask, setSubmittingTask] = useState<TaskItem | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Subscribe to real-time store updates across tabs & counselor portal actions
  useEffect(() => {
    setTasks(dataStore.getStudentTasks(studentId, false));
    const unsubscribe = dataStore.subscribe(() => {
      setTasks(dataStore.getStudentTasks(studentId, false));
    });
    return () => unsubscribe();
  }, [studentId]);

  const filteredTasks = tasks.filter((t) => {
    // Hide counseling session tasks from student actionable task list (conducted offline & counselor-managed)
    if (t.title.toLowerCase().includes("counseling") || (t as any).relatedStageNumber === 1) return false;
    if (activeFilter === "all") return true;
    if (activeFilter === "pending") return t.status === "pending" || t.status === "in_progress";
    if (activeFilter === "submitted") return t.status === "submitted" || t.status === "under_review";
    if (activeFilter === "completed") return t.status === "completed";
    return true;
  });

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingTask) return;

    dataStore.submitStudentTask(submittingTask.id, studentId, submissionNotes);
    setTasks(dataStore.getStudentTasks(studentId, false));
    setIsSuccess(true);

    setTimeout(() => {
      setSubmittingTask(null);
      setIsSuccess(false);
      setSubmissionNotes("");
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-lg bg-gvk-navy-50 text-gvk-navy">
                <CheckSquare className="w-5 h-5 text-gvk-navy" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-gvk-navy tracking-tight">
                My Assigned Tasks
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gvk-text-secondary">
              Action items assigned by your GVK counselor to keep your university applications on schedule.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-2.5 px-3.5 rounded-xl border border-gvk-border text-xs">
            <span className="text-gvk-text-secondary">Pending Action:</span>
            <span className="font-bold text-gvk-navy font-mono">
              {tasks.filter((t) => t.status === "pending" || t.status === "in_progress").length}
            </span>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-gvk-border">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeFilter === "all" ? "bg-gvk-navy text-white shadow-xs" : "bg-slate-100 text-gvk-text-secondary hover:bg-slate-200"
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveFilter("pending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeFilter === "pending" ? "bg-gvk-navy text-white shadow-xs" : "bg-slate-100 text-gvk-text-secondary hover:bg-slate-200"
            }`}
          >
            Pending / In Progress ({tasks.filter((t) => t.status === "pending" || t.status === "in_progress").length})
          </button>
          <button
            onClick={() => setActiveFilter("submitted")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeFilter === "submitted" ? "bg-blue-600 text-white shadow-xs" : "bg-slate-100 text-gvk-text-secondary hover:bg-slate-200"
            }`}
          >
            Submitted for Review ({tasks.filter((t) => t.status === "submitted" || t.status === "under_review").length})
          </button>
          <button
            onClick={() => setActiveFilter("completed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeFilter === "completed" ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 text-gvk-text-secondary hover:bg-slate-200"
            }`}
          >
            Completed ({tasks.filter((t) => t.status === "completed").length})
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => {
          const isPending = task.status === "pending" || task.status === "in_progress";
          const isSubmitted = task.status === "submitted" || task.status === "under_review";
          const isCompleted = task.status === "completed";
          const isCounselorSignoff = task.completionType === "counselor_signoff";

          return (
            <div
              key={task.id}
              className={`p-5 rounded-2xl border bg-white shadow-card transition-all flex flex-col justify-between gap-4 ${
                task.priority === "urgent" && isPending
                  ? "border-gvk-red/40 bg-gradient-to-r from-white via-white to-red-50/20"
                  : "border-gvk-border hover:border-slate-300"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge type="priority" status={task.priority} />
                    <StatusBadge type="task" status={task.status} />
                    {isCounselorSignoff && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-amber-600" />
                        Counselor-Verified Milestone
                      </span>
                    )}
                    {task.isOverdue && isPending && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-gvk-red border border-red-200">
                        Overdue
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-gvk-navy leading-snug">
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="text-xs text-gvk-text-secondary leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gvk-text-secondary pt-2">
                    <span className="flex items-center gap-1 font-medium">
                      <User className="w-3.5 h-3.5 text-gvk-text-muted" />
                      Assigned by: <strong className="text-gvk-text-primary">{task.assignedByName}</strong>
                    </span>
                    <span className="flex items-center gap-1 font-bold text-gvk-text-primary">
                      <Clock className="w-3.5 h-3.5 text-gvk-navy" />
                      Due Date: {task.dueDate}
                    </span>
                    {task.applicationName && (
                      <span className="flex items-center gap-1 text-gvk-navy font-semibold">
                        <Building className="w-3.5 h-3.5" />
                        {task.applicationName}
                      </span>
                    )}
                  </div>

                  {task.studentNotes && (
                    <div className="mt-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-gvk-text-secondary">
                      <strong className="text-gvk-navy font-bold">Your Submission Note:</strong> {task.studentNotes}
                    </div>
                  )}
                </div>

                {/* Right Action Column */}
                <div className="shrink-0 self-start sm:self-center">
                  {isPending && (
                    <>
                      {isCounselorSignoff ? (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-bold text-amber-800 bg-amber-100/90 px-3 py-1.5 rounded-lg border border-amber-300 flex items-center gap-1.5 shadow-xs">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            <span>Awaiting Counselor Sign-off</span>
                          </span>
                          <span className="text-[10px] text-gvk-text-muted">Counselor verifies upon session</span>
                        </div>
                      ) : (
                        <Button
                          onClick={() => {
                            setSubmittingTask(task);
                            setSubmissionNotes("");
                            setIsSuccess(false);
                          }}
                          variant={task.priority === "urgent" ? "primaryRed" : "default"}
                          size="sm"
                          className="font-bold flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Task</span>
                        </Button>
                      )}
                    </>
                  )}
                  {isSubmitted && (
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                      Awaiting Counselor Verification
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 shadow-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Verified Complete by {task.assignedByName}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Submission Modal (only for student-submitted tasks) */}
      {submittingTask && submittingTask.completionType !== "counselor_signoff" && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-gvk-border shadow-2xl p-6 sm:p-8">
            <div className="flex items-start justify-between pb-4 border-b border-gvk-border">
              <div>
                <h3 className="text-lg font-bold text-gvk-navy">
                  Submit Task for Review
                </h3>
                <p className="text-xs text-gvk-text-secondary mt-0.5">
                  {submittingTask.title}
                </p>
              </div>
              <button
                onClick={() => setSubmittingTask(null)}
                className="p-2 rounded-lg hover:bg-slate-100 text-gvk-text-secondary min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSuccess ? (
              <div className="py-8 text-center">
                <div className="w-14 h-14 rounded-full bg-gvk-success-light text-gvk-success flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-gvk-navy mb-1">Task Submitted!</h4>
                <p className="text-xs text-gvk-text-secondary">
                  Your counselor has been notified to verify your completed task.
                </p>
              </div>
            ) : (
              <form onSubmit={handleTaskSubmit} className="space-y-4 py-4">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-gvk-text-secondary">
                  <p>
                    <strong>Instructions:</strong> {submittingTask.description || "Please submit your completed deliverable or remarks."}
                  </p>
                  <p className="mt-1">
                    Due Date: <strong className={submittingTask.priority === "urgent" ? "text-red-600 font-bold" : "text-gvk-navy"}>{submittingTask.dueDate}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gvk-text-primary mb-1.5">
                    Submission Notes / Confirmation Details
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide details on how you completed this task or mention any uploaded document references..."
                    value={submissionNotes}
                    onChange={(e) => setSubmissionNotes(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gvk-border text-xs focus:ring-2 focus:ring-gvk-navy focus:outline-none"
                    required
                  />
                </div>

                <div className="pt-3 border-t border-gvk-border flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSubmittingTask(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="font-bold">
                    Confirm Submission
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
