"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  UserCheck,
  Users,
  GraduationCap,
  AlertCircle,
  Search,
  Filter,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  ShieldAlert,
  History,
  Briefcase,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function CounselorAssignmentsPage() {
  const [tick, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<"unassigned" | "active" | "capacity" | "history">("unassigned");
  const [searchQuery, setSearchQuery] = useState("");
  const [counselorFilter, setCounselorFilter] = useState("all");

  // Allocation / Reassignment Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetStudentId, setTargetStudentId] = useState("");
  const [selectedCounselorId, setSelectedCounselorId] = useState("");
  const [reassignReason, setReassignReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const unsub = dataStore.subscribe(() => setTick((t) => t + 1));
    return () => unsub();
  }, []);

  const students = dataStore.getAllStudents();
  const counselors = dataStore.getAllCounselors();
  const assignments = dataStore.getCounselorAssignments();

  // Categorize students
  const unassignedStudents = useMemo(() => {
    return students.filter((s) => !dataStore.getAssignedCounselor(s.id));
  }, [students, tick]);

  const assignedStudents = useMemo(() => {
    return students
      .filter((s) => !!dataStore.getAssignedCounselor(s.id))
      .map((s) => ({
        student: s,
        counselor: dataStore.getAssignedCounselor(s.id)!,
      }));
  }, [students, tick]);

  // Workload Map
  const counselorWorkload = useMemo(() => {
    return counselors.map((c) => {
      const studentCount = assignedStudents.filter((a) => a.counselor.id === c.id).length;
      const appCount = dataStore.getAllApplications(c.id).length;
      const pendingReviewCount = dataStore.getAllPendingReviewDocuments(c.id).length;
      return {
        ...c,
        studentCount,
        appCount,
        pendingReviewCount,
      };
    });
  }, [counselors, assignedStudents, tick]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleOpenAssignModal = (studentId: string, currentCounselorId?: string) => {
    setTargetStudentId(studentId);
    setSelectedCounselorId(currentCounselorId || counselors[0]?.id || "");
    setReassignReason("");
    setIsModalOpen(true);
  };

  const handleExecuteAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudentId || !selectedCounselorId) return;

    setIsSubmitting(true);
    const stu = students.find((s) => s.id === targetStudentId);
    const prevCounselor = dataStore.getAssignedCounselor(targetStudentId);
    const newCounselor = counselors.find((c) => c.id === selectedCounselorId);

    try {
      dataStore.assignCounselor(targetStudentId, selectedCounselorId);

      // Audit Log
      dataStore.logActivity({
        userId: "admin-gvk",
        userName: "GVK Masters Super Admin",
        role: "admin",
        action: prevCounselor ? "reassign_counselor" : "assign_counselor",
        entityType: "counselor_assignment",
        entityId: targetStudentId,
        title: prevCounselor
          ? `Reassigned ${stu?.name || "Student"} from ${prevCounselor.name} to ${newCounselor?.name}`
          : `Allocated ${stu?.name || "Student"} to ${newCounselor?.name}`,
        description: reassignReason
          ? `Reason: ${reassignReason}`
          : "Standard institutional student counseling desk allocation.",
        affectedStudentId: targetStudentId,
        affectedCounselorId: selectedCounselorId,
      });

      setIsModalOpen(false);
      showToast(
        `Successfully ${
          prevCounselor ? "reassigned" : "allocated"
        } ${stu?.name} to ${newCounselor?.name}.`
      );
    } catch (err: any) {
      alert("Error updating assignment: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAssigned = useMemo(() => {
    return assignedStudents.filter(({ student, counselor }) => {
      const matchSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        counselor.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCounselor = counselorFilter === "all" || counselor.id === counselorFilter;
      return matchSearch && matchCounselor;
    });
  }, [assignedStudents, searchQuery, counselorFilter]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Counselor Assignment Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Institutional candidate distribution, unassigned admissions queue, and real-time counselor workload balancing.
          </p>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Students
            </span>
            <GraduationCap className="w-4 h-4 text-[#253775]" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{students.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Across all intakes & target countries</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Assigned Students
            </span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">
            {assignedStudents.length}
          </div>
          <p className="text-[11px] text-emerald-600 mt-1">
            Active under dedicated counselor desk
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Admissions Hold
            </span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-900 mt-2">
            {unassignedStudents.length}
          </div>
          <p className="text-[11px] text-amber-700 mt-1">
            Unassigned candidates awaiting counselor allocation
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Counselors
            </span>
            <Users className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{counselors.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Avg. {(assignedStudents.length / Math.max(counselors.length, 1)).toFixed(1)} students/counselor
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto scrollbar-none">
          {[
            {
              id: "unassigned",
              label: `Unassigned Admissions Queue (${unassignedStudents.length})`,
              icon: AlertCircle,
              badgeColor: unassignedStudents.length > 0 ? "text-amber-600" : "text-slate-400",
            },
            {
              id: "active",
              label: `Active Assignments (${assignedStudents.length})`,
              icon: UserCheck,
            },
            {
              id: "capacity",
              label: `Counselor Workload & Capacity (${counselors.length})`,
              icon: Briefcase,
            },
            {
              id: "history",
              label: "Audit & Assignment History",
              icon: History,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-[#253775] text-[#253775]"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#253775]" : "text-slate-400"}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* TAB 1: UNASSIGNED STUDENTS QUEUE */}
      {activeTab === "unassigned" && (
        <AdminCard
          title="Unassigned Admissions Queue"
          subtitle="Candidates registered on GVK platform who have not yet been assigned to a counselor desk"
        >
          {unassignedStudents.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">
                Admissions Queue Clear!
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                All registered students currently have an assigned admissions counselor desk.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Candidate Name</th>
                    <th className="py-3 px-4">Candidate ID</th>
                    <th className="py-3 px-4">Destination</th>
                    <th className="py-3 px-4">Target Intake</th>
                    <th className="py-3 px-4">Registration Date</th>
                    <th className="py-3 px-4 text-right">Allocation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {unassignedStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/students/${s.id}`}
                          className="font-bold text-slate-900 hover:text-[#253775]"
                        >
                          {s.name}
                        </Link>
                        <div className="text-[11px] text-slate-500">{s.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-600">
                        {s.studentId}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {s.targetCountry || "United Kingdom"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {s.targetIntake || "September Intake"}
                      </td>
                      <td suppressHydrationWarning className="py-3.5 px-4 text-slate-500">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenAssignModal(s.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#253775] text-white hover:bg-[#1c2a5e] rounded-lg text-xs font-semibold shadow-sm transition-colors"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Allocate Counselor
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>
      )}

      {/* TAB 2: ACTIVE ASSIGNMENTS */}
      {activeTab === "active" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidate or counselor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#253775]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={counselorFilter}
                onChange={(e) => setCounselorFilter(e.target.value)}
                className="border border-slate-200 rounded-lg text-xs px-3 py-2 outline-none focus:border-[#253775] bg-white text-slate-700"
              >
                <option value="all">All Counselors ({counselors.length})</option>
                {counselors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.employeeId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <AdminCard title="Active Counselor-Student Pairings" subtitle="Live authorized assignments with access permissions">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Student Candidate</th>
                    <th className="py-3 px-4">Assigned Counselor</th>
                    <th className="py-3 px-4">Destination & Intake</th>
                    <th className="py-3 px-4">Applications</th>
                    <th className="py-3 px-4">Stage Progress</th>
                    <th className="py-3 px-4 text-right">Reassign</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAssigned.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No active pairings match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredAssigned.map(({ student, counselor }) => {
                      const apps = dataStore.getStudentApplications(student.id);
                      const journey = dataStore.getStudentJourney(student.id);
                      const activeStage =
                        journey.find((j) => j.status === "in_progress") || journey[0];
                      return (
                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <Link
                              href={`/admin/students/${student.id}`}
                              className="font-bold text-slate-900 hover:text-[#253775]"
                            >
                              {student.name}
                            </Link>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {student.studentId} • {student.email}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Link
                              href={`/admin/counselors/${counselor.id}`}
                              className="font-bold text-slate-800 hover:text-[#253775] flex items-center gap-1.5"
                            >
                              {counselor.name}
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({counselor.employeeId})
                              </span>
                            </Link>
                            <div className="text-[11px] text-slate-500">
                              {counselor.specialization || "Admissions Desk"}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {student.targetCountry || "United Kingdom"}
                            <div className="text-[11px] text-slate-400">
                              {student.targetIntake || "September Intake"}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700">
                              {apps.length} apps
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs font-medium text-slate-700">
                              Stage {activeStage?.stageNumber || 1}: {activeStage?.stageName}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleOpenAssignModal(student.id, counselor.id)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
                              Reassign
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
        </div>
      )}

      {/* TAB 3: COUNSELOR CAPACITY & WORKLOAD */}
      {activeTab === "capacity" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {counselorWorkload.map((c) => {
              const isHeavy = c.studentCount >= 10;
              const isNormal = c.studentCount > 0 && c.studentCount < 10;
              return (
                <div
                  key={c.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        href={`/admin/counselors/${c.id}`}
                        className="font-bold text-slate-900 hover:text-[#253775] text-sm"
                      >
                        {c.name}
                      </Link>
                      <p className="text-[11px] font-mono text-slate-400">{c.employeeId}</p>
                      <p className="text-xs text-slate-500 mt-1">{c.specialization}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        isHeavy
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : isNormal
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isHeavy ? "High Load" : isNormal ? "Optimal" : "Available"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-lg font-bold text-slate-900">{c.studentCount}</span>
                      <p className="text-[10px] text-slate-500 font-medium">Students</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-lg font-bold text-blue-600">{c.appCount}</span>
                      <p className="text-[10px] text-slate-500 font-medium">Active Apps</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-lg font-bold text-amber-600">
                        {c.pendingReviewCount}
                      </span>
                      <p className="text-[10px] text-slate-500 font-medium">Pending Docs</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-500">{c.email}</span>
                    <Link
                      href={`/admin/counselors/${c.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#253775] hover:underline"
                    >
                      Desk Workspace <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT HISTORY */}
      {activeTab === "history" && (
        <AdminCard
          title="Counselor Assignment Audit Trail"
          subtitle="Chronological record of candidate allocations, reassignments, and administrative handovers"
        >
          <div className="divide-y divide-slate-100">
            {assignments.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">
                No assignment records logged in system.
              </p>
            ) : (
              assignments.map((a, i) => (
                <div key={i} className="py-3.5 flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{a.studentName}</span>
                      <span className="text-[11px] font-mono text-slate-400">
                        ({a.studentIdCode})
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className="font-bold text-blue-700">{a.counselorName}</span>
                      <span className="text-[11px] font-mono text-slate-400">
                        ({a.counselorIdCode})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Status:{" "}
                      <span
                        className={`font-semibold ${
                          a.isActive ? "text-emerald-600" : "text-slate-400"
                        }`}
                      >
                        {a.isActive ? "Active Authorized Assignment" : "Historical / Superseded"}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      a.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {a.isActive ? "Active" : "Archived"}
                  </span>
                </div>
              ))
            )}
          </div>
        </AdminCard>
      )}

      {/* ALLOCATION / REASSIGNMENT MODAL */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Allocate or Reassign Counselor"
        description="Connect candidate to an admissions counselor. Authorizations, live notifications, and journey task assignments will automatically update."
      >
        <form onSubmit={handleExecuteAssignment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Candidate Student
            </label>
            <select
              required
              value={targetStudentId}
              onChange={(e) => setTargetStudentId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white text-slate-800"
            >
              <option value="">-- Choose Candidate --</option>
              {students.map((s) => {
                const assigned = dataStore.getAssignedCounselor(s.id);
                return (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.studentId}) — Currently:{" "}
                    {assigned ? assigned.name : "Unassigned"}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assign to Admissions Counselor Desk
            </label>
            <select
              required
              value={selectedCounselorId}
              onChange={(e) => setSelectedCounselorId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white text-slate-800"
            >
              <option value="">-- Choose Target Counselor --</option>
              {counselors.map((c) => {
                const count = assignedStudents.filter((a) => a.counselor.id === c.id).length;
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.employeeId}) — {count} students assigned
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reassignment / Allocation Handover Notes
            </label>
            <textarea
              rows={3}
              value={reassignReason}
              onChange={(e) => setReassignReason(e.target.value)}
              placeholder="e.g. Student requested specialization in UK Russell Group computing programs..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              Role Authorization Notice:
            </div>
            <p className="text-[11px] leading-relaxed">
              Upon submitting, the newly designated counselor will receive authorized access to the candidate's files, journey milestones, documents, and chat thread. The previous counselor's access will be revoked according to institutional privacy rules.
            </p>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#253775] text-white rounded-lg text-xs font-semibold hover:bg-[#1c2a5e] disabled:opacity-50"
            >
              {isSubmitting ? "Processing..." : "Confirm & Execute Allocation"}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
