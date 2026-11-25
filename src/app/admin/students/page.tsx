"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { dataStore, generateUniqueActivationCode } from "@/lib/data/store";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminModal } from "@/components/admin/AdminModal";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GraduationCap,
  Search,
  Plus,
  Filter,
  Users,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Mail,
  Phone,
  Edit3,
  UserCheck,
  ShieldCheck,
  KeyRound,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Ban,
  UserX,
  ShieldAlert,
  Trash2,
  Eye,
  EyeOff,
  Key,
} from "lucide-react";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState(() => dataStore.getAllStudents());
  const [counselors, setCounselors] = useState(() => dataStore.getAllCounselors());
  const [users, setUsers] = useState(() => dataStore.getAllUsers());

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [counselorFilter, setCounselorFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal states
  const [enrolModalOpen, setEnrolModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<any | null>(null);
  const [credentialsModal, setCredentialsModal] = useState<any | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Credentials visibility state
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [revealAll, setRevealAll] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleRevealPassword = (id: string) => {
    setRevealedPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Delete Candidate Confirmation Modal
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    student: any | null;
    reason: string;
  }>({
    isOpen: false,
    student: null,
    reason: "",
  });

  const handleConfirmDelete = () => {
    if (!deleteConfirmModal.student) return;
    dataStore.deleteStudent(deleteConfirmModal.student.id, deleteConfirmModal.reason);
    setDeleteConfirmModal({ isOpen: false, student: null, reason: "" });
    setStudents(dataStore.getAllStudents());
    setUsers(dataStore.getAllUsers());
  };

  // Form states for enrol
  const createNewEnrolForm = (country = "United Kingdom") => {
    const existing = students.map((s) => (s as any).activationCode);
    const freshCode = generateUniqueActivationCode(country, existing);
    return {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      studentIdCode: "",
      targetDegree: "",
      preferredCountry: country,
      targetIntake: "September Intake",
      ugCollege: "",
      ugCgpa: "",
      assignedCounselorId: "",
      password: "",
      activationCode: freshCode,
    };
  };

  const [enrolForm, setEnrolForm] = useState(() => createNewEnrolForm("United Kingdom"));

  // Check URL query parameters and custom admin action events
  useEffect(() => {
    const checkAction = () => {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("action") === "enrol") {
          setEnrolForm(createNewEnrolForm());
          setEnrolModalOpen(true);
        }
      }
    };
    checkAction();

    const handleCustomAction = (e: any) => {
      if (e.detail?.action === "enrol") {
        setEnrolForm(createNewEnrolForm());
        setEnrolModalOpen(true);
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
    const update = () => {
      setStudents([...dataStore.getAllStudents()]);
      setCounselors([...dataStore.getAllCounselors()]);
      setUsers([...dataStore.getAllUsers()]);
    };
    const unsubscribe = dataStore.subscribe(update);
    return () => unsubscribe();
  }, []);

  // Filter students
  const filteredStudents = students.filter((stu) => {
    const counselor = dataStore.getAssignedCounselor(stu.id);
    const userObj = users.find((u) => u.id === stu.id);
    const userEmail = userObj?.email || "";
    const userStatus = userObj?.status || "active";

    const matchesSearch =
      stu.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.studentIdCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.targetDegree.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (counselorFilter === "unassigned" && counselor) return false;
    if (counselorFilter === "assigned" && !counselor) return false;
    if (counselorFilter !== "all" && counselorFilter !== "unassigned" && counselorFilter !== "assigned") {
      if (counselor?.id !== counselorFilter) return false;
    }

    if (countryFilter !== "all" && stu.preferredCountry !== countryFilter) return false;
    if (statusFilter !== "all" && userStatus !== statusFilter) return false;

    return true;
  });

  const handleEnrolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrolForm.firstName || !enrolForm.lastName || !enrolForm.email) return;

    const defaultPassword = enrolForm.password?.trim() || "GvkStudent@2026";
    const actCode = enrolForm.activationCode?.trim() || generateUniqueActivationCode(enrolForm.preferredCountry);

    const created = dataStore.createStudent({
      firstName: enrolForm.firstName.trim(),
      lastName: enrolForm.lastName.trim(),
      email: enrolForm.email.trim(),
      phone: enrolForm.phone?.trim() || "",
      studentIdCode: enrolForm.studentIdCode?.trim() || undefined,
      preferredCountry: enrolForm.preferredCountry,
      targetDegree: enrolForm.targetDegree?.trim() || "General Masters",
      targetIntake: enrolForm.targetIntake,
      ugCollege: enrolForm.ugCollege?.trim() || "",
      ugCgpa: enrolForm.ugCgpa ? Number(enrolForm.ugCgpa) : 0,
      assignedCounselorId: enrolForm.assignedCounselorId || undefined,
      password: defaultPassword,
      activationCode: actCode,
    });

    const finalCode = (created as any).activationCode || actCode;
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

    setCredentialsModal({
      name: `${created.firstName} ${created.lastName}`,
      studentIdCode: created.studentIdCode,
      email: enrolForm.email,
      activationCode: finalCode,
      activationUrl: `${origin}/auth/activate?token=${finalCode}`,
      password: defaultPassword,
      counselorName: enrolForm.assignedCounselorId
        ? counselors.find((c) => c.id === enrolForm.assignedCounselorId)?.firstName
        : "Unassigned (Hold)",
    });

    setEnrolModalOpen(false);
    setEnrolForm(createNewEnrolForm());
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForEdit) return;

    dataStore.updateStudentProfile(selectedStudentForEdit.id, {
      firstName: selectedStudentForEdit.firstName,
      lastName: selectedStudentForEdit.lastName,
      phone: selectedStudentForEdit.phone,
      targetDegree: selectedStudentForEdit.targetDegree,
      preferredCountry: selectedStudentForEdit.preferredCountry,
      targetIntake: selectedStudentForEdit.targetIntake,
      ugCollege: selectedStudentForEdit.ugCollege,
      ugCgpa: Number(selectedStudentForEdit.ugCgpa),
      email: selectedStudentForEdit.email,
      password: selectedStudentForEdit.password,
      status: selectedStudentForEdit.status,
    });

    setEditModalOpen(false);
    setSelectedStudentForEdit(null);
  };

  const exportStudentsCSV = () => {
    const headers = ["Student ID,First Name,Last Name,Email,Password,Phone,Target Degree,Target Country,Intake,UG College,UG CGPA,Counselor\n"];
    const rows = filteredStudents.map((s) => {
      const email = users.find((u) => u.id === s.id)?.email || "";
      const password = dataStore.getUserPassword(s.id);
      const counselor = dataStore.getAssignedCounselor(s.id);
      const counselorName = counselor ? `${counselor.firstName} ${counselor.lastName}` : "Unassigned";
      return `"${s.studentIdCode}","${s.firstName}","${s.lastName}","${email}","${password}","${s.phone}","${s.targetDegree}","${s.preferredCountry}","${s.targetIntake}","${s.ugCollege}","${s.ugCgpa}","${counselorName}"`;
    });
    const blob = new Blob([headers.concat(rows.join("\n")).join("")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `gvk_students_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Control Bar */}
      <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-blue-50 text-[#253775]">
              <GraduationCap className="w-5 h-5 text-[#253775]" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gvk-navy tracking-tight">
              Student Master Directory ({students.length})
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gvk-text-secondary">
            Manage student registrations, academic profile parameters, counselor allocations, and milestone progression.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={exportStudentsCSV}
            className="text-xs font-bold flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>

          <Button
            onClick={() => {
              setEnrolForm(createNewEnrolForm());
              setEnrolModalOpen(true);
            }}
            size="sm"
            className="bg-[#253775] hover:bg-[#1a2754] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Enrol Student</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gvk-border p-4 shadow-card flex flex-col lg:flex-row items-center gap-3">
        <div className="w-full lg:w-96 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, ID code, degree, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-gvk-navy placeholder:text-slate-400 focus:outline-hidden focus:border-[#253775] focus:bg-white transition-all shadow-2xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Counselor filter */}
          <select
            value={counselorFilter}
            onChange={(e) => setCounselorFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-gvk-navy focus:outline-hidden"
          >
            <option value="all">All Counselor Allocations</option>
            <option value="unassigned">⚠️ Unassigned (Admissions Hold)</option>
            <option value="assigned">✅ Assigned to Counselor</option>
            {counselors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName} ({c.employeeIdCode})
              </option>
            ))}
          </select>

          {/* Country filter */}
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-gvk-navy focus:outline-hidden"
          >
            <option value="all">All Target Countries</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Ireland">Ireland</option>
            <option value="Australia">Australia</option>
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
          </select>

          {/* Account status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-gvk-navy focus:outline-hidden"
          >
            <option value="all">All Account Statuses</option>
            <option value="active">Active Accounts</option>
            <option value="suspended">Suspended Accounts</option>
          </select>

          {/* Show All Passwords Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setRevealAll(!revealAll)}
            className={`h-9 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              revealAll
                ? "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            {revealAll ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-amber-700" />
                <span>Hide Passwords</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-slate-600" />
                <span>Show All Passwords</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-gvk-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-gvk-border text-gvk-text-secondary font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 sm:px-6">Candidate & Student ID</th>
                <th className="py-3.5 px-4">Contact & Credentials</th>
                <th className="py-3.5 px-4">Target Course & Intake</th>
                <th className="py-3.5 px-4">Academic Background</th>
                <th className="py-3.5 px-4">Assigned Counselor</th>
                <th className="py-3.5 px-4">Applications</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Workspace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gvk-border">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <GraduationCap className="w-10 h-10 opacity-40 mx-auto mb-2 text-[#253775]" />
                    <p className="font-bold text-gvk-navy text-sm">No Student Records Found</p>
                    <p className="text-xs text-gvk-text-secondary mt-1">
                      No candidates match your current search and filter criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => {
                  const counselor = dataStore.getAssignedCounselor(stu.id);
                  const userObj = users.find((u) => u.id === stu.id);
                  const email = userObj?.email || dataStore.getUserEmail(stu.id);
                  const userStatus = userObj?.status || "active";
                  const apps = dataStore.getStudentApplications(stu.id);
                  const offersCount = apps.filter((a) => a.currentStatus.includes("offer")).length;

                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & ID */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#253775] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {stu.firstName.charAt(0)}
                          </div>
                          <div>
                            <strong className="text-sm font-bold text-gvk-navy block">
                              {stu.firstName} {stu.lastName}
                            </strong>
                            <span className="font-mono text-[11px] text-slate-500">
                              {stu.studentIdCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact & Credentials */}
                      <td className="py-4 px-4 text-gvk-text-secondary space-y-1.5">
                        {/* Email with copy */}
                        <div className="flex items-center gap-1.5 group">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-gvk-navy truncate max-w-[170px]" title={email}>
                            {email}
                          </span>
                          {email && (
                            <button
                              type="button"
                              onClick={() => handleCopy(email, `email-${stu.id}`)}
                              className="p-1 rounded text-slate-400 hover:text-[#253775] hover:bg-slate-100 transition-colors"
                              title="Copy Email"
                            >
                              {copiedId === `email-${stu.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>

                        {/* Password with eye toggle & copy */}
                        <div className="flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                            <span className="font-mono text-xs text-gvk-navy font-semibold select-all">
                              {revealAll || revealedPasswords[stu.id]
                                ? (stu.password || userObj?.passwordHash || "Student@123")
                                : "••••••••"}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleRevealPassword(stu.id)}
                              className="p-0.5 text-slate-400 hover:text-slate-700 transition-colors ml-1"
                              title={revealedPasswords[stu.id] || revealAll ? "Hide Password" : "Show Password"}
                            >
                              {revealAll || revealedPasswords[stu.id] ? (
                                <EyeOff className="w-3 h-3" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(
                                  stu.password || userObj?.passwordHash || "Student@123",
                                  `pwd-${stu.id}`
                                )
                              }
                              className="p-0.5 text-slate-400 hover:text-[#253775] transition-colors"
                              title="Copy Password"
                            >
                              {copiedId === `pwd-${stu.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>

                        {stu.phone && (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="font-mono text-slate-500">{stu.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Target Course & Intake */}
                      <td className="py-4 px-4">
                        <strong className="text-gvk-navy block font-bold truncate max-w-[180px]">
                          {stu.targetDegree}
                        </strong>
                        <span className="text-slate-500 text-[11px]">
                          {stu.preferredCountry} ({stu.targetIntake})
                        </span>
                      </td>

                      {/* Academic Background */}
                      <td className="py-4 px-4">
                        <span className="font-semibold text-gvk-navy block truncate max-w-[160px]">
                          {stu.ugCollege}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          CGPA: <strong className="text-gvk-navy font-mono">{stu.ugCgpa}</strong> • Backlogs: {stu.ugBacklogs || 0}
                        </span>
                      </td>

                      {/* Assigned Counselor */}
                      <td className="py-4 px-4">
                        {counselor ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <div>
                              <strong className="text-gvk-navy block font-semibold">
                                {counselor.firstName} {counselor.lastName}
                              </strong>
                              <span className="font-mono text-[10px] text-slate-400">
                                {counselor.employeeIdCode}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <Link href={`/admin/assignments?studentId=${stu.id}`}>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-[11px] font-bold hover:bg-amber-100 transition-colors">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>Assign Counselor</span>
                            </span>
                          </Link>
                        )}
                      </td>

                      {/* Applications count */}
                      <td className="py-4 px-4">
                        <span className="font-mono font-bold text-gvk-navy block">
                          {apps.length} Lodged
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold block">
                          {offersCount} Offers in Hand
                        </span>
                      </td>

                      {/* Account status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            userStatus === "active"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : userStatus === "pending_activation"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-red-50 text-red-800 border border-red-200"
                          }`}
                        >
                          {userStatus === "pending_activation" ? "Pending Activation" : userStatus}
                        </span>
                        {(stu as any).activationCode && (
                          <div className="mt-1 flex items-center gap-1 font-mono text-[10px] text-slate-500">
                            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                              {(stu as any).activationCode}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setDeleteConfirmModal({
                                isOpen: true,
                                student: stu,
                                reason: "",
                              })
                            }
                            className="h-8 px-2.5 text-[11px] font-bold text-red-700 bg-red-50/70 border-red-200 hover:bg-red-100 hover:text-red-900 flex items-center gap-1 shadow-2xs transition-colors"
                            title="Delete Candidate Account"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                            <span>Delete</span>
                          </Button>

                          <button
                            onClick={() => {
                              setSelectedStudentForEdit({
                                ...stu,
                                email,
                                password: stu.password || userObj?.passwordHash || "Student@123",
                                status: userStatus,
                              });
                              setEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                            title="Edit Student Parameters"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <Link
                            href={`/admin/students/${stu.id}`}
                            className="inline-flex items-center justify-center h-8 px-3 rounded-md font-bold text-xs bg-[#253775] hover:bg-[#1a2754] text-white transition-colors shadow-2xs"
                          >
                            <span>Profile</span>
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enrol Student Modal */}
      <AdminModal
        isOpen={enrolModalOpen}
        onClose={() => {
          setEnrolModalOpen(false);
          setEnrolForm(createNewEnrolForm());
        }}
        title="Enrol New Masters Candidate"
        subtitle="Provision student identity, academic parameters, and assign senior admissions counselor."
        maxWidth="2xl"
      >
        <form onSubmit={handleEnrolSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gvk-navy mb-1">First Name *</label>
              <Input
                value={enrolForm.firstName}
                onChange={(e) => setEnrolForm({ ...enrolForm, firstName: e.target.value })}
                placeholder="Enter first name"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-gvk-navy mb-1">Last Name *</label>
              <Input
                value={enrolForm.lastName}
                onChange={(e) => setEnrolForm({ ...enrolForm, lastName: e.target.value })}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gvk-navy mb-1">Registered Email *</label>
              <Input
                type="email"
                value={enrolForm.email}
                onChange={(e) => setEnrolForm({ ...enrolForm, email: e.target.value })}
                placeholder="Enter registered email address"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-gvk-navy mb-1">Phone Number</label>
              <Input
                value={enrolForm.phone}
                onChange={(e) => setEnrolForm({ ...enrolForm, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-gvk-navy mb-1">Target Degree</label>
              <Input
                value={enrolForm.targetDegree}
                onChange={(e) => setEnrolForm({ ...enrolForm, targetDegree: e.target.value })}
                placeholder="Enter target degree"
              />
            </div>
            <div>
              <label className="block font-bold text-gvk-navy mb-1">Target Country</label>
              <select
                value={enrolForm.preferredCountry}
                onChange={(e) => {
                  const newCountry = e.target.value;
                  const newCode = generateUniqueActivationCode(newCountry, students.map((s) => (s as any).activationCode));
                  setEnrolForm({ ...enrolForm, preferredCountry: newCountry, activationCode: newCode });
                }}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white"
              >
                <option value="United Kingdom">United Kingdom</option>
                <option value="USA">USA</option>
                <option value="Australia">Australia</option>
                <option value="Canada">Canada</option>
                <option value="Germany">Germany</option>
                <option value="New Zealand">New Zealand</option>
                <option value="Ireland">Ireland</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-gvk-navy mb-1">Target Intake</label>
              <select
                value={enrolForm.targetIntake}
                onChange={(e) => setEnrolForm({ ...enrolForm, targetIntake: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium"
              >
                <option value="September Intake">September Intake</option>
                <option value="January Intake">January Intake</option>
                <option value="May Intake">May Intake</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gvk-navy mb-1">Undergraduate College</label>
              <Input
                value={enrolForm.ugCollege}
                onChange={(e) => setEnrolForm({ ...enrolForm, ugCollege: e.target.value })}
                placeholder="Enter undergraduate college"
              />
            </div>
            <div>
              <label className="block font-bold text-gvk-navy mb-1">UG CGPA / Percentage</label>
              <Input
                type="number"
                step="0.01"
                value={enrolForm.ugCgpa}
                onChange={(e) => setEnrolForm({ ...enrolForm, ugCgpa: e.target.value })}
                placeholder="Enter CGPA or percentage"
              />
            </div>
          </div>

          {/* Automated Unique Activation Code (Unique per candidate) */}
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#253775]" />
                <label className="text-xs font-bold text-gvk-navy">
                  Automated Candidate Activation Code
                </label>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-white border border-indigo-200 px-2 py-0.5 rounded-full shadow-2xs">
                Unique per Student
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  value={enrolForm.activationCode}
                  readOnly
                  className="font-mono font-black text-gvk-navy bg-white border-indigo-200 tracking-wider text-sm pl-9 select-all"
                />
                <KeyRound className="w-4 h-4 text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newCode = generateUniqueActivationCode(enrolForm.preferredCountry, students.map((s) => (s as any).activationCode));
                  setEnrolForm((prev) => ({ ...prev, activationCode: newCode }));
                }}
                className="shrink-0 text-xs font-bold h-10 border-indigo-200 hover:bg-white text-indigo-950 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                <span>Regenerate</span>
              </Button>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Every student receives a distinct, automated invitation code. The student will enter this unique code at <span className="font-mono text-gvk-navy font-bold">/auth/activate</span> to set their personal secure password and activate their portal.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div>
              <label className="block font-bold text-gvk-navy mb-1">
                Assign Senior Admissions Counselor
              </label>
              <select
                value={enrolForm.assignedCounselorId}
                onChange={(e) => setEnrolForm({ ...enrolForm, assignedCounselorId: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-semibold"
              >
                <option value="">-- Allocate Later (Admissions Hold) --</option>
                {counselors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.employeeIdCode}) — {c.specializationCountries?.join(", ")}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Leaving unassigned puts the candidate in admissions hold; Stage 01 activates once assigned.
              </span>
            </div>

            <div>
              <label className="block font-bold text-gvk-navy mb-1">Temporary Initial Password (Optional)</label>
              <Input
                type="text"
                value={enrolForm.password}
                onChange={(e) => setEnrolForm({ ...enrolForm, password: e.target.value })}
                placeholder="Enter temporary password (defaults to GvkStudent@2026)"
                className="font-mono bg-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEnrolModalOpen(false);
                setEnrolForm(createNewEnrolForm());
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#253775] hover:bg-[#1a2754] text-white font-bold"
            >
              Enrol Candidate & Dispatch Deliverables
            </Button>
          </div>
        </form>
      </AdminModal>

      {/* Edit Student Modal */}
      {selectedStudentForEdit && (
        <AdminModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedStudentForEdit(null);
          }}
          title={`Edit Student: ${selectedStudentForEdit.firstName} ${selectedStudentForEdit.lastName}`}
          subtitle={`Student ID: ${selectedStudentForEdit.studentIdCode}`}
          maxWidth="xl"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gvk-navy mb-1">First Name</label>
                <Input
                  value={selectedStudentForEdit.firstName}
                  onChange={(e) => setSelectedStudentForEdit({ ...selectedStudentForEdit, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-gvk-navy mb-1">Last Name</label>
                <Input
                  value={selectedStudentForEdit.lastName}
                  onChange={(e) => setSelectedStudentForEdit({ ...selectedStudentForEdit, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gvk-navy mb-1">Email</label>
                <Input
                  type="email"
                  value={selectedStudentForEdit.email || ""}
                  onChange={(e) => setSelectedStudentForEdit({ ...selectedStudentForEdit, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-gvk-navy mb-1">Login Password</label>
                <Input
                  type="text"
                  value={selectedStudentForEdit.password || ""}
                  onChange={(e) => setSelectedStudentForEdit({ ...selectedStudentForEdit, password: e.target.value })}
                  placeholder="Student@123"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block font-bold text-gvk-navy mb-1">Phone</label>
                <Input
                  value={selectedStudentForEdit.phone || ""}
                  onChange={(e) => setSelectedStudentForEdit({ ...selectedStudentForEdit, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-gvk-navy mb-1">Target Degree</label>
                <Input
                  value={selectedStudentForEdit.targetDegree}
                  onChange={(e) => setSelectedStudentForEdit({ ...selectedStudentForEdit, targetDegree: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-bold text-gvk-navy mb-1">Target Country</label>
                <select
                  value={selectedStudentForEdit.preferredCountry}
                  onChange={(e) => setSelectedStudentForEdit({ ...selectedStudentForEdit, preferredCountry: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="USA">USA</option>
                  <option value="Australia">Australia</option>
                  <option value="Canada">Canada</option>
                  <option value="Germany">Germany</option>
                  <option value="New Zealand">New Zealand</option>
                  <option value="Ireland">Ireland</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-gvk-navy mb-1">Target Intake</label>
                <select
                  value={selectedStudentForEdit.targetIntake || "September Intake"}
                  onChange={(e) => setSelectedStudentForEdit({ ...selectedStudentForEdit, targetIntake: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  <option value="September Intake">September Intake</option>
                  <option value="January Intake">January Intake</option>
                  <option value="May Intake">May Intake</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gvk-navy mb-1">UG CGPA</label>
                <Input
                  type="number"
                  step="0.01"
                  value={selectedStudentForEdit.ugCgpa}
                  onChange={(e) => setSelectedStudentForEdit({ ...selectedStudentForEdit, ugCgpa: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block font-bold text-gvk-navy mb-1">Account Status</label>
                <select
                  value={selectedStudentForEdit.status || "active"}
                  onChange={(e) => setSelectedStudentForEdit({ ...selectedStudentForEdit, status: e.target.value as any })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedStudentForEdit(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#253775] hover:bg-[#1a2754] text-white font-bold">
                Save Changes
              </Button>
            </div>
          </form>
        </AdminModal>
      )}

      {/* Provisioned Credentials Modal */}
      {credentialsModal && (
        <AdminModal
          isOpen={true}
          onClose={() => {
            setCredentialsModal(null);
            setCopiedToken(false);
            setCopiedLink(false);
          }}
          title="Student Account Enrolled & Activation Code Generated"
          subtitle="Unique First-Time Invitation Code provisioned for candidate activation."
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            {/* Candidate Summary */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-sans">Student Name:</span>
                <strong className="text-gvk-navy font-sans text-sm">{credentialsModal.name}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-sans">Student ID Code:</span>
                <strong className="text-gvk-navy">{credentialsModal.studentIdCode}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-sans">Registered Email:</span>
                <strong className="text-gvk-navy">{credentialsModal.email}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-sans">Account Status:</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>Pending First-Time Activation</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-sans">Assigned Counselor:</span>
                <strong className="text-emerald-700 font-sans">{credentialsModal.counselorName}</strong>
              </div>
            </div>

            {/* Prominent Unique Automated Activation Code Card */}
            <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#253775]" />
                  <span className="font-bold text-gvk-navy text-xs">
                    Automated Activation Code (Unique)
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200 shadow-2xs">
                  Unique Token
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-indigo-100 shadow-2xs font-mono">
                <span className="text-base font-black text-[#253775] tracking-wider select-all">
                  {credentialsModal.activationCode}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (typeof navigator !== "undefined" && navigator.clipboard) {
                      navigator.clipboard.writeText(credentialsModal.activationCode);
                      setCopiedToken(true);
                      setTimeout(() => setCopiedToken(false), 2000);
                    }
                  }}
                  className="h-8 text-xs font-bold text-[#253775] hover:bg-indigo-50 flex items-center gap-1.5 border-indigo-200"
                >
                  {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedToken ? "Copied!" : "Copy Code"}</span>
                </Button>
              </div>

              {/* Direct Link */}
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">
                  Candidate Activation Portal Link:
                </span>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={credentialsModal.activationUrl}
                    readOnly
                    className="font-mono text-[11px] text-slate-600 bg-white select-all h-8"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (typeof navigator !== "undefined" && navigator.clipboard) {
                        navigator.clipboard.writeText(credentialsModal.activationUrl);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }
                    }}
                    className="h-8 text-xs font-bold text-[#253775] shrink-0 border-indigo-200 flex items-center gap-1"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? "Copied" : "Copy Link"}</span>
                  </Button>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                Provide this unique code to the candidate. They will visit <span className="font-bold text-gvk-navy font-mono">/auth/activate</span> to set their personal secure password and activate their student portal.
              </p>
            </div>

            <Button
              onClick={() => {
                setCredentialsModal(null);
                setCopiedToken(false);
                setCopiedLink(false);
              }}
              className="w-full bg-[#253775] hover:bg-[#1a2754] text-white font-bold h-10 shadow-sm"
            >
              Done & Return to Directory
            </Button>
          </div>
        </AdminModal>
      )}

      {/* Delete Candidate Confirmation Modal */}
      {deleteConfirmModal.isOpen && deleteConfirmModal.student && (
        <AdminModal
          isOpen={true}
          onClose={() =>
            setDeleteConfirmModal({ isOpen: false, student: null, reason: "" })
          }
          title="Confirm Candidate Deletion"
          subtitle="GVK Enterprise Security & Candidate Purge Protocol"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-red-800">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Are you sure you want to permanently delete this candidate?</span>
              </div>
              <p className="text-xs text-red-700 leading-relaxed font-normal">
                Deleting will permanently remove <strong className="font-bold text-red-900">{deleteConfirmModal.student.firstName} {deleteConfirmModal.student.lastName}</strong> ({deleteConfirmModal.student.studentIdCode}) and erase their profile, journey milestones, documents, and credentials from the system. This action cannot be undone.
              </p>
            </div>

            {/* Candidate Summary */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Candidate:</span>
                <strong className="text-gvk-navy font-sans">
                  {deleteConfirmModal.student.firstName} {deleteConfirmModal.student.lastName}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Student ID:</span>
                <strong className="text-gvk-navy">{deleteConfirmModal.student.studentIdCode}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Target Degree:</span>
                <span className="text-slate-700 font-sans">{deleteConfirmModal.student.targetDegree}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Target Country:</span>
                <span className="text-slate-700 font-sans">{deleteConfirmModal.student.preferredCountry}</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-gvk-navy mb-1 text-xs">
                Reason for Deletion (Audit Log)
              </label>
              <Input
                type="text"
                placeholder="e.g. Candidate withdrawn, duplicate profile, requested cancellation"
                value={deleteConfirmModal.reason}
                onChange={(e) =>
                  setDeleteConfirmModal((prev) => ({ ...prev, reason: e.target.value }))
                }
                className="bg-white text-xs"
              />
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setDeleteConfirmModal({ isOpen: false, student: null, reason: "" })
                }
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDelete}
                className="bg-[#FF0008] hover:bg-red-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Candidate</span>
              </Button>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
