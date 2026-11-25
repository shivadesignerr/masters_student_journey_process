"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { dataStore } from "@/lib/data/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UniversityBadge } from "@/components/shared/UniversityLogo";
import { UniversityCombobox } from "@/components/shared/UniversityCombobox";
import { ALL_GLOBAL_UNIVERSITIES } from "@/lib/data/universities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApplicationStatus, JourneyStageStatus, MockInterviewOutcome, TaskPriority } from "@/types/database.types";
import {
  User,
  GraduationCap,
  FolderLock,
  Compass,
  CheckSquare,
  Video,
  Banknote,
  MessageSquare,
  History,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  X,
  AlertTriangle,
  Upload,
  Send,
  Plus,
  Clock,
  ExternalLink,
  Lock,
  Building,
  Download,
  FileText,
  Trash2,
  Edit3,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  XCircle,
  CalendarX,
  Calendar,
  ArrowRight,
  Search,
} from "lucide-react";

const loanStagesList = [
  { id: "bank_selected", step: 1, label: "Bank Selected", phase: "Onboarding", desc: "Lender partner shortlisted" },
  { id: "info_submitted", step: 2, label: "Info Submitted", phase: "Onboarding", desc: "Candidate KYC & co-borrower data" },
  { id: "bank_login", step: 3, label: "File Login", phase: "Underwriting", desc: "File logged with branch" },
  { id: "credit_call", step: 4, label: "Credit Call", phase: "Underwriting", desc: "Telephonic verification call" },
  { id: "doc_verification", step: 5, label: "Doc Verification", phase: "Verification", desc: "ITR & property audit" },
  { id: "physical_verification", step: 6, label: "Physical Check", phase: "Verification", desc: "Residence & property inspect" },
  { id: "approved", step: 7, label: "Sanction Approved", phase: "Sanction", desc: "Credit committee sanction pass" },
  { id: "sanction_letter", step: 8, label: "Sanction Letter", phase: "Sanction", desc: "Formal letter issued" },
  { id: "disbursement_pending", step: 9, label: "Disbursal Pending", phase: "Disbursal", desc: "Fee invoice audit" },
  { id: "disbursed", step: 10, label: "Tuition Disbursed", phase: "Disbursal", desc: "Remittance to university" },
];

const tabList = [
  { id: "overview", label: "1. Overview", icon: User },
  { id: "personal", label: "2. Personal Details", icon: User },
  { id: "academic", label: "3. Academic Details", icon: GraduationCap },
  { id: "applications", label: "4. Applications", icon: GraduationCap },
  { id: "documents", label: "5. Documents", icon: FolderLock },
  { id: "journey", label: "6. Student Journey", icon: Compass },
  { id: "tasks", label: "7. Tasks", icon: CheckSquare },
  { id: "interviews", label: "8. Mock Interviews", icon: Video },
  { id: "loan", label: "9. Loan", icon: Banknote },
  { id: "communication", label: "10. Chat & Messages", icon: MessageSquare },
  { id: "activity", label: "11. Activity History", icon: History },
];

