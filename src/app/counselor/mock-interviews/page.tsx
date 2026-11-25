"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MockInterviewOutcome } from "@/types/database.types";
import {
  Video,
  Plus,
  Calendar,
  Clock,
  ExternalLink,
  Award,
  CheckCircle2,
  X,
  Sparkles,
  Copy,
  Check,
  Edit3,
  ShieldCheck,
  Link2,
  Info,
  XCircle,
  AlertTriangle,
  CalendarX,
} from "lucide-react";

export default function CounselorMockInterviewsPage() {
  const { user } = useCurrentUser();
  const counselorId = user?.role === "counselor" ? user.id : "usr-counselor-01";

  const [assignedStudents, setAssignedStudents] = useState(() => dataStore.getAssignedStudents(counselorId));
  const [interviews, setInterviews] = useState(() => dataStore.getAllMockInterviews(counselorId));

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Counselor Default Real Zoom Configuration State
  const counselorDefaultZoom = dataStore.getCounselorDefaultZoom(counselorId);
  const [globalZoomUrl, setGlobalZoomUrl] = useState(counselorDefaultZoom.zoomUrl);
  const [globalMeetingId, setGlobalMeetingId] = useState(counselorDefaultZoom.meetingId);
  const [globalPasscode, setGlobalPasscode] = useState(counselorDefaultZoom.passcode);
  const [isSavedBanner, setIsSavedBanner] = useState(false);

  // Schedule Modal State
  const [scheduleModal, setScheduleModal] = useState(false);
  const [targetStudentId, setTargetStudentId] = useState("");
  const [title, setTitle] = useState("University Readiness Mock Interview");
  const [date, setDate] = useState("2026-11-20T16:00");
  const [zoomUrl, setZoomUrl] = useState(globalZoomUrl);
  const [instructions, setInstructions] = useState("Prepare for questions on course syllabus and career objectives.");

  useEffect(() => {
    const students = dataStore.getAssignedStudents(counselorId);
    setAssignedStudents(students);
    setInterviews(dataStore.getAllMockInterviews(counselorId));
    const defaultZoom = dataStore.getCounselorDefaultZoom(counselorId);
    setGlobalZoomUrl(defaultZoom.zoomUrl);
    setGlobalMeetingId(defaultZoom.meetingId);
    setGlobalPasscode(defaultZoom.passcode);
    if (students.length > 0) {
      setTargetStudentId(students[0].id);
    }

    const unsubscribe = dataStore.subscribe(() => {
      const liveStudents = dataStore.getAssignedStudents(counselorId);
      setAssignedStudents(liveStudents);
      setInterviews(dataStore.getAllMockInterviews(counselorId));
      if (liveStudents.length > 0 && !targetStudentId) {
        setTargetStudentId(liveStudents[0].id);
      }
    });
    return () => unsubscribe();
  }, [counselorId]);

  const handleSaveGlobalZoom = (e: React.FormEvent) => {
    e.preventDefault();
    dataStore.updateCounselorDefaultZoom(
      counselorId,
      globalZoomUrl,
      globalMeetingId,
      globalPasscode
    );
    setInterviews([...dataStore.getAllMockInterviews(counselorId)]);
    setIsSavedBanner(true);
    setTimeout(() => setIsSavedBanner(false), 3000);
  };

  const openScheduleModal = () => {
    setZoomUrl(globalZoomUrl);
    setScheduleModal(true);
  };

  // Edit Zoom Link Modal State
  const [editZoomModal, setEditZoomModal] = useState<any | null>(null);
  const [editZoomUrl, setEditZoomUrl] = useState("");
  const [editMeetingId, setEditMeetingId] = useState("");
  const [editPasscode, setEditPasscode] = useState("");

  const openEditZoomModal = (interview: any) => {
    setEditZoomModal(interview);
    setEditZoomUrl(interview.zoomMeetingUrl || "https://zoom.us/test");
    setEditMeetingId(interview.zoomMeetingId || "984 9012 3456");
    setEditPasscode(interview.zoomPasscode || "GVK2026");
  };

  const handleUpdateZoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editZoomModal) return;
    dataStore.updateMockInterviewZoom(
      editZoomModal.id,
      counselorId,
      editZoomUrl,
      editMeetingId,
      editPasscode
    );
    setInterviews([...dataStore.getAllMockInterviews()]);
    setEditZoomModal(null);
  };

  // Cancel Interview Modal State
  const [cancelModal, setCancelModal] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState("Schedule conflict — will reschedule shortly");

  const openCancelModal = (interview: any) => {
    setCancelModal(interview);
    setCancelReason("Schedule conflict — will reschedule shortly");
  };

  const handleCancelInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModal) return;
    dataStore.cancelMockInterview(cancelModal.id, counselorId, cancelReason);
    setInterviews([...dataStore.getAllMockInterviews()]);
    setCancelModal(null);
  };

  // Evaluation Modal State
  const [evalModal, setEvalModal] = useState<any | null>(null);
  const [outcome, setOutcome] = useState<MockInterviewOutcome>("PASS");
  const [strengths, setStrengths] = useState("Articulate responses and strong project background.");
  const [improvements, setImprovements] = useState("Review UK post-study work visa rules.");
  const [feedback, setFeedback] = useState("Excellent progress! Ready for admissions interview.");
  const [privateNote, setPrivateNote] = useState("Strong candidate.");

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    dataStore.scheduleMockInterview(
      targetStudentId,
      counselorId,
      title,
      date,
      30,
      instructions,
      zoomUrl
    );
    setInterviews([...dataStore.getAllMockInterviews()]);
    setScheduleModal(false);
  };

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalModal) return;

    dataStore.evaluateMockInterview(
      evalModal.id,
      counselorId,
      outcome,
      strengths,
      improvements,
      8,
      9,
      8,
      feedback,
      privateNote
    );
    setInterviews([...dataStore.getAllMockInterviews()]);
    setEvalModal(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-lg bg-gvk-navy-50 text-gvk-navy">
                <Video className="w-5 h-5 text-gvk-navy" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-gvk-navy tracking-tight">
                Mock Interview Assessments
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gvk-text-secondary">
              Conduct video assessments, assign Zoom sessions, and record PASS / FAIL credibility outcomes.
            </p>
          </div>

          <Button
            onClick={openScheduleModal}
            variant="default"
            size="sm"
            className="font-bold flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Interview</span>
          </Button>
        </div>
      </div>

      {/* Real Zoom Meeting Room Configuration Panel */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-lg space-y-3.5 border border-blue-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/20">
              <Video className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Counselor Real Zoom Meeting Room Configuration
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Direct Real Access
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Set your personal Zoom meeting room or launch instant live sessions. Synchronizes across all student portals.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={globalZoomUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-md"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Launch Live Meeting</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <form onSubmit={handleSaveGlobalZoom} className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
          <div className="md:col-span-6 space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-200">Real Zoom Meeting URL</label>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setGlobalZoomUrl("https://zoom.us/start/videomeeting")}
                  className="text-blue-300 hover:text-white underline font-bold"
                >
                  Direct Real Launcher
                </button>
                <span className="text-slate-500">•</span>
                <button
                  type="button"
                  onClick={() => setGlobalZoomUrl("https://zoom.us/test")}
                  className="text-blue-300 hover:text-white underline font-bold"
                >
                  Zoom Test Room
                </button>
              </div>
            </div>
            <Input
              type="url"
              value={globalZoomUrl}
              onChange={(e) => setGlobalZoomUrl(e.target.value)}
              placeholder="https://zoom.us/start/videomeeting or https://us04web.zoom.us/j/..."
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/15 h-9"
              required
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="font-bold text-slate-200">Meeting ID</label>
            <Input
              value={globalMeetingId}
              onChange={(e) => setGlobalMeetingId(e.target.value)}
              placeholder="984 9012 3456"
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/15 h-9 font-mono"
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="font-bold text-slate-200">Passcode</label>
            <Input
              value={globalPasscode}
              onChange={(e) => setGlobalPasscode(e.target.value)}
              placeholder="GVK2026"
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/15 h-9 font-mono"
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <Button
              type="submit"
              size="sm"
              className="w-full h-9 font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 shadow-md"
            >
              {isSavedBanner ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Saved & Synced!</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Save Real Link</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {interviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gvk-border p-14 text-center text-xs shadow-card">
          <Video className="w-10 h-10 text-gvk-navy opacity-40 mx-auto mb-2" />
          {assignedStudents.length === 0 ? (
            <>
              <h3 className="text-base font-bold text-gvk-navy">No Candidates Assigned Yet</h3>
              <p className="text-gvk-text-secondary mt-1 max-w-md mx-auto">
                Your interview desk is fresh and ready. When candidates are allocated to your portfolio, credibility mock sessions can be scheduled and conducted here.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-base font-bold text-gvk-navy">No Mock Interviews Scheduled</h3>
              <p className="text-gvk-text-secondary mt-1 max-w-md mx-auto">
                Internal admissions mock interviews are scheduled at Stage 07 prior to official university credibility evaluations.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {interviews.map((interview) => (
          <div
            key={interview.id}
            className="p-6 rounded-2xl border border-gvk-border bg-white shadow-card space-y-4 text-xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-gvk-navy leading-snug">
                    {interview.title}
                  </h3>
                  <p className="text-gvk-text-secondary mt-0.5">
                    Candidate: <strong className="text-gvk-text-primary">{interview.studentName}</strong>
                  </p>
                </div>
                {interview.status === "cancelled" ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-red-600" />
                    <span>Cancelled</span>
                  </span>
                ) : interview.feedback ? (
                  <StatusBadge type="interviewOutcome" status={interview.feedback.outcome} />
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    Scheduled
                  </span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p>
                  📅 <strong>Scheduled:</strong> {new Date(interview.scheduledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} ({interview.durationMinutes} mins)
                </p>
                {interview.instructions && (
                  <p className="text-gvk-text-secondary">
                    💡 <strong>Instructions:</strong> {interview.instructions}
                  </p>
                )}
              </div>

              {interview.status === "cancelled" ? (
                <div className="p-3.5 rounded-xl bg-red-50/80 border border-red-200 text-red-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-red-800 text-[11px]">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Session Cancelled</span>
                  </div>
                  <p className="text-[11px] text-red-700 leading-relaxed">
                    <strong>Reason:</strong> {interview.cancellationReason || "Cancelled by counselor."}
                  </p>
                  {interview.cancelledAt && (
                    <span className="text-[10px] text-red-500 font-mono block">
                      Cancelled on: {new Date(interview.cancelledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                  )}
                </div>
              ) : (
                /* Zoom Credentials Box */
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gvk-navy flex items-center gap-1.5 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified Zoom Meeting Link</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => openEditZoomModal(interview)}
                      className="text-[11px] text-blue-700 font-bold flex items-center gap-1 hover:underline"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit / Replace Link</span>
                    </button>
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-blue-200 flex items-center justify-between gap-2">
                    <a
                      href={interview.zoomMeetingUrl || "https://zoom.us/start/videomeeting"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-blue-700 font-bold hover:underline truncate block flex-1"
                    >
                      {interview.zoomMeetingUrl || "https://zoom.us/start/videomeeting"}
                    </a>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(interview.zoomMeetingUrl || "https://zoom.us/start/videomeeting", `url-${interview.id}`)}
                      className="p-1 px-2 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 transition-colors shrink-0 flex items-center gap-1 text-[10px] font-bold"
                    >
                      {copiedId === `url-${interview.id}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-700 pt-0.5">
                    <span>ID: <strong>{interview.zoomMeetingId || "984 9012 3456"}</strong></span>
                    <span>Passcode: <strong>{interview.zoomPasscode || "GVK2026"}</strong></span>
                  </div>
                </div>
              )}

              {interview.feedback && (
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-950 space-y-1">
                  <strong className="block font-bold">Feedback Delivered to Candidate:</strong>
                  <p>{interview.feedback.studentVisibleFeedback}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gvk-border flex items-center justify-between gap-2 flex-wrap">
              {interview.status === "cancelled" ? (
                <div className="w-full flex items-center justify-between">
                  <span className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span>Interview Cancelled (Candidate Notified)</span>
                  </span>
                  <Button
                    onClick={() => {
                      setTargetStudentId(interview.studentId || assignedStudents[0]?.id || "");
                      setTitle(`Rescheduled: ${interview.title}`);
                      openScheduleModal();
                    }}
                    size="sm"
                    variant="outline"
                    className="font-bold text-xs flex items-center gap-1 text-gvk-navy border-gvk-navy/40 hover:bg-slate-50"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Reschedule</span>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <a href={interview.zoomMeetingUrl || "https://zoom.us/start/videomeeting"} target="_blank" rel="noopener noreferrer">
                      <Button variant="default" size="sm" className="font-bold flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
                        <Video className="w-3.5 h-3.5" />
                        <span>Launch Zoom</span>
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </a>
                    <Link href={`/interview/session/${interview.id}`}>
                      <Button variant="outline" size="sm" className="font-bold flex items-center gap-1.5 border-gvk-navy text-gvk-navy hover:bg-gvk-navy-50">
                        <Sparkles className="w-3.5 h-3.5 text-gvk-navy" />
                        <span>Open Studio</span>
                      </Button>
                    </Link>
                  </div>

                  <div className="flex items-center gap-2">
                    {!interview.feedback && (
                      <Button
                        onClick={() => openCancelModal(interview)}
                        size="sm"
                        variant="ghost"
                        className="font-bold text-xs text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-1 px-2.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </Button>
                    )}

                    {!interview.feedback ? (
                      <Button
                        onClick={() => setEvalModal(interview)}
                        size="sm"
                        variant="default"
                        className="font-bold shadow-xs"
                      >
                        Submit Evaluation
                      </Button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Evaluation Completed</span>
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Edit Zoom Link Modal */}
      {editZoomModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gvk-border shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-gvk-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-gvk-navy">Update Zoom Meeting Link</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditZoomModal(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateZoom} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Interview Session</label>
                <p className="font-semibold text-gvk-navy bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {editZoomModal.title} ({editZoomModal.studentName})
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-gvk-text-primary">Zoom Meeting URL</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditZoomUrl("https://zoom.us/test")}
                      className="text-[11px] text-blue-700 font-bold hover:underline"
                    >
                      Active Room
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setEditZoomUrl("https://zoom.us/start/videomeeting")}
                      className="text-[11px] text-blue-700 font-bold hover:underline"
                    >
                      Start Instant
                    </button>
                  </div>
                </div>
                <Input
                  type="url"
                  value={editZoomUrl}
                  onChange={(e) => setEditZoomUrl(e.target.value)}
                  placeholder="https://zoom.us/test or your personal Zoom link"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  You can paste your personal Zoom link (e.g. <code>https://zoom.us/j/...</code> or <code>https://zoom.us/my/...</code>) or use the active test room.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gvk-text-primary mb-1">Meeting ID</label>
                  <Input
                    value={editMeetingId}
                    onChange={(e) => setEditMeetingId(e.target.value)}
                    placeholder="984 9012 3456"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gvk-text-primary mb-1">Passcode</label>
                  <Input
                    value={editPasscode}
                    onChange={(e) => setEditPasscode(e.target.value)}
                    placeholder="GVK2026"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Saving will automatically update the link in the Student's portal and send an in-app notification.
                </span>
              </div>

              <div className="pt-3 border-t border-gvk-border flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditZoomModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="font-bold bg-blue-600 hover:bg-blue-700 text-white">
                  Save & Notify Student
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gvk-border shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-gvk-border pb-3 mb-3">
              <h3 className="text-lg font-bold text-gvk-navy">Schedule Mock Interview</h3>
              <button
                type="button"
                onClick={() => setScheduleModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSchedule} className="space-y-3 text-xs mt-3">
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
                <label className="block font-bold text-gvk-text-primary mb-1">Date & Time</label>
                <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-gvk-text-primary">Verified Zoom Meeting Link</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setZoomUrl("https://zoom.us/test")}
                      className="text-xs text-blue-700 font-bold flex items-center gap-1 hover:underline"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Use Active Zoom Room</span>
                    </button>
                  </div>
                </div>
                <Input
                  type="url"
                  value={zoomUrl}
                  onChange={(e) => setZoomUrl(e.target.value)}
                  placeholder="https://zoom.us/test or your personal Zoom URL"
                  required
                />
                <span className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>Verified active Zoom room link (connects to Zoom client without expiring).</span>
                </span>
              </div>

              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Instructions</label>
                <textarea rows={2} value={instructions} onChange={(e) => setInstructions(e.target.value)} className="w-full p-2 rounded border border-gvk-border" />
              </div>

              <div className="pt-3 border-t border-gvk-border flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setScheduleModal(false)}>Cancel</Button>
                <Button type="submit" size="sm" className="font-bold">Schedule Session</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evaluate Modal */}
      {evalModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-gvk-border shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-gvk-border pb-3 mb-3">
              <h3 className="text-lg font-bold text-gvk-navy">Mock Interview Evaluation</h3>
              <button
                type="button"
                onClick={() => setEvalModal(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleEvaluate} className="space-y-3 text-xs mt-3">
              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Outcome</label>
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value as MockInterviewOutcome)}
                  className="w-full h-10 px-3 rounded border border-gvk-border bg-white"
                >
                  <option value="PASS">PASS — Ready for Admissions</option>
                  <option value="FAIL">FAIL — Needs Another Round</option>
                  <option value="PENDING_SECOND_ROUND">PENDING_SECOND_ROUND — Conditional</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Strengths</label>
                <textarea rows={2} value={strengths} onChange={(e) => setStrengths(e.target.value)} className="w-full p-2 rounded border border-gvk-border" required />
              </div>

              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Areas for Improvement</label>
                <textarea rows={2} value={improvements} onChange={(e) => setImprovements(e.target.value)} className="w-full p-2 rounded border border-gvk-border" required />
              </div>

              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Feedback Delivered to Student</label>
                <textarea rows={2} value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full p-2 rounded border border-gvk-border" required />
              </div>

              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Private Counselor Notes</label>
                <Input value={privateNote} onChange={(e) => setPrivateNote(e.target.value)} />
              </div>

              <div className="pt-3 border-t border-gvk-border flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEvalModal(null)}>Cancel</Button>
                <Button type="submit" size="sm" variant="default" className="font-bold">Record Evaluation</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Interview Modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gvk-border shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-gvk-border pb-3 mb-4">
              <div className="flex items-center gap-2 text-red-600">
                <CalendarX className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-bold text-gvk-navy">Cancel Scheduled Mock Interview</h3>
              </div>
              <button
                type="button"
                onClick={() => setCancelModal(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCancelInterview} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="font-bold text-gvk-navy text-sm">
                  {cancelModal.title}
                </p>
                <p className="text-gvk-text-secondary">
                  Student: <strong>{cancelModal.studentName}</strong> • Date: {new Date(cancelModal.scheduledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>

              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">
                  Reason for Cancellation (Delivered to Student)
                </label>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Schedule conflict, student requested postponement, SOP review pending..."
                  className="w-full p-2.5 rounded-lg border border-gvk-border focus:border-red-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  This will mark the interview as Cancelled and send an immediate in-app notification to the candidate with your cancellation reason.
                </span>
              </div>

              <div className="pt-3 border-t border-gvk-border flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setCancelModal(null)}>
                  Keep Interview
                </Button>
                <Button type="submit" size="sm" className="font-bold bg-red-600 hover:bg-red-700 text-white shadow-md">
                  Confirm Cancellation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
