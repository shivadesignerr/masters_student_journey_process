"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminModal } from "@/components/admin/AdminModal";
import { UniversityBadge } from "@/components/shared/UniversityLogo";
import { UniversityCombobox } from "@/components/shared/UniversityCombobox";
import { ALL_GLOBAL_UNIVERSITIES } from "@/lib/data/universities";
import {
  FileCheck2,
  Plus,
  Search,
  Filter,
  GraduationCap,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Edit,
  ShieldAlert,
  Trash2,
  AlertTriangle,
} from "lucide-react";

export default function ApplicationManagementPage() {
  const [tick, setTick] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [counselorFilter, setCounselorFilter] = useState("all");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);

  // New App Form (NO AUTOFILL)
  const [newAppForm, setNewAppForm] = useState({
    studentId: "",
    country: "",
    universityName: "",
    courseName: "",
    intake: "",
    tuitionFee: "" as number | "",
  });
  const [isCustomCourse, setIsCustomCourse] = useState(false);
  const [customCourseTitle, setCustomCourseTitle] = useState("");

  const destinationCountries = [
    { id: "United Kingdom", name: "United Kingdom", flag: "🇬🇧", currency: "GBP", symbol: "£" },
    { id: "USA", name: "USA", flag: "🇺🇸", currency: "USD", symbol: "$" },
    { id: "Australia", name: "Australia", flag: "🇦🇺", currency: "AUD", symbol: "A$" },
    { id: "Canada", name: "Canada", flag: "🇨🇦", currency: "CAD", symbol: "C$" },
    { id: "Germany", name: "Germany", flag: "🇩🇪", currency: "EUR", symbol: "€" },
    { id: "New Zealand", name: "New Zealand", flag: "🇳🇿", currency: "NZD", symbol: "NZ$" },
  ];

  // Update Status Form
  const [updateForm, setUpdateForm] = useState({
    status: "submitted",
    remarks: "",
    offerConditions: "",
    depositAmount: 2000,
  });

  const [notification, setNotification] = useState<string | null>(null);

  // Check URL query parameters and custom admin action events
  useEffect(() => {
    const checkAction = () => {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("action") === "create" || urlParams.get("action") === "new") {
          setIsAddOpen(true);
        }
      }
    };
    checkAction();

    const handleCustomAction = (e: any) => {
      if (e.detail?.action === "create" || e.detail?.action === "new") {
        setIsAddOpen(true);
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

  const applications = dataStore.getAllApplications();
  const students = dataStore.getAllStudents();
  const counselors = dataStore.getAllCounselors();
  const universities = dataStore.getAllUniversities();
  const courses = dataStore.getAllCourses();

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const countries = useMemo(() => {
    const set = new Set(applications.map((a) => a.country || "United Kingdom"));
    return Array.from(set).sort();
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchSearch =
        app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.universityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.studentIdCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === "all" || app.currentStatus === statusFilter;
      const matchCountry = countryFilter === "all" || app.country === countryFilter;

      const counselor = dataStore.getAssignedCounselor(app.studentId);
      const matchCounselor =
        counselorFilter === "all" || (counselor && counselor.id === counselorFilter);

      return matchSearch && matchStatus && matchCountry && matchCounselor;
    });
  }, [applications, searchQuery, statusFilter, countryFilter, counselorFilter]);

  // KPI Calculations
  const kpiStats = useMemo(() => {
    const total = applications.length;
    const submitted = applications.filter((a) =>
      ["submitted", "under_review", "ready_for_submission"].includes(a.currentStatus)
    ).length;
    const conditionalOffers = applications.filter(
      (a) => a.currentStatus === "conditional_offer" || a.offerType === "conditional"
    ).length;
    const unconditionalOffers = applications.filter(
      (a) => a.currentStatus === "unconditional_offer" || a.offerType === "unconditional"
    ).length;
    const rejected = applications.filter((a) => a.currentStatus === "rejected").length;
    return { total, submitted, conditionalOffers, unconditionalOffers, rejected };
  }, [applications]);

  const handleOpenAdd = () => {
    setNewAppForm({
      studentId: "",
      country: "",
      universityName: "",
      courseName: "",
      intake: "",
      tuitionFee: "",
    });
    setIsCustomCourse(false);
    setCustomCourseTitle("");
    setIsAddOpen(true);
  };

  const universitiesForCountry = useMemo(() => {
    if (!newAppForm.country) return [];
    return ALL_GLOBAL_UNIVERSITIES.filter((u) => {
      const uCountry = (u.country || "").toLowerCase();
      const sCountry = newAppForm.country.toLowerCase();
      if (sCountry === "united kingdom" || sCountry === "uk") {
        return uCountry.includes("united kingdom") || uCountry === "uk";
      }
      if (sCountry === "usa" || sCountry === "united states") {
        return uCountry.includes("usa") || uCountry.includes("united states");
      }
      return uCountry.includes(sCountry);
    });
  }, [newAppForm.country]);

  const activeUniForApp = useMemo(() => {
    if (!newAppForm.universityName) return null;
    return (
      ALL_GLOBAL_UNIVERSITIES.find(
        (u) =>
          u.name.toLowerCase() === newAppForm.universityName.toLowerCase() ||
          u.id === newAppForm.universityName
      ) || null
    );
  }, [newAppForm.universityName]);

  const coursesForSelectedUni = useMemo(() => {
    if (!activeUniForApp) return [];
    const list: string[] = [];
    if (activeUniForApp.course) list.push(activeUniForApp.course);
    if (activeUniForApp.alternativeCourses && activeUniForApp.alternativeCourses.length > 0) {
      list.push(...activeUniForApp.alternativeCourses);
    }
    const storeCourses = dataStore.getAllCourses();
    const matchingStoreCourses = storeCourses.filter(
      (c) => c.universityName.toLowerCase() === activeUniForApp.name.toLowerCase()
    );
    matchingStoreCourses.forEach((c) => {
      if (!list.includes(c.courseName)) list.push(c.courseName);
    });
    return Array.from(new Set(list));
  }, [activeUniForApp]);

  const intakesForSelectedUni = useMemo(() => {
    if (!activeUniForApp) return ["September 2026 / Fall 2026", "January 2027 / Spring 2027", "May 2027 / Summer 2027"];
    const intakes: string[] = [];
    if (activeUniForApp.mainIntakes) {
      const parts = activeUniForApp.mainIntakes.split(",").map((p) => p.trim());
      parts.forEach((p) => {
        if (p.toLowerCase().includes("sep") || p.toLowerCase().includes("aug") || p.toLowerCase().includes("fall")) {
          intakes.push("September 2026 / Fall 2026");
        }
        if (p.toLowerCase().includes("jan") || p.toLowerCase().includes("feb") || p.toLowerCase().includes("spring")) {
          intakes.push("January 2027 / Spring 2027");
        }
        if (p.toLowerCase().includes("may") || p.toLowerCase().includes("summer")) {
          intakes.push("May 2027 / Summer 2027");
        }
      });
    }
    if (activeUniForApp.intake && !intakes.includes(activeUniForApp.intake)) {
      intakes.push(activeUniForApp.intake);
    }
    if (intakes.length === 0) {
      intakes.push("September 2026 / Fall 2026", "January 2027 / Spring 2027");
    }
    return Array.from(new Set(intakes));
  }, [activeUniForApp]);

  const appCurrencySymbol = useMemo(() => {
    if (!activeUniForApp) {
      const foundCountry = destinationCountries.find((c) => c.name === newAppForm.country);
      return foundCountry?.symbol || "£";
    }
    if (activeUniForApp.currency === "EUR" || activeUniForApp.country.toLowerCase().includes("germany")) return "€";
    if (activeUniForApp.currency === "USD" || activeUniForApp.country.toLowerCase().includes("usa")) return "$";
    if (activeUniForApp.currency === "AUD" || activeUniForApp.country.toLowerCase().includes("australia")) return "A$";
    if (activeUniForApp.currency === "CAD" || activeUniForApp.country.toLowerCase().includes("canada")) return "C$";
    if (activeUniForApp.currency === "NZD" || activeUniForApp.country.toLowerCase().includes("new zealand")) return "NZ$";
    return "£";
  }, [activeUniForApp, newAppForm.country]);

  const handleCountrySelect = (country: string) => {
    setNewAppForm({
      ...newAppForm,
      country,
      universityName: "",
      courseName: "",
      intake: "",
      tuitionFee: "",
    });
    setIsCustomCourse(false);
    setCustomCourseTitle("");
  };

  const handleUniSelect = (uniName: string) => {
    const uni = ALL_GLOBAL_UNIVERSITIES.find((u) => u.name === uniName || u.id === uniName);
    const fee = uni ? uni.tuitionFee || uni.tuition1Year || 22000 : "";
    let defaultIntake = "";
    if (uni?.mainIntakes) {
      if (uni.mainIntakes.toLowerCase().includes("sep") || uni.mainIntakes.toLowerCase().includes("fall")) {
        defaultIntake = "September 2026 / Fall 2026";
      } else if (uni.mainIntakes.toLowerCase().includes("jan") || uni.mainIntakes.toLowerCase().includes("spring")) {
        defaultIntake = "January 2027 / Spring 2027";
      } else {
        defaultIntake = uni.mainIntakes.split(",")[0].trim();
      }
    } else {
      defaultIntake = "September 2026 / Fall 2026";
    }

    setNewAppForm({
      ...newAppForm,
      universityName: uniName,
      courseName: "",
      intake: defaultIntake,
      tuitionFee: fee,
    });
    setIsCustomCourse(false);
    setCustomCourseTitle("");
  };

  const handleCourseSelect = (course: string) => {
    if (course === "__custom__") {
      setIsCustomCourse(true);
      setNewAppForm({ ...newAppForm, courseName: "__custom__" });
    } else {
      setIsCustomCourse(false);
      const storeCourses = dataStore.getAllCourses();
      const match = storeCourses.find(
        (c) =>
          c.courseName.toLowerCase() === course.toLowerCase() &&
          activeUniForApp &&
          c.universityName.toLowerCase() === activeUniForApp.name.toLowerCase()
      );
      setNewAppForm({
        ...newAppForm,
        courseName: course,
        tuitionFee: match?.tuitionFee || newAppForm.tuitionFee,
      });
    }
  };

  const handleOpenUpdate = (app: any) => {
    setSelectedApp(app);
    setUpdateForm({
      status: app.currentStatus || "submitted",
      remarks: app.counselorRemarks || "",
      offerConditions: app.offerConditions || "",
      depositAmount: app.depositAmountRequired || 2000,
    });
    setIsUpdateOpen(true);
  };

  const handleCreateApp = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCourse = isCustomCourse ? customCourseTitle.trim() : newAppForm.courseName;
    if (!newAppForm.studentId || !newAppForm.universityName || !finalCourse || !newAppForm.intake) {
      alert("Please complete candidate, destination country, university, course, and intake.");
      return;
    }

    dataStore.createApplication(
      newAppForm.studentId,
      newAppForm.universityName,
      newAppForm.country,
      finalCourse,
      newAppForm.intake,
      Number(newAppForm.tuitionFee) || 0,
      "usr-admin-01"
    );

    setIsAddOpen(false);
    showToast(`✓ Application created for ${newAppForm.universityName}`);
  };

  // Removal Confirmation Modal State
  const [deleteConfirmApp, setDeleteConfirmApp] = useState<{ id: string; universityName: string; courseName?: string; studentName?: string } | null>(null);

  const handleInitiateDelete = (app: { id: string; universityName: string; courseName?: string; studentName?: string }) => {
    setDeleteConfirmApp(app);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmApp) return;
    dataStore.deleteApplication(deleteConfirmApp.id, "usr-admin-01");
    setTick((t) => t + 1);
    showToast(`✓ Removed application for ${deleteConfirmApp.universityName}`);
    setDeleteConfirmApp(null);
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    dataStore.updateApplicationStatus(
      selectedApp.id,
      updateForm.status as any,
      "usr-admin-01",
      updateForm.remarks,
      updateForm.offerConditions,
      undefined,
      undefined,
      updateForm.depositAmount
    );

    setIsUpdateOpen(false);
    showToast(`Updated status to ${updateForm.status.replace(/_/g, " ")}.`);
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
            University Application Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end university applications matrix, conditional/unconditional offers, and admissions lifecycle.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#253775] text-white rounded-lg text-xs font-semibold hover:bg-[#1c2a5e] shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Log Application
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase">Total Apps</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{kpiStats.total}</div>
          <p className="text-[11px] text-slate-400 mt-1">Across all students</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm">
          <div className="text-xs font-semibold text-blue-700 uppercase">In Review</div>
          <div className="text-2xl font-bold text-blue-700 mt-2">{kpiStats.submitted}</div>
          <p className="text-[11px] text-blue-600 mt-1">Under admissions review</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <div className="text-xs font-semibold text-amber-700 uppercase">Conditional Offers</div>
          <div className="text-2xl font-bold text-amber-700 mt-2">{kpiStats.conditionalOffers}</div>
          <p className="text-[11px] text-amber-600 mt-1">Academic / doc conditions</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <div className="text-xs font-semibold text-emerald-700 uppercase">Unconditional</div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">
            {kpiStats.unconditionalOffers}
          </div>
          <p className="text-[11px] text-emerald-600 mt-1">Confirmed offers ready</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/20 shadow-sm">
          <div className="text-xs font-semibold text-red-700 uppercase">Rejections</div>
          <div className="text-2xl font-bold text-red-700 mt-2">{kpiStats.rejected}</div>
          <p className="text-[11px] text-red-600 mt-1">Unsuccessful submissions</p>
        </div>
      </div>

      {/* Filter / Search Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student, university, course, or student ID..."
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
            <option value="all">All Application Statuses</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="conditional_offer">Conditional Offer</option>
            <option value="unconditional_offer">Unconditional Offer</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs px-3 py-2 outline-none focus:border-[#253775] bg-white text-slate-700"
          >
            <option value="all">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={counselorFilter}
            onChange={(e) => setCounselorFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs px-3 py-2 outline-none focus:border-[#253775] bg-white text-slate-700"
          >
            <option value="all">All Counselors</option>
            {counselors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Applications Table */}
      <AdminCard
        title="Cross-Institutional Application Matrix"
        subtitle={`Displaying ${filteredApplications.length} of ${applications.length} applications`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">University & Course</th>
                <th className="py-3 px-4">Intake & Country</th>
                <th className="py-3 px-4">Assigned Desk</th>
                <th className="py-3 px-4">Application Status</th>
                <th className="py-3 px-4">Offer / Terms</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No university applications match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => {
                  const counselor = dataStore.getAssignedCounselor(app.studentId);
                  return (
                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/students/${app.studentId}`}
                          className="font-bold text-slate-900 hover:text-[#253775]"
                        >
                          {app.studentName}
                        </Link>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {app.studentIdCode}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <UniversityBadge name={app.universityName} country={app.country} size="sm" showCountryFlag />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-800 leading-snug">{app.universityName}</div>
                            <div className="text-[11px] text-slate-500">{app.courseName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="font-medium">{app.intake || "Fall 2026"}</div>
                        <div className="text-[11px] text-slate-400">
                          {app.country || "United Kingdom"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {counselor ? (
                          <span className="text-slate-800 font-medium">{counselor.name}</span>
                        ) : (
                          <span className="text-amber-600 font-semibold italic text-[11px]">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            app.currentStatus === "unconditional_offer"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : app.currentStatus === "conditional_offer"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : app.currentStatus === "rejected"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {app.currentStatus?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 font-medium">
                          {app.offerType !== "none" ? (
                            <span className="capitalize">{app.offerType?.replace(/_/g, " ")}</span>
                          ) : (
                            <span className="text-slate-400">No Offer Yet</span>
                          )}
                        </div>
                        {app.depositStatus && (
                          <div className="text-[10px] text-slate-500">
                            Deposit:{" "}
                            <span
                              className={`font-semibold ${
                                app.depositStatus === "paid"
                                  ? "text-emerald-600"
                                  : "text-amber-600"
                              }`}
                            >
                              {app.depositStatus}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenUpdate(app)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors"
                          >
                            <Edit className="w-3 h-3 text-slate-500" />
                            Status
                          </button>
                          <button
                            onClick={() => handleInitiateDelete(app)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Remove Application"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/admin/students/${app.studentId}`}
                            className="p-1 text-slate-400 hover:text-[#253775]"
                            title="Open Student Profile"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
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
      </AdminCard>

      {/* CREATE APPLICATION MODAL WITH CASCADING AUTO-LOAD */}
      <AdminModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Log New University Application"
        description="Select candidate, country, university, course, and intake — program benchmarks and tuition populate automatically."
      >
        <form onSubmit={handleCreateApp} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Student Candidate *
            </label>
            <select
              required
              value={newAppForm.studentId}
              onChange={(e) => setNewAppForm({ ...newAppForm, studentId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white text-slate-800"
            >
              <option value="">-- Choose Student Candidate --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.studentId})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                1. Destination Country *
              </label>
              <select
                required
                value={newAppForm.country}
                onChange={(e) => handleCountrySelect(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white text-slate-800 font-semibold"
              >
                <option value="">-- Select Country --</option>
                {destinationCountries.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.flag} {c.name} ({c.currency})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  2. Target University *
                </label>
                {newAppForm.country && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    {universitiesForCountry.length} available
                  </span>
                )}
              </div>
              <UniversityCombobox
                universities={universitiesForCountry}
                value={newAppForm.universityName}
                onChange={(uniName) => handleUniSelect(uniName)}
                disabled={!newAppForm.country}
                disabledPlaceholder="-- Select Country First --"
                placeholder="🔍 Type university name..."
                required
              />
            </div>
          </div>

          {/* Institutional Auto-Loaded Details Card */}
          {activeUniForApp && (
            <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <UniversityBadge name={activeUniForApp.name} country={activeUniForApp.country} size="sm" showCountryFlag />
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 leading-tight">{activeUniForApp.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                      {activeUniForApp.city}, {activeUniForApp.country}
                    </div>
                  </div>
                </div>
                {activeUniForApp.russellGroup && (
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300 text-[10px] shrink-0">
                    🏛️ Russell Group
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-indigo-100 text-[11px]">
                <div className="bg-white p-2 rounded-lg border border-indigo-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block font-medium">World Ranking</span>
                  <strong className="text-slate-800 font-mono text-[11px]">
                    {activeUniForApp.qsRankDisplay || `#${activeUniForApp.ranking}`}
                  </strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-indigo-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block font-medium">IELTS Benchmark</span>
                  <strong className="text-slate-800 text-[11px]">
                    {activeUniForApp.typicalIelts || activeUniForApp.minIelts || "6.5"}
                  </strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-indigo-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block font-medium">CGPA Benchmark</span>
                  <strong className="text-slate-800 text-[11px]">
                    {activeUniForApp.minCgpa ? activeUniForApp.minCgpa.split("(")[0].trim() : "60%"}
                  </strong>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>3. Course / Degree Title *</span>
              {coursesForSelectedUni.length > 0 && (
                <span className="text-[10.5px] font-normal text-slate-500">
                  {coursesForSelectedUni.length} programs available
                </span>
              )}
            </label>
            <select
              required
              disabled={!newAppForm.universityName}
              value={newAppForm.courseName}
              onChange={(e) => handleCourseSelect(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white text-slate-800 disabled:bg-slate-100 disabled:text-slate-400 font-medium"
            >
              <option value="">
                {newAppForm.universityName ? "-- Select Master's Program --" : "-- Select University First --"}
              </option>
              {coursesForSelectedUni.map((c, i) => (
                <option key={i} value={c}>
                  {c}
                </option>
              ))}
              <option value="__custom__">➕ Enter Custom Program Title...</option>
            </select>

            {isCustomCourse && (
              <div className="mt-2 animate-fade-in">
                <input
                  type="text"
                  required
                  placeholder="Enter custom program title (e.g. MSc Data Science and AI)"
                  value={customCourseTitle}
                  onChange={(e) => setCustomCourseTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                4. Target Intake *
              </label>
              <select
                required
                disabled={!newAppForm.universityName}
                value={newAppForm.intake}
                onChange={(e) => setNewAppForm({ ...newAppForm, intake: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white font-medium disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">
                  {newAppForm.universityName ? "-- Select Intake --" : "-- Select University First --"}
                </option>
                {intakesForSelectedUni.map((intake, i) => (
                  <option key={i} value={intake}>
                    {intake}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Tuition Fee ({appCurrencySymbol}) *</span>
                {activeUniForApp && (
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    Auto-loaded
                  </span>
                )}
              </label>
              <input
                type="number"
                required
                value={newAppForm.tuitionFee}
                onChange={(e) =>
                  setNewAppForm({
                    ...newAppForm,
                    tuitionFee: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                placeholder={activeUniForApp ? "Auto-detected fee" : "e.g. 25000"}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !newAppForm.studentId ||
                !newAppForm.country ||
                !newAppForm.universityName ||
                (!newAppForm.courseName && !customCourseTitle) ||
                !newAppForm.intake
              }
              className="px-4 py-2 bg-[#253775] text-white rounded-lg text-xs font-semibold hover:bg-[#1c2a5e] disabled:opacity-50"
            >
              Create Application
            </button>
          </div>
        </form>
      </AdminModal>

      {/* UPDATE STATUS MODAL */}
      <AdminModal
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
        title={`Update Application: ${selectedApp?.universityName}`}
        description={`Candidate: ${selectedApp?.studentName} (${selectedApp?.studentIdCode})`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Application Lifecycle Status
            </label>
            <select
              value={updateForm.status}
              onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white text-slate-800"
            >
              <option value="shortlisted">Shortlisted</option>
              <option value="submitted">Application Submitted</option>
              <option value="under_review">Under Review with University</option>
              <option value="conditional_offer">Conditional Offer Received</option>
              <option value="unconditional_offer">Unconditional Offer Confirmed</option>
              <option value="rejected">Application Rejected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Offer Conditions (if conditional)
            </label>
            <textarea
              rows={2}
              value={updateForm.offerConditions}
              onChange={(e) => setUpdateForm({ ...updateForm, offerConditions: e.target.value })}
              placeholder="e.g. Provide final degree marksheet with minimum 65%, submit official IELTS 6.5 test report."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Required Tuition Deposit Amount (£)
            </label>
            <input
              type="number"
              value={updateForm.depositAmount}
              onChange={(e) => setUpdateForm({ ...updateForm, depositAmount: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Counselor / Internal Remarks
            </label>
            <textarea
              rows={2}
              value={updateForm.remarks}
              onChange={(e) => setUpdateForm({ ...updateForm, remarks: e.target.value })}
              placeholder="e.g. University admissions committee approved application on Nov 19..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsUpdateOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#253775] text-white rounded-lg text-xs font-semibold hover:bg-[#1c2a5e]"
            >
              Save Application Changes
            </button>
          </div>
        </form>
      </AdminModal>

      {/* CONFIRM APPLICATION REMOVAL MODAL */}
      {deleteConfirmApp && (
        <AdminModal
          isOpen={!!deleteConfirmApp}
          onClose={() => setDeleteConfirmApp(null)}
          title="Confirm Application Removal"
          subtitle="Are you sure you want to remove this application?"
          maxWidth="md"
        >
          <div className="space-y-4 pt-1">
            <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 space-y-3">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Remove Application Record</span>
              </div>
              <p className="text-xs text-rose-800 leading-relaxed">
                This action will permanently delete this application record from the central matrix:
              </p>
              <div className="bg-white p-3.5 rounded-lg border border-rose-200 text-xs text-slate-800 space-y-1.5 shadow-2xs">
                <div className="font-bold text-gvk-navy text-sm">
                  {deleteConfirmApp.universityName}
                </div>
                {deleteConfirmApp.courseName && (
                  <div className="text-slate-600 font-medium text-[11px]">
                    {deleteConfirmApp.courseName}
                  </div>
                )}
                {deleteConfirmApp.studentName && (
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center gap-1.5">
                    <span>Student:</span>
                    <strong className="text-slate-800 font-semibold">{deleteConfirmApp.studentName}</strong>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-rose-700 font-medium">
                Downstream admission offers, CAS milestones, and university status logs will be removed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setDeleteConfirmApp(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Remove</span>
              </button>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