export default function CounselorStudentWorkspacePage() {
  const params = useParams();
  const studentId = (params?.id as string) || "usr-student-01";
  const { user } = useCurrentUser();
  const assignedCounselor = dataStore.getAssignedCounselor(studentId);
  const counselorId = user?.role === "counselor" ? user.id : (assignedCounselor?.id || "usr-counselor-01");

  const [activeTab, setActiveTab] = useState("overview");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToChatBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Check URL query parameters for active tab
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab");
      if (tabParam === "chat" || tabParam === "communication") {
        setActiveTab("communication");
      } else if (tabParam && tabList.some((t) => t.id === tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Live state from dataStore
  const student = dataStore.getStudentProfile(studentId);
  const counselor = dataStore.getCounselorProfile(counselorId);
  const [applications, setApplications] = useState(() => dataStore.getStudentApplications(studentId));
  const [documents, setDocuments] = useState(() => dataStore.getStudentDocuments(studentId));
  const [journey, setJourney] = useState(() => dataStore.getStudentJourney(studentId));
  const [tasks, setTasks] = useState(() => dataStore.getStudentTasks(studentId, true));
  const [mockInterviews, setMockInterviews] = useState(() => dataStore.getStudentMockInterviews(studentId));
  const [loanCase, setLoanCase] = useState(() => dataStore.getStudentLoanCase(studentId));
  const [internalNotes, setInternalNotes] = useState(() =>
    dataStore.getCounselorInternalNotes(studentId, "counselor")
  );
  const [activityLogs, setActivityLogs] = useState(() => dataStore.getActivityLogs(studentId));

  // Live chat messages with student
  const [messages, setMessages] = useState(() => dataStore.getMessages(studentId));
  const [chatInput, setChatInput] = useState("");

  // Auto-scroll chat to latest messages at bottom and mark candidate messages as read
  useEffect(() => {
    if (activeTab === "communication") {
      const counselorId = user?.role === "counselor" ? user.id : "usr-counselor-01";
      dataStore.markCounselorMessagesAsRead(counselorId, studentId);
      scrollToChatBottom();
      const t1 = setTimeout(scrollToChatBottom, 50);
      const t2 = setTimeout(scrollToChatBottom, 200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [activeTab, messages.length, studentId, user]);

  // Modals state
  const [appStatusModal, setAppStatusModal] = useState<any | null>(null);
  const [newStatusValue, setNewStatusValue] = useState<ApplicationStatus>("under_review");
  const [statusRemarks, setStatusRemarks] = useState("");
  const [offerConditions, setOfferConditions] = useState("");
  const [offerLetterFile, setOfferLetterFile] = useState<File | null>(null);
  const [offerLetterFileName, setOfferLetterFileName] = useState("");
  const [offerDeposit, setOfferDeposit] = useState<number>(2000);
  const [offerDeadline, setOfferDeadline] = useState("2026-12-15");
  const [offerTuition, setOfferTuition] = useState<number>(30000);
  const [isUpdatingApp, setIsUpdatingApp] = useState(false);

  const [reviewDocModal, setReviewDocModal] = useState<any | null>(null);
  const [reviewDecision, setReviewDecision] = useState<"verified" | "rejected" | "resubmission_required">("verified");
  const [reviewComments, setReviewComments] = useState("");

  // Loan Stage Update Modal state
  const [updateLoanModal, setUpdateLoanModal] = useState(false);
  const [loanStage, setLoanStage] = useState(loanCase?.stage || "bank_selected");
  const [loanLender, setLoanLender] = useState(loanCase?.lenderName || "HDFC Credila");
  const [loanRequested, setLoanRequested] = useState(loanCase?.amountRequested || 3500000);
  const [loanSanctioned, setLoanSanctioned] = useState(loanCase?.sanctionAmount || 3200000);
  const [loanCounselorNotes, setLoanCounselorNotes] = useState(loanCase?.counselorNotes || "");
  const [loanStudentNextStep, setLoanStudentNextStep] = useState(loanCase?.studentNextStep || "");

  // Edit Zoom Link State
  const [editInterviewZoomModal, setEditInterviewZoomModal] = useState<any | null>(null);
  const [editZoomUrl, setEditZoomUrl] = useState("");
  const [editMeetingId, setEditMeetingId] = useState("");
  const [editPasscode, setEditPasscode] = useState("");
  const [copiedZoomId, setCopiedZoomId] = useState<string | null>(null);

  // Sequential Journey Toast Notification
  const [journeyToast, setJourneyToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Prerequisite Stages Check
  const stage3 = journey.find((j) => j.stageNumber === 3);
  const stage4 = journey.find((j) => j.stageNumber === 4);
  const arePrerequisitesCompleted =
    stage3?.status === "completed" && stage4?.status === "completed";

  const handleMarkStageOffline = (stageNum: number) => {
    dataStore.markStageOfflineCompleted(studentId, stageNum, counselorId, "counselor");
    setJourney(dataStore.getStudentJourney(studentId));
    setJourneyToast({ type: "success", message: `Stage 0${stageNum} marked as completed (offline/in-person).` });
  };

  const handleMarkAllPrerequisitesOffline = () => {
    dataStore.markPrerequisiteStagesCompleted(studentId, counselorId, "counselor");
    setJourney(dataStore.getStudentJourney(studentId));
    setJourneyToast({ type: "success", message: "Prerequisite stages completed offline. Applications unlocked." });
  };

  // Confirmation modal state for application removal
  const [deleteConfirmApp, setDeleteConfirmApp] = useState<{ id: string; universityName: string; courseName?: string } | null>(null);

  const handleInitiateDelete = (app: { id: string; universityName: string; courseName?: string }) => {
    setDeleteConfirmApp(app);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmApp) return;
    dataStore.deleteApplication(deleteConfirmApp.id, counselorId);
    setApplications(dataStore.getStudentApplications(studentId));
    setJourneyToast({ type: "success", message: `Application for ${deleteConfirmApp.universityName} removed.` });
    setDeleteConfirmApp(null);
  };

  // Destination Countries for Application Creator
  const destinationCountries = [
    { id: "United Kingdom", name: "United Kingdom", flag: "🇬🇧", currency: "GBP", symbol: "£" },
    { id: "United States", name: "United States", flag: "🇺🇸", currency: "USD", symbol: "$" },
    { id: "Australia", name: "Australia", flag: "🇦🇺", currency: "AUD", symbol: "A$" },
    { id: "Canada", name: "Canada", flag: "🇨🇦", currency: "CAD", symbol: "C$" },
    { id: "Germany", name: "Germany", flag: "🇩🇪", currency: "EUR", symbol: "€" },
    { id: "New Zealand", name: "New Zealand", flag: "🇳🇿", currency: "NZD", symbol: "NZ$" },
  ];

  const [createAppModalOpen, setCreateAppModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [isCustomCourse, setIsCustomCourse] = useState(false);
  const [customCourseTitle, setCustomCourseTitle] = useState("");
  const [selectedIntake, setSelectedIntake] = useState("");
  const [newFee, setNewFee] = useState<string | number>("");

  const handleOpenCreateApp = () => {
    setSelectedCountry("");
    setSelectedUniversity("");
    setSelectedCourse("");
    setIsCustomCourse(false);
    setCustomCourseTitle("");
    setSelectedIntake("");
    setNewFee("");
    setCreateAppModalOpen(true);
  };

  const universitiesForCountry = React.useMemo(() => {
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

  const activeUni = React.useMemo(() => {
    if (!selectedUniversity) return null;
    return (
      ALL_GLOBAL_UNIVERSITIES.find(
        (u) => u.name.toLowerCase() === selectedUniversity.toLowerCase() || u.id === selectedUniversity
      ) || null
    );
  }, [selectedUniversity]);

  const coursesForUniversity = React.useMemo(() => {
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
    return list;
  }, [activeUni]);

  const intakesForUniversity: string[] = React.useMemo(() => {
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

  const currencySymbol = React.useMemo(() => {
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
    if (!activeUni || !selectedCountry) {
      alert("Please select a destination country and target university.");
      return;
    }
    const finalCourse = isCustomCourse ? customCourseTitle.trim() : selectedCourse;
    if (!finalCourse) {
      alert("Please select or enter a master's course title.");
      return;
    }
    if (!selectedIntake) {
      alert("Please select a target intake.");
      return;
    }

    dataStore.createApplication(
      studentId,
      activeUni.name,
      activeUni.country,
      finalCourse,
      selectedIntake,
      Number(newFee) || 0,
      counselorId
    );
    setApplications(dataStore.getStudentApplications(studentId));
    setJourney(dataStore.getStudentJourney(studentId));
    setCreateAppModalOpen(false);
    setJourneyToast({ type: "success", message: `Application lodged for ${activeUni.name}` });
  };

  const copyZoomToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedZoomId(id);
    setTimeout(() => setCopiedZoomId(null), 2500);
  };

  const openEditZoomModal = (interview: any) => {
    setEditInterviewZoomModal(interview);
    setEditZoomUrl(interview.zoomMeetingUrl || "https://zoom.us/test");
    setEditMeetingId(interview.zoomMeetingId || "984 9012 3456");
    setEditPasscode(interview.zoomPasscode || "GVK2026");
  };

  const handleUpdateInterviewZoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editInterviewZoomModal) return;
    dataStore.updateMockInterviewZoom(
      editInterviewZoomModal.id,
      counselorId,
      editZoomUrl,
      editMeetingId,
      editPasscode
    );
    setMockInterviews(dataStore.getStudentMockInterviews(studentId));
    setEditInterviewZoomModal(null);
  };

  const counselorDefaultZoom = dataStore.getCounselorDefaultZoom(counselorId);
  const [scheduleInterviewModal, setScheduleInterviewModal] = useState(false);
  const [interviewTitle, setInterviewTitle] = useState("Russell Group Readiness Mock Interview");
  const [interviewDate, setInterviewDate] = useState("2026-11-22T15:00");
  const [interviewZoomUrl, setInterviewZoomUrl] = useState(counselorDefaultZoom.zoomUrl || "https://zoom.us/start/videomeeting");
  const [interviewInstructions, setInterviewInstructions] = useState("Discuss statement of purpose and course modules.");

  const openScheduleInterview = () => {
    setInterviewZoomUrl(dataStore.getCounselorDefaultZoom(counselorId).zoomUrl || "https://zoom.us/start/videomeeting");
    setScheduleInterviewModal(true);
  };

  // Cancel Mock Interview State
  const [cancelInterviewModal, setCancelInterviewModal] = useState<any | null>(null);
  const [cancelInterviewReason, setCancelInterviewReason] = useState("Schedule conflict — will reschedule shortly");

  const openCancelInterviewModal = (interview: any) => {
    setCancelInterviewModal(interview);
    setCancelInterviewReason("Schedule conflict — will reschedule shortly");
  };

  const handleCancelInterviewSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelInterviewModal) return;
    dataStore.cancelMockInterview(cancelInterviewModal.id, counselorId, cancelInterviewReason);
    setMockInterviews(dataStore.getStudentMockInterviews(studentId));
    setCancelInterviewModal(null);
  };

  const [evaluateInterviewModal, setEvaluateInterviewModal] = useState<any | null>(null);
  const [evalOutcome, setEvalOutcome] = useState<MockInterviewOutcome>("PASS");
  const [evalStrengths, setEvalStrengths] = useState("Confident speaker, clear motivation for UK studies.");
  const [evalImprovements, setEvalImprovements] = useState("Elaborate more on specific faculty research papers.");
  const [evalScoreComm, setEvalScoreComm] = useState(4);
  const [evalScoreAcad, setEvalScoreAcad] = useState(4);
  const [evalScoreVisa, setEvalScoreVisa] = useState(5);
  const [evalStudentFeedback, setEvalStudentFeedback] = useState("Well done! Ready for official university interview.");
  const [evalPrivateNote, setEvalPrivateNote] = useState("High probability of visa clearance.");

  const [createTaskModal, setCreateTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("2026-11-25");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("medium");
  const [taskIsInternal, setTaskIsInternal] = useState(false);

  const [newInternalNote, setNewInternalNote] = useState("");

  const [activityRoleFilter, setActivityRoleFilter] = useState<"all" | "student" | "counselor" | "admin">("all");
  const [activitySearchQuery, setActivitySearchQuery] = useState("");

  // Real-time synchronization across tabs: when student uploads a document or accepts offer,
  // this counselor workspace automatically updates!
  useEffect(() => {
    const unsubscribe = dataStore.subscribe((event) => {
      setApplications(dataStore.getStudentApplications(studentId));
      setDocuments(dataStore.getStudentDocuments(studentId));
      setJourney(dataStore.getStudentJourney(studentId));
      setTasks(dataStore.getStudentTasks(studentId, true));
      setMockInterviews(dataStore.getStudentMockInterviews(studentId));
      setLoanCase(dataStore.getStudentLoanCase(studentId));
      setMessages(dataStore.getMessages(studentId));
      setActivityLogs(dataStore.getActivityLogs(studentId));

      if (event.type === "DOCUMENT_UPLOADED") {
        setJourneyToast({
          type: "success",
          message: `📄 Real-Time Update: ${student?.firstName || "Student"} uploaded a new document ("${event.payload?.document?.title}"). Review & download available in Tab 5.`,
        });
        setTimeout(() => setJourneyToast(null), 6000);
      } else if (event.type === "OFFER_ACCEPTED") {
        setJourneyToast({
          type: "success",
          message: `⭐ Real-Time Update: ${student?.firstName || "Student"} confirmed final destination: ${event.payload?.targetApp?.universityName}.`,
        });
        setTimeout(() => setJourneyToast(null), 6000);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [studentId, student?.firstName]);

  if (!student) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-gvk-border text-center">
        <h2 className="text-lg font-bold text-gvk-navy">Student record not found or unassigned.</h2>
        <Link href="/counselor/students" className="mt-4 inline-block">
          <Button>Back to Students</Button>
        </Link>
      </div>
    );
  }

  // Action handlers
  const handleUpdateAppStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appStatusModal) return;

    setIsUpdatingApp(true);
    try {
      const isOffer = newStatusValue === "conditional_offer" || newStatusValue === "unconditional_offer";
      let chosenFileName = offerLetterFileName || (isOffer ? `${appStatusModal.universityName.replace(/\s+/g, "_")}_Conditional_Offer.pdf` : undefined);
      let chosenFileUrl: string | undefined = undefined;

      // Real file upload to server disk if file selected
      if (offerLetterFile) {
        try {
          const formData = new FormData();
          formData.append("file", offerLetterFile);
          const uploadRes = await fetch("/api/documents/upload", {
            method: "POST",
            body: formData,
            credentials: "include",
          });
          const uploadData = await uploadRes.json();
          if (uploadRes.ok && uploadData.success) {
            chosenFileName = uploadData.fileName;
            chosenFileUrl = uploadData.fileUrl;
          }
        } catch (uploadErr) {
          console.error("Failed to upload offer letter file:", uploadErr);
          chosenFileName = offerLetterFile.name;
        }
      }

      dataStore.updateApplicationStatus(
        appStatusModal.id,
        newStatusValue,
        counselorId,
        statusRemarks,
        offerConditions,
        chosenFileName,
        chosenFileUrl,
        offerDeposit,
        offerDeadline,
        offerTuition
      );

      setApplications(dataStore.getStudentApplications(studentId));
      setDocuments(dataStore.getStudentDocuments(studentId));
      setActivityLogs(dataStore.getActivityLogs(studentId));

      setJourneyToast({
        type: "success",
        message: isOffer
          ? `✓ Official offer letter for ${appStatusModal.universityName} uploaded and published to candidate portal!`
          : `✓ Application for ${appStatusModal.universityName} updated to ${newStatusValue.replace(/_/g, " ")}.`,
      });
      setTimeout(() => setJourneyToast(null), 4500);

      setAppStatusModal(null);
      setOfferLetterFile(null);
    } finally {
      setIsUpdatingApp(false);
    }
  };

  const handleSetFinalDestination = (app: any) => {
    const res = dataStore.acceptUniversityOffer(
      studentId,
      app.id,
      counselorId,
      "Counselor recorded candidate's official final destination acceptance."
    );
    if (res.success) {
      setApplications(dataStore.getStudentApplications(studentId));
      setJourney(dataStore.getStudentJourney(studentId));
      setActivityLogs(dataStore.getActivityLogs(studentId));
      setJourneyToast({
        type: "success",
        message: `✓ ${app.universityName} set as student's Confirmed Final Destination! Downstream milestones updated.`,
      });
      setTimeout(() => setJourneyToast(null), 4500);
    }
  };

  const handleReviewDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewDocModal) return;

    dataStore.reviewDocument(reviewDocModal.id, reviewDecision, counselorId, reviewComments);
    setDocuments(dataStore.getStudentDocuments(studentId));
    setActivityLogs(dataStore.getActivityLogs(studentId));
    setReviewDocModal(null);
  };

  const handleUpdateJourneyStage = (stageNumber: number, newStatus: JourneyStageStatus, remarks?: string) => {
    const res = dataStore.updateJourneyStage(
      studentId,
      stageNumber,
      newStatus,
      counselorId,
      remarks || (newStatus === "completed" ? "Milestone verified and completed by counselor" : `Stage status set to ${newStatus} by counselor`)
    );
    setJourney(dataStore.getStudentJourney(studentId));
    setActivityLogs(dataStore.getActivityLogs(studentId));

    if (!res.success) {
      setJourneyToast({ type: "error", message: res.error || "Cannot update milestone status." });
    } else {
      setJourneyToast({
        type: "success",
        message: `✓ Stage ${stageNumber} status updated to ${newStatus.replace(/_/g, " ")}.`,
      });
    }

    setTimeout(() => {
      setJourneyToast(null);
    }, 4500);
  };

  const handleScheduleInterview = (e: React.FormEvent) => {
    e.preventDefault();
    dataStore.scheduleMockInterview(
      studentId,
      counselorId,
      interviewTitle,
      interviewDate,
      30,
      interviewInstructions,
      interviewZoomUrl
    );
    setMockInterviews(dataStore.getStudentMockInterviews(studentId));
    setActivityLogs(dataStore.getActivityLogs(studentId));
    setScheduleInterviewModal(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const counselorName = counselor ? `${counselor.firstName} ${counselor.lastName}` : "Priya Varma";
    dataStore.sendMessage(studentId, counselorId, "counselor", counselorName, chatInput.trim());
    setMessages([...dataStore.getMessages(studentId)]);
    setChatInput("");
    setActivityLogs(dataStore.getActivityLogs(studentId));
  };

  const handleUpdateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (loanStage === "not_started") {
      dataStore.resetLoanCase(studentId, counselorId);
    } else {
      dataStore.updateLoanCase(
        studentId,
        loanStage,
        loanLender || "HDFC Credila",
        Number(loanRequested),
        loanSanctioned ? Number(loanSanctioned) : undefined,
        loanCounselorNotes,
        loanStudentNextStep,
        counselorId
      );
    }
    setLoanCase(dataStore.getStudentLoanCase(studentId));
    setActivityLogs(dataStore.getActivityLogs(studentId));
    setUpdateLoanModal(false);
  };

  const handleEvaluateInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluateInterviewModal) return;

    dataStore.evaluateMockInterview(
      evaluateInterviewModal.id,
      counselorId,
      evalOutcome,
      evalStrengths,
      evalImprovements,
      evalScoreComm,
      evalScoreAcad,
      evalScoreVisa,
      evalStudentFeedback,
      evalPrivateNote
    );
    setMockInterviews(dataStore.getStudentMockInterviews(studentId));
    setActivityLogs(dataStore.getActivityLogs(studentId));
    setEvaluateInterviewModal(null);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    dataStore.createTask(
      studentId,
      taskTitle,
      taskDesc,
      taskDueDate,
      taskPriority,
      counselorId,
      taskIsInternal
    );
    setTasks(dataStore.getStudentTasks(studentId, true));
    setActivityLogs(dataStore.getActivityLogs(studentId));
    setCreateTaskModal(false);
    setTaskTitle("");
    setTaskDesc("");
  };

  const handleAddInternalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInternalNote.trim()) return;

    dataStore.addCounselorInternalNote(studentId, counselorId, "general", newInternalNote);
    setInternalNotes(dataStore.getCounselorInternalNotes(studentId, "counselor"));
    setNewInternalNote("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Ribbon: Student Vitals & Quick Return */}
      <div className="bg-white rounded-2xl border border-gvk-border p-5 sm:p-6 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gvk-navy text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md">
              {student.firstName.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-gvk-navy">
                  {student.firstName} {student.lastName}
                </h1>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-gvk-navy-50 text-gvk-navy border border-gvk-navy-200">
                  {student.studentIdCode}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  Assigned to Priya Varma
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gvk-text-secondary mt-1">
                Targeting <strong className="text-gvk-text-primary">{student.targetDegree}</strong> • {student.preferredCountry} ({student.targetIntake}) • CGPA: {student.ugCgpa}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => setActiveTab("communication")}
              variant="default"
              size="sm"
              className="font-bold text-xs flex items-center gap-2 shadow-sm"
              title={`Open Live Chat with ${student.firstName}`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat with {student.firstName}</span>
            </Button>
            <Link href="/counselor/students">
              <Button variant="outline" size="sm" className="font-bold text-xs">
                ← Back to Students
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Dropdown Tab Selector (Visible on < 640px) */}
        <div className="mt-6 pt-4 border-t border-gvk-border sm:hidden">
          <label className="block text-xs font-bold text-gvk-navy mb-1.5">
            Active Workspace Section:
          </label>
          <div className="relative">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full h-11 px-3.5 pr-8 rounded-xl border border-gvk-border bg-white text-xs font-bold text-gvk-navy shadow-xs focus:ring-2 focus:ring-gvk-navy appearance-none"
            >
              {tabList.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 font-bold text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* 11 Horizontal Workspace Tabs with Mobile Scroll (Visible on sm and up) */}
        <div className="hidden sm:flex mt-6 pt-4 border-t border-gvk-border items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {tabList.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all min-h-[40px] shrink-0 ${
                  isActive
                    ? "bg-gvk-navy text-white shadow-xs"
                    : "bg-slate-100 text-gvk-text-secondary hover:bg-slate-200 hover:text-gvk-navy"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-gvk-text-muted"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT AREAS */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-4">
              <h2 className="text-base font-bold text-gvk-navy">Counselor Briefing & Fast Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-gvk-text-secondary block">Applications</span>
                  <span className="text-xl font-black text-gvk-navy font-mono">{applications.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 block">Offers</span>
                  <span className="text-xl font-black text-emerald-700 font-mono">
                    {applications.filter((a) => a.currentStatus.includes("offer")).length}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-[10px] text-amber-800 block">Docs Under Review</span>
                  <span className="text-xl font-black text-amber-700 font-mono">
                    {documents.filter((d) => d.verificationStatus === "under_review").length}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-700 block font-medium">Pending Tasks</span>
                  <span className="text-xl font-black text-gvk-navy font-mono">
                    {tasks.filter((t) => t.status === "pending").length}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <strong className="text-gvk-navy font-bold block">Current Algorithmic Next Action:</strong>
                <p className="text-gvk-text-secondary">
                  {dataStore.calculateNextAction(studentId).title} — {dataStore.calculateNextAction(studentId).description}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-3 text-xs">
              <h3 className="font-bold text-gvk-navy">Direct Student Contact</h3>
              <p>Email: <strong className="text-gvk-navy">rahul.sharma@gmail.com</strong></p>
              <p>Phone: <strong className="text-gvk-navy font-mono">{student.phone}</strong></p>
              <p>Undergraduate: <strong>{student.ugCollege}</strong></p>
              <p>IELTS Score: <strong className="text-emerald-700">{student.englishScore} Band</strong></p>

              <Button
                onClick={() => setActiveTab("communication")}
                className="w-full flex items-center justify-center gap-2 font-bold text-xs mt-3 shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open Chat with {student.firstName}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PERSONAL DETAILS */}
      {activeTab === "personal" && (
        <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-4 animate-fade-in text-xs">
          <h2 className="text-base font-bold text-gvk-navy">Student Personal Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-gvk-text-secondary block">Full Name</span>
              <strong className="text-gvk-navy text-sm">{student.firstName} {student.lastName}</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-gvk-text-secondary block">Student ID Code</span>
              <strong className="text-gvk-navy font-mono text-sm">{student.studentIdCode}</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-gvk-text-secondary block">Phone Number</span>
              <strong className="text-gvk-navy font-mono text-sm">{student.phone}</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-gvk-text-secondary block">Preferred Country</span>
              <strong className="text-gvk-navy text-sm">{student.preferredCountry}</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-gvk-text-secondary block">Target Intake</span>
              <strong className="text-gvk-navy text-sm">{student.targetIntake}</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-gvk-text-secondary block">Target Degree</span>
              <strong className="text-gvk-navy text-sm">{student.targetDegree}</strong>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACADEMIC DETAILS */}
      {activeTab === "academic" && (
        <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-4 animate-fade-in text-xs">
          <h2 className="text-base font-bold text-gvk-navy">Academic History & Test Records</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-gvk-text-secondary block">Undergraduate College / University</span>
              <strong className="text-gvk-navy text-sm">{student.ugCollege}</strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-gvk-text-secondary block">UG CGPA / Percentage</span>
              <strong className="text-gvk-navy font-mono text-base">{student.ugCgpa} / 10.0</strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-gvk-text-secondary block">Backlogs Count</span>
              <strong className="text-gvk-success font-mono text-base">{student.ugBacklogs}</strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-gvk-text-secondary block">English Test Type</span>
              <strong className="text-gvk-navy text-sm">{student.englishTestType}</strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-gvk-text-secondary block">English Overall Score</span>
              <strong className="text-emerald-700 font-mono text-base">{student.englishScore} Band</strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-gvk-text-secondary block">GRE Score</span>
              <strong className="text-gvk-navy font-mono text-base">{student.greScore || "Waived"}</strong>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: UNIVERSITY APPLICATIONS */}
      {activeTab === "applications" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gvk-navy">
                University Applications Under Student ({applications.length})
              </h2>
              <p className="text-xs text-gvk-text-secondary">
                Track university admissions, review offers/rejections, and lock the candidate's single confirmed destination.
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleOpenCreateApp}
              className="bg-[#253775] hover:bg-[#1a2754] text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Application</span>
            </Button>
          </div>

          {/* SINGLE DESTINATION CONVERGENCE CALLOUT */}
          {(() => {
            const confirmedApp = applications.find((a) => a.isFinalDestination);
            const offers = applications.filter(
              (a) => a.currentStatus === "conditional_offer" || a.currentStatus === "unconditional_offer"
            );

            if (confirmedApp) {
              return (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs flex items-start gap-3 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black shrink-0 text-sm">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-emerald-950 font-bold text-sm">
                        Confirmed Final Destination: {confirmedApp.universityName}
                      </strong>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                        Downstream Pipeline Locked
                      </span>
                    </div>
                    <p className="text-emerald-800 leading-relaxed">
                      Candidate committed to <strong>{confirmedApp.courseName}</strong>. All downstream stages (Tuition Deposit, CAS Issuance, UKVI Tier 4 Visa, Campus Accommodation, and Enrollment) strictly execute for this university. Other applications are closed.
                    </p>
                  </div>
                </div>
              );
            }

            if (offers.length > 0) {
              return (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs flex items-start gap-3 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-black shrink-0 text-sm">
                    !
                  </div>
                  <div className="space-y-1">
                    <strong className="text-amber-950 font-bold text-sm block">
                      Single Destination Decision Required ({offers.length} Offers in Hand)
                    </strong>
                    <p className="text-amber-800 leading-relaxed">
                      Student has received offers from <strong>{offers.map((o) => o.universityName).join(", ")}</strong>. Because visa sponsorship, CAS issuance, and tuition deposits cannot proceed with multiple institutions, select one offer below to set as the <strong>Confirmed Final Destination</strong>.
                    </p>
                  </div>
                </div>
              );
            }

            return null;
          })()}

          {/* Prerequisite Stages Checklist & Offline Verification Banner */}
          {!arePrerequisitesCompleted ? (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h4 className="font-bold text-amber-950 text-sm">
                      Admissions Roadmap Status
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px]">
                      Prerequisites Pending
                    </span>
                  </div>
                  <p className="text-amber-800 leading-relaxed">
                    Standard admission protocol requires Document Verification and University Shortlisting before lodging formal university applications.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                        stage3?.status === "completed"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                          : "bg-white border-amber-200 text-amber-950"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {stage3?.status === "completed" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        )}
                        <div>
                          <div className="font-bold truncate">Stage 03: Document Collection</div>
                          <div className="text-[10px] text-slate-500">
                            {stage3?.status === "completed" ? "Verified & Completed" : "Pending Document Upload"}
                          </div>
                        </div>
                      </div>
                      {stage3?.status !== "completed" && (
                        <button
                          type="button"
                          onClick={() => handleMarkStageOffline(3)}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold shrink-0 transition-colors shadow-2xs"
                          title="Student submitted physical hard copies in office"
                        >
                          Mark Offline Done
                        </button>
                      )}
                    </div>

                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                        stage4?.status === "completed"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                          : "bg-white border-amber-200 text-amber-950"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {stage4?.status === "completed" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        )}
                        <div>
                          <div className="font-bold truncate">Stage 04: University Shortlisting</div>
                          <div className="text-[10px] text-slate-500">
                            {stage4?.status === "completed" ? "Shortlisted & Approved" : "Pending Shortlist Selection"}
                          </div>
                        </div>
                      </div>
                      {stage4?.status !== "completed" && (
                        <button
                          type="button"
                          onClick={() => handleMarkStageOffline(4)}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold shrink-0 transition-colors shadow-2xs"
                          title="Shortlisted in-person or over phone counseling"
                        >
                          Mark Offline Done
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-t border-amber-200/80 mt-2">
                    <p className="text-[11px] text-amber-800">
                      💡 <strong>Offline Consultation:</strong> If the candidate submitted physical documents in office and shortlisted offline, mark stages as completed to unlock applications.
                    </p>
                    <Button
                      size="sm"
                      type="button"
                      onClick={handleMarkAllPrerequisitesOffline}
                      className="bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shrink-0 shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark All Offline & Unlock Applications</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Prerequisite Stages Completed:</strong> Document verification and university shortlisting are completed.
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] shrink-0">
                Eligible for Applications
              </span>
            </div>
          )}

          <div className="space-y-4">
            {applications.map((app) => {
              const isOffer =
                app.currentStatus === "conditional_offer" || app.currentStatus === "unconditional_offer";
              const isFinal = !!app.isFinalDestination;
              const isDeclined = app.decisionStatus === "declined";
              const isRejected = app.currentStatus === "rejected";

              return (
                <div
                  key={app.id}
                  className={`p-5 rounded-2xl border transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isFinal
                      ? "border-emerald-400 bg-emerald-50/25 shadow-md ring-1 ring-emerald-300"
                      : isDeclined
                      ? "border-slate-200 bg-slate-50/60 opacity-80"
                      : isRejected
                      ? "border-red-200 bg-red-50/20"
                      : "border-gvk-border bg-white shadow-card"
                  }`}
                >
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                          <strong className="text-base font-bold text-gvk-navy truncate">
                            {app.universityName}
                          </strong>
                          <StatusBadge type="application" status={app.currentStatus} />

                          {isFinal && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-700 text-white shadow-sm">
                              ⭐ Confirmed Destination
                            </span>
                          )}

                          {isDeclined && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                              Declined in favor of Final Choice
                            </span>
                          )}

                          {isRejected && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-gvk-red border border-red-200">
                              Application Unsuccessful
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-slate-600">
                          <span className="text-gvk-text-primary font-semibold">{app.courseName}</span>
                          <span className="text-slate-300">•</span>
                          <span>Intake: <strong className="text-gvk-navy font-semibold">{app.intake || "Fall 2026"}</strong></span>
                          <span className="text-slate-300">•</span>
                          <span>Ref: <strong className="font-mono text-gvk-navy font-bold">{app.appRefNumber || "Awaiting"}</strong></span>
                        </div>
                      </div>

                    {/* Attached Offer Letter Display */}
                    {app.offerLetterFileName && (
                      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>
                            Official Offer Letter: <strong className="font-mono text-emerald-900">{app.offerLetterFileName}</strong>
                          </span>
                        </div>
                        <a
                          href={`/api/documents/download?id=doc-offer-${app.id}&studentId=${studentId}`}
                          download
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Offer Letter</span>
                        </a>
                      </div>
                    )}

                    {/* Offer Conditions Checklist */}
                    {app.offerConditions && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
                        <div className="flex items-center gap-1.5 font-bold mb-0.5 text-amber-900">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Admission Conditions Checklist:</span>
                        </div>
                        <p className="leading-relaxed pl-5">{app.offerConditions}</p>
                      </div>
                    )}

                    {app.counselorRemarks && (
                      <p className="text-gvk-navy bg-gvk-navy-50/70 p-2.5 rounded-lg border border-gvk-navy-100">
                        💡 Remarks: {app.counselorRemarks}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 flex flex-wrap items-center gap-2 self-end sm:self-center">
                    {isOffer && !isFinal && (
                      <Button
                        onClick={() => handleSetFinalDestination(app)}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                      >
                        Set as Final Destination
                      </Button>
                    )}

                    {isFinal && (
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200">
                        ✓ Selected Destination
                      </span>
                    )}

                    <Button
                      onClick={() => {
                        setAppStatusModal(app);
                        setNewStatusValue(app.currentStatus);
                        setStatusRemarks(app.counselorRemarks || "");
                        setOfferConditions(app.offerConditions || "");
                        setOfferLetterFileName(app.offerLetterFileName || "");
                        setOfferLetterFile(null);
                        setOfferDeposit(app.depositAmount || 2000);
                        setOfferDeadline(app.depositDeadline || "2026-12-15");
                        setOfferTuition(app.tuitionFee || 30000);
                      }}
                      size="sm"
                      variant="outline"
                      className="font-bold text-xs"
                    >
                      Update Status & Offer Letter
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleInitiateDelete(app)}
                      className="border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold"
                      title="Remove application"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: DOCUMENTS VERIFICATION QUEUE */}
      {activeTab === "documents" && (
        <div className="space-y-4 animate-fade-in">
          {stage3?.status !== "completed" ? (
            <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-blue-900">
              <div className="flex items-center gap-2.5">
                <FolderLock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Offline Physical Document Submission:</strong> If candidate submitted physical paper transcripts/passport at the counseling office, mark Stage 03 as verified.
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => handleMarkStageOffline(3)}
                className="bg-[#253775] hover:bg-[#1a2754] text-white font-bold rounded-lg text-xs shrink-0"
              >
                Mark Documents Verified (Offline)
              </Button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Document Verification Cleared:</strong> Stage 03 Document Collection & Verification completed.
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                Stage 03 Completed
              </span>
            </div>
          )}

          <h2 className="text-base font-bold text-gvk-navy">Document Verification Desk</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-2xl border border-gvk-border bg-white shadow-card flex flex-col justify-between text-xs space-y-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm font-bold text-gvk-navy">{doc.title}</strong>
                    <StatusBadge type="document" status={doc.verificationStatus} />
                  </div>
                  <p className="text-gvk-text-secondary">
                    File: <span className="font-mono text-gvk-navy">{doc.fileName || "None"}</span> • Version: v{doc.latestVersion}
                  </p>
                  {doc.counselorComments && (
                    <div className="p-2 rounded bg-red-50 text-gvk-red border border-red-100">
                      Previous Feedback: {doc.counselorComments}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-gvk-border flex items-center justify-end gap-2">
                  <a
                    href={`/api/documents/download?id=${doc.id}&studentId=${studentId}`}
                    download
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gvk-border bg-slate-50 hover:bg-slate-100 text-gvk-navy font-bold text-xs transition-colors"
                    title="Download Student Document"
                  >
                    <Download className="w-3.5 h-3.5 text-gvk-navy" />
                    <span>Download</span>
                  </a>
                  <Button
                    onClick={() => {
                      setReviewDocModal(doc);
                      setReviewDecision(doc.verificationStatus === "verified" ? "verified" : "verified");
                      setReviewComments(doc.counselorComments || "");
                    }}
                    size="sm"
                    variant={doc.verificationStatus === "verified" ? "outline" : "default"}
                    className="font-bold text-xs"
                  >
                    {doc.verificationStatus === "verified" ? "Re-evaluate" : "Review & Verify"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: STUDENT JOURNEY MANAGEMENT */}
      {activeTab === "journey" && (() => {
        const currentActive = journey.find((s) => s.status !== "completed");
        const activeStageNum = currentActive ? currentActive.stageNumber : 23;
        const completedCount = journey.filter(
          (s) => s.status === "completed" && s.stageNumber < activeStageNum
        ).length;
        const progressPct = Math.round((completedCount / journey.length) * 100);

        return (
          <div className="space-y-5 animate-fade-in">
            {/* Real-time Toast Alert */}
            {journeyToast && (
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-bold transition-all shadow-xs ${
                  journeyToast.type === "success"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                    : "bg-red-50 border-red-300 text-red-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  {journeyToast.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{journeyToast.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setJourneyToast(null)}
                  className="p-1 hover:bg-black/5 rounded-lg text-slate-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Header & Milestone Status Banner */}
            <div className="bg-white rounded-2xl border border-gvk-border p-5 shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-gvk-navy">
                    Sequential 25-Stage Study Abroad Roadmap
                  </h2>
                  <p className="text-xs text-gvk-text-secondary mt-0.5">
                    Audit milestone progression and override stage statuses
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="text-xs font-bold text-gvk-text-secondary">Progress:</span>
                  <span className="font-mono text-xs font-black text-gvk-navy bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    {completedCount} / {journey.length} Completed ({progressPct}%)
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-gvk-navy to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* List of 25 Stages with Full Status Override Controls */}
            <div className="space-y-3">
              {journey.map((stg) => {
                const isCompleted = stg.status === "completed";
                const isInProgress = stg.status === "in_progress";
                const isWaiting = stg.status.startsWith("waiting");

                return (
                  <div
                    key={stg.id}
                    className={`p-4 rounded-xl border transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCompleted
                        ? "bg-emerald-50/40 border-emerald-200 shadow-xs"
                        : isInProgress
                        ? "bg-blue-50/60 border-blue-300 shadow-xs ring-1 ring-blue-300/40"
                        : isWaiting
                        ? "bg-amber-50/40 border-amber-200 shadow-xs"
                        : "bg-slate-50/60 border-slate-200"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded ${
                            isCompleted
                              ? "bg-emerald-100 text-emerald-800"
                              : isInProgress
                              ? "bg-[#253775] text-white"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          Stage {stg.stageNumber.toString().padStart(2, "0")}
                        </span>
                        <strong className="text-sm font-bold text-gvk-navy">{stg.stageName}</strong>

                        {isCompleted && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Completed
                          </span>
                        )}
                        {isInProgress && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            In Progress
                          </span>
                        )}
                        {stg.status === "waiting_student" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            Waiting Student
                          </span>
                        )}
                        {stg.status === "waiting_counselor" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                            Waiting Counselor
                          </span>
                        )}
                        {stg.status === "waiting_university" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">
                            Waiting University
                          </span>
                        )}
                        {stg.status === "not_started" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            Not Started
                          </span>
                        )}

                        <span className="text-[10px] text-gvk-text-muted capitalize">
                          Owner: {stg.responsibleParty}
                        </span>
                      </div>

                      <p className="text-gvk-text-secondary leading-relaxed">{stg.description}</p>

                      {isCompleted && stg.completionDate && (
                        <p className="text-[11px] text-emerald-700 font-medium">
                          ✓ Verified & Completed on: <strong>{stg.completionDate}</strong>
                          {stg.counselorRemarks && <span> — &quot;{stg.counselorRemarks}&quot;</span>}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <select
                        value={stg.status}
                        onChange={(e) =>
                          handleUpdateJourneyStage(stg.stageNumber, e.target.value as JourneyStageStatus)
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-[11px] text-gvk-navy shadow-xs focus:ring-2 focus:ring-[#253775] focus:outline-none"
                      >
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="waiting_student">Waiting Student</option>
                        <option value="waiting_counselor">Waiting Counselor</option>
                        <option value="waiting_university">Waiting University</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* TAB 7: TASKS */}
      {activeTab === "tasks" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gvk-navy">Tasks & Deliverables Management</h2>
            <Button
              onClick={() => setCreateTaskModal(true)}
              size="sm"
              className="font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Assign New Task</span>
            </Button>
          </div>

          <div className="space-y-3">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl border border-gvk-border bg-white shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge type="priority" status={t.priority} />
                    <StatusBadge type="task" status={t.status} />
                    {t.isCounselorInternal && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        Internal Counselor Note
                      </span>
                    )}
                  </div>
                  <strong className="text-sm font-bold text-gvk-navy block">{t.title}</strong>
                  {t.description && <p className="text-gvk-text-secondary">{t.description}</p>}
                  <p className="text-gvk-text-muted">Due Date: <strong>{t.dueDate}</strong></p>
                  {t.studentNotes && (
                    <div className="p-2 rounded bg-slate-50 border border-slate-200 text-gvk-navy">
                      Student Submission: {t.studentNotes}
                    </div>
                  )}
                </div>

                {t.status !== "completed" && (
                  <div className="shrink-0 self-end sm:self-center">
                    <Button
                      onClick={() => {
                        dataStore.completeTaskByCounselor(t.id, counselorId);
                        setTasks(dataStore.getStudentTasks(studentId, true));
                        setJourney(dataStore.getStudentJourney(studentId));
                        setActivityLogs(dataStore.getActivityLogs(studentId));
                      }}
                      size="sm"
                      className="font-bold text-xs bg-emerald-600 hover:bg-emerald-700"
                    >
                      Verify & Complete
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: MOCK INTERVIEWS */}
      {activeTab === "interviews" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gvk-navy">Mock Interview Sessions & Evaluations</h2>
              <p className="text-xs text-gvk-text-secondary">Simulate university admissions interviews with automated Zoom video links.</p>
            </div>
            <Button
              onClick={openScheduleInterview}
              size="sm"
              className="font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Mock Interview</span>
            </Button>
          </div>

          <div className="space-y-4">
            {mockInterviews.map((interview) => (
              <div
                key={interview.id}
                className="p-5 rounded-2xl border border-gvk-border bg-white shadow-card space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-base font-bold text-gvk-navy">{interview.title}</strong>
                    <p className="text-gvk-text-secondary">
                      Scheduled: {new Date(interview.scheduledAt).toLocaleString()} ({interview.durationMinutes} mins)
                    </p>
                  </div>
                  {interview.status === "cancelled" ? (
                    <span className="px-2.5 py-1 rounded text-xs font-bold bg-red-100 text-red-800 border border-red-300 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 text-red-600" />
                      <span>Cancelled</span>
                    </span>
                  ) : interview.feedback ? (
                    <StatusBadge type="interviewOutcome" status={interview.feedback.outcome} />
                  ) : (
                    <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      Scheduled
                    </span>
                  )}
                </div>

                {interview.status === "cancelled" ? (
                  <div className="p-3.5 bg-red-50/80 border border-red-200 rounded-xl space-y-1 text-xs text-red-950">
                    <div className="flex items-center gap-1.5 font-bold text-red-800 text-[11px]">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>Session Cancelled</span>
                    </div>
                    <p className="text-[11px] text-red-700 leading-relaxed">
                      <strong>Reason:</strong> {interview.cancellationReason || "Cancelled by counselor."}
                    </p>
                    {interview.cancelledAt && (
                      <span className="text-[10px] text-red-500 font-mono block">
                        Cancelled on: {new Date(interview.cancelledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                    )}
                  </div>
                ) : (
                  /* Verified Zoom Meeting Details */
                  <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gvk-navy flex items-center gap-1.5 text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified Zoom Meeting Link:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => openEditZoomModal(interview)}
                        className="text-[11px] text-blue-700 font-bold flex items-center gap-1 hover:underline"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit / Replace Link</span>
                      </button>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-blue-200 flex items-center justify-between gap-2">
                      <a
                        href={interview.zoomMeetingUrl || "https://zoom.us/start/videomeeting"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-blue-700 font-bold hover:underline truncate block flex-1"
                      >
                        {interview.zoomMeetingUrl || "https://zoom.us/start/videomeeting"}
                      </a>
                      <button
                        type="button"
                        onClick={() => copyZoomToClipboard(interview.zoomMeetingUrl || "https://zoom.us/start/videomeeting", `url-${interview.id}`)}
                        className="p-1 px-2 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 transition-colors shrink-0 flex items-center gap-1 text-[10px] font-bold"
                      >
                        {copiedZoomId === `url-${interview.id}` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-700 pt-0.5">
                      <span>Meeting ID: <strong>{interview.zoomMeetingId || "984 9012 3456"}</strong></span>
                      <span>Passcode: <strong>{interview.zoomPasscode || "GVK2026"}</strong></span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
                  {interview.status === "cancelled" ? (
                    <div className="w-full flex items-center justify-between">
                      <span className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span>Cancelled (Candidate Notified)</span>
                      </span>
                      <Button
                        onClick={openScheduleInterview}
                        size="sm"
                        variant="outline"
                        className="font-bold text-xs flex items-center gap-1 text-gvk-navy border-gvk-navy/40 hover:bg-slate-50"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Reschedule Session</span>
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <a href={interview.zoomMeetingUrl || "https://zoom.us/start/videomeeting"} target="_blank" rel="noopener noreferrer">
                          <Button variant="default" size="sm" className="font-bold flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
                            <Video className="w-3.5 h-3.5" />
                            <span>Launch Zoom Session</span>
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </a>

                        <Link href={`/interview/session/${interview.id}`}>
                          <Button variant="outline" size="sm" className="font-bold flex items-center gap-1.5 border-gvk-navy text-gvk-navy hover:bg-gvk-navy-50">
                            <Sparkles className="w-3.5 h-3.5 text-gvk-navy" />
                            <span>Open In-Platform Studio</span>
                          </Button>
                        </Link>
                      </div>

                      <div className="flex items-center gap-2">
                        {!interview.feedback && (
                          <Button
                            onClick={() => openCancelInterviewModal(interview)}
                            size="sm"
                            variant="ghost"
                            className="font-bold text-xs text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-1 px-2.5"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Cancel</span>
                          </Button>
                        )}

                        {!interview.feedback && (
                          <Button
                            onClick={() => setEvaluateInterviewModal(interview)}
                            size="sm"
                            variant="default"
                            className="font-bold"
                          >
                            Submit PASS/FAIL Evaluation
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {interview.feedback && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 mt-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-gvk-navy">Score: Comm {interview.feedback.communicationScore}/5 • Acad {interview.feedback.academicClarityScore}/5 • Visa {interview.feedback.visaIntentScore}/5</strong>
                      <span suppressHydrationWarning className="text-[10px] text-gvk-text-muted">Evaluated on {new Date(interview.feedback.evaluatedAt).toLocaleDateString()}</span>
                    </div>
                    <p><strong>Feedback:</strong> {interview.feedback.studentVisibleFeedback}</p>
                    {interview.feedback.counselorPrivateNotes && (
                      <p className="text-purple-700 font-semibold">🔒 Private Counselor Notes: {interview.feedback.counselorPrivateNotes}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: LOAN MANAGEMENT */}
      {activeTab === "loan" && (
        <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-5 animate-fade-in text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gvk-navy">Education Loan Pipeline Tracking</h2>
              <p className="text-xs text-gvk-text-secondary">Track and update the 11-stage education loan application process with banking partners.</p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {loanCase && loanCase.stage !== "not_started" && (
                <Button
                  onClick={() => {
                    dataStore.resetLoanCase(studentId, counselorId);
                    setLoanCase(dataStore.getStudentLoanCase(studentId));
                    setActivityLogs(dataStore.getActivityLogs(studentId));
                  }}
                  variant="outline"
                  size="sm"
                  className="font-bold text-xs text-slate-600 border-slate-300 hover:text-red-600 hover:border-red-300 hover:bg-red-50"
                  title="Reset student loan file to uninitiated status"
                >
                  <span>Reset to Not Started</span>
                </Button>
              )}
              <Button
                onClick={() => {
                  if (loanCase) {
                    setLoanStage(loanCase.stage);
                    setLoanLender(loanCase.lenderName);
                    setLoanRequested(loanCase.amountRequested);
                    setLoanSanctioned(loanCase.sanctionAmount || 3200000);
                    setLoanCounselorNotes(loanCase.counselorNotes || "");
                    setLoanStudentNextStep(loanCase.studentNextStep || "");
                  } else {
                    setLoanStage("bank_selected");
                    setLoanLender("HDFC Credila");
                    setLoanRequested(3500000);
                    setLoanSanctioned(0);
                    setLoanCounselorNotes("Initiated loan application with HDFC Credila.");
                    setLoanStudentNextStep("Review bank details and assemble KYC documents.");
                  }
                  setUpdateLoanModal(true);
                }}
                size="sm"
                className="font-bold flex items-center gap-1.5 bg-gvk-navy hover:bg-gvk-navy-800 text-white"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{loanCase && loanCase.stage !== "not_started" ? "Update Loan Process Stage" : "+ Initiate Loan Process"}</span>
              </Button>
            </div>
          </div>

          {loanCase && loanCase.stage !== "not_started" ? (() => {
            const currentLoanStageIndex = loanStagesList.findIndex((s) => s.id === loanCase.stage);

            return (
              <div className="space-y-4">
                {/* 10-Stage Visual Loan Journey Stepper */}
                <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gvk-navy">Loan Progression Journey</h3>
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-gvk-navy text-white">
                          Stage {currentLoanStageIndex >= 0 ? currentLoanStageIndex + 1 : 1} of 10
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {Math.round(((currentLoanStageIndex + 1) / loanStagesList.length) * 100)}% Pipeline Complete
                        </span>
                      </div>
                      <p className="text-[11px] text-gvk-text-secondary mt-0.5">
                        Click any milestone node to update the loan status or advance the candidate through the banking pipeline.
                      </p>
                    </div>

                    {/* Quick 1-Click Advance Button if not yet disbursed */}
                    {currentLoanStageIndex >= 0 && currentLoanStageIndex < loanStagesList.length - 1 && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          const nextStage = loanStagesList[currentLoanStageIndex + 1];
                          if (nextStage) {
                            dataStore.updateLoanCase(
                              studentId,
                              nextStage.id,
                              loanCase.lenderName,
                              loanCase.amountRequested,
                              loanCase.sanctionAmount,
                              loanCase.counselorNotes || `Advanced to ${nextStage.label} by counselor`,
                              loanCase.studentNextStep || "",
                              counselorId
                            );
                            setLoanCase(dataStore.getStudentLoanCase(studentId));
                            setActivityLogs(dataStore.getActivityLogs(studentId));
                          }
                        }}
                        className="font-bold text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 shadow-sm"
                        title={`Advance loan directly to ${loanStagesList[currentLoanStageIndex + 1].label}`}
                      >
                        <span>Advance to: {loanStagesList[currentLoanStageIndex + 1].label}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>

                  {/* Horizontal Interactive Stepper */}
                  <div className="pt-3 pb-2 overflow-x-auto">
                    <div className="flex items-center justify-between min-w-[760px] relative px-2">
                      <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
                      {loanStagesList.map((stg, idx) => {
                        const isPast = idx < currentLoanStageIndex;
                        const isCurrent = idx === currentLoanStageIndex;

                        return (
                          <button
                            key={stg.id}
                            type="button"
                            onClick={() => {
                              setLoanStage(stg.id);
                              setLoanLender(loanCase.lenderName);
                              setLoanRequested(loanCase.amountRequested);
                              setLoanSanctioned(loanCase.sanctionAmount || 3200000);
                              setLoanCounselorNotes(loanCase.counselorNotes || "");
                              setLoanStudentNextStep(loanCase.studentNextStep || "");
                              setUpdateLoanModal(true);
                            }}
                            className="flex flex-col items-center relative z-10 text-center px-1 group cursor-pointer focus:outline-hidden"
                            title={`Click to set loan stage to ${stg.label}`}
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-xs transition-all group-hover:scale-110 ${
                                isPast
                                  ? "bg-gvk-success text-white"
                                  : isCurrent
                                  ? "bg-gvk-navy text-white ring-gvk-navy/20 font-black scale-110 animate-pulse"
                                  : "bg-white text-slate-400 border-2 border-slate-200 group-hover:border-gvk-navy group-hover:text-gvk-navy"
                              }`}
                            >
                              {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span
                              className={`text-[10px] font-bold mt-2 max-w-[70px] leading-tight transition-colors ${
                                isCurrent
                                  ? "text-gvk-navy font-black"
                                  : isPast
                                  ? "text-gvk-navy"
                                  : "text-gvk-text-muted group-hover:text-gvk-navy"
                              }`}
                            >
                              {stg.label}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.2 rounded bg-gvk-navy text-white mt-1">
                                Active
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4 Loan Phases Grouping */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-3 border-t border-slate-200">
                    <div className={`p-2.5 rounded-xl border text-[11px] ${
                      currentLoanStageIndex >= 1 ? "bg-emerald-50/70 border-emerald-200 text-emerald-900" : currentLoanStageIndex >= 0 ? "bg-indigo-50/70 border-indigo-200 text-indigo-900 font-bold" : "bg-white border-slate-200 text-slate-500"
                    }`}>
                      <span className="block font-bold">1. Onboarding & KYC</span>
                      <span className="text-[10px] text-slate-600 block mt-0.5">Bank selection & profile filing</span>
                    </div>
                    <div className={`p-2.5 rounded-xl border text-[11px] ${
                      currentLoanStageIndex >= 3 ? "bg-emerald-50/70 border-emerald-200 text-emerald-900" : currentLoanStageIndex >= 2 ? "bg-indigo-50/70 border-indigo-200 text-indigo-900 font-bold" : "bg-white border-slate-200 text-slate-500"
                    }`}>
                      <span className="block font-bold">2. Underwriting</span>
                      <span className="text-[10px] text-slate-600 block mt-0.5">File login & credit call</span>
                    </div>
                    <div className={`p-2.5 rounded-xl border text-[11px] ${
                      currentLoanStageIndex >= 7 ? "bg-emerald-50/70 border-emerald-200 text-emerald-900" : currentLoanStageIndex >= 4 ? "bg-indigo-50/70 border-indigo-200 text-indigo-900 font-bold" : "bg-white border-slate-200 text-slate-500"
                    }`}>
                      <span className="block font-bold">3. Verification & Sanction</span>
                      <span className="text-[10px] text-slate-600 block mt-0.5">Physical audit & sanction letter</span>
                    </div>
                    <div className={`p-2.5 rounded-xl border text-[11px] ${
                      currentLoanStageIndex >= 9 ? "bg-emerald-50/70 border-emerald-200 text-emerald-900" : currentLoanStageIndex >= 8 ? "bg-indigo-50/70 border-indigo-200 text-indigo-900 font-bold" : "bg-white border-slate-200 text-slate-500"
                    }`}>
                      <span className="block font-bold">4. Tuition Disbursal</span>
                      <span className="text-[10px] text-slate-600 block mt-0.5">Wire remittance to university</span>
                    </div>
                  </div>
                </div>

                {/* 4 Vitals Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-gvk-text-secondary block">Lender Name</span>
                    <strong className="text-gvk-navy text-sm">{loanCase.lenderName}</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200">
                    <span className="text-amber-800 text-[11px] font-bold block">Current Stage</span>
                    <strong className="text-gvk-navy uppercase font-mono text-sm">{loanCase.stage.replace(/_/g, " ")}</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-gvk-text-secondary block">Requested Amount</span>
                    <strong className="text-gvk-navy font-mono text-sm">₹{loanCase.amountRequested.toLocaleString()}</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-gvk-text-secondary block">Sanctioned Amount</span>
                    <strong className="text-emerald-700 font-mono text-sm">
                      {loanCase.sanctionAmount ? `₹${loanCase.sanctionAmount.toLocaleString()}` : "Pending Sanction"}
                    </strong>
                  </div>
                </div>

                {loanCase.studentNextStep && (
                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
                    <strong className="text-blue-900 font-bold block">Action Guidance for Candidate:</strong>
                    <p className="text-blue-800">{loanCase.studentNextStep}</p>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <strong className="text-gvk-navy font-bold block">Counselor Case Notes:</strong>
                  <p className="text-gvk-text-secondary">{loanCase.counselorNotes || "No notes recorded yet."}</p>
                </div>
              </div>
            );
          })() : (
            <div className="p-8 sm:p-10 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-300 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-slate-200 text-gvk-navy flex items-center justify-center shadow-xs">
                <Banknote className="w-7 h-7 text-gvk-navy" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base font-bold text-gvk-navy">
                  Education Loan Process Not Started for {student.firstName} {student.lastName}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  As the assigned counselor, you initiate the loan application and update each and every step of the 10-stage banking pipeline for the candidate. Once you initiate a file, the student will see your updates, notes, and action guidance in real time.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Button
                  onClick={() => {
                    setLoanStage("bank_selected");
                    setLoanLender("HDFC Credila");
                    setLoanRequested(3500000);
                    setLoanSanctioned(0);
                    setLoanCounselorNotes("Initiated loan application with HDFC Credila based on UK Masters intake.");
                    setLoanStudentNextStep("Review shortlisted bank details and assemble KYC documents.");
                    setUpdateLoanModal(true);
                  }}
                  size="sm"
                  className="font-bold text-xs bg-gvk-navy hover:bg-gvk-navy-800 text-white shadow-xs flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Initiate Loan at Step 1 (Bank Selected)</span>
                </Button>
              </div>

              {/* 3 Quick-Launch Presets */}
              <div className="pt-4 border-t border-slate-200/80 max-w-lg mx-auto">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                  1-Click Quick Launch with Partner Banks
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      dataStore.updateLoanCase(
                        studentId,
                        "bank_selected",
                        "HDFC Credila",
                        4000000,
                        0,
                        "Selected HDFC Credila as preferred overseas loan partner.",
                        "Gather co-borrower 3 years ITR and 6-month salary bank statements.",
                        counselorId
                      );
                      setLoanCase(dataStore.getStudentLoanCase(studentId));
                      setActivityLogs(dataStore.getActivityLogs(studentId));
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-gvk-navy text-left transition-colors text-[11px]"
                  >
                    <strong className="text-gvk-navy block">HDFC Credila</strong>
                    <span className="text-[10px] text-slate-500">₹40 Lakhs • NBFC</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      dataStore.updateLoanCase(
                        studentId,
                        "bank_selected",
                        "SBI Global Ed-Vantage",
                        4500000,
                        0,
                        "Initiated file with SBI Ed-Vantage desk for sovereign rate concession.",
                        "Prepare property title deeds or collateral documents for bank inspection.",
                        counselorId
                      );
                      setLoanCase(dataStore.getStudentLoanCase(studentId));
                      setActivityLogs(dataStore.getActivityLogs(studentId));
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-gvk-navy text-left transition-colors text-[11px]"
                  >
                    <strong className="text-gvk-navy block">SBI Ed-Vantage</strong>
                    <span className="text-[10px] text-slate-500">₹45 Lakhs • PSU Bank</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      dataStore.updateLoanCase(
                        studentId,
                        "bank_selected",
                        "ICICI Bank",
                        3500000,
                        0,
                        "Selected ICICI Bank for fast unsecured overseas education loan.",
                        "Upload applicant PAN & Aadhaar and B.Tech marksheet.",
                        counselorId
                      );
                      setLoanCase(dataStore.getStudentLoanCase(studentId));
                      setActivityLogs(dataStore.getActivityLogs(studentId));
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-gvk-navy text-left transition-colors text-[11px]"
                  >
                    <strong className="text-gvk-navy block">ICICI Bank</strong>
                    <span className="text-[10px] text-slate-500">₹35 Lakhs • Unsecured</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 10: COMMUNICATION & INTERNAL NOTES */}
      {activeTab === "communication" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Public Communication Thread with Student */}
          <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-4 text-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-gvk-navy flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gvk-navy" />
                  <span>Chat with Student ({student.firstName})</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Synchronized
                </span>
              </div>
              <p className="text-gvk-text-secondary mb-3">
                Live communication channel with {student.firstName}. Synchronizes with Student Counselor Desk and Counselor Communications Inbox.
              </p>

              {/* Chat messages viewport */}
              <div ref={chatContainerRef} className="space-y-3 max-h-[360px] min-h-[220px] overflow-y-auto p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 mb-4">
                {messages.length > 0 ? (
                  messages.map((m) => {
                    const isCounselor = m.senderRole === "counselor";
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isCounselor ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-gvk-text-muted">
                          <span className="font-bold text-gvk-navy">{m.senderName}</span>
                          <span>•</span>
                          <span suppressHydrationWarning>{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <div
                          className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                            isCounselor
                              ? "bg-gvk-navy text-white rounded-tr-xs"
                              : "bg-white text-gvk-text-primary border border-gvk-border rounded-tl-xs"
                          }`}
                        >
                          {m.content}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center text-gvk-text-muted">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-2.5 text-gvk-navy shadow-xs">
                      <MessageSquare className="w-6 h-6 text-gvk-navy" />
                    </div>
                    <p className="font-bold text-gvk-navy text-sm">No Messages in Thread Yet</p>
                    <p className="text-xs text-gvk-text-secondary max-w-sm mx-auto mt-1 leading-relaxed">
                      Neither you nor {student.firstName} have sent a message. Type a message below to initiate the counseling dialogue.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2 border-t border-gvk-border">
              <Input
                type="text"
                placeholder={`Type a message to ${student.firstName}...`}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 text-xs"
                required
              />
              <Button type="submit" size="sm" className="font-bold flex items-center gap-1.5 shrink-0 bg-gvk-navy hover:bg-gvk-navy-dark text-white">
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </Button>
            </form>
          </div>

          {/* Strictly Private Counselor Notes */}
          <div className="bg-white rounded-2xl border-2 border-purple-200 bg-purple-50/20 p-6 shadow-card space-y-4 text-xs">
            <div className="flex items-center gap-2 text-purple-900 font-bold">
              <Lock className="w-4 h-4 text-purple-700" />
              <h3 className="text-base">Counselor Internal Notes (Zero Student Visibility)</h3>
            </div>
            <p className="text-purple-800">
              Internal risk assessment and private observations strictly blocked from student access via Row-Level Security.
            </p>

            <form onSubmit={handleAddInternalNote} className="space-y-2">
              <textarea
                rows={3}
                placeholder="Add confidential internal note..."
                value={newInternalNote}
                onChange={(e) => setNewInternalNote(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-purple-200 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white"
                required
              />
              <Button type="submit" size="sm" className="font-bold bg-purple-700 hover:bg-purple-800">
                Save Confidential Note
              </Button>
            </form>

            <div className="space-y-2 pt-2 max-h-[300px] overflow-y-auto">
              {internalNotes.map((note) => (
                <div key={note.id} className="p-3 rounded-lg bg-white border border-purple-200 text-purple-950">
                  <span className="text-[10px] text-purple-600 font-mono block mb-1">
                    {new Date(note.createdAt).toLocaleString()}
                  </span>
                  <p className="leading-relaxed">{note.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 11: ACTIVITY HISTORY (IMMUTABLE AUDIT TRAIL ACROSS ALL USERS) */}
      {activeTab === "activity" && (() => {
        const filteredLogs = activityLogs.filter((log) => {
          const matchesRole = activityRoleFilter === "all" || log.role === activityRoleFilter;
          const searchLower = activitySearchQuery.toLowerCase();
          const matchesSearch =
            !activitySearchQuery ||
            log.action.toLowerCase().includes(searchLower) ||
            (log.title && log.title.toLowerCase().includes(searchLower)) ||
            (log.description && log.description.toLowerCase().includes(searchLower)) ||
            (log.userName && log.userName.toLowerCase().includes(searchLower)) ||
            log.entityType.toLowerCase().includes(searchLower);
          return matchesRole && matchesSearch;
        });

        const studentActionsCount = activityLogs.filter((l) => l.role === "student").length;
        const counselorActionsCount = activityLogs.filter((l) => l.role === "counselor").length;
        const adminActionsCount = activityLogs.filter((l) => l.role === "admin").length;

        return (
          <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-5 animate-fade-in text-xs">
            {/* Header & Real-time Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gvk-border">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gvk-navy flex items-center gap-2">
                    <History className="w-4 h-4 text-gvk-navy" />
                    <span>Real-Time User Activity Audit Stream ({activityLogs.length})</span>
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Sync Active
                  </span>
                </div>
                <p className="text-xs text-gvk-text-secondary mt-0.5">
                  Every activity of every user (Student, Counselor, Admin) is permanently logged here with timestamps and actor credentials.
                </p>
              </div>
              <span className="text-[10px] uppercase font-mono font-bold text-gvk-text-muted bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 self-start sm:self-center">
                Append-Only Audit Log
              </span>
            </div>

            {/* Filter Pills and Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActivityRoleFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activityRoleFilter === "all"
                      ? "bg-gvk-navy text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All Activities ({activityLogs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActivityRoleFilter("student")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activityRoleFilter === "student"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Student Actions ({studentActionsCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivityRoleFilter("counselor")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activityRoleFilter === "counselor"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Counselor Actions ({counselorActionsCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivityRoleFilter("admin")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activityRoleFilter === "admin"
                      ? "bg-purple-600 text-white shadow-xs"
                      : "bg-purple-50 text-purple-800 hover:bg-purple-100"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Actions ({adminActionsCount})</span>
                </button>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-gvk-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter activities..."
                  value={activitySearchQuery}
                  onChange={(e) => setActivitySearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gvk-border bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-gvk-navy"
                />
              </div>
            </div>

            {/* Activities List */}
            <div className="space-y-3">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const isStudent = log.role === "student";
                  const isCounselor = log.role === "counselor";
                  const isAdmin = log.role === "admin";

                  return (
                    <div
                      key={log.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                        isStudent
                          ? "bg-blue-50/20 border-blue-200/80 hover:border-blue-300"
                          : isCounselor
                          ? "bg-emerald-50/20 border-emerald-200/80 hover:border-emerald-300"
                          : "bg-purple-50/20 border-purple-200/80 hover:border-purple-300"
                      }`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                              isStudent
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : isCounselor
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-purple-100 text-purple-800 border border-purple-200"
                            }`}
                          >
                            {isStudent && <User className="w-3 h-3" />}
                            {isCounselor && <ShieldCheck className="w-3 h-3" />}
                            {isAdmin && <Lock className="w-3 h-3" />}
                            <span>{log.role}</span>
                          </span>

                          <strong className="text-gvk-navy font-bold text-xs">
                            {log.userName || (isStudent ? `${student.firstName} ${student.lastName} (Student)` : isCounselor ? "Priya Varma (Counselor)" : "GVK Admin Team")}
                          </strong>

                          <span className="font-mono text-[10px] text-gvk-text-muted px-1.5 py-0.5 rounded bg-slate-100">
                            {log.action}
                          </span>
                        </div>

                        <strong className="text-sm font-bold text-gvk-navy block">
                          {log.title || log.action.replace(/_/g, " ")}
                        </strong>

                        {log.description && (
                          <p className="text-gvk-text-secondary text-xs leading-relaxed">
                            {log.description}
                          </p>
                        )}

                        {log.context && typeof log.context === "object" && (
                          <div className="pt-1 flex flex-wrap gap-1.5 text-[11px] text-slate-600 font-mono">
                            {Object.entries(log.context).map(([k, v]) => (
                              <span key={k} className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                                {k}: {String(v)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center sm:flex-col sm:items-end gap-1 text-[11px] text-gvk-text-muted font-mono">
                        <span suppressHydrationWarning className="font-semibold text-gvk-navy">
                          {new Date(log.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        <span suppressHydrationWarning>
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-gvk-text-secondary bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <History className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p className="font-semibold">No activities found matching this filter.</p>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* MODAL 0: COUNSELOR CREATE APPLICATION (Zero-Autofill Cascading Selector) */}
      {createAppModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-gvk-border shadow-2xl p-6 sm:p-7 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-gvk-border mb-4">
              <div>
                <h3 className="text-lg font-bold text-gvk-navy">
                  Add University Application for {student.firstName}
                </h3>
                <p className="text-xs text-gvk-text-secondary mt-0.5">
                  Select destination, institution, course and intake — details and benchmarks populate automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateAppModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="space-y-4 text-xs">
              {/* Step 1: Destination Country */}
              <div>
                <label className="block font-bold text-gvk-navy mb-1.5 flex items-center justify-between">
                  <span>1. Destination Country *</span>
                  {selectedCountry && (
                    <span className="text-[11px] font-normal text-slate-500">
                      {universitiesForCountry.length} universities available
                    </span>
                  )}
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white text-slate-800"
                >
                  <option value="">-- Select Destination Country --</option>
                  {destinationCountries.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.flag} {c.name} ({c.currency})
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Target University (Typeahead Combobox) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-gvk-navy">
                    2. Target University *
                  </label>
                  {selectedCountry && (
                    <span className="text-[10px] font-medium text-slate-400">
                      Type to filter from {universitiesForCountry.length} universities
                    </span>
                  )}
                </div>
                <UniversityCombobox
                  universities={universitiesForCountry}
                  value={selectedUniversity}
                  onChange={(uniName) => handleUniversityChange(uniName)}
                  disabled={!selectedCountry}
                  disabledPlaceholder="-- Select Country First --"
                  placeholder="🔍 Type university name (e.g. Manchester, Oxford, Heriot)..."
                  required
                />
              </div>

              {/* Automatic Institutional Details Card */}
              {activeUni && (
                <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-2.5 animate-fade-in">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UniversityBadge name={activeUni.name} country={activeUni.country} size="sm" showCountryFlag />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 leading-tight">{activeUni.name}</div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                          {activeUni.city || "Campus"}, {activeUni.country}
                        </div>
                      </div>
                    </div>
                    {activeUni.qsRankDisplay && (
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold border border-blue-200 text-[10px] shrink-0 font-mono">
                        QS {activeUni.qsRankDisplay}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-indigo-100 text-[11px]">
                    <div className="bg-white p-2 rounded-lg border border-indigo-100">
                      <span className="text-[10px] text-slate-400 block font-medium">World Ranking</span>
                      <strong className="text-slate-800 font-mono text-[11px]">
                        {activeUni.qsRankDisplay || `#${activeUni.ranking}`}
                      </strong>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-indigo-100">
                      <span className="text-[10px] text-slate-400 block font-medium">IELTS Benchmark</span>
                      <strong className="text-slate-800 text-[11px]">
                        {activeUni.typicalIelts || activeUni.minIelts || "6.5"}
                      </strong>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-indigo-100 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-400 block font-medium">CGPA Requirement</span>
                      <strong className="text-slate-800 text-[11px]">
                        {activeUni.minCgpa ? activeUni.minCgpa.split("(")[0].trim() : "60%"}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Master's Course / Degree Title */}
              <div>
                <label className="block font-bold text-gvk-navy mb-1.5 flex items-center justify-between">
                  <span>3. Course / Degree Title *</span>
                  {activeUni && (
                    <span className="text-[11px] font-normal text-slate-500">
                      {coursesForUniversity.length} programs available
                    </span>
                  )}
                </label>
                <select
                  value={isCustomCourse ? "__custom__" : selectedCourse}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  disabled={!selectedUniversity}
                  required
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white text-slate-800 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">
                    {selectedUniversity ? "-- Select Master's Program --" : "-- Select University First --"}
                  </option>
                  {coursesForUniversity.map((course, idx) => (
                    <option key={idx} value={course}>
                      {course}
                    </option>
                  ))}
                  {selectedUniversity && (
                    <option value="__custom__">➕ Enter Custom Program Title...</option>
                  )}
                </select>

                {isCustomCourse && (
                  <div className="mt-2 animate-fade-in">
                    <Input
                      type="text"
                      placeholder="Type custom master's program name..."
                      value={customCourseTitle}
                      onChange={(e) => setCustomCourseTitle(e.target.value)}
                      required
                      className="text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Step 4: Target Intake & Tuition Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gvk-navy mb-1.5">
                    4. Target Intake *
                  </label>
                  <select
                    value={selectedIntake}
                    onChange={(e) => setSelectedIntake(e.target.value)}
                    disabled={!selectedUniversity}
                    required
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white text-slate-800 disabled:bg-slate-100 disabled:text-slate-400"
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
                  <label className="block font-bold text-gvk-navy mb-1.5 flex items-center justify-between">
                    <span>Tuition Fee ({currencySymbol}) *</span>
                    {activeUni && (
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-bold">
                        Auto-loaded
                      </span>
                    )}
                  </label>
                  <Input
                    type="number"
                    value={newFee}
                    onChange={(e) => setNewFee(e.target.value)}
                    placeholder={activeUni ? "Auto-detected fee" : "e.g. 25000"}
                    required
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCreateAppModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={
                    !selectedCountry ||
                    !selectedUniversity ||
                    (!selectedCourse && !customCourseTitle.trim()) ||
                    !selectedIntake
                  }
                  className="bg-[#253775] hover:bg-[#1a2754] text-white font-bold disabled:opacity-50"
                >
                  Create Application
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: UPDATE APPLICATION STATUS & OFFER LETTER DESK */}
      {appStatusModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-gvk-border shadow-2xl p-6 sm:p-7 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-gvk-border mb-4">
              <div>
                <h3 className="text-lg font-bold text-gvk-navy">
                  Application Status & University Offer Desk
                </h3>
                <p className="text-xs text-gvk-text-secondary mt-0.5">
                  {appStatusModal.universityName} • {appStatusModal.courseName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAppStatusModal(null);
                  setOfferLetterFile(null);
                }}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAppStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">
                  Admissions Status Decision
                </label>
                <select
                  value={newStatusValue}
                  onChange={(e) => setNewStatusValue(e.target.value as ApplicationStatus)}
                  className="w-full h-11 px-3 rounded-xl border border-gvk-border bg-white font-semibold text-gvk-navy focus:ring-2 focus:ring-gvk-navy focus:outline-none"
                >
                  <option value="under_review">Under Review — Application Evaluated by University</option>
                  <option value="conditional_offer">🎉 University Accepted — Issue Conditional Offer Letter</option>
                  <option value="unconditional_offer">⭐ Unconditional Offer — All Academic Conditions Met</option>
                  <option value="rejected">❌ University Rejected Application</option>
                  <option value="deposit_paid">Deposit Paid to University</option>
                  <option value="cas_received">CAS Confirmation of Acceptance Received</option>
                  <option value="visa_processing">UKVI Visa Processing</option>
                  <option value="completed">Enrollment Completed</option>
                </select>
              </div>

              {/* CONDITIONAL / UNCONDITIONAL OFFER UPLOAD & CONDITIONS SECTION */}
              {(newStatusValue === "conditional_offer" || newStatusValue === "unconditional_offer") && (
                <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-300 space-y-3.5 animate-fade-in">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-emerald-950 font-bold block text-xs">
                        Official University Offer Transmission
                      </strong>
                      <p className="text-[11px] text-emerald-800 leading-relaxed mt-0.5">
                        Universities transmit offer letters directly to counselors via official portals. Upload the PDF and enter requirements below so the candidate can download the letter and decide on single-destination commitment.
                      </p>
                    </div>
                  </div>

                  {/* Local File Upload Input */}
                  <div>
                    <label className="block font-bold text-emerald-950 mb-1">
                      Upload Official Offer Letter Document (.pdf, .docx)
                    </label>
                    <div className="relative border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl p-3 bg-white text-center transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setOfferLetterFile(file);
                            setOfferLetterFileName(file.name);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center justify-center gap-1 pointer-events-none">
                        <Upload className="w-5 h-5 text-emerald-600" />
                        <span className="font-bold text-emerald-950 text-xs">
                          {offerLetterFile ? (
                            <span className="text-emerald-700 flex items-center gap-1 justify-center">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Selected: {offerLetterFile.name} ({(offerLetterFile.size / 1024).toFixed(0)} KB)
                            </span>
                          ) : offerLetterFileName ? (
                            <span>Currently Attached: <strong className="font-mono text-emerald-900">{offerLetterFileName}</strong> (click to replace)</span>
                          ) : (
                            <span>Click or Drag & Drop local file to upload from your computer</span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-500">Supports PDF, DOCX up to 15MB</span>
                      </div>
                    </div>
                  </div>

                  {/* Offer Conditions */}
                  <div>
                    <label className="block font-bold text-emerald-950 mb-1">
                      Admission Conditions Checklist (Sent by University)
                    </label>
                    <textarea
                      rows={3}
                      value={offerConditions}
                      onChange={(e) => setOfferConditions(e.target.value)}
                      placeholder="e.g. 1. Minimum 65% in B.Tech final semester. 2. Submit consolidated marksheet. 3. Pay £2,000 seat deposit by 15 Dec."
                      className="w-full p-2.5 rounded-lg border border-emerald-300 bg-white text-emerald-950 text-xs focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Financial Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-emerald-950 mb-1">Required Deposit (£)</label>
                      <Input
                        type="number"
                        value={offerDeposit}
                        onChange={(e) => setOfferDeposit(Number(e.target.value))}
                        className="bg-white border-emerald-300 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-emerald-950 mb-1">Deposit Deadline</label>
                      <Input
                        type="date"
                        value={offerDeadline}
                        onChange={(e) => setOfferDeadline(e.target.value)}
                        className="bg-white border-emerald-300 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* REJECTION SECTION */}
              {newStatusValue === "rejected" && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-950 text-xs space-y-1.5 animate-fade-in">
                  <div className="flex items-center gap-1.5 font-bold text-red-900">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span>Application Unsuccessful Notice</span>
                  </div>
                  <p className="text-red-800 text-[11px] leading-relaxed">
                    Under overseas guidelines, universities reject profiles when department quotas are filled or academic cutoffs are not met. The candidate will be notified to focus on their remaining active or offered universities.
                  </p>
                </div>
              )}

              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">
                  Counselor Guidance & Instructions to Student
                </label>
                <textarea
                  rows={3}
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  placeholder="Official counselor notes and next action instructions (instantly visible on student portal)..."
                  className="w-full p-2.5 rounded-xl border border-gvk-border bg-white text-xs focus:ring-2 focus:ring-gvk-navy"
                  required
                />
              </div>

              <div className="pt-3 border-t border-gvk-border flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAppStatusModal(null);
                    setOfferLetterFile(null);
                  }}
                  className="font-semibold text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isUpdatingApp}
                  className="font-bold text-xs bg-gvk-navy hover:bg-gvk-navy-800 text-white shadow-xs disabled:opacity-50"
                >
                  {isUpdatingApp ? "Uploading & Publishing..." : "Save & Publish Update"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REVIEW DOCUMENT */}
      {reviewDocModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gvk-border shadow-2xl p-6">
            <h3 className="text-lg font-bold text-gvk-navy mb-1">
              Review Document: {reviewDocModal.title}
            </h3>
            <p className="text-xs text-gvk-text-secondary mb-3">
              File: {reviewDocModal.fileName} (v{reviewDocModal.latestVersion})
            </p>

            {/* Direct Document Download Action */}
            <div className="p-3.5 mb-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0">
                <span className="font-mono text-gvk-navy font-bold block truncate">
                  📄 {reviewDocModal.fileName}
                </span>
                <span className="text-[11px] text-gvk-text-muted">
                  Version: v{reviewDocModal.latestVersion} • Authenticated PDF file
                </span>
              </div>
              <a
                href={`/api/documents/download?id=${reviewDocModal.id}&studentId=${studentId}`}
                download
                className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gvk-navy text-white text-xs font-bold hover:bg-gvk-navy-800 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </div>

            <form onSubmit={handleReviewDocument} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Verification Decision</label>
                <select
                  value={reviewDecision}
                  onChange={(e) => setReviewDecision(e.target.value as any)}
                  className="w-full h-11 px-3 rounded-lg border border-gvk-border bg-white font-medium"
                >
                  <option value="verified">✅ Verified & Approved</option>
                  <option value="resubmission_required">⚠️ Request Resubmission</option>
                  <option value="rejected">❌ Reject Document</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Counselor Feedback Comments</label>
                <textarea
                  rows={3}
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Detail any corrections or verification notes..."
                  className="w-full p-2.5 rounded-lg border border-gvk-border"
                />
              </div>

              <div className="pt-3 border-t border-gvk-border flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setReviewDocModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="font-bold">
                  Submit Decision
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SCHEDULE MOCK INTERVIEW */}
      {scheduleInterviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gvk-border shadow-2xl p-6">
            <h3 className="text-lg font-bold text-gvk-navy mb-1">
              Schedule Mock Admissions Interview
            </h3>
            <p className="text-xs text-gvk-text-secondary mb-4">
              Student: {student.firstName} {student.lastName}
            </p>

            <form onSubmit={handleScheduleInterview} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Session Title</label>
                <Input
                  type="text"
                  value={interviewTitle}
                  onChange={(e) => setInterviewTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Scheduled Date & Time</label>
                <Input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-gvk-text-primary">Verified Zoom Meeting URL</label>
                  <button
                    type="button"
                    onClick={() => {
                      setInterviewZoomUrl("https://zoom.us/test");
                    }}
                    className="text-xs text-blue-700 font-bold flex items-center gap-1 hover:underline"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Use Active Zoom Room</span>
                  </button>
                </div>
                <Input
                  type="url"
                  value={interviewZoomUrl}
                  onChange={(e) => setInterviewZoomUrl(e.target.value)}
                  placeholder="https://zoom.us/test or https://zoom.us/j/..."
                  required
                />
                <span className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>Verified active Zoom room link (connects to Zoom client without expiring).</span>
                </span>
              </div>

              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Instructions for Student</label>
                <textarea
                  rows={2}
                  value={interviewInstructions}
                  onChange={(e) => setInterviewInstructions(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gvk-border"
                />
              </div>

              <div className="pt-3 border-t border-gvk-border flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setScheduleInterviewModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="font-bold">
                  Schedule & Notify Student
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EVALUATE INTERVIEW (PASS / FAIL) */}
      {evaluateInterviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-gvk-border shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gvk-navy mb-1">
              Submit Mock Interview Evaluation
            </h3>
            <p className="text-xs text-gvk-text-secondary mb-4">
              {evaluateInterviewModal.title}
            </p>

            <form onSubmit={handleEvaluateInterview} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Assessment Outcome</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEvalOutcome("PASS")}
                    className={`py-3 rounded-xl font-black text-sm border-2 transition-all ${
                      evalOutcome === "PASS"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 text-slate-500"
                    }`}
                  >
                    ✅ PASS (Ready)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvalOutcome("FAIL")}
                    className={`py-3 rounded-xl font-black text-sm border-2 transition-all ${
                      evalOutcome === "FAIL"
                        ? "border-gvk-red bg-red-50 text-gvk-red"
                        : "border-slate-200 text-slate-500"
                    }`}
                  >
                    ❌ FAIL (Needs Retake)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gvk-text-primary mb-1">Comm (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={evalScoreComm}
                    onChange={(e) => setEvalScoreComm(Number(e.target.value))}
                    className="w-full h-10 px-2 rounded border border-gvk-border text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gvk-text-primary mb-1">Acad (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={evalScoreAcad}
                    onChange={(e) => setEvalScoreAcad(Number(e.target.value))}
                    className="w-full h-10 px-2 rounded border border-gvk-border text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gvk-text-primary mb-1">Visa (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={evalScoreVisa}
                    onChange={(e) => setEvalScoreVisa(Number(e.target.value))}
                    className="w-full h-10 px-2 rounded border border-gvk-border text-center font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Key Strengths</label>
                <textarea
                  rows={2}
                  value={evalStrengths}
                  onChange={(e) => setEvalStrengths(e.target.value)}
                  className="w-full p-2 rounded border border-gvk-border"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Areas for Improvement</label>
                <textarea
                  rows={2}
                  value={evalImprovements}
                  onChange={(e) => setEvalImprovements(e.target.value)}
                  className="w-full p-2 rounded border border-gvk-border"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Student Visible Feedback Summary</label>
                <textarea
                  rows={2}
                  value={evalStudentFeedback}
                  onChange={(e) => setEvalStudentFeedback(e.target.value)}
                  className="w-full p-2 rounded border border-gvk-border"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-purple-900 mb-1">🔒 Confidential Counselor Private Note</label>
                <textarea
                  rows={2}
                  value={evalPrivateNote}
                  onChange={(e) => setEvalPrivateNote(e.target.value)}
                  placeholder="Hidden from student..."
                  className="w-full p-2 rounded border border-purple-200 bg-purple-50/30"
                />
              </div>

              <div className="pt-3 border-t border-gvk-border flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEvaluateInterviewModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="font-bold">
                  Save Evaluation & Notify Student
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: ASSIGN TASK */}
      {createTaskModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gvk-border shadow-2xl p-6">
            <h3 className="text-lg font-bold text-gvk-navy mb-1">
              Assign New Task
            </h3>
            <p className="text-xs text-gvk-text-secondary mb-4">
              Student: {student.firstName} {student.lastName}
            </p>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Task Title</label>
                <Input
                  type="text"
                  placeholder="e.g. Upload updated Birmingham resume"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Due Date</label>
                <Input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                  className="w-full h-10 px-3 rounded border border-gvk-border bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Detailed Instructions</label>
                <textarea
                  rows={3}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Specific requirements for this deliverable..."
                  className="w-full p-2.5 rounded-lg border border-gvk-border"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="internalCheck"
                  checked={taskIsInternal}
                  onChange={(e) => setTaskIsInternal(e.target.checked)}
                  className="w-4 h-4 rounded text-gvk-navy"
                />
                <label htmlFor="internalCheck" className="text-xs font-semibold text-gvk-text-secondary">
                  Counselor internal reminder (Hidden from student)
                </label>
              </div>

              <div className="pt-3 border-t border-gvk-border flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setCreateTaskModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="font-bold">
                  Assign Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: UPDATE EDUCATION LOAN STAGE */}
      {updateLoanModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-gvk-border shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gvk-navy mb-1">
              Update Education Loan Stage
            </h3>
            <p className="text-xs text-gvk-text-secondary mb-4">
              Student: {student.firstName} {student.lastName} ({student.studentIdCode})
            </p>

            <form onSubmit={handleUpdateLoan} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Loan Process Stage (11 Steps)</label>
                <select
                  value={loanStage}
                  onChange={(e) => setLoanStage(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-gvk-border bg-white font-medium"
                >
                  <option value="not_started">0. Process Not Started (Reset File)</option>
                  <option value="bank_selected">1. Bank Selected (Initial Selection)</option>
                  <option value="info_submitted">2. Info Submitted (Candidate Details Entered)</option>
                  <option value="bank_login">3. Bank File Login (Application Lodged with Lender)</option>
                  <option value="credit_call">4. Credit Call (Lender Verification Call Completed)</option>
                  <option value="doc_verification">5. Doc Verification (Financial Documents Authenticated)</option>
                  <option value="physical_verification">6. Physical Verification (Property / Residence Checked)</option>
                  <option value="approved">7. Sanction Approved (Credit Committee Passed)</option>
                  <option value="sanction_letter">8. Sanction Letter Issued (Official Letter Generated)</option>
                  <option value="disbursement_pending">9. Disbursement Pending (Pre-Disbursement Audit)</option>
                  <option value="disbursed">10. Disbursed (Tuition Transferred to University)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Lender / Partner Bank Name</label>
                <Input
                  type="text"
                  placeholder="e.g. HDFC Credila, Avanse, Auxilo, SBI, InCred"
                  value={loanLender}
                  onChange={(e) => setLoanLender(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gvk-text-primary mb-1">Requested Amount (₹)</label>
                  <Input
                    type="number"
                    value={loanRequested}
                    onChange={(e) => setLoanRequested(Number(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gvk-text-primary mb-1">Sanctioned Amount (₹)</label>
                  <Input
                    type="number"
                    value={loanSanctioned}
                    onChange={(e) => setLoanSanctioned(Number(e.target.value))}
                    placeholder="If approved..."
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Counselor Case Notes (Internal Tracking)</label>
                <textarea
                  rows={2}
                  value={loanCounselorNotes}
                  onChange={(e) => setLoanCounselorNotes(e.target.value)}
                  placeholder="e.g. Branch manager follow-up conducted on Nov 15..."
                  className="w-full p-2.5 rounded-lg border border-gvk-border"
                />
              </div>

              <div>
                <label className="block font-bold text-blue-900 mb-1">Candidate Next Action (Visible in Student Portal)</label>
                <textarea
                  rows={2}
                  value={loanStudentNextStep}
                  onChange={(e) => setLoanStudentNextStep(e.target.value)}
                  placeholder="e.g. Please keep your 3-year ITR and property tax receipts handy for credit officer call."
                  className="w-full p-2.5 rounded-lg border border-blue-200 bg-blue-50/30"
                />
              </div>

              <div className="pt-3 border-t border-gvk-border flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setUpdateLoanModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="font-bold">
                  Save Stage & Notify Candidate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: EDIT ZOOM LINK */}
      {editInterviewZoomModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gvk-border shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-gvk-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-gvk-navy">Update Zoom Meeting Link</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditInterviewZoomModal(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateInterviewZoom} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Interview Session</label>
                <p className="font-semibold text-gvk-navy bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {editInterviewZoomModal.title}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-gvk-text-primary">Zoom Meeting URL</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditZoomUrl("https://zoom.us/test")}
                      className="text-[11px] text-blue-700 font-bold hover:underline"
                    >
                      Active Room
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setEditZoomUrl("https://zoom.us/start/videomeeting")}
                      className="text-[11px] text-blue-700 font-bold hover:underline"
                    >
                      Start Instant
                    </button>
                  </div>
                </div>
                <Input
                  type="url"
                  value={editZoomUrl}
                  onChange={(e) => setEditZoomUrl(e.target.value)}
                  placeholder="https://zoom.us/test or your personal Zoom URL"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Paste your active personal Zoom meeting link or click "Active Room" to use the permanent non-expiring test room.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gvk-text-primary mb-1">Meeting ID</label>
                  <Input
                    value={editMeetingId}
                    onChange={(e) => setEditMeetingId(e.target.value)}
                    placeholder="984 9012 3456"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gvk-text-primary mb-1">Passcode</label>
                  <Input
                    value={editPasscode}
                    onChange={(e) => setEditPasscode(e.target.value)}
                    placeholder="GVK2026"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Updates automatically sync to the candidate's student portal and send an in-app notification.
                </span>
              </div>

              <div className="pt-3 border-t border-gvk-border flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditInterviewZoomModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="font-bold bg-blue-600 hover:bg-blue-700 text-white">
                  Save & Notify Student
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 8: CANCEL INTERVIEW */}
      {cancelInterviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gvk-border shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-gvk-border pb-3 mb-4">
              <div className="flex items-center gap-2 text-red-600">
                <CalendarX className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-bold text-gvk-navy">Cancel Scheduled Mock Interview</h3>
              </div>
              <button
                type="button"
                onClick={() => setCancelInterviewModal(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCancelInterviewSession} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="font-bold text-gvk-navy text-sm">
                  {cancelInterviewModal.title}
                </p>
                <p className="text-gvk-text-secondary">
                  Student: <strong>{student.firstName} {student.lastName}</strong> • Date: {new Date(cancelInterviewModal.scheduledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>

              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">
                  Reason for Cancellation (Delivered to Student)
                </label>
                <textarea
                  rows={3}
                  value={cancelInterviewReason}
                  onChange={(e) => setCancelInterviewReason(e.target.value)}
                  placeholder="e.g. Schedule conflict, student requested postponement, SOP review pending..."
                  className="w-full p-2.5 rounded-lg border border-gvk-border focus:border-red-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  This will mark the interview as Cancelled and send an immediate in-app notification to the candidate with your cancellation reason.
                </span>
              </div>

              <div className="pt-3 border-t border-gvk-border flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setCancelInterviewModal(null)}>
                  Keep Interview
                </Button>
                <Button type="submit" size="sm" className="font-bold bg-red-600 hover:bg-red-700 text-white shadow-md">
                  Confirm Cancellation
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
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
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
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    Candidate: <strong className="text-slate-800 font-semibold">{student?.firstName} {student?.lastName}</strong>
                  </div>
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

      {/* Floating Quick Chat Action Button (Easy access from any tab) */}
      {activeTab !== "communication" && (
        <button
          type="button"
          onClick={() => {
            setActiveTab("communication");
            window.scrollTo({ top: 300, behavior: "smooth" });
          }}
          className="fixed bottom-6 right-6 z-40 bg-gvk-navy hover:bg-gvk-navy-dark text-white font-bold text-xs py-3 px-4 rounded-full shadow-elevated flex items-center gap-2.5 border-2 border-white transition-all hover:scale-105 group cursor-pointer"
          aria-label={`Chat with ${student.firstName}`}
          title={`Chat with ${student.firstName}`}
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4 text-white" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <span>Chat with {student.firstName}</span>
        </button>
      )}
    </div>
  );
}
