"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UniversityBadge } from "@/components/shared/UniversityLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DocumentCategory, JourneyStageStatus } from "@/types/database.types";
import { UniversityApplicationCardData } from "@/types/domain";
import { ALL_UK_UNIVERSITIES } from "@/lib/data/universities";
import {
  Compass,
  CheckCircle2,
  Clock,
  AlertCircle,
  Info,
  Calendar,
  User,
  Building,
  Building2,
  FileText,
  Upload,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  GraduationCap,
  Sparkles,
  Plane,
  CreditCard,
  PhoneCall,
  Home,
  Luggage,
  ShieldCheck,
  Video,
  Banknote,
  Send,
  Download,
  AlertTriangle,
  Award,
  Lock,
  Search,
  MessageSquare,
  ExternalLink,
} from "lucide-react";

interface UniversityCatalogItem {
  id: string;
  name: string;
  country: string;
  flag: string;
  ranking: number;
  tier: "ambitious" | "target" | "safe";
  course: string;
  intake: string;
  tuitionFee: number;
  currency: string;
  minCgpa: string;
  minIelts: string;
  gvkPartner: boolean;
  highlight: string;
  city?: string;
  tuition1Year?: number | string;
  tuition2Year?: number | string;
  tuitionRange1Year?: string;
  tuitionRange2Year?: string;
  placementAvailable?: boolean;
}

const masterUniversityCatalog: UniversityCatalogItem[] = [
  // ALL 48 UK UNIVERSITIES (Primary Masters Destination)
  ...ALL_UK_UNIVERSITIES.map((u) => ({
    id: u.id,
    name: u.name,
    country: u.country,
    flag: u.flag,
    ranking: u.ranking,
    tier: u.tier,
    course: u.course,
    intake: u.intake,
    tuitionFee: u.tuitionFee,
    currency: u.currency,
    minCgpa: u.minCgpa,
    minIelts: u.minIelts,
    gvkPartner: u.gvkPartner,
    highlight: u.highlight,
    city: u.city,
    tuition1Year: u.tuition1Year,
    tuition2Year: u.tuition2Year,
    tuitionRange1Year: u.tuitionRange1Year,
    tuitionRange2Year: u.tuitionRange2Year,
    placementAvailable: u.placementAvailable,
  })),

  // UNITED STATES
  {
    id: "us-mit",
    name: "Massachusetts Institute of Technology (MIT)",
    country: "United States",
    flag: "🇺🇸",
    ranking: 1,
    tier: "ambitious",
    course: "Master of Science in EECS",
    intake: "Fall 2026",
    tuitionFee: 59750,
    currency: "USD",
    minCgpa: "8.8 CGPA",
    minIelts: "7.5 (Min 7.0)",
    gvkPartner: false,
    highlight: "World #1 Engineering Institution • World-leading AI research",
    city: "Cambridge, MA",
    tuition1Year: "$59,750 / year",
    tuition2Year: "$119,500 total (2-Yr MS)",
    placementAvailable: true,
  },
  {
    id: "us-sta",
    name: "Stanford University",
    country: "United States",
    flag: "🇺🇸",
    ranking: 3,
    tier: "ambitious",
    course: "MS Computer Science",
    intake: "Fall 2026",
    tuitionFee: 61200,
    currency: "USD",
    minCgpa: "8.5 CGPA",
    minIelts: "7.5 (Min 7.0)",
    gvkPartner: false,
    highlight: "Heart of Silicon Valley • Unmatched startup and VC incubator network",
    city: "Stanford, CA",
    tuition1Year: "$61,200 / year",
    tuition2Year: "$122,400 total (2-Yr MS)",
    placementAvailable: true,
  },
  {
    id: "us-nyu",
    name: "New York University (NYU)",
    country: "United States",
    flag: "🇺🇸",
    ranking: 38,
    tier: "target",
    course: "MS Computer Science (Courant Institute)",
    intake: "Fall 2026",
    tuitionFee: 56000,
    currency: "USD",
    minCgpa: "7.5 CGPA",
    minIelts: "7.0 (Min 6.5)",
    gvkPartner: true,
    highlight: "Manhattan tech corridor • Wall Street algorithmic trading recruiting",
    city: "New York, NY",
    tuition1Year: "$56,000 / year",
    tuition2Year: "$112,000 total (2-Yr MS)",
    placementAvailable: true,
  },
  {
    id: "us-neu",
    name: "Northeastern University",
    country: "United States",
    flag: "🇺🇸",
    ranking: 120,
    tier: "safe",
    course: "MS Computer Science",
    intake: "Fall 2026",
    tuitionFee: 52000,
    currency: "USD",
    minCgpa: "6.5 CGPA",
    minIelts: "6.5 (Min 6.0)",
    gvkPartner: true,
    highlight: "World #1 Co-op Industry Internship program • High STEM OPT conversion",
    city: "Boston, MA",
    tuition1Year: "$52,000 / year",
    tuition2Year: "$104,000 total (2-Yr Co-op)",
    placementAvailable: true,
  },

  // CANADA
  {
    id: "ca-tor",
    name: "University of Toronto",
    country: "Canada",
    flag: "🇨🇦",
    ranking: 21,
    tier: "ambitious",
    course: "MSc Applied Computing (MScAC)",
    intake: "Fall 2026",
    tuitionFee: 52000,
    currency: "CAD",
    minCgpa: "8.0 CGPA",
    minIelts: "7.0 (Min 6.5)",
    gvkPartner: true,
    highlight: "Vector Institute AI hub • 8-month paid industry internship included",
    city: "Toronto, ON",
    tuition1Year: "CAD 52,000 / 1-Yr",
    tuition2Year: "CAD 78,000 (16-Mo Co-op)",
    placementAvailable: true,
  },
  {
    id: "ca-wat",
    name: "University of Waterloo",
    country: "Canada",
    flag: "🇨🇦",
    ranking: 112,
    tier: "target",
    course: "MMath in Computer Science",
    intake: "Fall 2026",
    tuitionFee: 42000,
    currency: "CAD",
    minCgpa: "7.5 CGPA",
    minIelts: "7.0 (Min 6.5)",
    gvkPartner: true,
    highlight: "Canada's top tech talent pipeline to Silicon Valley and Toronto",
    city: "Waterloo, ON",
    tuition1Year: "CAD 42,000 / 1-Yr",
    tuition2Year: "CAD 68,000 (2-Yr Thesis)",
    placementAvailable: true,
  },

  // IRELAND
  {
    id: "ie-tcd",
    name: "Trinity College Dublin",
    country: "Ireland",
    flag: "🇮🇪",
    ranking: 81,
    tier: "target",
    course: "MSc Computer Science",
    intake: "Fall 2026",
    tuitionFee: 25800,
    currency: "EUR",
    minCgpa: "7.0 CGPA",
    minIelts: "6.5 (Min 6.0)",
    gvkPartner: true,
    highlight: "European Silicon Docks • 2-Year Post-Study Work Visa (Stamp 1G)",
    city: "Dublin",
    tuition1Year: "€25,800 / 1-Yr",
    tuition2Year: "€32,500 (Extended Route)",
    placementAvailable: true,
  },
  {
    id: "ie-ucd",
    name: "University College Dublin (UCD)",
    country: "Ireland",
    flag: "🇮🇪",
    ranking: 126,
    tier: "safe",
    course: "MSc Computer Science (Negotiated Learning)",
    intake: "Fall 2026",
    tuitionFee: 24500,
    currency: "EUR",
    minCgpa: "6.5 CGPA",
    minIelts: "6.5 (Min 6.0)",
    gvkPartner: true,
    highlight: "Direct recruitment pipeline to Google, Meta, and Microsoft EMEA Dublin HQs",
    city: "Dublin",
    tuition1Year: "€24,500 / 1-Yr",
    tuition2Year: "€31,000 (Extended Route)",
    placementAvailable: true,
  },
];

