"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  Video,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  ExternalLink,
  Award,
  AlertCircle,
  XCircle,
  FileText,
  UserCheck,
} from "lucide-react";

export default function MockInterviewsPage() {
  const [tick, setTick] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [outcomeFilter, setOutcomeFilter] = useState("all");
  const [studentFilter, setStudentFilter] = useState("all");

  // Modals
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isEvaluateOpen, setIsEvaluateOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<any>(null);

  // Schedule Form
  const [scheduleForm, setScheduleForm] = useState({
    studentId: "",
    counselorId: "",
    title: "Stage 07 University Admissions Readiness Mock Interview",
    scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16),
    durationMinutes: 45,
    instructions: "Please prepare your Statement of Purpose and university background questions. Keep camera on in formal dress.",
    zoomUrl: "https://zoom.us/start/videomeeting",
  });

  // Evaluation Form
  const [evalForm, setEvalForm] = useState({
    outcome: "PASS" as "PASS" | "FAIL",
    strengths: "Articulate explanation of academic trajectory and university course selection.",
    areasForImprovement: "Review post-graduation career plan details and financial sponsorship evidence.",
    communicationScore: 8,
    academicScore: 8,
    visaScore: 9,
    studentVisibleFeedback: "Excellent readiness! Maintain confidence during the official university interview.",
    privateNotes: "Student passed internal institutional quality check.",
  });

  const [notification, setNotification] = useState<string | null>(null);

  // Check URL query parameters and custom admin action events
  useEffect(() => {
    const checkAction = () => {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("action") === "schedule" || urlParams.get("action") === "new") {
          setIsScheduleOpen(true);
        }
      }
    };
    checkAction();

    const handleCustomAction = (e: any) => {
      if (e.detail?.action === "schedule" || e.detail?.action === "new") {
        setIsScheduleOpen(true);
      }
    };
    window.addEventListener("gvk_admin_action", handleCustomAction);
    window.addEventListener("popstate", checkAction);
    return () => {
      window.removeEventListener("gvk_admin_action", handleCustomAction);
      window.removeEventListener("popstate", checkAction);
    };
  }, []);

  useEffect(() => {
    const unsub = dataStore.subscribe(() => setTick((t) => t + 1));
    return () => unsub();
  }, []);

  const interviews = dataStore.getAllMockInterviews();
  const students = dataStore.getAllStudents();
  const counselors = dataStore.getAllCounselors();

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredInterviews = useMemo(() => {
    return interviews.filter((iv) => {
      const matchSearch =
        iv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (iv.studentName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        iv.counselorName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === "all" || iv.status === statusFilter;
      const matchOutcome =
        outcomeFilter === "all" ||
        (outcomeFilter === "pass" && iv.feedback?.outcome === "PASS") ||
        (outcomeFilter === "fail" && iv.feedback?.outcome === "FAIL");
      const matchStudent = studentFilter === "all" || (iv as any).studentId === studentFilter;

      return matchSearch && matchStatus && matchOutcome && matchStudent;
    });
  }, [interviews, searchQuery, statusFilter, outcomeFilter, studentFilter]);

  // KPI Calculations
  const kpiStats = useMemo(() => {
    const total = interviews.length;
    const scheduled = interviews.filter((iv) => iv.status === "scheduled").length;
    const completed = interviews.filter((iv) => iv.status === "completed").length;
    const passes = interviews.filter((iv) => iv.feedback?.outcome === "PASS").length;
    const passRate = completed > 0 ? Math.round((passes / completed) * 100) : 100;
    return { total, scheduled, completed, passRate };
  }, [interviews]);

  const handleOpenSchedule = () => {
    setScheduleForm({
      studentId: students[0]?.id || "",
      counselorId: counselors[0]?.id || "",
      title: "Stage 07 University Admissions Readiness Mock Interview",
      scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16),
      durationMinutes: 45,
      instructions: "Please prepare your Statement of Purpose and university background questions. Keep camera on in formal dress.",
      zoomUrl: "https://zoom.us/start/videomeeting",
    });
    setIsScheduleOpen(true);
  };

  const handleOpenEvaluate = (iv: any) => {
    setSelectedInterview(iv);
    setEvalForm({
      outcome: iv.feedback?.outcome || "PASS",
      strengths: iv.feedback?.strengths || "Articulate explanation of academic trajectory.",
      areasForImprovement: iv.feedback?.areasForImprovement || "Elaborate further on career goals.",
      communicationScore: iv.feedback?.communicationScore || 8,
      academicScore: iv.feedback?.academicClarityScore || 8,
      visaScore: iv.feedback?.visaIntentScore || 9,
      studentVisibleFeedback:
        iv.feedback?.studentVisibleFeedback || "Good performance! Ready for submission.",
      privateNotes: iv.feedback?.counselorPrivateNotes || "",
    });
    setIsEvaluateOpen(true);
  };

  const handleExecuteSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.studentId || !scheduleForm.counselorId) return;

    dataStore.scheduleMockInterview(
      scheduleForm.studentId,
      scheduleForm.counselorId,
      scheduleForm.title,
      scheduleForm.scheduledAt,
      Number(scheduleForm.durationMinutes),
      scheduleForm.instructions,
      scheduleForm.zoomUrl
    );

    setIsScheduleOpen(false);
    showToast(`Mock interview booked for ${scheduleForm.scheduledAt}.`);
  };

  const handleExecuteEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview) return;

    dataStore.evaluateMockInterview(
      selectedInterview.id,
      "usr-admin-01",
      evalForm.outcome,
      evalForm.strengths,
      evalForm.areasForImprovement,
      Number(evalForm.communicationScore),
      Number(evalForm.academicScore),
      Number(evalForm.visaScore),
      evalForm.studentVisibleFeedback,
      evalForm.privateNotes
    );

    setIsEvaluateOpen(false);
    showToast(
      `Evaluation committed: ${evalForm.outcome.toUpperCase()} for ${selectedInterview.studentName}.`
    );
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
            Mock Admissions & Visa Interview Desk
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Conduct video practice sessions, admissions readiness assessments, and PASS/FAIL quality checks for university committees.
          </p>
        </div>
        <button
          onClick={handleOpenSchedule}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#253775] text-white rounded-lg text-xs font-semibold hover:bg-[#1c2a5e] shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Schedule Mock Interview
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Total Interviews
            </span>
            <Video className="w-4 h-4 text-[#253775]" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{kpiStats.total}</div>
          <p className="text-[11px] text-slate-400 mt-1">Registered mock sessions</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 uppercase">Upcoming</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-2">{kpiStats.scheduled}</div>
          <p className="text-[11px] text-blue-600 mt-1">Booked on video calendar</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{kpiStats.completed}</div>
          <p className="text-[11px] text-emerald-600 mt-1">Evaluated with feedback</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-700 uppercase">Pass Rate</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700 mt-2">{kpiStats.passRate}%</div>
          <p className="text-[11px] text-purple-600 mt-1">Institutional readiness rate</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search interview by student, interviewer, or title..."
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
            <option value="scheduled">Scheduled / Upcoming</option>
            <option value="completed">Completed & Evaluated</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs px-3 py-2 outline-none focus:border-[#253775] bg-white text-slate-700"
          >
            <option value="all">All Outcomes</option>
            <option value="pass">PASS Only</option>
            <option value="fail">FAIL Only</option>
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

      {/* Main Interviews Table */}
      <AdminCard
        title="Mock Interview Sessions"
        subtitle={`Showing ${filteredInterviews.length} of ${interviews.length} practice interviews`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Interview Title</th>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Evaluator</th>
                <th className="py-3 px-4">Schedule</th>
                <th className="py-3 px-4">Meeting Link</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInterviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No mock interviews match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredInterviews.map((iv) => (
                  <tr key={iv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-bold text-slate-900">{iv.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {iv.instructions}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {iv.studentName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {iv.counselorName}
                    </td>
                    <td suppressHydrationWarning className="py-3.5 px-4 text-slate-600">
                      <div suppressHydrationWarning className="font-medium">{new Date(iv.scheduledAt).toLocaleDateString()}</div>
                      <div suppressHydrationWarning className="text-[11px] text-slate-400">
                        {new Date(iv.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ({iv.durationMinutes}m)
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {iv.zoomMeetingUrl ? (
                        <a
                          href={iv.zoomMeetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline font-mono text-[11px]"
                        >
                          Join Zoom <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">No link</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {iv.feedback ? (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            iv.feedback.outcome === "PASS"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {iv.feedback.outcome.toUpperCase()} (
                          {iv.feedback.communicationScore}/10)
                        </span>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            iv.status === "scheduled"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {iv.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEvaluate(iv)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#253775] text-white hover:bg-[#1c2a5e] rounded text-xs font-semibold shadow-sm transition-colors"
                        >
                          <Award className="w-3 h-3" />
                          Evaluate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {/* SCHEDULE MODAL */}
      <AdminModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        title="Schedule Mock Interview"
        description="Book a dedicated practice video session between candidate and admissions interviewer."
      >
        <form onSubmit={handleExecuteSchedule} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Candidate</label>
              <select
                required
                value={scheduleForm.studentId}
                onChange={(e) => setScheduleForm({ ...scheduleForm, studentId: e.target.value })}
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
                Interviewer / Counselor
              </label>
              <select
                required
                value={scheduleForm.counselorId}
                onChange={(e) => setScheduleForm({ ...scheduleForm, counselorId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white text-slate-800"
              >
                {counselors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.employeeId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Interview Title
            </label>
            <input
              type="text"
              required
              value={scheduleForm.title}
              onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={scheduleForm.scheduledAt}
                onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Duration (Minutes)
              </label>
              <select
                value={scheduleForm.durationMinutes}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, durationMinutes: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white text-slate-800"
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes (Standard)</option>
                <option value={60}>60 Minutes (Comprehensive)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Zoom / Video Room URL
            </label>
            <input
              type="url"
              required
              value={scheduleForm.zoomUrl}
              onChange={(e) => setScheduleForm({ ...scheduleForm, zoomUrl: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Instructions for Student
            </label>
            <textarea
              rows={2}
              value={scheduleForm.instructions}
              onChange={(e) => setScheduleForm({ ...scheduleForm, instructions: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsScheduleOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#253775] text-white rounded-lg text-xs font-semibold hover:bg-[#1c2a5e]"
            >
              Confirm Schedule
            </button>
          </div>
        </form>
      </AdminModal>

      {/* EVALUATE MODAL */}
      <AdminModal
        isOpen={isEvaluateOpen}
        onClose={() => setIsEvaluateOpen(false)}
        title={`Evaluate Interview: ${selectedInterview?.studentName}`}
        description="Record readiness scorecard and official pass/fail outcome for university admissions."
      >
        <form onSubmit={handleExecuteEvaluate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Readiness Outcome
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEvalForm({ ...evalForm, outcome: "PASS" })}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                  evalForm.outcome === "PASS"
                    ? "bg-emerald-500 text-white border-emerald-600 shadow-sm"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                ✓ PASS (Cleared for Submission)
              </button>
              <button
                type="button"
                onClick={() => setEvalForm({ ...evalForm, outcome: "FAIL" })}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                  evalForm.outcome === "FAIL"
                    ? "bg-red-500 text-white border-red-600 shadow-sm"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                ✕ RETAKE REQUIRED
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Communication (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={evalForm.communicationScore}
                onChange={(e) =>
                  setEvalForm({ ...evalForm, communicationScore: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Academic Clarity (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={evalForm.academicScore}
                onChange={(e) =>
                  setEvalForm({ ...evalForm, academicScore: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Visa Intent (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={evalForm.visaScore}
                onChange={(e) => setEvalForm({ ...evalForm, visaScore: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Key Strengths</label>
            <textarea
              rows={2}
              value={evalForm.strengths}
              onChange={(e) => setEvalForm({ ...evalForm, strengths: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Areas for Improvement
            </label>
            <textarea
              rows={2}
              value={evalForm.areasForImprovement}
              onChange={(e) => setEvalForm({ ...evalForm, areasForImprovement: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Student-Visible Feedback
            </label>
            <textarea
              rows={2}
              value={evalForm.studentVisibleFeedback}
              onChange={(e) =>
                setEvalForm({ ...evalForm, studentVisibleFeedback: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsEvaluateOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#253775] text-white rounded-lg text-xs font-semibold hover:bg-[#1c2a5e]"
            >
              Commit Evaluation
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
