"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { dataStore } from "@/lib/data/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import {
  Video,
  Calendar,
  Clock,
  ExternalLink,
  Award,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  User,
  Sparkles,
  Copy,
  Check,
  Info,
  Lock,
  GraduationCap,
  Building,
  FileCheck,
  ArrowRight,
  BookOpen,
} from "lucide-react";

function InterviewContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "university" ? "university" : "mock";
  const [activeTab, setActiveTab] = useState<"mock" | "university">(initialTab);

  const { user } = useCurrentUser();
  const studentId = user?.role === "student" ? user.id : "usr-student-01";

  const [mockInterviews, setMockInterviews] = useState(() => dataStore.getStudentMockInterviews(studentId));
  const [applications, setApplications] = useState(() => dataStore.getStudentApplications(studentId));
  const finalDestination = applications.find((a) => a.isFinalDestination) || applications[0];

  useEffect(() => {
    setMockInterviews(dataStore.getStudentMockInterviews(studentId));
    setApplications(dataStore.getStudentApplications(studentId));
    const unsubscribe = dataStore.subscribe(() => {
      setMockInterviews(dataStore.getStudentMockInterviews(studentId));
      setApplications(dataStore.getStudentApplications(studentId));
    });
    return () => unsubscribe();
  }, [studentId]);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const upcomingMockInterviews = mockInterviews.filter(
    (i) => i.status === "scheduled" || i.status === "in_progress"
  );
  const pastMockInterviews = mockInterviews.filter((i) => i.status === "completed");

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in text-xs">
      {/* 1. Header Banner & Main Switcher */}
      <div className="bg-white rounded-2xl border border-gvk-border p-5 sm:p-7 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gvk-border">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-gvk-navy text-white shadow-md shrink-0 mt-0.5">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-gvk-navy tracking-tight">
                  Admissions & Credibility Interviews
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300">
                  Comprehensive Interview Hub
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gvk-text-secondary mt-1">
                Prepare with GVK internal mock interviews conducted by our counselor team, and track your official university admissions interviews.
              </p>
            </div>
          </div>

          <Link href="/student/journey?stage=7" className="shrink-0 self-start md:self-auto">
            <Button variant="outline" size="sm" className="font-bold text-xs border-gvk-navy text-gvk-navy hover:bg-gvk-navy-50 flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>View in Journey Roadmap</span>
            </Button>
          </Link>
        </div>

        {/* 2 Top-Level Tabs: Mock Interview (Our Team) vs University Interview (University) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-4">
          {/* Tab 1: GVK Mock Interview */}
          <button
            type="button"
            onClick={() => setActiveTab("mock")}
            className={`flex-1 p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
              activeTab === "mock"
                ? "bg-gvk-navy text-white border-gvk-navy shadow-md ring-2 ring-gvk-navy/20"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                activeTab === "mock" ? "bg-white/20 text-white" : "bg-slate-200 text-gvk-navy"
              }`}>
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <strong className={`block text-xs sm:text-sm font-bold ${activeTab === "mock" ? "text-white" : "text-gvk-navy"}`}>
                  1. Mock Admissions Interview
                </strong>
                <span className={`text-[10px] block ${activeTab === "mock" ? "text-blue-100" : "text-slate-500"}`}>
                  Conducted by GVK Counselor Team (Priya Varma)
                </span>
              </div>
            </div>
            <span className={`text-[9.5px] uppercase font-mono font-bold px-2 py-0.5 rounded ${
              activeTab === "mock" ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
            }`}>
              Prep Desk
            </span>
          </button>

          {/* Tab 2: University Interview */}
          <button
            type="button"
            onClick={() => setActiveTab("university")}
            className={`flex-1 p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
              activeTab === "university"
                ? "bg-gvk-navy text-white border-gvk-navy shadow-md ring-2 ring-gvk-navy/20"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                activeTab === "university" ? "bg-white/20 text-white" : "bg-slate-200 text-gvk-navy"
              }`}>
                <Building className="w-4 h-4" />
              </div>
              <div>
                <strong className={`block text-xs sm:text-sm font-bold ${activeTab === "university" ? "text-white" : "text-gvk-navy"}`}>
                  2. University Interview
                </strong>
                <span className={`text-[10px] block ${activeTab === "university" ? "text-blue-100" : "text-slate-500"}`}>
                  Conducted by Official University Admissions Panel
                </span>
              </div>
            </div>
            <span className={`text-[9.5px] uppercase font-mono font-bold px-2 py-0.5 rounded ${
              activeTab === "university" ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
            }`}>
              Official Desk
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: GVK MOCK INTERVIEW (CONDUCTED BY GVK TEAM / COUNSELORS)            */}
      {/* ========================================================================= */}
      {activeTab === "mock" && (
        <div className="space-y-6 animate-fade-in">
          {/* Advisory Box */}
          <div className="p-4 bg-blue-50/70 border border-blue-200/90 rounded-2xl text-xs text-blue-950 flex items-start gap-3 shadow-xs">
            <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-xs sm:text-sm font-bold text-blue-950 block mb-0.5">
                About GVK Internal Mock Interviews (Conducted by Our Team):
              </strong>
              <p className="text-blue-900 leading-relaxed">
                Mock interviews are conducted strictly by <strong>GVK senior counselors</strong> (not the university). We evaluate your academic articulation, reasons for choosing your university, course modules understanding, and visa credibility. A <strong>PASS</strong> from our team is required before appearing for your official university admissions or UKVI credibility interview.
              </p>
            </div>
          </div>

          {/* Scheduled Upcoming Mock Interview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-gvk-navy flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gvk-navy" />
                <span>Scheduled GVK Mock Sessions</span>
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                upcomingMockInterviews.length > 0
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}>
                {upcomingMockInterviews.length > 0
                  ? `${upcomingMockInterviews.length} Session${upcomingMockInterviews.length > 1 ? "s" : ""} Scheduled`
                  : "Stage 07 Milestone (Not Scheduled Yet)"}
              </span>
            </div>

            {upcomingMockInterviews.length > 0 ? (
              <div className="space-y-5">
                {upcomingMockInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="p-6 sm:p-7 rounded-2xl border-2 border-slate-200/90 bg-white shadow-card hover:border-gvk-navy/40 transition-all"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                      {/* LEFT COLUMN: Interview Topic & Counselor Details */}
                      <div className="lg:col-span-6 space-y-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                Live Counselor Evaluation
                              </span>
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                                GVK Internal Mock
                              </span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gvk-navy mt-1.5 leading-snug">
                              {interview.title}
                            </h3>
                          </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                          <div className="flex items-center justify-between text-gvk-text-secondary">
                            <span className="flex items-center gap-1.5 font-bold text-gvk-navy">
                              <Calendar className="w-4 h-4 text-gvk-navy" />
                              Date & Time:
                            </span>
                            <span suppressHydrationWarning className="font-bold text-gvk-navy">
                              {new Date(interview.scheduledAt).toLocaleString("en-IN", {
                                dateStyle: "full",
                                timeStyle: "short",
                              })}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-gvk-text-secondary">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Clock className="w-4 h-4 text-gvk-text-muted" />
                              Duration:
                            </span>
                            <span className="font-semibold text-slate-800">{interview.durationMinutes} Minutes</span>
                          </div>

                          <div className="flex items-center justify-between text-gvk-text-secondary">
                            <span className="flex items-center gap-1.5 font-medium">
                              <User className="w-4 h-4 text-gvk-text-muted" />
                              Conducted by GVK Counselor:
                            </span>
                            <span className="font-bold text-gvk-navy">{interview.counselorName}</span>
                          </div>
                        </div>

                        {interview.instructions && (
                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-gvk-text-secondary">
                            <strong className="text-gvk-navy font-bold block mb-1">Internal Guidelines:</strong>
                            <p className="leading-relaxed text-slate-700">{interview.instructions}</p>
                          </div>
                        )}
                      </div>

                      {/* RIGHT COLUMN: Video Meeting Credentials & Actions */}
                      <div className="lg:col-span-6 space-y-4 flex flex-col justify-between h-full">
                        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/90 text-xs text-blue-950 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              <span className="font-bold text-gvk-navy">Direct Real Access Zoom Meeting</span>
                            </div>
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-300">
                              Live Real Link
                            </span>
                          </div>

                          {/* Complete Zoom Link */}
                          <div className="bg-white p-2.5 rounded-lg border border-blue-200 flex items-center justify-between gap-2">
                            <div className="truncate flex-1">
                              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Direct Access URL</span>
                              <a
                                href={interview.zoomMeetingUrl || "https://zoom.us/start/videomeeting"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-xs text-blue-700 font-bold hover:underline hover:text-blue-900 truncate block"
                              >
                                {interview.zoomMeetingUrl || "https://zoom.us/start/videomeeting"}
                              </a>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(interview.zoomMeetingUrl || "https://zoom.us/start/videomeeting", `url-${interview.id}`)}
                              className="p-1.5 px-2.5 rounded-lg bg-blue-100/80 hover:bg-blue-200 text-blue-800 transition-colors shrink-0 flex items-center gap-1 text-[11px] font-bold"
                              title="Copy meeting link"
                            >
                              {copiedId === `url-${interview.id}` ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-700">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy Link</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Meeting ID & Passcode */}
                          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                            <div className="bg-white p-2.5 rounded-lg border border-blue-200 flex items-center justify-between">
                              <div>
                                <span className="text-[9px] text-slate-500 uppercase block font-sans font-bold">Meeting ID</span>
                                <span className="font-bold text-slate-800">{interview.zoomMeetingId || "984 9012 3456"}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(interview.zoomMeetingId || "98490123456", `id-${interview.id}`)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-600"
                                title="Copy ID"
                              >
                                {copiedId === `id-${interview.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>

                            <div className="bg-white p-2.5 rounded-lg border border-blue-200 flex items-center justify-between">
                              <div>
                                <span className="text-[9px] text-slate-500 uppercase block font-sans font-bold">Passcode</span>
                                <span className="font-bold text-slate-800">{interview.zoomPasscode || "GVK2026"}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(interview.zoomPasscode || "GVK2026", `pwd-${interview.id}`)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-600"
                                title="Copy Passcode"
                              >
                                {copiedId === `pwd-${interview.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>

                          <div className="pt-1 flex items-center gap-1.5 text-[11px] text-blue-900/80">
                            <Info className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                            <span>Direct access link connecting to the live Zoom video session with audio & video.</span>
                          </div>
                        </div>

                        {/* Direct Action Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          <a
                            href={interview.zoomMeetingUrl || "https://zoom.us/start/videomeeting"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <Button
                              size="lg"
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
                            >
                              <Video className="w-4 h-4" />
                              <span>Join Live Zoom Session</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </a>

                          <Link href={`/interview/session/${interview.id}`} className="block">
                            <Button
                              variant="outline"
                              size="lg"
                              className="w-full font-bold text-xs border-gvk-navy text-gvk-navy hover:bg-gvk-navy-50 flex items-center justify-center gap-2"
                            >
                              <Sparkles className="w-4 h-4 text-amber-500" />
                              <span>In-Platform Video Studio</span>
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-white border border-gvk-border text-center space-y-2">
                <Video className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-gvk-navy">No Upcoming Mock Interviews</h3>
                <p className="text-xs text-gvk-text-secondary max-w-md mx-auto">
                  Your counselor Priya Varma will schedule your internal mock session upon completing your document verification in Stage 03.
                </p>
              </div>
            )}
          </div>

          {/* GVK Mock Evaluation Pillars */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-gvk-border shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gvk-border">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gvk-navy">
                  5 Core GVK Mock Assessment Pillars
                </h3>
                <p className="text-xs text-gvk-text-secondary mt-0.5">
                  Our counselors evaluate you across these 5 dimensions to certify your readiness.
                </p>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                GVK Standard
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { title: "Academic Articulation", desc: "Verbal defense of previous degree and GPA" },
                { title: "Course Modules", desc: "Understanding specific modules & faculty" },
                { title: "Why This University", desc: "Strong logical rationale for university choice" },
                { title: "Career Progression", desc: "Post-study career goals and Indian return intent" },
                { title: "Financial & Visa Credibility", desc: "Maintenance funds & tuition remittance clarity" },
              ].map((p, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-gvk-navy bg-slate-200 px-1.5 py-0.5 rounded">
                    0{i + 1}
                  </span>
                  <strong className="text-xs font-bold text-gvk-navy block mt-1">{p.title}</strong>
                  <p className="text-[10.5px] text-slate-600 leading-snug">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: UNIVERSITY INTERVIEW (CONDUCTED BY OFFICIAL UNIVERSITY PANEL)       */}
      {/* ========================================================================= */}
      {activeTab === "university" && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Distinction Banner */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-white border-2 border-amber-300/80 rounded-2xl text-xs text-amber-950 space-y-2 shadow-xs">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-amber-800 shrink-0" />
              <strong className="text-sm sm:text-base font-black text-amber-950">
                Official University Admissions Interview Desk
              </strong>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 border border-amber-300">
                Conducted by University
              </span>
            </div>
            <p className="text-amber-900/90 leading-relaxed text-xs">
              This interview is conducted directly by the <strong>University Admissions Committee, Academic Department Faculty, and UKVI Credibility Officers</strong> (not GVK). The university verifies your genuine student intent, curriculum readiness, and English fluency.
            </p>
          </div>

          {/* Prerequisite Clearance Rule */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-gvk-navy block">Prerequisite: GVK Internal Mock Clearance Required</strong>
                <span className="text-slate-600 text-[11px]">
                  You must complete and clear Stage 07 (GVK Mock Interview with Priya Varma) before attending this official session.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("mock")}
              className="text-xs font-bold text-gvk-navy hover:underline shrink-0 flex items-center gap-1"
            >
              <span>Check GVK Mock Status →</span>
            </button>
          </div>

          {/* Official University Interview Invitation Card */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border-2 border-gvk-navy/30 shadow-card space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gvk-border">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Confirmed Destination
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    Official University Session
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-gvk-navy mt-1">
                  {finalDestination?.universityName || "University of Manchester"} Admissions Interview
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Target Program: <strong>{finalDestination?.courseName || "MSc Computer Science"}</strong> ({finalDestination?.intake || "Fall 2026"})
                </p>
              </div>

              <div className="text-right self-start sm:self-auto">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Stage in Journey</span>
                <span className="font-mono font-bold text-xs text-gvk-navy">Stage 08 of 22</span>
              </div>
            </div>

            {/* University Interview Status Vitals */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Interview Type</span>
                <strong className="text-gvk-navy block mt-0.5">Academic & Credibility Assessment</strong>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Faculty & Admissions Committee</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Session Format</span>
                <strong className="text-gvk-navy block mt-0.5">Official University Video Portal</strong>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Microsoft Teams / University Portal</span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
                <span className="text-amber-800 text-[10px] uppercase font-bold block">Official Portal Invitation</span>
                <strong className="text-amber-950 block mt-0.5">Awaiting Invitation Dispatch</strong>
                <span className="text-[10px] text-amber-800 mt-0.5 block">Within Admissions Window</span>
              </div>
            </div>

            {/* Placeholder / Framework Note as requested by user */}
            <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-gvk-navy">
                <Info className="w-4 h-4 text-gvk-navy shrink-0" />
                <span>University Interview Process Configuration Desk</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11.5px]">
                Official interview process protocols, schedule links, and university departmental panel requirements will be updated here as per your institution&apos;s specific dispatch. Once your official invitation email arrives from {finalDestination?.universityName || "the university"}, your counselor Priya Varma will configure your dedicated portal link and mock rehearsal.
              </p>
            </div>
          </div>

          {/* Official University Interview Core Questions Checklist */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-gvk-border shadow-card space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-gvk-navy flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gvk-navy" />
              <span>Official University Admissions Prep Checklist</span>
            </h3>
            <p className="text-xs text-gvk-text-secondary">
              Key topics international university faculties ask during formal admissions interviews:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <strong className="text-gvk-navy block font-bold">1. Academic & Technical Foundation</strong>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Be prepared to discuss your undergraduate major, final year dissertation project, programming proficiencies, and specific mathematical/computational foundations.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <strong className="text-gvk-navy block font-bold">2. Specific Syllabus & Module Choices</strong>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Know at least 3 core modules from your target curriculum and explain why you selected them over alternative degrees in India.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <strong className="text-gvk-navy block font-bold">3. Genuineness of Study Abroad Intent</strong>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Articulate why the UK education system offers pedagogical advantages that align specifically with your post-graduation career path.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <strong className="text-gvk-navy block font-bold">4. Financial Sponsorship & Living Awareness</strong>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Demonstrate clear awareness of campus accommodation arrangements, city living costs, and sanctioned financial sponsorship.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentInterviewPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-slate-500 font-bold text-xs">Loading Interview Hub...</div>}>
      <InterviewContent />
    </React.Suspense>
  );
}
