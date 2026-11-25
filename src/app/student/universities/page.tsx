"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UniversityBadge } from "@/components/shared/UniversityLogo";
import { Button } from "@/components/ui/button";
import { UniversityApplicationCardData } from "@/types/domain";
import {
  ALL_GLOBAL_UNIVERSITIES,
  ALL_UK_UNIVERSITIES,
  UniversityCatalogEntry,
} from "@/lib/data/universities";
import {
  GraduationCap,
  Building,
  Calendar,
  CreditCard,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Search,
  Plus,
  Check,
  Sparkles,
  Download,
  Lock,
  Globe2,
  MessageSquare,
} from "lucide-react";

export default function StudentUniversitiesPage() {
  const { user } = useCurrentUser();
  const studentId = user?.role === "student" ? user.id : "usr-student-01";

  const [applications, setApplications] = useState(() => dataStore.getStudentApplications(studentId));
  const [selectedApp, setSelectedApp] = useState<UniversityApplicationCardData | null>(null);

  // Offer Acceptance State
  const [acceptOfferModal, setAcceptOfferModal] = useState<UniversityApplicationCardData | null>(null);
  const [acceptToast, setAcceptToast] = useState<string | null>(null);

  const finalDestination = applications.find((a) => a.isFinalDestination);
  const offersReceivedList = applications.filter(
    (a) => a.currentStatus === "conditional_offer" || a.currentStatus === "unconditional_offer"
  );

  // Tab & Shortlisting State for Global Universities
  const [activeTab, setActiveTab] = useState<"applications" | "shortlist_global">("applications");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<"all" | "ambitious" | "target" | "safe">("all");
  const [prestigeOnly, setPrestigeOnly] = useState(false);

  const [journey, setJourney] = useState(() => dataStore.getStudentJourney(studentId));

  useEffect(() => {
    setApplications(dataStore.getStudentApplications(studentId));
    setJourney(dataStore.getStudentJourney(studentId));
    const unsubscribe = dataStore.subscribe(() => {
      setApplications(dataStore.getStudentApplications(studentId));
      setJourney(dataStore.getStudentJourney(studentId));
    });
    return () => unsubscribe();
  }, [studentId]);

  const activeStage = journey.find((s) => s.status !== "completed");
  const activeStageNum = activeStage ? activeStage.stageNumber : 23;
  const stage4Record = journey.find((s) => s.stageNumber === 4);
  const isStage4Completed = stage4Record?.status === "completed" || activeStageNum > 4;
  const isShortlistingUnlocked = activeStageNum >= 4;
  const isShortlistingActive = activeStageNum === 4 && stage4Record?.status !== "completed";
  const [confirmSubmitShortlistModal, setConfirmSubmitShortlistModal] = useState(false);

  const handleToggleShortlist = (uni: UniversityCatalogEntry) => {
    if (!isShortlistingUnlocked) {
      setAcceptToast(
        "🔒 University shortlisting is locked until Stage 03 (Document Collection) is verified and completed by your counselor."
      );
      setTimeout(() => setAcceptToast(null), 4500);
      return;
    }

    if (isStage4Completed) {
      setAcceptToast(
        "🔒 University shortlist has been confirmed and submitted to your counselor. Shortlist changes are locked while applications are being lodged."
      );
      setTimeout(() => setAcceptToast(null), 4500);
      return;
    }

    const isAlreadyShortlisted = applications.some(
      (a) => a.universityName.toLowerCase() === uni.name.toLowerCase()
    );

    if (isAlreadyShortlisted) {
      dataStore.removeShortlistedUniversity(studentId, uni.name);
      setAcceptToast(`Removed ${uni.name} from your shortlisted applications.`);
    } else {
      dataStore.shortlistUniversity(
        studentId,
        uni.name,
        uni.country,
        uni.course,
        uni.tuitionFee,
        uni.tier
      );
      setAcceptToast(`✓ Added ${uni.name} to your shortlisted applications!`);
    }

    setApplications(dataStore.getStudentApplications(studentId));
    setTimeout(() => setAcceptToast(null), 3500);
  };

  const handleConfirmAndSubmitShortlist = () => {
    dataStore.confirmStudentShortlist(studentId);
    setJourney(dataStore.getStudentJourney(studentId));
    setApplications(dataStore.getStudentApplications(studentId));
    setConfirmSubmitShortlistModal(false);
    setActiveTab("applications");
    setAcceptToast(
      "✓ University shortlist confirmed & submitted! Your counselor will now lodge official applications in Stage 05."
    );
    setTimeout(() => setAcceptToast(null), 5000);
  };

  // Supported country destinations with dynamic badge counts
  const countryTabs = useMemo(() => {
    return [
      { id: "all", label: "All Destinations", flag: "🌐", count: ALL_GLOBAL_UNIVERSITIES.length },
      {
        id: "United Kingdom",
        label: "United Kingdom",
        flag: "🇬🇧",
        count: ALL_GLOBAL_UNIVERSITIES.filter((u) => u.country === "United Kingdom").length,
      },
      {
        id: "USA",
        label: "USA",
        flag: "🇺🇸",
        count: ALL_GLOBAL_UNIVERSITIES.filter((u) => u.country === "USA" || u.country === "United States").length,
      },
      {
        id: "Australia",
        label: "Australia",
        flag: "🇦🇺",
        count: ALL_GLOBAL_UNIVERSITIES.filter((u) => u.country === "Australia").length,
      },
      {
        id: "Canada",
        label: "Canada",
        flag: "🇨🇦",
        count: ALL_GLOBAL_UNIVERSITIES.filter((u) => u.country === "Canada").length,
      },
      {
        id: "Germany",
        label: "Germany",
        flag: "🇩🇪",
        count: ALL_GLOBAL_UNIVERSITIES.filter((u) => u.country === "Germany").length,
      },
      {
        id: "New Zealand",
        label: "New Zealand",
        flag: "🇳🇿",
        count: ALL_GLOBAL_UNIVERSITIES.filter((u) => u.country === "New Zealand").length,
      },
    ];
  }, []);

  // Universities filtered by country
  const countryPool = useMemo(() => {
    if (selectedCountry === "all") return ALL_GLOBAL_UNIVERSITIES;
    if (selectedCountry === "USA") {
      return ALL_GLOBAL_UNIVERSITIES.filter((u) => u.country === "USA" || u.country === "United States");
    }
    return ALL_GLOBAL_UNIVERSITIES.filter((u) => u.country === selectedCountry);
  }, [selectedCountry]);

  // Dynamic Tier counts based on selected country
  const tierCounts = useMemo(() => {
    return {
      all: countryPool.length,
      ambitious: countryPool.filter((u) => u.tier === "ambitious").length,
      target: countryPool.filter((u) => u.tier === "target").length,
      safe: countryPool.filter((u) => u.tier === "safe").length,
    };
  }, [countryPool]);

  // Filtered universities based on search, tier, prestige
  const filteredUniversities = useMemo(() => {
    return countryPool.filter((uni) => {
      const matchesTier = tierFilter === "all" || uni.tier === tierFilter;
      const matchesPrestige =
        !prestigeOnly ||
        uni.russellGroup ||
        uni.typeGroup?.includes("Russell") ||
        uni.typeGroup?.includes("Ivy") ||
        uni.typeGroup?.includes("Group of Eight") ||
        uni.typeGroup?.includes("U15") ||
        uni.typeGroup?.includes("TU9");

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        uni.name.toLowerCase().includes(q) ||
        uni.city.toLowerCase().includes(q) ||
        uni.country.toLowerCase().includes(q) ||
        uni.course.toLowerCase().includes(q) ||
        (uni.keyStrengths && uni.keyStrengths.toLowerCase().includes(q)) ||
        (uni.alternativeCourses && uni.alternativeCourses.some((c) => c.toLowerCase().includes(q)));

      return matchesTier && matchesPrestige && matchesSearch;
    });
  }, [countryPool, tierFilter, prestigeOnly, searchQuery]);

  const handleConfirmAcceptOffer = () => {
    if (!acceptOfferModal) return;
    const res = dataStore.acceptUniversityOffer(studentId, acceptOfferModal.id, studentId);
    if (res.success) {
      setApplications(dataStore.getStudentApplications(studentId));
      setAcceptToast(
        `✓ ${acceptOfferModal.universityName} confirmed as your Final Destination! Next steps locked to this university.`
      );
      setTimeout(() => setAcceptToast(null), 4500);
      if (selectedApp?.id === acceptOfferModal.id) {
        setSelectedApp(null);
      }
    }
    setAcceptOfferModal(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-lg bg-gvk-navy-50 text-gvk-navy">
                <GraduationCap className="w-5 h-5 text-gvk-navy" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-gvk-navy tracking-tight">
                My University Applications ({applications.length})
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gvk-text-secondary">
              Explore accredited institutions across 6 study destinations. Shortlist universities concurrently and lock in your firm choice when offers arrive.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-gvk-text-secondary bg-slate-50 p-2.5 px-3.5 rounded-xl border border-gvk-border self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-gvk-success" />
            <span>Single Final Destination Binding</span>
          </div>
        </div>
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

      {/* View Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-gvk-border pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("applications")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "applications"
                ? "bg-gvk-navy text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <span>My Applications</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === "applications" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
              }`}
            >
              {applications.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("shortlist_global")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "shortlist_global"
                ? "bg-gvk-navy text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            {isShortlistingUnlocked ? (
              <Sparkles className="w-3.5 h-3.5" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span>Explore & Shortlist Universities</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === "shortlist_global" ? "bg-white/20 text-white" : isShortlistingUnlocked ? "bg-slate-200 text-slate-700" : "bg-amber-100 text-amber-800"
              }`}
            >
              {isShortlistingUnlocked ? ALL_GLOBAL_UNIVERSITIES.length : "Stage 04 Locked"}
            </span>
          </button>
        </div>

        <span className="text-[11px] text-gvk-text-secondary font-medium px-3 hidden sm:block">
          Destinations: <strong>UK, USA, Australia, Canada, Germany, New Zealand</strong>
        </span>
      </div>

      {/* VIEW 1: MY ACTIVE APPLICATIONS */}
      {activeTab === "applications" && (
        <div className="space-y-6">
          {/* Single Destination Convergence Callout */}
          {finalDestination ? (
            <div className="p-4 sm:p-5 rounded-2xl border border-emerald-300 bg-emerald-50/90 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 text-emerald-700">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm sm:text-base font-bold">
                      Confirmed Final Destination: {finalDestination.universityName}
                    </strong>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                      Firm Choice Locked
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Target: <strong>{finalDestination.courseName}</strong> ({finalDestination.intake}) • All downstream stages (Tuition Deposit, CAS/I-20, Visa, Accommodation) are bound exclusively to this institution.
                  </p>
                </div>
              </div>
              <Link href="/student/journey">
                <Button size="sm" className="font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white shrink-0 shadow-xs flex items-center gap-1.5">
                  <span>View Milestone Roadmap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          ) : offersReceivedList.length > 0 ? (
            <div className="p-4 sm:p-5 rounded-2xl border border-amber-300 bg-amber-50 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-amber-700">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm sm:text-base font-bold">
                      Admission Offers Received ({offersReceivedList.length}): Choose One Final Destination
                    </strong>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                      Decision Required
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 mt-0.5">
                    You have received offers from multiple universities ({offersReceivedList.map((o) => o.universityName).join(", ")}). Accept one university below to unlock CAS/Visa and Tuition Deposit.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* List of University Applications */}
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-4 shadow-card">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 border border-slate-200 text-gvk-navy flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-gvk-navy" />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h3 className="text-lg font-bold text-gvk-navy">
                    No University Applications Shortlisted Yet
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    You are currently at <strong>Stage {activeStage?.stageNumber.toString().padStart(2, "0")}: {activeStage?.stageName}</strong>. Official university shortlisting unlocks at <strong>Stage 04</strong>, and formal application submissions occur at <strong>Stage 05</strong> once prerequisite stages are verified by your counselor.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <Link href={`/student/journey?stage=${activeStageNum}`}>
                    <Button variant="outlineNavy" size="sm" className="font-bold text-xs">
                      Go to Active Stage {activeStage?.stageNumber.toString().padStart(2, "0")} ({activeStage?.stageName}) →
                    </Button>
                  </Link>
                  {isShortlistingUnlocked ? (
                    <Button
                      onClick={() => setActiveTab("shortlist_global")}
                      size="sm"
                      className="bg-gvk-navy hover:bg-gvk-navy-hover text-white font-bold text-xs shadow-xs"
                    >
                      Browse Global University Catalog
                    </Button>
                  ) : (
                    <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Universities visible in Stage 04: Shortlisting</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              applications.map((app) => {
                const isAcceptedFinal = app.isFinalDestination;
                const hasOffer =
                  app.currentStatus === "conditional_offer" || app.currentStatus === "unconditional_offer";

                const currencySymbol =
                  app.tuitionFeeCurrency === "GBP"
                    ? "£"
                    : app.tuitionFeeCurrency === "EUR"
                    ? "€"
                    : app.tuitionFeeCurrency === "AUD"
                    ? "A$"
                    : app.tuitionFeeCurrency === "CAD"
                    ? "C$"
                    : app.tuitionFeeCurrency === "NZD"
                    ? "NZ$"
                    : "$";

                return (
                  <div
                    key={app.id}
                    className={`rounded-2xl border bg-white p-4 sm:p-5 shadow-card transition-all ${
                      isAcceptedFinal
                        ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10"
                        : hasOffer
                        ? "border-amber-300 ring-1 ring-amber-300/30"
                        : "border-gvk-border hover:shadow-elevated"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      {/* Left Side: Identity */}
                      <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base sm:text-lg font-bold text-gvk-navy leading-snug">
                              {app.universityName}
                            </h2>
                            <StatusBadge type="application" status={app.currentStatus} />
                            {isAcceptedFinal && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
                                Confirmed Final Choice
                              </span>
                            )}
                          </div>

                          <p className="text-xs font-semibold text-slate-700">
                            {app.courseName}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-gvk-text-secondary pt-0.5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200">
                              <Globe2 className="w-3.5 h-3.5 text-slate-500" />
                              <span>{app.country}</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200">
                              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                              <strong className="text-emerald-700">
                                {currencySymbol}
                                {(app.tuitionFee || app.tuition1Year)?.toLocaleString() || "N/A"} / yr
                              </strong>
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200">
                              <Calendar className="w-3.5 h-3.5 text-gvk-navy" />
                              <span>Intake: <strong className="text-gvk-navy">{app.intake || "Fall 2026"}</strong></span>
                            </span>
                          </div>
                        </div>

                      {/* Right Side: Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 self-start lg:self-center pt-2.5 lg:pt-0 border-t lg:border-t-0 border-gvk-border w-full lg:w-auto justify-end">
                        {hasOffer && (
                          <a
                            href={`/api/documents/download?id=doc-offer-${app.id}&appId=${app.id}&studentId=${studentId}`}
                            download
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs shadow-2xs transition-colors shrink-0"
                            title="Download Official University Offer Letter PDF"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Download Offer Letter</span>
                          </a>
                        )}

                        {hasOffer && !isAcceptedFinal && (
                          <Button
                            size="sm"
                            onClick={() => setAcceptOfferModal(app)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 shrink-0"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{finalDestination ? "Switch Choice" : "Accept Offer & Commit"}</span>
                          </Button>
                        )}

                        <Button
                          size="sm"
                          onClick={() => setSelectedApp(app)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs hover:shadow-indigo-500/25 transition-all flex items-center gap-1.5 shrink-0"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: EXPLORE & SHORTLIST GLOBAL UNIVERSITIES */}
      {activeTab === "shortlist_global" && (
        !isShortlistingUnlocked ? (
          /* DEDICATED LOCKED VIEW: Visible only in University Shortlisting Stage (Stage 04+) */
          <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-linear-to-b from-amber-50/70 via-white to-white p-8 sm:p-12 text-center shadow-card animate-fade-in space-y-6 max-w-2xl mx-auto my-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center mx-auto text-amber-800 shadow-sm">
              <Lock className="w-8 h-8 text-amber-700" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                <Lock className="w-3.5 h-3.5" /> Stage 04: University Shortlisting Restricted
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gvk-navy">
                Global University Catalog is Currently Locked
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Under GVK Edutech sequential counseling guidelines, the global institutional database of <strong>180 universities across 6 destinations</strong> is visible to students <strong>exclusively in Stage 04: University Shortlisting</strong>.
              </p>
            </div>

            {/* Current Active Milestone Progress Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 text-left shadow-xs max-w-md mx-auto space-y-3">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Your Current Admissions Milestone
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                    0{activeStage?.stageNumber || 2}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      Stage 0{activeStage?.stageNumber || 2}: {activeStage?.stageName || "Profile Evaluation"}
                    </div>
                    <div className="text-xs text-amber-600 font-semibold flex items-center gap-1 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      Active — Pending counselor verification
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-50 text-blue-800 border border-blue-200">
                  Prerequisite
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Sequential Milestone Protocol:
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Your assigned counselor must complete and sign off <strong>Stage 02 (Profile Evaluation)</strong> and <strong>Stage 03 (Document Collection)</strong> before universities can be viewed and shortlisted.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link href={`/student/journey?stage=${activeStageNum}`}>
                <Button className="bg-gvk-navy hover:bg-gvk-navy-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2">
                  <span>Go to Active Stage 0{activeStage?.stageNumber || 2} ({activeStage?.stageName})</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setActiveTab("applications")}
                className="border-slate-300 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl"
              >
                Return to My Applications
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">

          {/* DESTINATION COUNTRY SELECTOR PILLS */}
          <div className="bg-white rounded-2xl border border-gvk-border p-4 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-gvk-navy" />
                <span className="text-xs font-bold text-gvk-navy uppercase tracking-wider">
                  Target Destination
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                {selectedCountry === "all" ? "Showing all countries" : `Destination: ${selectedCountry}`}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
              {countryTabs.map((tab) => {
                const isActive = selectedCountry === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedCountry(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-gvk-navy text-white shadow-xs ring-2 ring-gvk-navy/20"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    <span className="text-sm leading-none">{tab.flag}</span>
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SHORTLIST CONFIRMED & LOCKED BANNER VS ACTION BANNER */}
          {isStage4Completed ? (
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5 sm:mt-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-sm font-bold text-gvk-navy">
                      University Shortlist Confirmed & Locked
                    </strong>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                      Stage 04 Completed
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    You have confirmed your university shortlist and submitted it to your counselor. Your assigned counselor (Priya Varma) is currently lodging official applications in <strong>Stage 05 (Application Submission)</strong>. Direct shortlisting changes are locked.
                  </p>
                </div>
              </div>
              <Link href="/student/counselor">
                <Button variant="outline" size="sm" className="font-bold text-xs shrink-0 flex items-center gap-1.5 border-slate-300 bg-white hover:bg-slate-50">
                  <MessageSquare className="w-3.5 h-3.5 text-gvk-navy" />
                  <span>Request Revisions</span>
                </Button>
              </Link>
            </div>
          ) : applications.length > 0 ? (
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-bold text-gvk-navy">
                      Confirm & Submit Shortlist to Counselor ({applications.length} Selected)
                    </strong>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                      Step 4 Action Required
                    </span>
                  </div>
                  <p className="text-indigo-900 mt-0.5 leading-relaxed">
                    Confirm that these are the target institutions you want to apply to. Once submitted, your shortlist locks and your counselor begins official application submissions.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                onClick={() => setConfirmSubmitShortlistModal(true)}
                className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm px-4 py-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Submit to Counselor</span>
              </Button>
            </div>
          ) : null}

          {/* Controls: Search, Tier Filter, Prestige Toggle */}
          <div className="bg-white rounded-2xl border border-gvk-border p-5 shadow-card space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gvk-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${selectedCountry === "all" ? "all global" : selectedCountry} universities by name, course, or city...`}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gvk-border bg-slate-50 text-xs font-medium text-gvk-navy placeholder:text-gvk-text-muted focus:outline-none focus:ring-2 focus:ring-gvk-navy/20 focus:border-gvk-navy transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Prestige Toggle */}
              <button
                type="button"
                onClick={() => setPrestigeOnly(!prestigeOnly)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 shrink-0 ${
                  prestigeOnly
                    ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-gvk-border"
                }`}
              >
                <span>🏛️</span>
                <span>Prestige Networks Only</span>
                {prestigeOnly && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Tier Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-gvk-text-secondary mr-1">Tiers:</span>
                {(
                  [
                    { id: "all", label: `All (${tierCounts.all})` },
                    { id: "ambitious", label: `Ambitious (${tierCounts.ambitious})` },
                    { id: "target", label: `Target (${tierCounts.target})` },
                    { id: "safe", label: `Safe (${tierCounts.safe})` },
                  ] as const
                ).map((tierItem) => (
                  <button
                    key={tierItem.id}
                    type="button"
                    onClick={() => setTierFilter(tierItem.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      tierFilter === tierItem.id
                        ? "bg-gvk-navy text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tierItem.label}
                  </button>
                ))}
              </div>

              <span className="text-xs font-medium text-gvk-text-secondary">
                Showing <strong className="text-gvk-navy font-bold">{filteredUniversities.length}</strong> universities
              </span>
            </div>
          </div>

          {/* Grid of Global Universities */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredUniversities.map((uni) => {
              const existingApp = applications.find(
                (a) => a.universityName.toLowerCase() === uni.name.toLowerCase()
              );
              const isShortlisted = !!existingApp;
              const hasOffer =
                existingApp &&
                (existingApp.currentStatus === "conditional_offer" ||
                  existingApp.currentStatus === "unconditional_offer");
              const isFinal = !!existingApp?.isFinalDestination;

              const countryFlag =
                uni.country === "United Kingdom"
                  ? "🇬🇧"
                  : uni.country === "USA" || uni.country === "United States"
                  ? "🇺🇸"
                  : uni.country === "Australia"
                  ? "🇦🇺"
                  : uni.country === "Canada"
                  ? "🇨🇦"
                  : uni.country === "Germany"
                  ? "🇩🇪"
                  : uni.country === "New Zealand"
                  ? "🇳🇿"
                  : "🌐";

              return (
                <div
                  key={uni.id}
                  className={`rounded-2xl border bg-white p-5 flex flex-col justify-between transition-all ${
                    isFinal
                      ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20 bg-emerald-50/15"
                      : isShortlisted
                      ? "border-indigo-300 bg-indigo-50/15 shadow-card"
                      : "border-gvk-border shadow-card hover:shadow-elevated"
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Top: Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <UniversityBadge name={uni.name} country={uni.country} size="md" showCountryFlag />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-gvk-navy leading-snug line-clamp-2" title={uni.name}>
                            {uni.name}
                          </h3>
                          <p className="text-[11px] text-gvk-text-secondary flex items-center gap-1.5 mt-0.5">
                            <span>{countryFlag}</span>
                            <span>{uni.city}, {uni.country}</span>
                          </p>
                        </div>
                      </div>

                      {/* Tier Badge */}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shrink-0 ${
                          uni.tier === "ambitious"
                            ? "bg-purple-100 text-purple-900 border border-purple-200"
                            : uni.tier === "target"
                            ? "bg-blue-100 text-blue-900 border border-blue-200"
                            : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                        }`}
                      >
                        {uni.tier}
                      </span>
                    </div>

                    {/* Rankings & Prestige Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                        QS: {uni.qsRankDisplay || `#${uni.ranking}`}
                      </span>
                      {uni.theRankDisplay && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          THE: {uni.theRankDisplay}
                        </span>
                      )}
                      {uni.russellGroup && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                          <span>🏛️</span>
                          <span>Russell Group</span>
                        </span>
                      )}
                      {uni.typeGroup && !uni.russellGroup && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
                          {uni.typeGroup}
                        </span>
                      )}
                    </div>

                    {/* Key Strengths Pill */}
                    {uni.keyStrengths && (
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                          Key Strengths & Popular Disciplines
                        </span>
                        <span className="font-semibold text-slate-800 text-[11px] line-clamp-2">
                          {uni.keyStrengths}
                        </span>
                      </div>
                    )}

                    {/* Target Program & Financials */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gvk-text-secondary block">
                          Featured Course
                        </span>
                        <p className="font-bold text-gvk-navy text-xs mt-0.5">
                          {uni.course}
                        </p>
                      </div>

                      {/* Intake Window & Tuition Status */}
                      <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-600 bg-white/80 p-1.5 px-2 rounded-lg border border-slate-200">
                        <span>Intakes: <strong className="text-gvk-navy font-bold">{uni.mainIntakes || "Rolling"}</strong></span>
                        <span className="text-emerald-700 font-bold">
                          {uni.estimatedTuition || "Standard Tuition"} / yr
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 text-[10px] text-gvk-text-secondary">
                        <div>
                          <span>Min Entry:</span>{" "}
                          <strong className="text-gvk-navy">{uni.minCgpa}</strong>
                        </div>
                        <div>
                          <span>IELTS Band:</span>{" "}
                          <strong className="text-gvk-navy">{uni.minIelts}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Highlights */}
                    <p className="text-[11px] text-gvk-text-secondary leading-relaxed line-clamp-2">
                      💡 {uni.highlight}
                    </p>
                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="pt-3 border-t border-gvk-border mt-3 flex items-center justify-between gap-2">
                    <a
                      href={uni.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg border border-gvk-border bg-white hover:bg-slate-50 text-gvk-text-secondary hover:text-gvk-navy text-xs inline-flex items-center gap-1 transition-colors"
                      title="Visit Official University Portal"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-semibold hidden sm:inline">Official Site</span>
                    </a>

                    <div>
                      {isFinal ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Final Choice</span>
                        </span>
                      ) : hasOffer ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Offer Received</span>
                        </span>
                      ) : isStage4Completed ? (
                        isShortlisted ? (
                          <span className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-800 text-xs font-bold border border-indigo-200 flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Confirmed Choice • Locked</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-slate-400 text-xs font-medium italic">
                            Not in Final Shortlist
                          </span>
                        )
                      ) : !isShortlistingUnlocked ? (
                        <Button
                          type="button"
                          size="sm"
                          disabled
                          className="text-xs font-semibold bg-slate-100 border border-slate-300 text-slate-400 cursor-not-allowed flex items-center gap-1.5 shadow-none"
                          title={`Locked: Complete prerequisite stages to shortlist universities (Stage ${activeStageNum} Active)`}
                        >
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Locked (Stage {activeStageNum.toString().padStart(2, "0")} Active)</span>
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleToggleShortlist(uni)}
                          className={`text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                            isShortlisted
                              ? "bg-indigo-50 border border-indigo-300 text-indigo-700 hover:bg-indigo-100"
                              : "bg-gvk-navy hover:bg-gvk-navy-800 text-white"
                          }`}
                        >
                          {isShortlisted ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-indigo-700" />
                              <span>Shortlisted</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Shortlist</span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredUniversities.length === 0 && (
            <div className="bg-white rounded-2xl border border-gvk-border p-8 text-center space-y-2 shadow-xs">
              <Building className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-gvk-navy">No Universities Found</p>
              <p className="text-xs text-slate-500">
                No institutions in {selectedCountry === "all" ? "the global catalog" : selectedCountry} match your selected criteria. Try adjusting the search keywords, tier filters, or destination.
              </p>
            </div>
          )}
        </div>
        )
      )}

      {/* CONFIRM UNIVERSITY OFFER ACCEPTANCE MODAL */}
      {acceptOfferModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-gvk-border shadow-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-gvk-border">
              <div>
                <h3 className="text-base font-bold text-gvk-navy">
                  Confirm Final Destination Acceptance
                </h3>
                <p className="text-xs text-gvk-text-secondary">
                  {acceptOfferModal.universityName} • {acceptOfferModal.courseName}
                </p>
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
                {acceptOfferModal.appRefNumber && (
                  <div className="flex justify-between text-gvk-text-secondary">
                    <span>Application Ref:</span>
                    <strong className="text-gvk-navy font-mono">{acceptOfferModal.appRefNumber}</strong>
                  </div>
                )}
                <div className="flex justify-between text-gvk-text-secondary">
                  <span>Offer Status:</span>
                  <StatusBadge type="application" status={acceptOfferModal.currentStatus} />
                </div>
              </div>

              {/* Review Official Letter Action */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-300">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span className="font-bold text-emerald-950 text-xs">Review Formal Offer Letter:</span>
                </div>
                <a
                  href={`/api/documents/download?id=doc-offer-${acceptOfferModal.id}&appId=${acceptOfferModal.id}&studentId=${studentId}`}
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Offer Letter</span>
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block mb-0.5 text-xs text-amber-950">
                    Overseas Admission Compliance Rule:
                  </strong>
                  <p className="text-[11px] text-amber-900/95 leading-relaxed">
                    Under study abroad visa and university regulations, <strong>you can only proceed with ONE university</strong> for subsequent stages. By confirming, your Tuition Deposit, CAS/I-20, Student Visa, and Accommodation stages will strictly proceed for <strong>{acceptOfferModal.universityName}</strong>. Other university applications will be declined.
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

      {/* Application Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-gvk-border shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gvk-border">
              <div className="min-w-0">
                <h3 className="text-xl font-bold text-gvk-navy">
                  {selectedApp.universityName}
                </h3>
                <p className="text-xs text-gvk-text-secondary">
                  {selectedApp.courseName} ({selectedApp.intake}) • {selectedApp.country}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-lg hover:bg-slate-100 text-gvk-text-secondary min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-5 space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-gvk-text-secondary">Official Status</span>
                <StatusBadge type="application" status={selectedApp.currentStatus} />
              </div>

              {/* Offer Letter Download Button */}
              {(selectedApp.currentStatus === "conditional_offer" || selectedApp.currentStatus === "unconditional_offer") && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-emerald-700" />
                    <div>
                      <strong className="text-emerald-950 font-bold block text-xs">
                        Official {selectedApp.currentStatus === "unconditional_offer" ? "Unconditional" : "Conditional"} Offer Letter
                      </strong>
                      <span className="text-[11px] text-emerald-800 font-mono">
                        {selectedApp.offerLetterFileName || `${selectedApp.universityName.replace(/\s+/g, "_")}_Offer_Letter.pdf`}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`/api/documents/download?id=doc-offer-${selectedApp.id}&appId=${selectedApp.id}&studentId=${studentId}`}
                    download
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Offer Letter</span>
                  </a>
                </div>
              )}

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gvk-navy text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-gvk-navy" />
                    <span>Program Structure & Route Details</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Ref: {selectedApp.appRefNumber || "Pending"}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs space-y-1">
                    <strong className="text-gvk-navy font-bold text-xs block">
                      Full-time Postgraduate
                    </strong>
                    <p className="text-[10.5px] text-slate-600 font-medium">
                      Intake: <strong className="text-slate-800">{selectedApp.intake || "Fall 2026"}</strong>
                    </p>
                    <p className="text-[10px] text-slate-500 pt-0.5">
                      Destination: {selectedApp.country}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs space-y-1">
                    <strong className="text-gvk-navy font-bold text-xs block">
                      Annual Tuition Benchmark
                    </strong>
                    <p className="text-[11px] text-emerald-700 font-bold">
                      {selectedApp.tuitionFeeCurrency} {(selectedApp.tuitionFee || selectedApp.tuition1Year)?.toLocaleString() || "Standard"} / yr
                    </p>
                    <p className="text-[10px] text-slate-500 pt-0.5">
                      Post-Study Work Visa eligible
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-gvk-border flex items-center justify-between gap-3">
              <div>
                {(selectedApp.currentStatus === "conditional_offer" || selectedApp.currentStatus === "unconditional_offer") && !selectedApp.isFinalDestination && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setAcceptOfferModal(selectedApp);
                      setSelectedApp(null);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Accept Offer & Commit</span>
                  </Button>
                )}
              </div>
              <Button onClick={() => setSelectedApp(null)} variant="outline" className="font-bold text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM & SUBMIT SHORTLIST MODAL */}
      {confirmSubmitShortlistModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-gvk-border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gvk-border pb-3">
              <div>
                <h3 className="font-bold text-base text-gvk-navy flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Confirm & Submit University Shortlist
                </h3>
                <p className="text-xs text-gvk-text-secondary mt-0.5">
                  Confirm your target institutions to initiate official portal applications.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmSubmitShortlistModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950 uppercase tracking-wide text-[10px]">
                    Confirmed Target Institutions ({applications.length})
                  </span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                    Final Shortlist
                  </span>
                </div>
                <div className="divide-y divide-indigo-100 bg-white rounded-lg border border-indigo-200/60 overflow-hidden">
                  {applications.map((app) => (
                    <div key={app.id} className="p-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <UniversityBadge name={app.universityName} country={app.country} size="xs" showCountryFlag />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-xs truncate">{app.universityName}</p>
                          <p className="text-[10px] text-slate-500 truncate">{app.courseName} • {app.intake}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                        Target Choice
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Confirmation Binding Declaration */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-950 text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Student Confirmation & Submission Declaration</span>
                </div>
                <p className="text-amber-900 leading-relaxed text-[11px]">
                  &ldquo;I confirm that these universities only I want to join and apply to for my Masters. Upon submission, my shortlist will be locked and my assigned counselor will begin submitting official university applications in Stage 05.&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-gvk-border flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmSubmitShortlistModal(false)}
                  className="font-bold text-xs"
                >
                  Review / Modify Selection
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleConfirmAndSubmitShortlist}
                  className="font-bold text-xs bg-indigo-700 hover:bg-indigo-800 text-white shadow-md flex items-center gap-1.5 px-4 py-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm & Submit to Counselor</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