export default function StudentJourneyPage() {
  const { user } = useCurrentUser();
  const studentId = user?.role === "student" ? user.id : "usr-student-01";
  const student = dataStore.getStudentProfile(studentId);

  // Live state from dataStore
  const [journey, setJourney] = useState(() => dataStore.getStudentJourney(studentId));
  const [documents, setDocuments] = useState(() => dataStore.getStudentDocuments(studentId));
  const [applications, setApplications] = useState(() => dataStore.getStudentApplications(studentId));
  const [mockInterviews, setMockInterviews] = useState(() => dataStore.getStudentMockInterviews(studentId));
  const [loanCase, setLoanCase] = useState(() => dataStore.getStudentLoanCase(studentId));

  // Top Bar Filter and Selected Stage
  const [filter, setFilter] = useState<"all" | "in_progress" | "completed" | "waiting_student" | "locked">("all");

  // Real-time synchronization: when counselor completes or updates any stage or verifies docs,
  // this hook updates the student journey and UI state immediately across tabs/windows!
  useEffect(() => {
    setJourney(dataStore.getStudentJourney(studentId));
    setDocuments(dataStore.getStudentDocuments(studentId));
    setApplications(dataStore.getStudentApplications(studentId));
    setMockInterviews(dataStore.getStudentMockInterviews(studentId));
    setLoanCase(dataStore.getStudentLoanCase(studentId));

    const unsubscribe = dataStore.subscribe((event) => {
      const updatedJourney = dataStore.getStudentJourney(studentId);
      setJourney(updatedJourney);
      setDocuments(dataStore.getStudentDocuments(studentId));
      setApplications(dataStore.getStudentApplications(studentId));
      setMockInterviews(dataStore.getStudentMockInterviews(studentId));
      setLoanCase(dataStore.getStudentLoanCase(studentId));

      if (event.type === "JOURNEY_STAGE_COMPLETED") {
        setUploadSuccessToast(
          `✓ Milestone Update: Counselor verified Stage ${event.payload?.stageNumber} (${event.payload?.stage?.stageName}) as Completed!`
        );
        setTimeout(() => setUploadSuccessToast(null), 5000);
      } else if (event.type === "DOCUMENT_REVIEWED") {
        setUploadSuccessToast(
          `✓ Document Evaluated: Counselor reviewed "${event.payload?.document?.title}". Status: ${event.payload?.document?.verificationStatus?.toUpperCase()}`
        );
        setTimeout(() => setUploadSuccessToast(null), 5000);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [studentId]);

  const activeStage = journey.find((s) => s.status !== "completed");
  const currentActiveStageNumber = activeStage ? activeStage.stageNumber : journey.length + 1;

  // Stage 4 Shortlist Locking & Confirmation State
  const stage4Record = journey.find((s) => s.stageNumber === 4);
  const isStage4Completed = stage4Record?.status === "completed" || currentActiveStageNumber > 4;
  const isShortlistingActive = currentActiveStageNumber === 4 && stage4Record?.status !== "completed";
  const [confirmSubmitShortlistModal, setConfirmSubmitShortlistModal] = useState(false);

  const [selectedStageNumber, setSelectedStageNumber] = useState<number>(() => {
    // Default to current active stage in sequence
    return currentActiveStageNumber <= journey.length ? currentActiveStageNumber : 1;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const stageParam = params.get("stage");
      if (stageParam) {
        const num = parseInt(stageParam, 10);
        if (!isNaN(num) && num >= 1 && num <= journey.length) {
          setSelectedStageNumber(num);
        }
      }
    }
  }, [journey.length]);

  const scrollStagesBar = (direction: "left" | "right") => {
    if (stagesBarRef.current) {
      stagesBarRef.current.scrollBy({
        left: direction === "left" ? -280 : 280,
        behavior: "smooth",
      });
    }
  };

  // Country Selection for University Shortlisting (Stage 4)
  // Initializes with student's preferred country from profile (e.g. "United Kingdom")
  const [selectedCountry, setSelectedCountry] = useState<string>(
    student?.preferredCountry || "United Kingdom"
  );
  const [uniTierFilter, setUniTierFilter] = useState<"all" | "ambitious" | "target" | "safe">("all");
  const [uniSearchQuery, setUniSearchQuery] = useState("");

  // Inline Document Upload Modal State (for Stage 3)
  const [uploadDocModal, setUploadDocModal] = useState<any | null>(null);
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>("academic");
  const [uploadDocType, setUploadDocType] = useState("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadFileSize, setUploadFileSize] = useState<number>(1024 * 350);
  const [selectedLocalFile, setSelectedLocalFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccessToast, setUploadSuccessToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const finalDestination = applications.find((a) => a.isFinalDestination);

  const handleAcceptOfferFromJourney = (app: UniversityApplicationCardData) => {
    dataStore.acceptUniversityOffer(studentId, app.id, studentId);
    setApplications(dataStore.getStudentApplications(studentId));
    setJourney(dataStore.getStudentJourney(studentId));
    setUploadSuccessToast(`✓ ${app.universityName} confirmed as your Final Destination! Next steps locked to this university.`);
    setTimeout(() => setUploadSuccessToast(null), 4500);
  };

  // Reference for scrolling stages bar
  const stagesBarRef = useRef<HTMLDivElement>(null);
  const stageDetailsRef = useRef<HTMLDivElement>(null);

  const completedCount = journey.filter(
    (j) => j.status === "completed" && j.stageNumber < currentActiveStageNumber
  ).length;
  const progressPercent = Math.round((completedCount / journey.length) * 100);

  const selectedStage = journey.find((s) => s.stageNumber === selectedStageNumber) || journey[0];

  const filteredStages = journey.filter((stage) => {
    if (filter === "all") return true;
    if (filter === "completed")
      return stage.status === "completed" && stage.stageNumber < currentActiveStageNumber;
    if (filter === "in_progress") return stage.stageNumber === currentActiveStageNumber;
    if (filter === "waiting_student") return stage.status === "waiting_student";
    if (filter === "locked") return stage.stageNumber > currentActiveStageNumber;
    return true;
  });

  const handleSelectStage = (stageNum: number) => {
    setSelectedStageNumber(stageNum);
    stageDetailsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const handlePrevStage = () => {
    if (selectedStageNumber > 1) {
      handleSelectStage(selectedStageNumber - 1);
    }
  };

  const handleNextStage = () => {
    if (selectedStageNumber < journey.length) {
      handleSelectStage(selectedStageNumber + 1);
    }
  };

  // University Shortlist actions
  const handleToggleShortlist = (uni: UniversityCatalogItem) => {
    // Strict Sequential Guard: Can only shortlist if Stage 4 is unlocked!
    if (currentActiveStageNumber < 4) {
      setUploadSuccessToast("🔒 Stage 04 (University Shortlisting) is locked. Complete Stage 03 (Document Collection) first.");
      setTimeout(() => setUploadSuccessToast(null), 4000);
      return;
    }

    // Shortlist is locked once Stage 4 is completed or student submitted to counselor
    if (isStage4Completed) {
      setUploadSuccessToast("🔒 University shortlist has already been confirmed and submitted to your counselor. Changes are locked while applications are being lodged.");
      setTimeout(() => setUploadSuccessToast(null), 4000);
      return;
    }

    const isAlreadyShortlisted = applications.some(
      (a) => a.universityName.toLowerCase() === uni.name.toLowerCase()
    );

    if (isAlreadyShortlisted) {
      dataStore.removeShortlistedUniversity(studentId, uni.name);
      setUploadSuccessToast(`Removed ${uni.name} from your shortlist.`);
    } else {
      dataStore.shortlistUniversity(
        studentId,
        uni.name,
        uni.country,
        uni.course,
        uni.tuitionFee,
        uni.tier
      );
      setUploadSuccessToast(`Added ${uni.name} to your shortlisted applications!`);
    }

    setApplications(dataStore.getStudentApplications(studentId));
    setTimeout(() => setUploadSuccessToast(null), 3500);
  };

  const handleConfirmAndSubmitShortlist = () => {
    dataStore.confirmStudentShortlist(studentId);
    setJourney(dataStore.getStudentJourney(studentId));
    setApplications(dataStore.getStudentApplications(studentId));
    setConfirmSubmitShortlistModal(false);
    setSelectedStageNumber(5);
    setUploadSuccessToast(
      "✓ University shortlist confirmed & submitted! Your counselor will now lodge official applications in Stage 05."
    );
    setTimeout(() => setUploadSuccessToast(null), 5000);
  };

  // Document Upload Submit Action — uploads file bytes to server, then records in store
  const [isUploading, setIsUploading] = useState(false);

  const handleDocumentUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle) return;

    // Must have a file selected from local disk
    if (!selectedLocalFile) {
      setUploadSuccessToast("⚠ Please select a file from your device first.");
      return;
    }

    setIsUploading(true);

    try {
      // 1. Upload the actual file bytes to the server
      const formData = new FormData();
      formData.append("file", selectedLocalFile);

      const uploadRes = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.success) {
        throw new Error(uploadData.error || "Upload failed");
      }

      // 2. Record the document in the store with the real server URL
      dataStore.uploadDocument(
        studentId,
        uploadCategory,
        uploadDocType || uploadTitle,
        uploadTitle,
        uploadData.fileName,
        uploadData.fileSize,
        uploadData.fileUrl
      );

      setDocuments(dataStore.getStudentDocuments(studentId));
      setUploadSuccessToast(`✓ "${selectedLocalFile.name}" uploaded successfully. Counselor notified for verification.`);
      setUploadDocModal(null);
      setSelectedLocalFile(null);
      setUploadFileName("");
      setTimeout(() => setUploadSuccessToast(null), 5000);
    } catch (err: any) {
      setUploadSuccessToast(`⚠ Upload failed: ${err.message}. Please try again.`);
      setTimeout(() => setUploadSuccessToast(null), 5000);
    } finally {
      setIsUploading(false);
    }
  };

  // Filtered universities based on Country selection, Tier filter, and live Search Query
  const availableUniversities = masterUniversityCatalog.filter((u) => {
    const matchesCountry = u.country.toLowerCase() === selectedCountry.toLowerCase();
    const matchesTier = uniTierFilter === "all" || u.tier === uniTierFilter;
    const q = uniSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.course.toLowerCase().includes(q) ||
      (u.city && u.city.toLowerCase().includes(q));

    return matchesCountry && matchesTier && matchesSearch;
  });

  const uniqueCountries = Array.from(new Set(masterUniversityCatalog.map((u) => u.country)));

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Toast Notification */}
      {uploadSuccessToast && (
        <div className="fixed top-20 right-6 z-50 bg-gvk-navy text-white px-5 py-3 rounded-xl shadow-2xl border-2 border-emerald-400 flex items-center gap-3 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{uploadSuccessToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-lg bg-gvk-navy-50 text-gvk-navy">
                <Compass className="w-5 h-5 text-gvk-navy" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-gvk-navy tracking-tight">
                My Masters Abroad Journey
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gvk-text-secondary">
              25-Stage structured milestone roadmap for {student?.preferredCountry || "United Kingdom"} Masters Admissions ({student?.targetIntake || "Fall 2026"}).
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-3 px-4 rounded-xl border border-gvk-border self-start md:self-auto">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gvk-text-secondary block">
                Overall Progress
              </span>
              <span className="text-lg font-black text-gvk-navy font-mono">
                {completedCount} / {journey.length} Stages
              </span>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-gvk-navy border-t-indigo-600 flex items-center justify-center font-bold text-xs font-mono text-gvk-navy shadow-xs">
              {progressPercent}%
            </div>
          </div>
        </div>

        {/* TOP STAGES BAR: Counselor Interface Style (All Stages Navigable Across the Top) */}
        <div className="mt-6 pt-5 border-t border-gvk-border">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gvk-navy">
                Stage Navigator
              </span>
              <span className="text-[11px] text-gvk-text-muted hidden sm:inline">
                • Real-time sequential roadmap (Stage N must complete before Stage N+1 unlocks)
              </span>
            </div>

            {/* Quick jump to active milestone & filter pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {currentActiveStageNumber <= journey.length && (
                <button
                  type="button"
                  onClick={() => handleSelectStage(currentActiveStageNumber)}
                  className="px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors bg-indigo-50 text-indigo-900 border border-indigo-200 hover:bg-indigo-100 flex items-center gap-1.5 shadow-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping shrink-0" />
                  <span>Active: Stage {currentActiveStageNumber.toString().padStart(2, "0")}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                  filter === "all" ? "bg-gvk-navy text-white shadow-xs" : "bg-slate-100 text-gvk-text-secondary hover:bg-slate-200"
                }`}
              >
                All ({journey.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("in_progress")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                  filter === "in_progress" ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-100 text-gvk-text-secondary hover:bg-slate-200"
                }`}
              >
                Active (1)
              </button>
              <button
                type="button"
                onClick={() => setFilter("completed")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                  filter === "completed" ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 text-gvk-text-secondary hover:bg-slate-200"
                }`}
              >
                Done ({completedCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter("locked")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                  filter === "locked" ? "bg-slate-700 text-white shadow-xs" : "bg-slate-100 text-gvk-text-secondary hover:bg-slate-200"
                }`}
              >
                Locked ({journey.filter((j) => j.stageNumber > currentActiveStageNumber).length})
              </button>
            </div>
          </div>

          {/* Mobile Stage Selector Dropdown (Visible on < 640px) */}
          <div className="sm:hidden mb-3">
            <label className="block text-xs font-bold text-gvk-navy mb-1.5">
              Select Milestone to View / Action:
            </label>
            <div className="relative">
              <select
                value={selectedStageNumber}
                onChange={(e) => handleSelectStage(Number(e.target.value))}
                className="w-full h-11 px-3.5 pr-8 rounded-xl border border-gvk-border bg-white text-xs font-bold text-gvk-navy shadow-xs focus:ring-2 focus:ring-gvk-navy appearance-none"
              >
                {journey.map((stg) => {
                  const isDone =
                    stg.status === "completed" && stg.stageNumber < currentActiveStageNumber;
                  const isActive = stg.stageNumber === currentActiveStageNumber;
                  const prefix = isDone ? "✓ Completed: " : isActive ? "▶ Active: " : "🔒 Locked: ";
                  return (
                    <option key={stg.id} value={stg.stageNumber}>
                      {prefix}Stage {stg.stageNumber.toString().padStart(2, "0")} — {stg.stageName}
                    </option>
                  );
                })}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 font-bold text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Horizontal Stages Bar with scroll controls */}
          <div className="relative flex items-center">
            {/* Scroll left button */}
            <button
              type="button"
              onClick={() => scrollStagesBar("left")}
              className="hidden md:flex absolute -left-3 z-10 w-7 h-7 rounded-full bg-white border border-slate-300 shadow-md items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors"
              title="Scroll Stages Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div
              ref={stagesBarRef}
              className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none scroll-smooth w-full px-0.5"
            >
              {filteredStages.map((stg) => {
                const isSelected = stg.stageNumber === selectedStageNumber;
                const isDone =
                  stg.status === "completed" && stg.stageNumber < currentActiveStageNumber;
                const isActive = stg.stageNumber === currentActiveStageNumber;
                const isLocked = stg.stageNumber > currentActiveStageNumber;

                return (
                  <button
                    key={stg.id}
                    type="button"
                    onClick={() => handleSelectStage(stg.stageNumber)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer border ${
                      isSelected
                        ? "bg-gvk-navy text-white border-gvk-navy shadow-md ring-2 ring-gvk-navy/20 scale-[1.02]"
                        : isDone
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70"
                        : isActive
                        ? "bg-indigo-50 text-indigo-900 border-indigo-300 hover:bg-indigo-100 ring-1 ring-indigo-400"
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 opacity-80"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 ${
                        isSelected
                          ? "bg-white text-gvk-navy font-black"
                          : isDone
                          ? "bg-emerald-600 text-white"
                          : isActive
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-3 h-3" />
                      ) : isLocked ? (
                        <Lock className="w-2.5 h-2.5" />
                      ) : (
                        stg.stageNumber
                      )}
                    </span>
                    <span>{stg.stageName}</span>
                    {isActive && (
                      <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-black tracking-wider ${isSelected ? "bg-white/20 text-white" : "bg-indigo-200 text-indigo-900"}`}>
                        Active
                      </span>
                    )}
                    {isDone && (
                      <span className={`text-[10px] px-1 rounded font-bold ${isSelected ? "bg-white/20 text-white" : "text-emerald-700"}`}>
                        ✓
                      </span>
                    )}
                    {isLocked && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}>
                        Locked
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Scroll right button */}
            <button
              type="button"
              onClick={() => scrollStagesBar("right")}
              className="hidden md:flex absolute -right-3 z-10 w-7 h-7 rounded-full bg-white border border-slate-300 shadow-md items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors"
              title="Scroll Stages Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* SELECTED STAGE DETAILS & ACTIONABLE WORKSPACE */}
      <div ref={stageDetailsRef} className="space-y-6">
        {/* Stage Overview Banner */}
        <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gvk-border">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-gvk-navy-50 text-gvk-navy font-mono text-xs font-black border border-gvk-navy-200">
                  Stage {selectedStage.stageNumber.toString().padStart(2, "0")} of {journey.length}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-gvk-navy">
                  {selectedStage.stageName}
                </h2>
                {!selectedStage.isMandatory && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    Destination Specific
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gvk-text-secondary">
                {selectedStage.description}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <StatusBadge type="journey" status={selectedStage.status} />
              <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1 bg-slate-50">
                <button
                  type="button"
                  onClick={handlePrevStage}
                  disabled={selectedStageNumber <= 1}
                  className="p-1 rounded text-slate-600 hover:text-gvk-navy hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Previous Stage"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextStage}
                  disabled={selectedStageNumber >= journey.length}
                  className="p-1 rounded text-slate-600 hover:text-gvk-navy hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Next Stage"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Vitals row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
              <User className="w-4 h-4 text-gvk-navy shrink-0" />
              <div>
                <span className="text-gvk-text-muted text-[10px] block">Responsible Party</span>
                <strong className="text-gvk-navy capitalize">{selectedStage.responsibleParty}</strong>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-gvk-navy shrink-0" />
              <div>
                <span className="text-gvk-text-muted text-[10px] block">Milestone Target Deadline</span>
                <strong className="text-gvk-navy">{selectedStage.deadline || "Within Intake Window"}</strong>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-gvk-text-muted text-[10px] block">Milestone Status</span>
                <strong className={selectedStage.status === "completed" ? "text-emerald-700" : "text-gvk-navy"}>
                  {selectedStage.status === "completed" ? `Completed on ${selectedStage.completionDate}` : selectedStage.status.replace(/_/g, " ").toUpperCase()}
                </strong>
              </div>
            </div>
          </div>

          {/* Counselor Advice Box */}
          {selectedStage.counselorRemarks && (
            <div className="p-3.5 rounded-xl bg-gvk-navy-50/70 border border-gvk-navy-100 text-xs text-gvk-navy flex items-start gap-2.5">
              <Info className="w-4 h-4 text-gvk-navy shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-0.5">Assigned Counselor Advice (Priya Varma):</strong>
                <p className="leading-relaxed">{selectedStage.counselorRemarks}</p>
              </div>
            </div>
          )}
        </div>

        {/* STAGE-SPECIFIC WORKSPACES */}

        {/* 1. IF STAGE IS LOCKED: RENDER SEQUENTIAL NOTICE BANNER (PREVIEW MODE) */}
        {selectedStage.stageNumber > currentActiveStageNumber && (
          <div className="bg-white rounded-2xl border-2 border-amber-300/80 shadow-card p-6 sm:p-8 space-y-6 animate-fade-in text-xs">
            {/* Header with Lock Icon */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-amber-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center shrink-0 text-amber-800 shadow-xs">
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                      Sequential Stage Locked
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      Stage {selectedStage.stageNumber.toString().padStart(2, "0")} of {journey.length} (Preview Mode)
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-gvk-navy mt-1">
                    {selectedStage.stageName} is Currently Locked
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Stage requirements and preparation checklists are shown below for preview. Submission tools unlock when previous milestones are completed.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => handleSelectStage(currentActiveStageNumber)}
                size="lg"
                className="font-bold bg-gvk-navy hover:bg-gvk-navy-800 text-white shrink-0 self-start sm:self-auto text-xs shadow-md flex items-center gap-2"
              >
                <span>Go to Active Stage {currentActiveStageNumber.toString().padStart(2, "0")} ({journey.find((s) => s.stageNumber === currentActiveStageNumber)?.stageName})</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Strict Sequential Rule Explanation */}
            <div className="p-4 sm:p-5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Strict Sequential Progression Rule</span>
              </div>
              <p className="text-xs leading-relaxed text-amber-900/90">
                Under GVK overseas university admissions protocol, you can only perform activities for <strong>Stage {selectedStage.stageNumber.toString().padStart(2, "0")}: {selectedStage.stageName}</strong> after your counselor verifies and completes <strong>Stage {currentActiveStageNumber.toString().padStart(2, "0")}: {journey.find((s) => s.stageNumber === currentActiveStageNumber)?.stageName}</strong>. This ensures all prerequisites, documentation, and university eligibility standards are fully satisfied.
              </p>
            </div>

            {/* Prerequisite Milestone Roadmap */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-[11px] font-bold text-gvk-navy uppercase tracking-wider block">
                Prerequisite Milestone Roadmap
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Completed Prerequisite */}
                <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {completedCount > 0 ? `Stage${completedCount > 1 ? `s 01–${completedCount.toString().padStart(2, "0")}` : " 01"}` : "Onboarding"}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <strong className="text-xs font-bold text-gvk-navy block">
                    {completedCount > 0 ? `${completedCount} Milestone${completedCount > 1 ? "s" : ""} Cleared` : "Profile Registered"}
                  </strong>
                  <span className="text-[10px] text-emerald-700 font-semibold block">✓ Verified & Confirmed</span>
                </div>

                {/* Current Active Blocker */}
                <div className="p-3 rounded-xl bg-white border-2 border-gvk-navy shadow-xs space-y-1 ring-2 ring-gvk-navy/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-white bg-gvk-navy px-1.5 py-0.5 rounded">
                      Stage {currentActiveStageNumber.toString().padStart(2, "0")} • REQUIRED
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <strong className="text-xs font-bold text-gvk-navy block">
                    {journey.find((s) => s.stageNumber === currentActiveStageNumber)?.stageName}
                  </strong>
                  <span className="text-[10px] text-amber-700 font-bold block">
                    ⚡ In Progress — Action Required
                  </span>
                </div>

                {/* Locked Target Stage */}
                <div className="p-3 rounded-xl bg-slate-100/80 border border-slate-300 text-slate-400 space-y-1 opacity-80">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                      Stage {selectedStage.stageNumber.toString().padStart(2, "0")}
                    </span>
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                  <strong className="text-xs font-bold text-slate-600 block">{selectedStage.stageName}</strong>
                  <span className="text-[10px] text-slate-500 font-medium block">🔒 Locked (Awaiting Stage {currentActiveStageNumber.toString().padStart(2, "0")})</span>
                </div>
              </div>
            </div>

            {/* Counselor Note */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-gvk-navy shrink-0" />
                <span>Assigned Counselor: <strong className="text-gvk-navy">Priya Varma</strong> will review and advance your stage once pending tasks are submitted.</span>
              </span>
              <Link href="/student/counselor">
                <Button variant="outline" size="sm" className="font-bold text-xs shrink-0">
                  Contact Counselor
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* WORKSPACE FOR STAGE 03: DOCUMENT COLLECTION (Direct Upload & Vault Checklist) */}
        {selectedStageNumber === 3 && (
          <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-5 animate-fade-in text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gvk-border">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gvk-navy">Document Collection & Upload Vault</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    Upload & Review Active
                  </span>
                </div>
                <p className="text-gvk-text-secondary mt-0.5">
                  Upload your academic, financial, and personal credentials. Verified documents automatically advance your university applications.
                </p>
              </div>

              <Button
                type="button"
                onClick={() => {
                  setUploadDocModal(true);
                  setUploadCategory("masters_prep");
                  setUploadDocType("statement_of_purpose");
                  setUploadTitle("Statement of Purpose (UK Master's Format)");
                  setUploadFileName("");
                  setSelectedLocalFile(null);
                }}
                size="sm"
                className="font-bold flex items-center gap-2 shrink-0 bg-gvk-navy hover:bg-gvk-navy-dark text-white shadow-md"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New Document</span>
              </Button>
            </div>

            {/* Document Checklist Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gvk-border text-[10px] font-bold uppercase tracking-wider text-gvk-text-secondary">
                    <th className="py-3 px-4">Required Document Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Latest Version</th>
                    <th className="py-3 px-4">Verification Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gvk-border">
                  {documents.map((doc) => {
                    const isVerified = doc.verificationStatus === "verified";
                    const isResubmit = doc.verificationStatus === "resubmission_required" || doc.verificationStatus === "rejected";
                    const isUnderReview = doc.verificationStatus === "under_review";

                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-gvk-navy shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <strong className="text-gvk-navy block">{doc.title}</strong>
                              <span className="font-mono text-[10px] text-gvk-text-muted">
                                {doc.fileName || "No file uploaded yet"}
                              </span>
                              {doc.counselorComments && (
                                <p className="text-[11px] text-red-600 font-medium mt-1">
                                  Feedback: {doc.counselorComments}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 capitalize text-gvk-text-secondary">
                          {doc.category.replace(/_/g, " ")}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-gvk-navy font-bold">
                          v{doc.latestVersion}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge type="document" status={doc.verificationStatus} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {doc.fileName && (
                              <a
                                href={`/api/documents/download?id=${doc.id}&studentId=${studentId}`}
                                download
                                className="p-1.5 rounded-lg border border-gvk-border text-gvk-navy hover:bg-slate-100 transition-colors"
                                title="Download File"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <Button
                              type="button"
                              size="sm"
                              variant={isResubmit ? "default" : isVerified ? "outline" : "default"}
                              onClick={() => {
                                setUploadDocModal(doc);
                                setUploadCategory(doc.category);
                                setUploadDocType(doc.documentType);
                                setUploadTitle(doc.title);
                                setUploadFileName("");
                                setSelectedLocalFile(null);
                              }}
                              className="font-bold text-xs"
                            >
                              <Upload className="w-3 h-3 mr-1" />
                              <span>{isResubmit ? "Upload Fix" : isVerified ? "Upload Update" : "Upload"}</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* WORKSPACE FOR STAGE 04: UNIVERSITY SHORTLISTING (Country Filter & Live Shortlist Selection) - Unlocked ONLY when student reaches Stage 04 */}
        {selectedStageNumber === 4 && selectedStage.stageNumber <= currentActiveStageNumber && (
          <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-6 animate-fade-in text-xs">
            {/* Header and Country Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gvk-border">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gvk-navy">University Shortlisting & Selection</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Primary Destination: {student?.preferredCountry || "United Kingdom"}
                  </span>
                </div>
                <p className="text-gvk-text-secondary mt-0.5">
                  Select and shortlist top overseas universities for your Masters. Country is pre-selected based on your registration preferences.
                </p>
              </div>

              {/* Country Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
                {uniqueCountries.map((c) => {
                  const flag = c === "United Kingdom" ? "🇬🇧" : c === "United States" ? "🇺🇸" : c === "Canada" ? "🇨🇦" : "🇮🇪";
                  const isSelected = selectedCountry === c;

                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedCountry(c)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? "bg-gvk-navy text-white shadow-xs font-black"
                          : "text-gvk-text-secondary hover:text-gvk-navy hover:bg-slate-200"
                      }`}
                    >
                      <span>{flag}</span>
                      <span>{c}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Bar & Shortlist Controls */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Real-time search bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gvk-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={uniSearchQuery}
                    onChange={(e) => setUniSearchQuery(e.target.value)}
                    placeholder={`Search ${selectedCountry} universities by name, course, or city (e.g. Manchester, Oxford, London, Leeds, AI)...`}
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gvk-border bg-white text-xs font-medium text-gvk-navy placeholder:text-gvk-text-muted focus:outline-none focus:ring-2 focus:ring-gvk-navy/20 focus:border-gvk-navy transition-all shadow-xs"
                  />
                  {uniSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setUniSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Tier Filter Pills */}
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[11px] font-bold text-gvk-text-secondary mr-1 hidden sm:inline">Tier:</span>
                  {(["all", "ambitious", "target", "safe"] as const).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setUniTierFilter(tier)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold capitalize transition-colors ${
                        uniTierFilter === tier
                          ? "bg-gvk-navy text-white shadow-xs"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status & Counter Line */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gvk-navy">
                    Showing <span className="text-emerald-700 font-black">{availableUniversities.length}</span> universities in {selectedCountry}
                  </span>
                  {uniSearchQuery && (
                    <span className="text-gvk-text-secondary">
                      matching &ldquo;<strong>{uniSearchQuery}</strong>&rdquo;
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-gvk-text-secondary font-medium">
                  <span>Portfolio Status:</span>
                  <span className="font-bold text-emerald-700">
                    {applications.filter((a) => a.currentStatus.includes("offer")).length} Offers
                  </span>
                  <span>•</span>
                  <span className="font-bold text-indigo-700">
                    {applications.filter((a) => a.currentStatus === "shortlisted").length} Shortlisted
                  </span>
                </div>
              </div>
            </div>

            {/* STAGE 4 BANNER: LOCKED VS SUBMIT TO COUNSELOR */}
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
                        Submitted to Counselor
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1 leading-relaxed">
                      You have confirmed your final target universities. Your assigned counselor (Priya Varma) is now preparing and lodging official university applications in <strong>Stage 05 (Application Submission)</strong>. Shortlist modifications are locked.
                    </p>
                  </div>
                </div>
                <Link href="/student/counselor">
                  <Button variant="outline" size="sm" className="font-bold text-xs shrink-0 flex items-center gap-1.5 border-slate-300 bg-white hover:bg-slate-50">
                    <MessageSquare className="w-3.5 h-3.5 text-gvk-navy" />
                    <span>Request Shortlist Changes</span>
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
                      Confirm that these are the target universities you want to join. Once submitted, your shortlist locks and your counselor begins submitting official applications.
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

            {/* University Selection Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableUniversities.map((uni) => {
                const existingApp = applications.find(
                  (a) => a.universityName.toLowerCase() === uni.name.toLowerCase()
                );
                const isShortlisted = !!existingApp;
                const hasOffer = existingApp && existingApp.currentStatus.includes("offer");

                return (
                  <div
                    key={uni.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      hasOffer
                        ? "bg-emerald-50/40 border-emerald-300 shadow-sm"
                        : isShortlisted
                        ? "bg-indigo-50/40 border-indigo-300 shadow-sm"
                        : "bg-white border-gvk-border hover:border-slate-300 shadow-card hover:shadow-elevated"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <UniversityBadge name={uni.name} country={uni.country} size="md" showCountryFlag />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-gvk-navy leading-snug line-clamp-2" title={uni.name}>
                              {uni.name}
                            </h4>
                            <p className="text-[11px] text-gvk-text-secondary flex items-center gap-1.5 mt-0.5">
                              <span>📍 {uni.city || uni.country}</span>
                              <span>•</span>
                              <span className="font-mono text-[10px] text-gvk-text-muted">Rank #{uni.ranking}</span>
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                            uni.tier === "ambitious"
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : uni.tier === "target"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {uni.tier}
                        </span>
                      </div>

                      {/* Course & Program Route Structure (Zero Speculative Tuition Fees) */}
                      <div className="space-y-2 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 text-[11px]">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gvk-text-muted tracking-wider block">Course</span>
                          <p className="font-bold text-gvk-navy leading-tight mt-0.5">{uni.course}</p>
                        </div>

                        {/* Program Structure Specifications */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-600 block uppercase tracking-wide">
                                1-Yr Standard
                              </span>
                              <span className="text-[9px] font-bold text-slate-700 bg-slate-200 px-1 py-0.5 rounded">
                                12 Mo
                              </span>
                            </div>
                            <span className="text-xs font-bold text-gvk-navy block mt-0.5">
                              Standard Route
                            </span>
                            <span className="text-[9.5px] text-slate-500 block truncate">
                              Taught + Dissertation
                            </span>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-600 block uppercase tracking-wide">
                                2-Yr Route
                              </span>
                              <span className="text-[9px] font-bold text-slate-700 bg-slate-200 px-1 py-0.5 rounded">
                                {uni.placementAvailable ? "Placement" : "2-Yr"}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-gvk-navy block mt-0.5">
                              {uni.placementAvailable ? "Work Placement" : "Extended"}
                            </span>
                            <span className="text-[9.5px] text-slate-500 block truncate">
                              Industry Experience
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-gvk-text-secondary pt-1 border-t border-slate-200/60">
                          <span>Min Entry: <strong className="text-gvk-navy">{uni.minCgpa}</strong></span>
                          <span>IELTS: <strong className="text-gvk-navy">{uni.minIelts}</strong></span>
                        </div>
                      </div>

                      <p className="text-[11px] text-gvk-text-secondary italic line-clamp-2">
                        {uni.highlight}
                      </p>
                    </div>

                    <div className="pt-3.5 border-t border-slate-200 mt-4 flex items-center justify-between gap-2">
                      {hasOffer ? (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Offer in Hand</span>
                        </span>
                      ) : isShortlisted ? (
                        <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                          <span>{isStage4Completed ? "Confirmed Choice • Locked" : "Shortlisted"}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-gvk-text-muted">
                          {isStage4Completed ? "Not in Final Shortlist" : "Available for Shortlist"}
                        </span>
                      )}

                      {!hasOffer && !isStage4Completed && (
                        <Button
                          type="button"
                          size="sm"
                          variant={isShortlisted ? "outline" : "default"}
                          onClick={() => handleToggleShortlist(uni)}
                          className="font-bold text-xs"
                        >
                          {isShortlisted ? "Remove" : "+ Shortlist"}
                        </Button>
                      )}

                      {isStage4Completed && isShortlisted && (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-bold text-[11px] border border-slate-200 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>Submitted</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Empty state when no matches */}
              {availableUniversities.length === 0 && (
                <div className="col-span-full p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-gvk-navy">No universities found</h4>
                  <p className="text-xs text-gvk-text-secondary mt-1">
                    No universities matched your search &ldquo;{uniSearchQuery}&rdquo; in {selectedCountry}.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setUniSearchQuery("");
                      setUniTierFilter("all");
                    }}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-gvk-navy text-white text-xs font-bold hover:bg-gvk-navy-dark transition-all"
                  >
                    Reset Search & Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* WORKSPACE FOR STAGE 01: COUNSELING SESSION */}
        {selectedStageNumber === 1 && (
          <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-6 animate-fade-in text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gvk-border">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gvk-navy">Stage 01: In-Person Masters Counseling Session</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedStage.status === "completed"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-blue-50 text-blue-800 border border-blue-200"
                  }`}>
                    {selectedStage.status === "completed" ? "✓ Session Completed" : "⚡ Offline Milestone"}
                  </span>
                </div>
                <p className="text-gvk-text-secondary mt-1">
                  1-on-1 offline consultation at GVK Overseas Education Center with Senior Counselor Priya Varma.
                </p>
              </div>

              <Link href="/student/counselor">
                <Button size="sm" variant="outlineNavy" className="font-bold text-xs shrink-0 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Open Counselor Channel</span>
                </Button>
              </Link>
            </div>

            {selectedStage.status !== "completed" ? (
              <div className="space-y-5">
                {/* In-Person Offline Counseling Session Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <Building className="w-3 h-3 text-emerald-700" />
                        Offline Session • GVK Overseas Education Center
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">In-Person Consultation</span>
                    </div>
                    <h4 className="text-sm font-bold text-gvk-navy">
                      Offline Masters Counseling & Profile Onboarding
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                      This comprehensive initial counseling consultation is conducted in-person at the GVK Overseas Education Center with your assigned counselor. Your counselor evaluates your academic background, degree aspirations, and study abroad destinations offline, and will mark this milestone as completed upon session conclusion.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                      <span>Location: <strong>GVK Hyderabad Overseas Center</strong></span>
                      <span>•</span>
                      <span>Mode: <strong>In-Person / Offline</strong></span>
                      <span>•</span>
                      <span>Status: <strong>Awaiting Counselor Sign-off</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Counselor Signed Offline</span>
                    </span>
                  </div>
                </div>

                {/* 4 Agenda Topics for the Session */}
                <div>
                  <h4 className="text-xs font-bold text-gvk-navy uppercase tracking-wider mb-3">
                    Counseling Session Discussion Agenda
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide block">Topic 1</span>
                      <strong className="text-xs font-bold text-gvk-navy block">Destination Mapping</strong>
                      <p className="text-[11px] text-slate-500">United Kingdom Russell Group, Ireland, or Canadian Universities.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide block">Topic 2</span>
                      <strong className="text-xs font-bold text-gvk-navy block">Intake & Degree</strong>
                      <p className="text-[11px] text-slate-500">Fall 2026 Intake targeting MSc Computer Science & AI specializations.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide block">Topic 3</span>
                      <strong className="text-xs font-bold text-gvk-navy block">Academic Profile</strong>
                      <p className="text-[11px] text-slate-500">Undergrad 8.45 CGPA and IELTS 7.5 benchmark eligibility evaluation.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide block">Topic 4</span>
                      <strong className="text-xs font-bold text-gvk-navy block">25-Stage Roadmap</strong>
                      <p className="text-[11px] text-slate-500">Complete timeline walkthrough from shortlisting to UK campus enrollment, GP, NI and part-time jobs.</p>
                    </div>
                  </div>
                </div>

                {/* Counselor Next Step Notice */}
                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">
                    <strong>Offline Milestone Protocol:</strong> The initial counseling session is held in-person at the GVK Center. Students do not need to submit or attend online—your counselor will verify your in-person session and mark this stage as completed on their Counselor Desk.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>In-Person Counseling Session Successfully Completed on {selectedStage.completionDate}</span>
                  </div>
                  <p className="leading-relaxed text-xs text-emerald-950/90">
                    Candidate completed 1-on-1 counseling in-person at GVK Overseas Education Center with Senior Advisor Priya Varma. Destination established as United Kingdom for Masters in Advanced Computer Science (Fall 2026 intake).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <strong className="text-gvk-navy font-bold block">Advisory Summary:</strong>
                  <p className="leading-relaxed text-gvk-text-secondary">
                    Candidate possesses a strong undergraduate degree with 8.45 CGPA and 7.5 IELTS. Focus application strategy on top Russell Group UK universities with specialized research in Distributed Systems and Cloud Architecture.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* WORKSPACE FOR STAGE 02: PROFILE EVALUATION */}
        {selectedStageNumber === 2 && (
          <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-4 animate-fade-in text-xs">
            <h3 className="text-base font-bold text-gvk-navy">Official Academic & Eligibility Evaluation</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-gvk-text-secondary block">Undergrad CGPA</span>
                <strong className="text-lg font-black text-gvk-navy font-mono">{student?.ugCgpa || "8.45"} / 10</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-gvk-text-secondary block">English Proficiency</span>
                <strong className="text-lg font-black text-emerald-700 font-mono">{student?.englishScore || "7.5"} Band</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-gvk-text-secondary block">Undergraduate Institute</span>
                <strong className="text-xs font-bold text-gvk-navy block truncate">{student?.ugCollege || "BITS Pilani"}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-emerald-800 block font-bold">Eligibility Outcome</span>
                <strong className="text-xs font-bold text-emerald-700 block">Tier 1 Russell Group Cleared</strong>
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE FOR STAGE 05: APPLICATION SUBMISSION */}
        {selectedStageNumber === 5 && (
          <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-5 animate-fade-in text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gvk-border">
              <div>
                <h3 className="text-base font-bold text-gvk-navy">Official University Application Portals</h3>
                <p className="text-gvk-text-secondary mt-0.5">
                  Direct submission across UCAS and university postgraduate portals managed by your assigned counselor.
                </p>
              </div>
              <Link href="/student/universities">
                <Button size="sm" className="font-bold">
                  View Full Application Details →
                </Button>
              </Link>
            </div>

            {/* Counselor Execution Advisory Card */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-300 text-blue-800 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <strong className="text-sm font-bold text-gvk-navy">
                    Official Application Submission is Handled by Your Counselor
                  </strong>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-200 text-blue-900 uppercase">
                    Counselor Desk
                  </span>
                </div>
                <p className="text-xs text-blue-950 leading-relaxed">
                  Application Submission means submitting your verified academic transcripts, recommendation letters, and Statement of Purpose directly into university postgraduate portals and UCAS. This is executed on your behalf by your assigned counselor, <strong>Priya Varma</strong>. Track official portal submission references, counselor remarks, and evaluation status below.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applications.map((app) => (
                <div key={app.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UniversityBadge name={app.universityName} country={app.country} size="xs" showCountryFlag />
                      <strong className="text-sm font-bold text-gvk-navy truncate">{app.universityName}</strong>
                    </div>
                    <StatusBadge type="application" status={app.currentStatus} />
                  </div>
                  <p className="text-gvk-text-secondary">Course: <strong>{app.courseName}</strong> • Intake: <strong>{app.intake}</strong></p>
                  <p className="text-[11px] text-gvk-text-muted">Application Ref: <strong className="font-mono text-gvk-navy">{app.appRefNumber || "GVK-APP-SUBMITTED"}</strong></p>
                  {app.counselorRemarks && (
                    <p className="text-[11px] text-emerald-800 bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                      Counselor Update: {app.counselorRemarks}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WORKSPACE FOR STAGE 06: CONDITIONAL OFFER */}
        {selectedStageNumber === 6 && (
          <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-5 animate-fade-in text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gvk-border">
              <div>
                <h3 className="text-base font-bold text-gvk-navy">Official Admission Offers & Destination Selection</h3>
                <p className="text-gvk-text-secondary mt-0.5">
                  Review received admission offers. You must accept one primary university destination to proceed with Tuition Deposit, CAS, and Visa.
                </p>
              </div>
              <Link href="/student/universities">
                <Button size="sm" variant="outline" className="font-bold">
                  Compare All Applications →
                </Button>
              </Link>
            </div>

            {/* Final Destination Banner if chosen */}
            {finalDestination ? (
              <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <strong className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                    <span>Confirmed Destination: {finalDestination.universityName}</span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-black uppercase">
                      Firm Choice Locked
                    </span>
                  </strong>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    {finalDestination.courseName} • All next stages (Stage 7 Tuition Deposit, Stage 10 CAS, Stage 11 Visa) will proceed for this university.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
                  <div>
                    <strong className="text-xs sm:text-sm font-bold block">
                      Decision Required: Accept One University Offer
                    </strong>
                    <p className="text-[11px] text-amber-900 mt-0.5">
                      You cannot continue downstream processes with multiple universities. Accept your preferred university offer below to unlock your Tuition Deposit and CAS.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {applications.filter((a) => a.currentStatus.includes("offer")).map((app) => {
                const isFinal = app.isFinalDestination;
                return (
                  <div
                    key={app.id}
                    className={`p-4 rounded-xl border transition-all space-y-2 ${
                      isFinal
                        ? "border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <UniversityBadge name={app.universityName} country={app.country} size="sm" showCountryFlag />
                        <strong className="text-sm sm:text-base font-bold text-gvk-navy">{app.universityName}</strong>
                        <StatusBadge type="application" status={app.currentStatus} />
                        {isFinal && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Confirmed Choice
                          </span>
                        )}
                      </div>

                      <div className="shrink-0 self-end sm:self-center">
                        {!isFinal ? (
                          <Button
                            onClick={() => handleAcceptOfferFromJourney(app)}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{finalDestination ? "Switch Final Choice to this" : "Accept Offer & Commit"}</span>
                          </Button>
                        ) : (
                          <span className="text-xs font-black text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Destination Confirmed</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gvk-text-secondary">Course: <strong>{app.courseName}</strong> • Intake: <strong>{app.intake}</strong> • Offer Status: <strong className="text-emerald-700">Official Admissions Offer Issued</strong></p>
                    <p className="text-emerald-900 font-medium bg-white/70 p-2 rounded-lg border border-emerald-100">
                      Conditions: {app.offerConditions || "Complete final semester with min 65% aggregate."}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* WORKSPACE FOR STAGE 07: GVK MOCK ADMISSIONS INTERVIEW (CONDUCTED BY OUR TEAM) */}
        {selectedStageNumber === 7 && (
          <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-5 animate-fade-in text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gvk-border">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gvk-navy">Stage 07: Mock Admissions Interview (GVK Readiness Assessment)</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    Conducted by GVK Team
                  </span>
                </div>
                <p className="text-gvk-text-secondary mt-0.5">
                  Internal readiness evaluations conducted by your assigned counselor Priya Varma before your official university interview.
                </p>
              </div>
              <Link href="/student/interview?tab=mock">
                <Button size="sm" className="font-bold flex items-center gap-1.5 shadow-xs">
                  <Video className="w-4 h-4" />
                  <span>Open Mock Interview Desk →</span>
                </Button>
              </Link>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 space-y-2">
              <strong className="text-gvk-navy block font-bold text-sm">Mandatory Sequence: Mock Interview Before University Interview</strong>
              <p className="text-blue-900 leading-relaxed">
                Under GVK admissions protocol, you must complete and pass this internal mock interview with your assigned counselor <strong>before</strong> attending your official university admissions interview (Stage 08). This ensures complete mastery of your SOP articulation, course modules, and visa credibility.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <strong className="text-gvk-navy block font-bold">Scheduled Mock Session Details</strong>
                <p className="text-gvk-text-secondary">
                  Live video evaluation with Counselor Priya Varma. Review feedback, practice questions, and Zoom credentials.
                </p>
                <Link href="/student/interview?tab=mock">
                  <Button size="sm" variant="outline" className="font-bold">
                    View Zoom Link & Guidelines
                  </Button>
                </Link>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <strong className="text-gvk-navy block font-bold">5 Core Mock Evaluation Pillars</strong>
                <p className="text-gvk-text-secondary">
                  Assessment covers Academic Articulation, Course Modules, Why This University, Career Progression, and Visa Credibility.
                </p>
                <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                  ✓ GVK Certified Readiness Standard
                </span>
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE FOR STAGE 08: OFFICIAL UNIVERSITY INTERVIEW (CONDUCTED BY UNIVERSITY) */}
        {selectedStageNumber === 8 && (
          <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-5 animate-fade-in text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gvk-border">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gvk-navy">Stage 08: University Admissions Interview</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    Conducted by University
                  </span>
                </div>
                <p className="text-gvk-text-secondary mt-0.5">
                  Official admissions and credibility interview conducted directly by the university departmental faculty and admissions committee.
                </p>
              </div>
              <Link href="/student/interview?tab=university">
                <Button size="sm" className="font-bold flex items-center gap-1.5 shadow-xs">
                  <Building className="w-4 h-4" />
                  <span>Open University Interview Desk →</span>
                </Button>
              </Link>
            </div>

            {finalDestination && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                <div>
                  <strong className="block text-xs font-bold text-gvk-navy">
                    Official Interview Institution: {finalDestination.universityName} ({finalDestination.courseName})
                  </strong>
                  <span className="text-[11px] text-slate-600">
                    Faculty Admissions Panel • Pre-CAS Credibility Assessment
                  </span>
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-2">
              <strong className="text-amber-950 block font-bold">Prerequisite Clearance: Stage 07 Required</strong>
              <p className="text-amber-900 leading-relaxed">
                Attendance at the official university interview requires prior clearance of Stage 07 (GVK Mock Interview). Your counselor will unlock the university invitation link and specific departmental questions once mock evaluation is cleared.
              </p>
            </div>
          </div>
        )}

        {/* WORKSPACE FOR STAGE 09: UNIVERSITY DEPOSIT PAYMENT */}
        {selectedStageNumber === 9 && (
          <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-5 animate-fade-in text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gvk-border">
              <div>
                <h3 className="text-base font-bold text-gvk-navy">Stage 09: University Seat Acceptance Deposit</h3>
                <p className="text-gvk-text-secondary mt-0.5">
                  Remit required seat acceptance deposit to secure your university admission and trigger official CAS issuance.
                </p>
              </div>
            </div>

            {finalDestination ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                <div>
                  <strong className="block text-xs font-bold text-emerald-950">
                    Target Institution: {finalDestination.universityName} ({finalDestination.courseName})
                  </strong>
                  <span className="text-[11px] text-emerald-800">
                    Seat Deposit required: <strong>{finalDestination.tuitionFeeCurrency} {finalDestination.depositAmount?.toLocaleString() || "2,000"}</strong> • Deadline: <strong>{finalDestination.depositDeadline || "15 Dec 2026"}</strong>
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
                <div>
                  <strong className="block text-xs font-bold text-amber-950">
                    University Destination Selection Pending:
                  </strong>
                  <span className="text-[11px] text-amber-900">
                    Please accept one university offer in Stage 6 or Applications tab to lock in your official CAS and seat deposit process.
                  </span>
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <strong className="text-gvk-navy block font-bold">Financing & Loan Disbursement Desk</strong>
              <p className="text-gvk-text-secondary">
                Track sanctioned educational loan disbursements or self-funded international wire remittance status.
              </p>
              <Link href="/student/loan">
                <Button size="sm" variant="outline" className="font-bold">
                  View Loan Financing Status →
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* WORKSPACE FOR STAGE 10: TB TEST (UKVI CLINIC VERIFICATION) */}
        {selectedStageNumber === 10 && (
          <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-4 animate-fade-in text-xs">
            <h3 className="text-base font-bold text-gvk-navy">Stage 10: UKVI Tuberculosis (TB) Medical Clearance</h3>
            <p className="text-gvk-text-secondary">
              Students traveling from India to the UK for programs longer than 6 months must obtain a TB clearance certificate from an approved UKVI medical clinic.
            </p>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
              <strong className="font-bold block">Approved UKVI Clinic Partners:</strong>
              <p>Apollo Hospitals, Max Healthcare, and Fortis Healthcare centres across major metropolitan cities.</p>
            </div>
            <Link href="/student/documents">
              <Button size="sm" className="font-bold">
                Upload TB Certificate to Document Vault
              </Button>
            </Link>
          </div>
        )}

        {/* WORKSPACE FOR STAGE 12: CAS ISSUANCE */}
        {selectedStageNumber === 12 && (
          <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-4 animate-fade-in text-xs">
            <h3 className="text-base font-bold text-gvk-navy">Stage 12: Confirmation of Acceptance for Studies (CAS)</h3>
            <p className="text-gvk-text-secondary">
              The university issues your electronic CAS reference number after verification of your unconditional offer and tuition deposit.
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-gvk-text-muted block">CAS Number Status</span>
              <strong className="text-base font-mono text-gvk-navy">CAS Draft Under University Review</strong>
            </div>
          </div>
        )}

        {/* WORKSPACE FOR STAGE 13: VISA APPLICATION */}
        {selectedStageNumber === 13 && (
          <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-4 animate-fade-in text-xs">
            <h3 className="text-base font-bold text-gvk-navy">Stage 13: UK Student Visa (Tier 4 Route) Preparation</h3>
            <p className="text-gvk-text-secondary">
              Complete your online UKVI application, book your biometric appointment at the VFS Global center, and review maintenance fund requirements.
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <strong className="text-gvk-navy font-bold block">28-Day Maintenance Fund Rule:</strong>
              <p className="text-gvk-text-secondary leading-relaxed">
                Ensure tuition balance plus 9 months of UK living expenses (£1,023/month outer London or £1,334/month inner London) has matured for 28 consecutive days before submission.
              </p>
            </div>
          </div>
        )}

        {/* WORKSPACE FOR STAGES 14-22 (General Actionable Guidance Card) */}
        {selectedStageNumber >= 14 && selectedStageNumber <= 22 && (
          <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-4 animate-fade-in text-xs">
            <h3 className="text-base font-bold text-gvk-navy">{selectedStage.stageName} Action Guidelines</h3>
            <p className="text-gvk-text-secondary leading-relaxed">
              {selectedStage.description}
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <strong className="text-gvk-navy font-bold block">Next Milestone Instructions:</strong>
              <p className="text-gvk-text-secondary">
                Your assigned counselor Priya Varma will guide you through this milestone as your visa and admission progress advances. Check your notifications and counselor support desk for live alerts.
              </p>
            </div>
            <Link href="/student/counselor">
              <Button size="sm" className="font-bold">
                Message Counselor About This Stage
              </Button>
            </Link>
          </div>
        )}

        {/* WORKSPACE FOR STAGE 23: GP REGISTRATION */}
        {selectedStageNumber === 23 && (
          <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-5 animate-fade-in text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gvk-border">
              <div>
                <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                  Stage 23 • Post-Landing Healthcare
                </span>
                <h3 className="text-base font-black text-gvk-navy mt-1">
                  GP Registration (National Health Service - NHS)
                </h3>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 self-start sm:self-auto">
                Mandatory UK Health Registration
              </span>
            </div>

            <p className="text-gvk-text-secondary leading-relaxed">
              As an international student who has paid the Immigration Health Surcharge (IHS), you are entitled to full National Health Service (NHS) medical coverage. You must register with a local General Practice (GP) surgery near your campus or student accommodation.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-gvk-navy text-white text-[11px] font-bold flex items-center justify-center font-mono">1</span>
                <strong className="text-gvk-navy font-bold block">Locate Nearby GP</strong>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Search NHS directory using your UK accommodation postcode or register at your university health centre.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-gvk-navy text-white text-[11px] font-bold flex items-center justify-center font-mono">2</span>
                <strong className="text-gvk-navy font-bold block">Required Documents</strong>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Passport, UKVI digital share code / BRP, university enrollment letter, and tenancy contract proof of address.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-gvk-navy text-white text-[11px] font-bold flex items-center justify-center font-mono">3</span>
                <strong className="text-gvk-navy font-bold block">Receive NHS Number</strong>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Your unique 10-digit NHS Number will be dispatched to your UK address within 5 to 10 working days.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="https://www.nhs.uk/service-search/find-a-gp"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gvk-navy text-white hover:bg-gvk-navy-dark rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <span>Find Local GP on NHS.uk</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <Link href="/student/counselor">
                <Button variant="outline" size="sm" className="font-bold text-xs">
                  Ask Counselor for GP Guidance
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* WORKSPACE FOR STAGE 24: NI REGISTRATION */}
        {selectedStageNumber === 24 && (
          <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-5 animate-fade-in text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gvk-border">
              <div>
                <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-blue-50 text-blue-800 border border-blue-200 uppercase">
                  Stage 24 • Employment Authorization
                </span>
                <h3 className="text-base font-black text-gvk-navy mt-1">
                  National Insurance (NI) Number Registration
                </h3>
              </div>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 self-start sm:self-auto">
                Official UK Tax & Pension ID
              </span>
            </div>

            <p className="text-gvk-text-secondary leading-relaxed">
              Your National Insurance (NI) number is your personal reference number for the UK social security and taxation system. It is legally required before or as soon as you start any part-time employment in the United Kingdom.
            </p>

            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-3">
              <strong className="text-gvk-navy font-bold block text-sm">
                Official GOV.UK Online Application Checklist:
              </strong>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Valid Biometric Passport</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>UK Student Visa BRP or Digital Share Code</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>UK Postal Address & Mobile Number</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Online Identity Verification (Gov.uk Verify)</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="https://www.gov.uk/apply-national-insurance-number"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gvk-navy text-white hover:bg-gvk-navy-dark rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <span>Apply Online on GOV.UK</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <Link href="/student/counselor">
                <Button variant="outline" size="sm" className="font-bold text-xs">
                  Request NI Verification Help
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* WORKSPACE FOR STAGE 25: PART TIME JOB SUPPORT */}
        {selectedStageNumber === 25 && (
          <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-5 animate-fade-in text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gvk-border">
              <div>
                <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-purple-50 text-purple-800 border border-purple-200 uppercase">
                  Stage 25 • GVK Career Desk
                </span>
                <h3 className="text-base font-black text-gvk-navy mt-1">
                  Part-Time Job Support & Career Placement Desk
                </h3>
              </div>
              <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-lg border border-purple-200 self-start sm:self-auto">
                Post-Landing Assistance
              </span>
            </div>

            <p className="text-gvk-text-secondary leading-relaxed">
              GVK Edutech provides comprehensive on-ground post-landing support to help you secure legal part-time employment in your university city, balancing academics with earning potential.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <strong className="text-gvk-navy font-bold block text-sm">20 Hours / Week Limit</strong>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Strict UKVI student visa rule: International students can work up to 20 hours per week during term-time, and full-time during official vacation breaks.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <strong className="text-gvk-navy font-bold block text-sm">National Minimum Wage</strong>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  UK statutory rate is £11.44/hour (age 21+) or £8.60/hour (age 18-20). Typical earnings range from £800 to £1,200 per month.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <strong className="text-gvk-navy font-bold block text-sm">GVK Partner Job Roles</strong>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  On-campus student union roles, library stewards, retail associates, coffee shops, warehousing logistics, and academic tutor jobs.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5">
              <strong className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>GVK UK-Format CV Review Included</span>
              </strong>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Connect with counselor Priya Varma to have your CV adapted to British 2-page standards, free of photograph, marital status, or nationality bias, optimized for UK ATS applicant tracking systems.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/student/counselor">
                <Button size="sm" className="font-bold bg-gvk-navy hover:bg-gvk-navy-dark text-white">
                  Connect with Career Placement Desk
                </Button>
              </Link>
              <Link href="/student/tasks">
                <Button variant="outline" size="sm" className="font-bold text-xs">
                  View Career Preparation Tasks
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* INLINE DOCUMENT UPLOAD MODAL */}
      {uploadDocModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gvk-border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gvk-border">
              <h3 className="text-base font-bold text-gvk-navy flex items-center gap-2">
                <Upload className="w-4 h-4 text-gvk-navy" />
                <span>Upload Document to Journey</span>
              </h3>
              <button
                type="button"
                onClick={() => setUploadDocModal(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDocumentUploadSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">
                  Document Title
                </label>
                <Input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Statement of Purpose (Warwick & Manchester)"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">
                  Document Category
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as DocumentCategory)}
                  className="w-full h-10 px-3 rounded-lg border border-gvk-border bg-white font-medium"
                >
                  <option value="academic">Academic (Transcripts, Degree Certificates)</option>
                  <option value="masters_prep">Master's Prep (SOP, LOR, Resume)</option>
                  <option value="financial">Financial (Bank Statement, Loan Sanction)</option>
                  <option value="visa">Visa Documents (TB Test, Passport)</option>
                  <option value="personal">Personal Identification & Passport</option>
                  <option value="english_proficiency">English Proficiency (IELTS, TOEFL, PTE)</option>
                </select>
              </div>

              {/* CURRENT FILE ON RECORD BANNER (IF RESUBMITTING/UPDATING) */}
              {uploadDocModal && typeof uploadDocModal === "object" && uploadDocModal.fileName && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">
                        Current Document on File:
                      </span>
                      <span className="font-mono text-xs text-slate-800 font-semibold truncate block">
                        {uploadDocModal.fileName}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full shrink-0">
                    {uploadDocModal.verificationStatus === "resubmission_required" ? "Fix / Replace Required" : "Update Version"}
                  </span>
                </div>
              )}

              {/* LOCAL FILE SELECTOR & DRAG-AND-DROP ZONE */}
              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">
                  Select File from Local Device (.pdf, .docx, .jpg, .png)
                </label>

                {/* Hidden native file input triggered on click */}
                <input
                  type="file"
                  ref={fileInputRef}
                  id="journeyLocalFileInput"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedLocalFile(file);
                      setUploadFileName(file.name);
                      setUploadFileSize(file.size);
                    }
                  }}
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      setSelectedLocalFile(file);
                      setUploadFileName(file.name);
                      setUploadFileSize(file.size);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-gvk-navy bg-indigo-50/50 scale-[1.01]"
                      : selectedLocalFile
                      ? "border-emerald-400 bg-emerald-50/40"
                      : "border-gvk-border hover:border-gvk-navy bg-slate-50 hover:bg-slate-100/70"
                  }`}
                >
                  {selectedLocalFile ? (
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gvk-navy text-xs break-all">
                          {selectedLocalFile.name}
                        </p>
                        <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                          ✓ File selected from local device • {(selectedLocalFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-gvk-navy underline hover:text-blue-700 mt-1 inline-block">
                        Click to choose a different local file
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-gvk-navy-50 text-gvk-navy flex items-center justify-center mx-auto shadow-xs">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gvk-navy text-xs">
                          Click to select a document from your computer
                        </p>
                        <p className="text-[11px] text-gvk-text-secondary mt-0.5">
                          or drag & drop your PDF, DOCX, JPG or PNG here
                        </p>
                      </div>
                      <span className="inline-block px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-gvk-navy shadow-xs hover:bg-slate-50">
                        📁 Browse Local Files
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-gvk-text-secondary text-[11px] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Encrypted local upload. Once submitted, this document is immediately delivered to Counselor Priya Varma for official verification.
                </span>
              </div>

              <div className="pt-3 border-t border-gvk-border flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadDocModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!selectedLocalFile || isUploading}
                  className="font-bold bg-gvk-navy hover:bg-gvk-navy-dark text-white disabled:opacity-50"
                >
                  {isUploading ? "Uploading..." : "Confirm & Upload"}
                </Button>
              </div>
            </form>
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
