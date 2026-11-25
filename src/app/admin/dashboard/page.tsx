"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Users,
  FileCheck2,
  FolderLock,
  CheckSquare,
  Video,
  Banknote,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Building2,
  Globe2,
  Calendar,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Compass,
  MessageSquare,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [students, setStudents] = useState(() => dataStore.getAllStudents());
  const [counselors, setCounselors] = useState(() => dataStore.getAllCounselors());
  const [applications, setApplications] = useState(() => dataStore.getAllApplications());
  const [documents, setDocuments] = useState(() => dataStore.getAllPendingReviewDocuments());
  const [tasks, setTasks] = useState(() => dataStore.getAllCounselorTasks());
  const [interviews, setInterviews] = useState(() => dataStore.getAllMockInterviews());
  const [loans, setLoans] = useState(() => dataStore.getAllLoanCases());
  const [activities, setActivities] = useState(() => dataStore.getActivityLogs().slice(0, 8));
  const [adminCounselorMessages, setAdminCounselorMessages] = useState(() =>
    dataStore.getAllAdminCounselorMessages("admin")
  );

  useEffect(() => {
    const update = () => {
      setStudents([...dataStore.getAllStudents()]);
      setCounselors([...dataStore.getAllCounselors()]);
      setApplications([...dataStore.getAllApplications()]);
      setDocuments([...dataStore.getAllPendingReviewDocuments()]);
      setTasks([...dataStore.getAllCounselorTasks()]);
      setInterviews([...dataStore.getAllMockInterviews()]);
      setLoans([...dataStore.getAllLoanCases()]);
      setActivities([...dataStore.getActivityLogs().slice(0, 8)]);
      setAdminCounselorMessages([...dataStore.getAllAdminCounselorMessages("admin")]);
    };
    const unsubscribe = dataStore.subscribe(update);
    return () => unsubscribe();
  }, []);

  // Compute live KPIs
  const totalStudents = students.length;
  const unassignedStudents = students.filter(
    (s) => !dataStore.getAssignedCounselor(s.id)
  );
  const activeStudents = totalStudents - unassignedStudents.length;

  const totalCounselors = counselors.length;
  const activeCounselors = counselors.filter((c) => c.isActive).length;

  const submittedApps = applications.filter(
    (a) => a.currentStatus === "submitted" || a.currentStatus === "under_review"
  ).length;
  const conditionalOffers = applications.filter(
    (a) => a.currentStatus === "conditional_offer"
  ).length;
  const unconditionalOffers = applications.filter(
    (a) => a.currentStatus === "unconditional_offer"
  ).length;
  const rejectedApps = applications.filter(
    (a) => a.currentStatus === "rejected"
  ).length;
  const activeApps = applications.length - rejectedApps;

  const pendingDocsCount = documents.length;
  const overdueTasks = tasks.filter((t) => t.isOverdue && t.status !== "completed");
  const upcomingInterviews = interviews.filter(
    (i) => i.status === "scheduled" || i.status === "in_progress"
  );
  const activeLoans = loans.filter((l) => l.stage !== "disbursed" && l.stage !== "not_required");

  // Analytics: Applications by Country
  const appsByCountry = applications.reduce((acc, app) => {
    acc[app.country] = (acc[app.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Analytics: Mock Interview Pass vs Fail
  const interviewPass = interviews.filter((i) => i.feedback?.outcome === "PASS").length;
  const interviewFail = interviews.filter((i) => i.feedback?.outcome === "FAIL").length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Executive Welcome & Live Ops Status */}
      <div className="bg-gradient-to-r from-[#132244] via-[#1a2d59] to-[#253775] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-900/40 relative overflow-hidden">
        {/* Subtle decorative brand motif */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-blue-500/10 to-transparent pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/20">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>GVK Central Command & Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Executive Governance Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Organization-wide admissions oversight, counselor desk workload balancing, sequential milestone tracking, and compliance intelligence across all candidate portfolios.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/assignments"
              className="inline-flex items-center justify-center h-8 px-3 rounded-md bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold text-xs shadow-xs transition-colors"
            >
              <span>Assignments Workbench</span>
              {unassignedStudents.length > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-[#FF0008] text-white text-[10px] font-bold">
                  {unassignedStudents.length}
                </span>
              )}
            </Link>

            <Link
              href="/admin/students?action=enrol"
              className="inline-flex items-center justify-center h-8 px-3 rounded-md bg-white hover:bg-slate-100 text-[#253775] font-black text-xs shadow-lg transition-colors"
            >
              <span>+ Enrol New Candidate</span>
            </Link>
          </div>
        </div>

        {/* Rapid Status Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Admissions Operations</span>
            <strong className="text-white font-mono flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {counselors.length} Active Counselor Desks
            </strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Unassigned Intake Hold</span>
            <strong className={`font-mono mt-0.5 block ${unassignedStudents.length > 0 ? "text-amber-400" : "text-white"}`}>
              {unassignedStudents.length} Candidates Pending Allocation
            </strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Document Verification</span>
            <strong className={`font-mono mt-0.5 block ${pendingDocsCount > 0 ? "text-amber-400" : "text-white"}`}>
              {pendingDocsCount} Files Awaiting Sign-off
            </strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Active Milestone Cycle</span>
            <strong className="text-white font-mono mt-0.5 block">
              September Intake (UK / IE / AU)
            </strong>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (13 Enterprise Metrics) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gvk-text-secondary">
            Platform Key Performance Indicators
          </h2>
          <span className="text-xs text-gvk-text-muted">Live Database Sync</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <AdminStatCard
            title="Total Students"
            value={totalStudents}
            subtitle={`${activeStudents} Active • ${unassignedStudents.length} Hold`}
            icon={GraduationCap}
            href="/admin/students"
            iconBg="bg-blue-50"
            iconColor="text-[#253775]"
          />
          <AdminStatCard
            title="Senior Counselors"
            value={totalCounselors}
            subtitle={`${activeCounselors} Active Desks`}
            icon={Users}
            href="/admin/counselors"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-700"
          />
          <AdminStatCard
            title="Active Applications"
            value={activeApps}
            subtitle={`${submittedApps} Lodged to Universities`}
            icon={FileCheck2}
            href="/admin/applications"
            iconBg="bg-purple-50"
            iconColor="text-purple-700"
          />
          <AdminStatCard
            title="Offers Received"
            value={conditionalOffers + unconditionalOffers}
            subtitle={`${unconditionalOffers} Unconditional • ${conditionalOffers} Conditional`}
            icon={TrendingUp}
            href="/admin/applications?status=offer"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <AdminStatCard
            title="Pending Documents"
            value={pendingDocsCount}
            subtitle={pendingDocsCount > 0 ? "Action Required" : "Queue Pristine"}
            icon={FolderLock}
            href="/admin/documents"
            iconBg="bg-amber-50"
            iconColor="text-amber-700"
          />
          <AdminStatCard
            title="Overdue Tasks"
            value={overdueTasks.length}
            subtitle={overdueTasks.length > 0 ? "Past Milestone SLA" : "All on Track"}
            icon={CheckSquare}
            href="/admin/tasks?filter=overdue"
            iconBg={overdueTasks.length > 0 ? "bg-red-50" : "bg-slate-50"}
            iconColor={overdueTasks.length > 0 ? "text-red-600" : "text-slate-500"}
          />
          <AdminStatCard
            title="Mock Interviews"
            value={interviews.length}
            subtitle={`${upcomingInterviews.length} Upcoming • ${interviewPass} Passed`}
            icon={Video}
            href="/admin/interviews"
            iconBg="bg-indigo-50"
            iconColor="text-indigo-700"
          />
          <AdminStatCard
            title="Loan Pipeline"
            value={activeLoans.length}
            subtitle="Active Bank Cases"
            icon={Banknote}
            href="/admin/loans"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-700"
          />
          <AdminStatCard
            title="Unassigned Queue"
            value={unassignedStudents.length}
            subtitle="Requires Senior Allocation"
            icon={AlertTriangle}
            href="/admin/assignments"
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
          <AdminStatCard
            title="Total Applications"
            value={applications.length}
            subtitle={`${rejectedApps} Rejected`}
            icon={Building2}
            href="/admin/applications"
            iconBg="bg-slate-50"
            iconColor="text-slate-700"
          />
          <AdminStatCard
            title="UK Institutions"
            value={Object.keys(appsByCountry).length > 0 ? "48 Catalog" : "0"}
            subtitle="Russell Group & Tier 1"
            icon={Globe2}
            href="/admin/universities"
            iconBg="bg-blue-50"
            iconColor="text-[#253775]"
          />
          <AdminStatCard
            title="Audit Trail Logs"
            value={activities.length > 0 ? "10+ Events" : "0"}
            subtitle="Immutable Audit Active"
            icon={ShieldCheck}
            href="/admin/activity"
            iconBg="bg-slate-50"
            iconColor="text-slate-700"
          />
        </div>
      </div>

      {/* Analytics & Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Status Pipeline */}
        <AdminCard
          title="Application Pipeline Distribution"
          subtitle="Real-time admissions funnel progression"
          headerAction={
            <Link href="/admin/applications" className="text-xs font-bold text-[#253775] hover:underline">
              View All Applications →
            </Link>
          }
        >
          <div className="space-y-3.5">
            {[
              { label: "Submitted / Under Review", count: submittedApps, color: "bg-blue-600", text: "text-blue-700" },
              { label: "Conditional Offer", count: conditionalOffers, color: "bg-amber-500", text: "text-amber-800" },
              { label: "Unconditional Offer", count: unconditionalOffers, color: "bg-emerald-600", text: "text-emerald-800" },
              { label: "Rejected / Closed", count: rejectedApps, color: "bg-red-500", text: "text-red-700" },
            ].map((st, idx) => {
              const pct = applications.length > 0 ? Math.round((st.count / applications.length) * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gvk-navy">{st.label}</span>
                    <span className="font-mono text-slate-500">
                      {st.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full ${st.color} transition-all duration-500`}
                      style={{ width: `${Math.max(pct, st.count > 0 ? 5 : 0)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </AdminCard>

        {/* Destination Countries Breakdown */}
        <AdminCard
          title="Applications by Destination Country"
          subtitle="Geographic target distribution"
          headerAction={
            <Link href="/admin/universities" className="text-xs font-bold text-[#253775] hover:underline">
              Universities →
            </Link>
          }
        >
          <div className="space-y-3">
            {Object.entries(appsByCountry).length > 0 ? (
              Object.entries(appsByCountry).map(([country, count], idx) => {
                const pct = applications.length > 0 ? Math.round((count / applications.length) * 100) : 0;
                return (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center gap-2.5">
                      <Globe2 className="w-4 h-4 text-[#253775]" />
                      <strong className="text-gvk-navy font-bold">{country}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-gvk-navy">{count} Apps</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#253775] text-[10px] font-bold">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No university applications lodged yet.
              </div>
            )}
          </div>
        </AdminCard>

        {/* Counselor Desk Workload */}
        <AdminCard
          title="Counselor Desk Workload Balance"
          subtitle="Active candidate load per senior advisor"
          headerAction={
            <Link href="/admin/counselors" className="text-xs font-bold text-[#253775] hover:underline">
              Counselors →
            </Link>
          }
        >
          <div className="space-y-3">
            {counselors.map((c) => {
              const assigned = dataStore.getPrimaryAssignedStudents(c.id);
              return (
                <div key={c.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#253775] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {c.firstName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <strong className="text-gvk-navy font-bold block truncate">
                        {c.firstName} {c.lastName}
                      </strong>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {c.employeeIdCode}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gvk-navy font-mono">
                      {assigned.length} Student{assigned.length !== 1 ? "s" : ""}
                    </span>
                    <span className="block text-[10px] text-emerald-700 font-semibold">
                      {c.isActive ? "Active Desk" : "Suspended"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </AdminCard>
      </div>

      {/* Priority Action Required Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-gvk-navy">
              Executive Priority Action Items ({unassignedStudents.length + pendingDocsCount + overdueTasks.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500">Urgent operational items requiring management attention</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Action 1: Unassigned Students */}
          <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-card space-y-3">
            <div className="flex items-start justify-between">
              <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                Admissions Hold
              </span>
              <span className="font-mono text-sm font-bold text-amber-700">{unassignedStudents.length}</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gvk-navy">
                Unassigned Candidates
              </h3>
              <p className="text-xs text-gvk-text-secondary mt-1">
                New students currently in admissions hold awaiting counselor allocation to unlock Stage 01.
              </p>
            </div>
            <Link
              href="/admin/assignments"
              className="block pt-2"
            >
              <span className="inline-flex items-center justify-center w-full h-8 px-3 rounded-md border border-amber-300 text-amber-800 hover:bg-amber-50 font-bold text-xs transition-colors">
                Open Allocation Workbench →
              </span>
            </Link>
          </div>

          {/* Action 2: Document Verification Queue */}
          <div className="bg-white rounded-2xl border border-blue-200 p-5 shadow-card space-y-3">
            <div className="flex items-start justify-between">
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#253775] border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                Verification Queue
              </span>
              <span className="font-mono text-sm font-bold text-[#253775]">{pendingDocsCount}</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gvk-navy">
                Documents Waiting for Review
              </h3>
              <p className="text-xs text-gvk-text-secondary mt-1">
                Academic marksheets, SOPs, and financial affidavits submitted by candidates pending audit.
              </p>
            </div>
            <Link
              href="/admin/documents"
              className="block pt-2"
            >
              <span className="inline-flex items-center justify-center w-full h-8 px-3 rounded-md border border-blue-300 text-[#253775] hover:bg-blue-50 font-bold text-xs transition-colors">
                Review Pending Files →
              </span>
            </Link>
          </div>

          {/* Action 3: Overdue Deliverables */}
          <div className="bg-white rounded-2xl border border-red-200 p-5 shadow-card space-y-3">
            <div className="flex items-start justify-between">
              <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold uppercase tracking-wider">
                SLA Alert
              </span>
              <span className="font-mono text-sm font-bold text-red-600">{overdueTasks.length}</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gvk-navy">
                Overdue Milestone Tasks
              </h3>
              <p className="text-xs text-gvk-text-secondary mt-1">
                Assigned deliverables exceeding deadline dates that may impact intake submission deadlines.
              </p>
            </div>
            <Link
              href="/admin/tasks?filter=overdue"
              className="block pt-2"
            >
              <span className="inline-flex items-center justify-center w-full h-8 px-3 rounded-md border border-red-300 text-red-700 hover:bg-red-50 font-bold text-xs transition-colors">
                Inspect Overdue Tasks →
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Counselor Direct Messages & Desk Alerts */}
      {(() => {
        const unreadCounselorSenders = dataStore.getUnreadMessageSendersCount("admin");
        return (
          <div className="bg-white rounded-2xl border border-gvk-border p-5 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gvk-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#253775] text-white flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-gvk-navy">
                      Counselor Direct Messages & Desk Alerts
                    </h2>
                    {unreadCounselorSenders > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                        {unreadCounselorSenders} Active Alert{unreadCounselorSenders > 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase tracking-wider">
                        All Desks Read
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gvk-text-secondary mt-0.5">
                    Active directives, counselor workload updates, and direct management communication threads.
                  </p>
                </div>
              </div>

              <Link
                href="/admin/communication"
                className="inline-flex items-center justify-center h-8 px-3 rounded-md bg-[#253775] hover:bg-[#1a2754] text-white font-bold text-xs transition-colors"
              >
                Open Communications Hub {unreadCounselorSenders > 0 ? `(${unreadCounselorSenders} Unread)` : ""}
              </Link>
            </div>

            <div className="space-y-2.5">
              {adminCounselorMessages.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  No counselor message threads active yet.
                </div>
              ) : (
                adminCounselorMessages.slice(-3).reverse().map((msg) => {
                  return (
                    <div
                      key={msg.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            msg.senderRole === "counselor" && !msg.isRead
                              ? "bg-emerald-500 animate-pulse ring-2 ring-emerald-200"
                              : "bg-slate-300"
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <strong className="text-gvk-navy font-bold">{msg.senderName}</strong>
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                              {msg.senderRole === "counselor" ? "Senior Counselor" : "Central Admin"}
                            </span>
                            <span suppressHydrationWarning className="text-[10px] text-slate-400 font-mono">
                              {new Date(msg.createdAt).toLocaleDateString()}
                            </span>
                            {!msg.isRead && msg.senderRole === "counselor" && (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                Unread
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 mt-0.5 truncate max-w-xl">
                            &ldquo;{msg.content}&rdquo;
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/admin/counselors/${msg.counselorId}?tab=messages`}
                        className="shrink-0 self-end md:self-auto inline-flex items-center justify-center h-8 px-3 rounded-md border border-slate-300 hover:bg-slate-100 text-xs font-bold transition-colors"
                      >
                        Open Thread →
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })()}

      {/* Recent Central Activity Audit Feed */}
      <AdminCard
        title="Live Central Audit Stream"
        subtitle="Chronological trail of student, counselor, and administrator activities across all workspaces"
        headerAction={
          <Link href="/admin/activity" className="text-xs font-bold text-[#253775] hover:underline">
            View Complete Audit Log →
          </Link>
        }
      >
        <div className="divide-y divide-slate-100">
          {activities.length > 0 ? (
            activities.map((act) => (
              <div key={act.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {act.role}
                    </span>
                    <strong className="text-gvk-navy font-bold truncate">
                      {act.title}
                    </strong>
                  </div>
                  <p className="text-gvk-text-secondary leading-relaxed">
                    {act.description}
                  </p>
                </div>
                <span suppressHydrationWarning className="text-[11px] text-slate-400 font-mono shrink-0">
                  {new Date(act.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No recent activity recorded.
            </div>
          )}
        </div>
      </AdminCard>
    </div>
  );
}
