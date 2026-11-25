"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { NextActionCard } from "@/components/student/NextActionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UniversityBadge } from "@/components/shared/UniversityLogo";
import { Button } from "@/components/ui/button";
import { UniversityApplicationCardData } from "@/types/domain";
import {
  GraduationCap,
  FolderLock,
  CheckSquare,
  Award,
  Video,
  Calendar,
  Compass,
  ArrowRight,
  UserCheck,
  Building,
  Bell,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  X,
  ShieldCheck,
  MessageSquare,
  Download,
  FileText,
  Banknote,
  Lock,
  AlertTriangle,
} from "lucide-react";

export default function StudentDashboardPage() {
  const { user } = useCurrentUser();
  const studentId = user?.role === "student" ? user.id : "usr-student-01";

  const [student, setStudent] = useState(() => dataStore.getStudentProfile(studentId));
  const [counselor, setCounselor] = useState(() => dataStore.getAssignedCounselor(studentId));
  const [applications, setApplications] = useState(() => dataStore.getStudentApplications(studentId));
  const [documents, setDocuments] = useState(() => dataStore.getStudentDocuments(studentId));
  const [tasks, setTasks] = useState(() => dataStore.getStudentTasks(studentId, false));
  const [journey, setJourney] = useState(() => dataStore.getStudentJourney(studentId));
  const [mockInterviews, setMockInterviews] = useState(() => dataStore.getStudentMockInterviews(studentId));
  const [nextAction, setNextAction] = useState(() => dataStore.calculateNextAction(studentId));
  const [notifications, setNotifications] = useState(() => dataStore.getNotifications(studentId));
  const [messages, setMessages] = useState(() => dataStore.getMessages(studentId));

  useEffect(() => {
    setStudent(dataStore.getStudentProfile(studentId));
    setCounselor(dataStore.getAssignedCounselor(studentId));
    setApplications(dataStore.getStudentApplications(studentId));
    setDocuments(dataStore.getStudentDocuments(studentId));
    setTasks(dataStore.getStudentTasks(studentId, false));
    setJourney(dataStore.getStudentJourney(studentId));
    setMockInterviews(dataStore.getStudentMockInterviews(studentId));
    setNextAction(dataStore.calculateNextAction(studentId));
    setNotifications(dataStore.getNotifications(studentId));
    setMessages(dataStore.getMessages(studentId));

    const unsubscribe = dataStore.subscribe(() => {
      setStudent(dataStore.getStudentProfile(studentId));
      setCounselor(dataStore.getAssignedCounselor(studentId));
      setApplications(dataStore.getStudentApplications(studentId));
      setDocuments(dataStore.getStudentDocuments(studentId));
      setTasks(dataStore.getStudentTasks(studentId, false));
      setJourney(dataStore.getStudentJourney(studentId));
      setMockInterviews(dataStore.getStudentMockInterviews(studentId));
      setNextAction(dataStore.calculateNextAction(studentId));
      setNotifications(dataStore.getNotifications(studentId));
      setMessages(dataStore.getMessages(studentId));
    });
    return () => unsubscribe();
  }, [studentId]);

  // Offer Acceptance Modal & Toast State
  const [acceptOfferModal, setAcceptOfferModal] = useState<UniversityApplicationCardData | null>(null);
  const [acceptToast, setAcceptToast] = useState<string | null>(null);

  const finalDestination = applications.find((a) => a.isFinalDestination);
  const offersReceivedList = applications.filter(
    (a) => a.currentStatus === "conditional_offer" || a.currentStatus === "unconditional_offer"
  );

  const handleConfirmAcceptOffer = () => {
    if (!acceptOfferModal) return;
    const res = dataStore.acceptUniversityOffer(studentId, acceptOfferModal.id, studentId);
    if (res.success) {
      setApplications(dataStore.getStudentApplications(studentId));
      setAcceptToast(`✓ ${acceptOfferModal.universityName} confirmed as your Final Destination! Next steps locked to this university.`);
      setTimeout(() => setAcceptToast(null), 4500);
    }
    setAcceptOfferModal(null);
  };

  // Computed metrics
  const totalApplications = applications.length;
  const offersReceived = applications.filter(
    (a) => a.currentStatus === "conditional_offer" || a.currentStatus === "unconditional_offer"
  ).length;
  const pendingDocs = documents.filter(
    (d) => d.verificationStatus === "not_uploaded" || d.verificationStatus === "resubmission_required" || d.verificationStatus === "required"
  ).length;
  const pendingTasks = tasks.filter((t) => t.status === "pending" || t.status === "in_progress").length;

  const activeStage = journey.find((s) => s.status !== "completed");
  const activeStageNum = activeStage ? activeStage.stageNumber : journey.length + 1;
  const completedStages = journey.filter(
    (j) => j.status === "completed" && j.stageNumber < activeStageNum
  ).length;
  const totalStages = journey.length || 25;
  const journeyProgressPercent = Math.round((completedStages / totalStages) * 100);

  const upcomingInterview = mockInterviews.find((m) => m.status === "scheduled");

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* 1. Welcome & Student Profile Header Ribbon (Refined & Compact for Hierarchy) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Identity info */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-gvk-navy border border-slate-200 flex items-center justify-center font-black text-lg shrink-0 shadow-2xs">
              {student?.firstName?.charAt(0) || "S"}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-gvk-navy tracking-tight">
                  Welcome back, {student?.firstName} {student?.lastName}!
                </h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {student?.studentIdCode}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Targeting <strong className="text-slate-800">{student?.targetDegree}</strong> • {student?.preferredCountry} ({student?.targetIntake})
              </p>
            </div>
          </div>

          {/* Assigned Counselor pill & Quick Message */}
          <div className="flex items-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            {counselor ? (
              <div className="p-2 px-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {counselor.firstName?.charAt(0) || "C"}
                </div>
                <div className="text-left">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">
                    Assigned Counselor
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {counselor.firstName} {counselor.lastName}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-2 px-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="text-left">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-amber-600 block">
                    Desk Allocation
                  </span>
                  <span className="text-xs font-bold text-amber-900">
                    Counselor Assignment Pending
                  </span>
                </div>
              </div>
            )}

            <Link href="/student/counselor">
              <Button variant="outlineNavy" size="sm" className="font-bold text-xs h-9">
                {counselor ? "Message Counselor" : "Counselor Desk"}
              </Button>
            </Link>
          </div>
        </div>

        {/* Warning Banner if Unassigned */}
        {!counselor && (
          <div className="mt-4 p-3.5 rounded-xl border border-amber-300 bg-amber-50/90 text-amber-950 flex items-start gap-3 shadow-2xs animate-fade-in text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-amber-900 font-bold mb-0.5">
                Welcome to GVK Masters! Your Senior Counselor Allocation is in Progress
              </strong>
              <p className="text-amber-800 leading-relaxed text-[11px]">
                GVK Admissions Administration is currently reviewing your target program (<strong>{student?.targetDegree}</strong>) and destination country ({student?.preferredCountry}) to assign your dedicated senior admissions counselor. Once assigned, your Stage 01 In-Person Counseling roadmap and consultation schedule will activate immediately.
              </p>
            </div>
          </div>
        )}

        {/* Counselor Follow-up & Advisory Communication Alert */}
        {counselor && (() => {
          const unreadCounselorMessages = messages.filter((m) => m.senderRole === "counselor" && m.isRead === false);
          if (unreadCounselorMessages.length === 0) return null; // Alert is GONE when messages are read!
          return (
            <div className="mt-4 p-4 rounded-xl border border-emerald-300 bg-emerald-50/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs animate-fade-in shadow-2xs">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-300">
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      New Counselor Message
                    </span>
                    <span className="font-semibold text-emerald-900">
                      {counselor.firstName} {counselor.lastName} • {counselor.employeeIdCode}
                    </span>
                  </div>
                  <p className="text-emerald-950 font-medium mt-1 leading-relaxed">
                    &ldquo;{unreadCounselorMessages[unreadCounselorMessages.length - 1]?.content.substring(0, 95)}...&rdquo;
                  </p>
                </div>
              </div>
              <Link href="/student/counselor" className="shrink-0 self-end sm:self-auto">
                <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs">
                  Open Support Desk →
                </Button>
              </Link>
            </div>
          );
        })()}
      </div>

      {/* 2. ELEVATED MASTERS JOURNEY HERO SHOWCASE (MAIN PROMINENT CENTERPIECE) */}
      <section className="bg-gradient-to-br from-[#0B192C] via-[#0F284E] to-[#0A182E] text-white rounded-2xl border border-blue-900/50 shadow-xl p-5 sm:p-7 relative overflow-hidden animate-fade-in">
        {/* Ambient glowing radial light effects */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          {/* Top Row: Title, 22-Stage Badge, Large Stage Counter, and High-Contrast CTA */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Title & Roadmap Context */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {totalStages}-Stage Official Roadmap
                </span>
                <span className="text-xs text-slate-300 font-medium">Real-Time Sequential Progress</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                <Compass className="w-7 h-7 text-emerald-400 shrink-0" />
                <span>My Masters Abroad Journey</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Sequential admissions tracking with verified counselor sign-offs at each milestone.
              </p>
            </div>

            {/* Prominent Numbers & Full Roadmap Action */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6 shrink-0">
              {/* Elevated Stage Counter & Percentage Badge */}
              <div className="flex items-center gap-3.5 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 shadow-sm">
                <div className="text-left">
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-2xl sm:text-3xl font-black text-white">{completedStages}</span>
                    <span className="text-sm font-bold text-slate-300">/ {totalStages}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300 block">
                    Stages Cleared
                  </span>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div className="text-left font-mono">
                  <span className="text-xl sm:text-2xl font-black text-emerald-300 block">
                    {journeyProgressPercent}%
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300 block">
                    Completed
                  </span>
                </div>
              </div>

              {/* View Full Roadmap Button */}
              <Link href="/student/journey" className="shrink-0">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white hover:bg-slate-100 text-gvk-navy font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-xl flex items-center justify-center gap-2 group transition-all transform hover:-translate-y-0.5"
                >
                  <span>View Full Roadmap</span>
                  <ArrowRight className="w-4 h-4 text-gvk-navy transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Glowing High-Impact Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full h-3.5 bg-slate-800/90 rounded-full overflow-hidden border border-slate-700/80 shadow-inner relative">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                style={{ width: `${journeyProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Live Step Horizon: Shows immediate stages (Completed -> Active -> Locked) */}
          <div className="pt-3 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">Milestone Horizon:</span>
              {/* Prior Completed Stages */}
              {journey
                .filter((s) => s.status === "completed" && s.stageNumber < activeStageNum)
                .slice(-2)
                .map((stg) => (
                  <span
                    key={stg.id}
                    className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md font-semibold text-[11px]"
                  >
                    ✓ Stage {stg.stageNumber.toString().padStart(2, "0")}: {stg.stageName}
                  </span>
                ))}

              {/* Current Active Stage */}
              {activeStage && (
                <span className="inline-flex items-center gap-1 bg-white text-gvk-navy px-2.5 py-0.5 rounded-md font-black text-[11px] shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Stage {activeStage.stageNumber.toString().padStart(2, "0")}: {activeStage.stageName} (ACTIVE)
                </span>
              )}

              {/* Next Upcoming Locked Stages */}
              {journey
                .filter((s) => s.stageNumber > activeStageNum)
                .slice(0, activeStageNum === 1 ? 2 : 1)
                .map((stg) => (
                  <span
                    key={stg.id}
                    className="inline-flex items-center gap-1 bg-white/10 text-slate-300 border border-white/10 px-2 py-0.5 rounded-md font-medium text-[11px]"
                  >
                    🔒 Stage {stg.stageNumber.toString().padStart(2, "0")}: {stg.stageName}
                  </span>
                ))}
            </div>

            <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              {activeStageNum < totalStages ? (
                <span>
                  Next Unlock: <strong>Stage {(activeStageNum + 1).toString().padStart(2, "0")} ({journey.find((s) => s.stageNumber === activeStageNum + 1)?.stageName || "Next Stage"})</strong> upon counselor sign-off of Stage {activeStageNum.toString().padStart(2, "0")}
                </span>
              ) : (
                <span>Final settlement and career milestones reached</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROMINENT CARD: "YOUR NEXT ACTION" */}
      <section aria-labelledby="next-action-heading">
        <NextActionCard action={nextAction} />
      </section>

      {/* 3. High-Impact Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <Link
          href="/student/universities"
          className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-card hover:shadow-md hover:border-gvk-navy/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 group-hover:text-gvk-navy transition-colors">
              Universities Applied
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-gvk-navy group-hover:bg-gvk-navy group-hover:text-white transition-all flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gvk-navy font-mono">
            {totalApplications}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {totalApplications === 0 ? "Unlocks at Stage 05" : "Across UK Russell Group"}
          </span>
        </Link>

        <Link
          href="/student/universities"
          className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-card hover:shadow-md hover:border-gvk-navy/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 group-hover:text-gvk-navy transition-colors">
              Offers Received
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-gvk-navy group-hover:bg-gvk-navy group-hover:text-white transition-all flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gvk-navy font-mono">
            {offersReceived}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {offersReceived === 0 ? "Awaiting Application Reviews" : `${offersReceived} Conditional / Unconditional`}
          </span>
        </Link>

        <Link
          href="/student/documents"
          className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-card hover:shadow-md hover:border-gvk-navy/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 group-hover:text-gvk-navy transition-colors">
              Actionable Documents
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-gvk-navy group-hover:bg-gvk-navy group-hover:text-white transition-all flex items-center justify-center">
              <FolderLock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gvk-navy font-mono">
            {pendingDocs}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {pendingDocs === 0 ? "Unlocks at Stage 03" : `${pendingDocs} Action Required`}
          </span>
        </Link>

        <Link
          href="/student/tasks"
          className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-card hover:shadow-md hover:border-gvk-navy/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 group-hover:text-gvk-navy transition-colors">
              Tasks In Queue
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-gvk-navy group-hover:bg-gvk-navy group-hover:text-white transition-all flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gvk-navy font-mono">
            {pendingTasks}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {pendingTasks === 0 ? "All Cleared" : `${pendingTasks} Assigned by Counselor`}
          </span>
        </Link>
      </div>

      {/* 4. Split Section: Multiple University Applications & Mock Interview Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left 2 Cols: My Active University Applications */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gvk-navy">
                My University Applications ({applications.length})
              </h2>
              <p className="text-xs text-gvk-text-secondary">
                Applications progress independently. After receiving offers, accept one university to unlock downstream CAS, Visa and Deposit.
              </p>
            </div>
            <Link href="/student/universities">
              <Button variant="ghost" size="sm" className="font-bold text-xs text-gvk-navy">
                View All Details →
              </Button>
            </Link>
          </div>

          {/* Success Toast Banner */}
          {acceptToast && (
            <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 flex items-center justify-between gap-3 text-xs font-bold animate-fade-in shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{acceptToast}</span>
              </div>
              <button
                type="button"
                onClick={() => setAcceptToast(null)}
                className="p-1 hover:bg-black/5 rounded-lg text-slate-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Single Destination Convergence Callout */}
          {finalDestination ? (
            <div className="p-4 rounded-xl border border-slate-200 border-l-4 border-l-emerald-600 bg-white text-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-card">
              <div className="flex items-start sm:items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-xs sm:text-sm font-bold text-gvk-navy">
                      Confirmed Final Destination: {finalDestination.universityName}
                    </strong>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Primary Destination Locked
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {finalDestination.courseName} • All downstream processes (Tuition Deposit, CAS Letter, UKVI Tier 4 Visa, Accommodation) are bound exclusively to this institution.
                  </p>
                </div>
              </div>
              <Link href="/student/journey">
                <Button size="sm" className="font-bold text-xs bg-gvk-navy hover:bg-gvk-navy-hover text-white shrink-0 shadow-xs">
                  Proceed with {finalDestination.universityName.split(" ")[2] || "University"} →
                </Button>
              </Link>
            </div>
          ) : offersReceivedList.length > 0 ? (
            <div className="p-4 rounded-xl border border-slate-200 border-l-4 border-l-amber-500 bg-white text-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-card">
              <div className="flex items-start sm:items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-xs sm:text-sm font-bold text-gvk-navy">
                      Admission Offers Received ({offersReceivedList.length}): Choose One Final Destination
                    </strong>
                    <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Decision Required
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    You have received offers from multiple universities ({offersReceivedList.map((o) => o.universityName).join(", ")}). You cannot continue the process with multiple universities. Accept one university below to proceed with Tuition Deposit, CAS and Visa.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* List of Applications */}
          <div className="space-y-3">
            {applications.length === 0 ? (
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-4 shadow-card">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 border border-slate-200 text-gvk-navy flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 text-gvk-navy" />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-gvk-navy">
                    No University Applications Submitted Yet
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    You are currently at <strong>Stage {activeStage?.stageNumber.toString().padStart(2, "0")}: {activeStage?.stageName}</strong>. As per overseas admissions protocol, formal application submissions unlock at <strong>Stage 05</strong> once prerequisite stages are verified and university shortlisting is finalized.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <Link href={`/student/journey?stage=${activeStageNum}`}>
                    <Button variant="outlineNavy" size="sm" className="font-bold text-xs">
                      Go to Active Stage {activeStage?.stageNumber.toString().padStart(2, "0")} ({activeStage?.stageName}) →
                    </Button>
                  </Link>
                  {activeStageNum >= 4 ? (
                    <Link href="/student/universities">
                      <Button size="sm" className="bg-gvk-navy hover:bg-gvk-navy-hover text-white font-bold text-xs shadow-xs">
                        Explore Universities Catalog
                      </Button>
                    </Link>
                  ) : (
                    <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      <span>University catalog unlocks at Stage 04</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              applications.map((app) => {
              const isAcceptedFinal = app.isFinalDestination;
              const hasOffer = app.currentStatus === "conditional_offer" || app.currentStatus === "unconditional_offer";
              const isRejected = app.currentStatus === "rejected";

              return (
                <div
                  key={app.id}
                  className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all flex flex-col gap-3.5 shadow-card hover:shadow-md ${
                    isAcceptedFinal
                      ? "border-emerald-500/70 ring-1 ring-emerald-500/20"
                      : isRejected
                      ? "border-slate-200 opacity-80"
                      : "border-slate-200 hover:border-gvk-navy/40"
                  }`}
                >
                  {/* ROW 1: HEADER (University Titles on Left, Brand Navy View Details on Right) */}
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <UniversityBadge name={app.universityName} country={app.country} size="md" showCountryFlag />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-bold text-gvk-navy tracking-tight">
                          {app.universityName}
                        </h3>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">
                          <strong className="text-slate-800">{app.courseName}</strong> • <span>Intake: <strong className="text-gvk-navy font-semibold">{app.intake || "Fall 2026"}</strong></span>
                        </p>
                      </div>
                    </div>

                    {/* TOP-RIGHT ANCHOR: VIEW DETAILS BUTTON (Brand 30% Navy Button) */}
                    <Link href="/student/universities" className="shrink-0">
                      <Button
                        size="sm"
                        className="bg-gvk-navy hover:bg-gvk-navy-hover text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>

                  {/* ROW 2: STATUS BADGES (Dedicated Row with Clean Breathing Room) */}
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge type="application" status={app.currentStatus} />
                    {isAcceptedFinal && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Confirmed Final Destination
                      </span>
                    )}
                    {hasOffer && !isAcceptedFinal && finalDestination && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                        Offer Declined for {finalDestination.universityName.split(" ")[2] || "Primary"}
                      </span>
                    )}
                  </div>

                  {/* ROW 3: OFFER ACTIONS & DIRECT DOWNLOAD (Rendered for issued offers) */}
                  {hasOffer && (
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="font-semibold text-gvk-navy">Admission Status:</span>
                        <span className="font-medium text-emerald-800">
                          {app.currentStatus === "unconditional_offer" ? "Unconditional Offer Issued" : "Official Conditional Offer Received"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {/* Direct Offer Letter Download */}
                        <a
                          href={`/api/documents/download?id=doc-offer-${app.id}&appId=${app.id}&studentId=${studentId}`}
                          download
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors shadow-2xs shrink-0"
                          title="Download University Offer Letter PDF"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-600" />
                          <span>Download Offer Letter</span>
                        </a>

                        {/* Primary Action Button: Accept Offer (10% Emerald Accent) */}
                        {!isAcceptedFinal && (
                          <Button
                            onClick={() => setAcceptOfferModal(app)}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 shrink-0"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{finalDestination ? "Switch Final Choice" : "Accept Offer & Commit"}</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ROW 4: COUNSELOR GUIDANCE NOTE (Clean Neutral Slate + Navy Left Accent) */}
                  {app.counselorRemarks && (
                    <div className="mt-0.5 flex items-start gap-3 rounded-xl p-3 sm:p-3.5 bg-slate-50 border border-slate-200/90 border-l-4 border-l-gvk-navy">
                      <span className="text-sm shrink-0 mt-0.5 text-gvk-navy">💡</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-[11px] uppercase tracking-wider block mb-0.5 text-gvk-navy">
                          Counselor Guidance Note:
                        </span>
                        <p className="text-xs font-normal text-slate-700 leading-relaxed">
                          {app.counselorRemarks}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
          </div>
        </div>

        {/* Right 1 Col: Upcoming Mock Interview & Notifications */}
        <div className="space-y-6">
          {/* Upcoming Mock Interview Spotlight */}
          <div className="bg-white rounded-xl border border-gvk-border p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gvk-text-secondary flex items-center gap-1.5">
                <Video className="w-4 h-4 text-gvk-navy" />
                GVK Mock Interview
              </span>
              {upcomingInterview ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Scheduled
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                  Stage 07 Milestone
                </span>
              )}
            </div>

            {upcomingInterview ? (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gvk-navy leading-snug">
                  {upcomingInterview.title}
                </h3>
                <div className="text-xs text-gvk-text-secondary space-y-1">
                  <p className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gvk-navy" />
                    <span suppressHydrationWarning>{new Date(upcomingInterview.scheduledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gvk-text-muted" />
                    <span>Duration: {upcomingInterview.durationMinutes} Minutes (Priya Varma)</span>
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={upcomingInterview.zoomMeetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button variant="default" size="sm" className="w-full font-bold flex items-center justify-center gap-2">
                      <Video className="w-4 h-4" />
                      <span>Join Zoom Meeting</span>
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </a>
                  <Link href="/student/interview" className="block w-full">
                    <Button variant="outline" size="sm" className="w-full font-bold text-xs border-slate-200 text-slate-700 hover:bg-slate-50">
                      <span>Open Interview Hub →</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-2 space-y-2">
                <p className="text-xs text-slate-500 leading-relaxed">
                  No admissions mock interview scheduled yet. Internal mock interviews are conducted at <strong>Stage 07</strong> prior to official university credibility evaluations.
                </p>
                <Link href="/student/interview" className="block">
                  <Button variant="outline" size="sm" className="w-full font-bold text-xs text-slate-700 border-slate-200 hover:bg-slate-50">
                    Preview Interview Hub →
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Recent Counselor Messages / Updates */}
          <div className="bg-white rounded-xl border border-gvk-border p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gvk-text-secondary flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-gvk-navy" />
                Recent Notifications
              </span>
              <Link href="/student/notifications" className="text-[11px] font-bold text-gvk-navy hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {notifications.slice(0, 3).map((notif) => (
                <div key={notif.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gvk-navy">{notif.title}</span>
                    <span className="text-[10px] text-gvk-text-muted">Just now</span>
                  </div>
                  <p className="text-gvk-text-secondary mt-0.5 line-clamp-2">
                    {notif.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRM UNIVERSITY OFFER ACCEPTANCE MODAL */}
      {acceptOfferModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-gvk-border shadow-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-gvk-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gvk-navy">
                    Confirm Final Destination Acceptance
                  </h3>
                  <p className="text-xs text-gvk-text-secondary">
                    {acceptOfferModal.universityName} • {acceptOfferModal.courseName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAcceptOfferModal(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between text-gvk-text-secondary">
                  <span>Target Program:</span>
                  <strong className="text-gvk-navy">{acceptOfferModal.courseName}</strong>
                </div>
                <div className="flex justify-between text-gvk-text-secondary">
                  <span>Intake Session:</span>
                  <strong className="text-gvk-navy">{acceptOfferModal.intake || "Fall 2026"}</strong>
                </div>
                <div className="flex justify-between text-gvk-text-secondary">
                  <span>Offer Status:</span>
                  <StatusBadge type="application" status={acceptOfferModal.currentStatus} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block mb-0.5 text-xs text-amber-950">
                    Overseas Admission Compliance Rule:
                  </strong>
                  <p className="text-[11px] text-amber-900/95 leading-relaxed">
                    Under study abroad visa and university regulations, <strong>you can only proceed with ONE university</strong> for subsequent stages. By confirming, your Tuition Deposit, CAS Letter, UKVI Tier 4 Visa, and Accommodation stages will strictly proceed for <strong>{acceptOfferModal.universityName}</strong>. Other university applications will be declined.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gvk-border flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAcceptOfferModal(null)}
                className="font-semibold text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmAcceptOffer}
                className="font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Lock Destination</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
