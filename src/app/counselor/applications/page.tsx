"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UniversityBadge } from "@/components/shared/UniversityLogo";
import { UniversityCombobox } from "@/components/shared/UniversityCombobox";
import { ALL_GLOBAL_UNIVERSITIES } from "@/lib/data/universities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApplicationStatus } from "@/types/database.types";
import {
  GraduationCap,
  Building,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  Trash2,
  AlertTriangle,
} from "lucide-react";

export default function CounselorApplicationsPage() {
  const { user } = useCurrentUser();
  const counselorId = user?.role === "counselor" ? user.id : "usr-counselor-01";

  const [assignedStudents, setAssignedStudents] = useState(() => dataStore.getAssignedStudents(counselorId));
  const [applications, setApplications] = useState(() => dataStore.getAllApplications(counselorId));

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal State for zero-autofill cascading creator
  const [createAppModal, setCreateAppModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [isCustomCourse, setIsCustomCourse] = useState(false);
  const [customCourseTitle, setCustomCourseTitle] = useState("");
  const [selectedIntake, setSelectedIntake] = useState("");
  const [newFee, setNewFee] = useState<string | number>("");

  const destinationCountries = [
    { id: "United Kingdom", name: "United Kingdom", flag: "🇬🇧", currency: "GBP", symbol: "£" },
    { id: "United States", name: "United States", flag: "🇺🇸", currency: "USD", symbol: "$" },
    { id: "Australia", name: "Australia", flag: "🇦🇺", currency: "AUD", symbol: "A$" },
    { id: "Canada", name: "Canada", flag: "🇨🇦", currency: "CAD", symbol: "C$" },
    { id: "Germany", name: "Germany", flag: "🇩🇪", currency: "EUR", symbol: "€" },
    { id: "New Zealand", name: "New Zealand", flag: "🇳🇿", currency: "NZD", symbol: "NZ$" },
  ];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    const students = dataStore.getAssignedStudents(counselorId);
    setAssignedStudents(students);
    setApplications(dataStore.getAllApplications(counselorId));

    const unsubscribe = dataStore.subscribe(() => {
      const liveStudents = dataStore.getAssignedStudents(counselorId);
      setAssignedStudents(liveStudents);
      setApplications(dataStore.getAllApplications(counselorId));
    });
    return () => unsubscribe();
  }, [counselorId]);

  // Prerequisite check for candidate selected in modal
  const studentJourney = useMemo(() => {
    if (!selectedStudentId) return [];
    return dataStore.getStudentJourney(selectedStudentId);
  }, [selectedStudentId, applications]);

  const stage3 = studentJourney.find((j) => j.stageNumber === 3);
  const stage4 = studentJourney.find((j) => j.stageNumber === 4);
  const arePrerequisitesCompleted =
    stage3?.status === "completed" && stage4?.status === "completed";

  const handleMarkPrerequisitesOffline = () => {
    if (!selectedStudentId) return;
    dataStore.markPrerequisiteStagesCompleted(selectedStudentId, counselorId, "counselor");
    showToast("Prerequisite stages marked completed offline. Candidate ready for application lodging.");
  };

  // Open modal with clean zero-autofill state
  const handleOpenCreateAppModal = () => {
    setSelectedStudentId("");
    setSelectedCountry("");
    setSelectedUniversity("");
    setSelectedCourse("");
    setIsCustomCourse(false);
    setCustomCourseTitle("");
    setSelectedIntake("");
    setNewFee("");
    setCreateAppModal(true);
  };

  const universitiesForCountry = useMemo(() => {
    if (!selectedCountry) return [];
    return ALL_GLOBAL_UNIVERSITIES.filter((u) => {
      const uCountry = (u.country || "").toLowerCase();
      const sCountry = selectedCountry.toLowerCase();
      if (sCountry === "united kingdom" || sCountry === "uk") {
        return uCountry.includes("united kingdom") || uCountry === "uk";
      }
      if (sCountry === "usa" || sCountry === "united states") {
        return uCountry.includes("usa") || uCountry.includes("united states");
      }
      return uCountry.includes(sCountry);
    });
  }, [selectedCountry]);

  const activeUni = useMemo(() => {
    if (!selectedUniversity) return null;
    return (
      ALL_GLOBAL_UNIVERSITIES.find(
        (u) => u.name.toLowerCase() === selectedUniversity.toLowerCase() || u.id === selectedUniversity
      ) || null
    );
  }, [selectedUniversity]);

  const coursesForUniversity = useMemo(() => {
    if (!activeUni) return [];
    const list: string[] = [];
    if (activeUni.course) list.push(activeUni.course);
    if (activeUni.alternativeCourses && activeUni.alternativeCourses.length > 0) {
      activeUni.alternativeCourses.forEach((c) => {
        if (!list.includes(c)) list.push(c);
      });
    }
    const storeCourses = dataStore.getAllCourses().filter(
      (c) => c.universityName.toLowerCase() === activeUni.name.toLowerCase()
    );
    storeCourses.forEach((sc) => {
      if (!list.includes(sc.courseName)) list.push(sc.courseName);
    });
    return Array.from(new Set(list));
  }, [activeUni]);

  const intakesForUniversity: string[] = useMemo(() => {
    if (!activeUni) return [];
    const list: string[] = [];
    if (activeUni.mainIntakes) {
      const parts = activeUni.mainIntakes.split(",").map((p) => p.trim());
      parts.forEach((p) => {
        if (p.toLowerCase().includes("sep") || p.toLowerCase().includes("aug") || p.toLowerCase().includes("fall")) {
          list.push("September 2026 / Fall 2026");
        }
        if (p.toLowerCase().includes("jan") || p.toLowerCase().includes("feb") || p.toLowerCase().includes("spring")) {
          list.push("January 2027 / Spring 2027");
        }
        if (p.toLowerCase().includes("may") || p.toLowerCase().includes("summer")) {
          list.push("May 2027 / Summer 2027");
        }
      });
    }
    if (activeUni.intake && !list.includes(activeUni.intake)) {
      list.push(activeUni.intake);
    }
    if (list.length === 0) {
      const uCountry = (activeUni.country || "").toLowerCase();
      if (uCountry.includes("australia") || uCountry.includes("new zealand")) {
        return ["February 2027 / Semester 1", "July 2027 / Semester 2", "November 2027 / Summer"];
      }
      if (uCountry.includes("germany")) {
        return ["Winter Semester 2026 / October 2026", "Summer Semester 2027 / April 2027"];
      }
      return ["September 2026 / Fall 2026", "January 2027 / Spring 2027", "May 2027 / Summer 2027"];
    }
    return Array.from(new Set(list));
  }, [activeUni]);

  const currencySymbol = useMemo(() => {
    if (!activeUni) {
      const foundCountry = destinationCountries.find((c) => c.name === selectedCountry);
      return foundCountry?.symbol || "£";
    }
    if (activeUni.currency === "EUR" || activeUni.country.toLowerCase().includes("germany")) return "€";
    if (activeUni.currency === "USD" || activeUni.country.toLowerCase().includes("usa") || activeUni.country.toLowerCase().includes("united states")) return "$";
    if (activeUni.currency === "AUD" || activeUni.country.toLowerCase().includes("australia")) return "A$";
    if (activeUni.currency === "CAD" || activeUni.country.toLowerCase().includes("canada")) return "C$";
    if (activeUni.currency === "NZD" || activeUni.country.toLowerCase().includes("new zealand")) return "NZ$";
    return "£";
  }, [activeUni, selectedCountry]);

  const handleCountryChange = (countryName: string) => {
    setSelectedCountry(countryName);
    setSelectedUniversity("");
    setSelectedCourse("");
    setIsCustomCourse(false);
    setCustomCourseTitle("");
    setSelectedIntake("");
    setNewFee("");
  };

  const handleUniversityChange = (uniName: string) => {
    setSelectedUniversity(uniName);
    setIsCustomCourse(false);
    setCustomCourseTitle("");

    const foundUni = ALL_GLOBAL_UNIVERSITIES.find(
      (u) => u.name.toLowerCase() === uniName.toLowerCase() || u.id === uniName
    );

    if (foundUni) {
      const fee = foundUni.tuitionFee || foundUni.tuition1Year || 22000;
      setNewFee(fee);

      if (foundUni.course) {
        setSelectedCourse(foundUni.course);
      } else {
        setSelectedCourse("");
      }

      let defaultIntake = "";
      if (foundUni.mainIntakes) {
        if (foundUni.mainIntakes.toLowerCase().includes("sep") || foundUni.mainIntakes.toLowerCase().includes("fall")) {
          defaultIntake = "September 2026 / Fall 2026";
        } else if (foundUni.mainIntakes.toLowerCase().includes("jan") || foundUni.mainIntakes.toLowerCase().includes("spring")) {
          defaultIntake = "January 2027 / Spring 2027";
        } else {
          defaultIntake = foundUni.mainIntakes.split(",")[0].trim();
        }
      } else {
        defaultIntake = foundUni.intake || "September 2026 / Fall 2026";
      }
      setSelectedIntake(defaultIntake);
    } else {
      setSelectedCourse("");
      setSelectedIntake("");
      setNewFee("");
    }
  };

  const handleCourseChange = (courseTitle: string) => {
    if (courseTitle === "__custom__") {
      setIsCustomCourse(true);
      setSelectedCourse("");
    } else {
      setIsCustomCourse(false);
      setSelectedCourse(courseTitle);
      if (activeUni) {
        const storeMatch = dataStore.getAllCourses().find(
          (c) =>
            c.universityName.toLowerCase() === activeUni.name.toLowerCase() &&
            c.courseName.toLowerCase() === courseTitle.toLowerCase()
        );
        if (storeMatch && storeMatch.tuitionFee) {
          setNewFee(storeMatch.tuitionFee);
        }
      }
    }
  };

  const handleCreateApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      alert("Please select a target candidate.");
      return;
    }
    if (!activeUni || !selectedCountry) {
      alert("Please select a destination country and target university.");
      return;
    }
    const finalCourse = isCustomCourse ? customCourseTitle.trim() : selectedCourse;
    if (!finalCourse) {
      alert("Please select or enter a master's program title.");
      return;
    }
    if (!selectedIntake) {
      alert("Please select a target intake.");
      return;
    }

    dataStore.createApplication(
      selectedStudentId,
      activeUni.name,
      activeUni.country,
      finalCourse,
      selectedIntake,
      Number(newFee) || 0,
      counselorId
    );
    setApplications(dataStore.getAllApplications(counselorId));
    setCreateAppModal(false);
    showToast(`✓ Application created for ${activeUni.name}`);
  };

  // Removal Confirmation Modal State
  const [deleteConfirmApp, setDeleteConfirmApp] = useState<{ id: string; universityName: string; courseName?: string; studentName?: string } | null>(null);

  const handleInitiateDelete = (app: { id: string; universityName: string; courseName?: string; studentName?: string }) => {
    setDeleteConfirmApp(app);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmApp) return;
    dataStore.deleteApplication(deleteConfirmApp.id, counselorId);
    setApplications(dataStore.getAllApplications(counselorId));
    showToast(`✓ Application for ${deleteConfirmApp.universityName} removed.`);
    setDeleteConfirmApp(null);
  };

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.universityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.courseName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter !== "all" && app.currentStatus !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-lg bg-gvk-navy-50 text-gvk-navy">
                <GraduationCap className="w-5 h-5 text-gvk-navy" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-gvk-navy tracking-tight">
                Cross-Student Applications Matrix ({applications.length})
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gvk-text-secondary">
              Monitor, track admission offers, seat deposits, CAS issuances, and visa timelines.
            </p>
          </div>

          <Button
            onClick={handleOpenCreateAppModal}
            size="sm"
            className="bg-[#253775] hover:bg-[#1a2754] text-white font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create University Application</span>
          </Button>
        </div>

        {/* Search & Status Filters */}
        <div className="mt-6 pt-4 border-t border-gvk-border flex flex-col md:flex-row items-center gap-3">
          <div className="w-full md:w-80">
            <Input
              type="text"
              placeholder="Search by university, course or student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {["all", "conditional_offer", "unconditional_offer", "under_review", "documents_pending"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors capitalize ${
                  statusFilter === st
                    ? "bg-gvk-navy text-white shadow-xs"
                    : "bg-slate-100 text-gvk-text-secondary hover:bg-slate-200"
                }`}
              >
                {st.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-gvk-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-gvk-border text-gvk-text-secondary font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 sm:px-6">University & Campus</th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Course & Intake</th>
                <th className="py-3.5 px-4">Program Structure</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gvk-border">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gvk-text-muted">
                    <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-40 text-gvk-navy" />
                    {assignedStudents.length === 0 ? (
                      <>
                        <p className="font-bold text-gvk-navy text-sm">No Candidates Assigned Yet</p>
                        <p className="text-xs text-gvk-text-secondary mt-1 max-w-sm mx-auto">
                          Your desk is fresh and ready. As GVK Admissions Administration allocates candidates to your specialization, their applications and admission offers will appear here.
                        </p>
                      </>
                    ) : applications.length === 0 ? (
                      <>
                        <p className="font-bold text-gvk-navy text-sm">No Applications Lodged Yet</p>
                        <p className="text-xs text-gvk-text-secondary mt-1 max-w-sm mx-auto">
                          Click "+ Create University Application" above to lodge a formal university application for your assigned candidates.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-bold text-gvk-navy text-sm">No Matching Applications Found</p>
                        <p className="text-xs text-gvk-text-secondary mt-1 max-w-sm mx-auto">
                          No university applications match your current search and filter criteria.
                        </p>
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <UniversityBadge name={app.universityName} country={app.country} size="sm" showCountryFlag />
                        <div className="min-w-0">
                          <strong className="text-sm font-bold text-gvk-navy block leading-snug">
                            {app.universityName}
                          </strong>
                          <span className="text-gvk-text-secondary text-[11px]">
                            {app.country} • Ref: <span className="font-mono">{app.appRefNumber || "Awaiting"}</span>
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <strong className="text-gvk-text-primary block font-semibold">
                        {app.studentName}
                      </strong>
                      <span className="font-mono text-[11px] text-gvk-text-muted">
                        {app.studentIdCode}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-gvk-navy">{app.courseName}</span>
                      <span className="block text-gvk-text-secondary text-[11px]">{app.intake}</span>
                    </td>

                    <td className="py-4 px-4 text-xs font-semibold text-gvk-navy">
                      <span className="block">{app.intake}</span>
                      <span className="text-[11px] text-gvk-text-secondary font-normal">Full-time Postgraduate</span>
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge type="application" status={app.currentStatus} />
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/counselor/students/${app.studentId}?tab=applications`}>
                          <Button variant="outline" size="sm" className="font-bold text-xs">
                            Open Workspace
                          </Button>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleInitiateDelete(app)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                          title="Remove application"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Application (Zero Autofill + Cascading Selector) */}
      {createAppModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-gvk-border shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gvk-navy">
                  Add University Application
                </h3>
                <p className="text-xs text-gvk-text-secondary">
                  Select candidate, destination country, university, course & intake.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateAppModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>

            {/* Offline Prerequisite Check for Selected Student */}
            {selectedStudentId && !arePrerequisitesCompleted && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-amber-950">
                      Prior Stages Pending for Candidate
                    </p>
                    <p className="text-amber-800 text-[11px] leading-relaxed">
                      If the candidate completed document submission and shortlisting in-person or via phone consultation, you can unlock application lodging right now:
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleMarkPrerequisitesOffline}
                  className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs"
                >
                  Mark Prior Stages Completed Offline & Unlock
                </button>
              </div>
            )}

            <form onSubmit={handleCreateApplication} className="space-y-4 text-xs">
              {/* Target Candidate */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  1. Target Candidate *
                </label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white font-medium"
                >
                  <option value="">-- Choose Candidate --</option>
                  {assignedStudents.map((stu) => (
                    <option key={stu.id} value={stu.id}>
                      {stu.firstName} {stu.lastName} ({stu.studentIdCode}) — Targeting {stu.preferredCountry || "Study Abroad"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Country */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  2. Destination Country *
                </label>
                <select
                  required
                  value={selectedCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white font-medium"
                >
                  <option value="">-- Select Destination Country --</option>
                  {destinationCountries.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* University Selector with Typeahead Combobox */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  3. Target University *
                </label>
                <UniversityCombobox
                  universities={universitiesForCountry}
                  value={selectedUniversity}
                  onChange={(uniName) => handleUniversityChange(uniName)}
                  disabled={!selectedCountry}
                  disabledPlaceholder="-- Select Country First --"
                  placeholder={
                    selectedCountry
                      ? `Type to search ${universitiesForCountry.length} universities in ${selectedCountry}...`
                      : "-- Choose Destination Country First --"
                  }
                  required
                />
              </div>

              {/* Course Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  4. Master's Program Title *
                </label>
                <select
                  required
                  disabled={!selectedUniversity}
                  value={isCustomCourse ? "__custom__" : selectedCourse}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white font-medium disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">
                    {selectedUniversity ? "-- Select Master's Program --" : "-- Select University First --"}
                  </option>
                  {coursesForUniversity.map((course, idx) => (
                    <option key={idx} value={course}>
                      {course}
                    </option>
                  ))}
                  <option value="__custom__">➕ Enter Custom Program Title...</option>
                </select>

                {isCustomCourse && (
                  <div className="mt-2">
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

              {/* Intake & Tuition Fee */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    5. Target Intake *
                  </label>
                  <select
                    required
                    disabled={!selectedUniversity}
                    value={selectedIntake}
                    onChange={(e) => setSelectedIntake(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white font-medium disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">
                      {selectedUniversity ? "-- Select Intake --" : "-- Select University First --"}
                    </option>
                    {intakesForUniversity.map((intake: string, idx: number) => (
                      <option key={idx} value={intake}>
                        {intake}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Tuition Fee ({currencySymbol}) *</span>
                    {activeUni && (
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        Auto-loaded
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    required
                    value={newFee}
                    onChange={(e) => setNewFee(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder={activeUni ? "Auto-detected fee" : "e.g. 25000"}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setCreateAppModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={
                    !selectedStudentId ||
                    !selectedCountry ||
                    !selectedUniversity ||
                    (!selectedCourse && !customCourseTitle) ||
                    !selectedIntake
                  }
                  className="bg-[#253775] hover:bg-[#1a2754] text-white font-bold"
                >
                  Create Application
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM APPLICATION REMOVAL */}
      {deleteConfirmApp && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gvk-border shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-gvk-border pb-3 mb-4">
              <h3 className="font-bold text-base text-gvk-navy flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-600" />
                Confirm Application Removal
              </h3>
              <button
                type="button"
                onClick={() => setDeleteConfirmApp(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 space-y-3">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Remove Application Record</span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  Are you sure you want to remove this university application from candidate&apos;s portfolio?
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
                      <span>Candidate:</span>
                      <strong className="text-slate-800 font-semibold">{deleteConfirmApp.studentName}</strong>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-rose-700 font-medium">
                  Associated admission offers, milestone locks, and documentation records will be detached.
                </p>
              </div>

              <div className="pt-3 border-t border-gvk-border flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteConfirmApp(null)}
                  className="text-xs font-semibold px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleConfirmDelete}
                  className="text-xs font-bold px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white shadow-md flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirm Remove</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
