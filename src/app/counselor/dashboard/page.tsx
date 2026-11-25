"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Users,
  GraduationCap,
  Award,
  ShieldCheck,
  CheckSquare,
  Video,
  Banknote,
  PhoneCall,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Building,
  Calendar,
  ExternalLink,
  History,
  User,
  Lock,
  MessageSquare,
} from "lucide-react";

export default function CounselorDashboardPage() {
  const { user } = useCurrentUser();
  const counselorId = user?.role === "counselor" ? user.id : "usr-counselor-01";
  const counselor = dataStore.getCounselorProfile(counselorId);

  const [assignedStudents, setAssignedStudents] = useState(() => dataStore.getAssignedStudents(counselorId));
  const [allApps, setAllApps] = useState(() =>
    dataStore.getAllApplications().filter((app) =>
      dataStore.getAssignedStudents(counselorId).some((s) => s.id === app.studentId)
    )
  );
  const [pendingDocs, setPendingDocs] = useState(() =>
    dataStore.getAllPendingReviewDocuments().filter((doc) =>
      dataStore.getAssignedStudents(counselorId).some((s) => s.id === doc.studentId)
    )
  );
  const [counselorTasks, setCounselorTasks] = useState(() => dataStore.getAllCounselorTasks(counselorId));
  const [mockInterviews, setMockInterviews] = useState(() =>
    dataStore.getAllMockInterviews().filter((m) =>
      dataStore.getAssignedStudents(counselorId).some((s) => s.id === (m as any).studentId)
    )
  );
  const [activityLogs, setActivityLogs] = useState(() => dataStore.getActivityLogs());

  useEffect(() => {
    const students = dataStore.getAssignedStudents(counselorId);
    setAssignedStudents(students);
    setAllApps(dataStore.getAllApplications().filter((app) => students.some((s) => s.id === app.studentId)));
    setPendingDocs(dataStore.getAllPendingReviewDocuments().filter((doc) => students.some((s) => s.id === doc.studentId)));
    setCounselorTasks(dataStore.getAllCounselorTasks(counselorId));
    setMockInterviews(dataStore.getAllMockInterviews().filter((m) => students.some((s) => s.id === (m as any).studentId)));
    setActivityLogs(dataStore.getActivityLogs());

    const unsubscribe = dataStore.subscribe(() => {
      const liveStudents = dataStore.getAssignedStudents(counselorId);
      setAssignedStudents(liveStudents);
      setAllApps(
        dataStore.getAllApplications().filter((app) => liveStudents.some((s) => s.id === app.studentId))
      );
      setPendingDocs(
        dataStore.getAllPendingReviewDocuments().filter((doc) => liveStudents.some((s) => s.id === doc.studentId))
      );
      setCounselorTasks(dataStore.getAllCounselorTasks(counselorId));
      setMockInterviews(
        dataStore.getAllMockInterviews().filter((m) => liveStudents.some((s) => s.id === (m as any).studentId))
      );
      setActivityLogs(dataStore.getActivityLogs());
    });
    return () => unsubscribe();
  }, [counselorId]);

  // Compute live metrics from dataStore
  const totalStudents = assignedStudents.length;
  const activeStudents = assignedStudents.length;
  const appsInProgress = allApps.filter(
    (a) => a.currentStatus !== "completed" && a.currentStatus !== "rejected" && a.currentStatus !== "withdrawn"
  ).length;
  const offersReceived = allApps.filter(
    (a) => a.currentStatus === "conditional_offer" || a.currentStatus === "unconditional_offer"
  ).length;
  const waitingUni = allApps.filter(
    (a) => a.currentStatus === "submitted" || a.currentStatus === "under_review"
  ).length;
  const docsAwaitingReview = pendingDocs.length;
  const upcomingInterviews = mockInterviews.filter((m) => m.status === "scheduled").length;
  const overdueTasks = counselorTasks.filter((t) => t.isOverdue).length;
  const tasksDueSoon = counselorTasks.filter((t) => t.status === "pending" || t.status === "in_progress").length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* 1. Header Ribbon */}
      <div className="bg-white rounded-2xl border border-gvk-border p-6 sm:p-7 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md">
              {counselor?.firstName?.charAt(0) || "P"}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-gvk-navy">
                  Counselor Operations Command Center
                </h1>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {counselor?.employeeIdCode}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gvk-text-secondary mt-1">
                Overseeing <strong className="text-gvk-text-primary">{totalStudents} Assigned Masters Candidates</strong> • Specialist: UK, Ireland, Australia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <Link href="/counselor/documents">
              <Button variant="default" size="sm" className="font-bold flex items-center gap-1.5 shadow-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Review Documents ({docsAwaitingReview})</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Real Database-Driven Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Link
          href="/counselor/students"
          className="p-5 rounded-2xl bg-white border border-gvk-border shadow-card hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gvk-text-secondary group-hover:text-gvk-navy transition-colors">
              Assigned Students
            </span>
            <div className="w-8 h-8 rounded-lg bg-gvk-navy-50 text-gvk-navy flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-gvk-navy font-mono">
            {totalStudents}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            {activeStudents} Active in Pipeline
          </span>
        </Link>

        <Link
          href="/counselor/applications"
          className="p-5 rounded-2xl bg-white border border-gvk-border shadow-card hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gvk-text-secondary group-hover:text-gvk-navy transition-colors">
              Offers Secured
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-700 font-mono">
            {offersReceived}
          </div>
          <span className="text-[11px] text-gvk-text-secondary mt-1 block">
            {waitingUni} Under University Review
          </span>
        </Link>

        <Link
          href="/counselor/documents"
          className="p-5 rounded-2xl bg-white border border-gvk-border shadow-card hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gvk-text-secondary group-hover:text-amber-600 transition-colors">
              Verification Queue
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-700 font-mono">
            {docsAwaitingReview}
          </div>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 block">
            Awaiting Counselor Review
          </span>
        </Link>

        <Link
          href="/counselor/mock-interviews"
          className="p-5 rounded-2xl bg-white border border-gvk-border shadow-card hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gvk-text-secondary group-hover:text-gvk-navy transition-colors">
              Mock Interviews
            </span>
            <div className="w-8 h-8 rounded-lg bg-gvk-navy-50 text-gvk-navy flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-gvk-navy font-mono">
            {upcomingInterviews}
          </div>
          <span className="text-[11px] text-gvk-navy font-semibold mt-1 block">
            Scheduled Sessions
          </span>
        </Link>
      </div>

      {/* Real-time Unread Message Alert Banner */}
      {(() => {
        const unreadStudentCount = dataStore.getUnreadMessageSendersCount("counselor", counselorId);
        if (unreadStudentCount === 0) return null; // Alert is GONE when read!
        return (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-300">
                <MessageSquare className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    {unreadStudentCount} Candidate Message Alert{unreadStudentCount > 1 ? "s" : ""}
                  </span>
                  <span className="text-emerald-900 font-semibold">
                    New message{unreadStudentCount > 1 ? "s" : ""} received from {unreadStudentCount} candidate{unreadStudentCount > 1 ? "s" : ""}
                  </span>
                </div>
                <p className="text-emerald-950 text-[11px] mt-0.5">
                  Open your communications desk to review and respond to student inquiries.
                </p>
              </div>
            </div>
            <Link href="/counselor/communication" className="shrink-0 self-end sm:self-auto">
              <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs">
                Open Communications Desk ({unreadStudentCount}) →
              </Button>
            </Link>
          </div>
        );
      })()}

      {/* 3. Follow-up Workbench Banner & Priority Queue */}
      <div className="rounded-2xl border border-gvk-border bg-white p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gvk-navy text-white flex items-center justify-center shadow-sm">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gvk-navy">
                Counselor Follow-up & Inactivity Alerts
              </h2>
              <p className="text-xs text-gvk-text-secondary">
                Students requiring action, document resubmissions, or upcoming intake deadlines.
              </p>
            </div>
          </div>

          <Link href="/counselor/follow-ups">
            <Button variant="default" size="sm" className="font-bold">
              Open Follow-up Desk
            </Button>
          </Link>
        </div>

        <div className="space-y-2.5">
          {assignedStudents.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
              No follow-ups active. Your candidate roster is currently fresh with 0 students assigned.
            </div>
          ) : (
            assignedStudents.map((stu) => {
              const stuTasks = counselorTasks.filter((t) => t.studentId === stu.id);
              const journey = dataStore.getStudentJourney(stu.id);
              const activeStage = journey.find((s) => s.status !== "completed");

              return (
                <div
                  key={stu.id}
                  className="p-3.5 rounded-xl bg-white border border-gvk-border flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <strong className="text-gvk-navy">
                        {stu.firstName} {stu.lastName} ({stu.studentIdCode}) • Stage {activeStage?.stageNumber.toString().padStart(2, "0") || "01"} Active
                      </strong>
                      <p className="text-gvk-text-secondary mt-0.5">
                        {stuTasks.length > 0
                          ? `${stuTasks[0].title} (Due: ${stuTasks[0].dueDate}); ${stuTasks.length} deliverable(s) active.`
                          : "Stage 01 Counseling Session scheduled. No overdue items."}
                      </p>
                    </div>
                  </div>
                  <Link href={`/counselor/students/${stu.id}`}>
                    <Button variant="outlineNavy" size="sm" className="font-bold text-xs">
                      Open Workspace →
                    </Button>
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Split Workbench: Assigned Students & Application Status Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Assigned Student Roster Quick View */}
        <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gvk-navy flex items-center gap-2">
              <Users className="w-4 h-4 text-gvk-navy" />
              <span>Assigned Students Roster ({assignedStudents.length})</span>
            </h2>
            <Link href="/counselor/students" className="text-xs font-bold text-gvk-navy hover:underline">
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {assignedStudents.length === 0 ? (
              <div className="p-8 text-center text-xs text-gvk-text-muted">
                <Users className="w-8 h-8 opacity-40 mx-auto mb-2 text-gvk-navy" />
                <p className="font-bold text-gvk-navy">No Candidates Assigned Yet</p>
                <p className="text-gvk-text-secondary mt-0.5">
                  Your desk is fresh and ready. As GVK Admissions Administration allocates candidates to your specialization, they will appear here.
                </p>
              </div>
            ) : (
              assignedStudents.map((stu) => (
                <div
                  key={stu.id}
                  className="p-4 rounded-xl border border-gvk-border bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gvk-navy truncate">
                        {stu.firstName} {stu.lastName}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200">
                        {stu.studentIdCode}
                      </span>
                    </div>
                    <p className="text-xs text-gvk-text-secondary mt-0.5 truncate">
                      {stu.targetDegree} • {stu.preferredCountry} ({stu.targetIntake})
                    </p>
                  </div>

                  <Link href={`/counselor/students/${stu.id}`}>
                    <Button variant="outline" size="sm" className="text-xs font-bold shrink-0">
                      Workspace
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Applications Pipeline Matrix */}
        <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gvk-navy flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-gvk-navy" />
              <span>Live Application Matrix</span>
            </h2>
            <Link href="/counselor/applications" className="text-xs font-bold text-gvk-navy hover:underline">
              Manage Matrix →
            </Link>
          </div>

          <div className="space-y-3">
            {allApps.length === 0 ? (
              <div className="p-8 text-center text-xs text-gvk-text-muted">
                <GraduationCap className="w-8 h-8 opacity-40 mx-auto mb-2 text-gvk-navy" />
                <p className="font-bold text-gvk-navy">No Applications Lodged Yet</p>
                <p className="text-gvk-text-secondary mt-0.5">
                  Applications unlock sequentially at Stage 05 once university shortlisting is finalized.
                </p>
              </div>
            ) : (
              allApps.slice(0, 4).map((app) => (
                <div
                  key={app.id}
                  className="p-3.5 rounded-xl border border-gvk-border bg-white flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gvk-navy truncate">
                        {app.universityName}
                      </span>
                      <span className="text-[10px] text-gvk-text-secondary font-semibold">
                        ({app.studentName})
                      </span>
                    </div>
                    <p className="text-[11px] text-gvk-text-secondary truncate mt-0.5">
                      {app.courseName}
                    </p>
                  </div>

                  <StatusBadge type="application" status={app.currentStatus} className="shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. Live User Activity Stream Across All Users (Student, Counselor, Admin) */}
      <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gvk-border">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gvk-navy flex items-center gap-2">
                <History className="w-4 h-4 text-gvk-navy" />
                <span>Live System Activity Stream ({activityLogs.length})</span>
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Real-Time Sync Active
              </span>
            </div>
            <p className="text-xs text-gvk-text-secondary mt-0.5">
              Live chronological activity stream tracking actions taken by students, counselors, and administrators.
            </p>
          </div>
          <span className="text-[10px] uppercase font-mono font-bold text-gvk-text-muted bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 self-start sm:self-center">
            Audited Trail
          </span>
        </div>

        <div className="space-y-3">
          {activityLogs.slice(0, 6).map((log) => {
            const isStudent = log.role === "student";
            const isCounselor = log.role === "counselor";
            const isAdmin = log.role === "admin";

            return (
              <div
                key={log.id}
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                  isStudent
                    ? "bg-blue-50/20 border-blue-200"
                    : isCounselor
                    ? "bg-emerald-50/20 border-emerald-200"
                    : "bg-purple-50/20 border-purple-200"
                }`}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                        isStudent
                          ? "bg-blue-100 text-blue-800"
                          : isCounselor
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {isStudent && <User className="w-3 h-3" />}
                      {isCounselor && <ShieldCheck className="w-3 h-3" />}
                      {isAdmin && <Lock className="w-3 h-3" />}
                      <span>{log.role}</span>
                    </span>

                    <strong className="text-gvk-navy font-bold text-xs">
                      {log.userName || log.role}
                    </strong>

                    <span className="font-mono text-[10px] text-gvk-text-muted px-1.5 py-0.5 rounded bg-slate-100">
                      {log.action}
                    </span>
                  </div>

                  <strong className="text-xs font-bold text-gvk-navy block">
                    {log.title || log.action.replace(/_/g, " ")}
                  </strong>

                  {log.description && (
                    <p className="text-gvk-text-secondary text-[11px] leading-relaxed">
                      {log.description}
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex items-center sm:flex-col sm:items-end gap-1 text-[10px] text-gvk-text-muted font-mono">
                  <span suppressHydrationWarning className="font-semibold text-gvk-navy">
                    {new Date(log.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </span>
                  <span suppressHydrationWarning>
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
