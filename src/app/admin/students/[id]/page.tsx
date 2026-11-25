"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { dataStore } from "@/lib/data/store";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminModal } from "@/components/admin/AdminModal";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UniversityBadge } from "@/components/shared/UniversityLogo";
import { UniversityCombobox } from "@/components/shared/UniversityCombobox";
import { ALL_GLOBAL_UNIVERSITIES } from "@/lib/data/universities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  ShieldCheck,
  CheckCircle2,
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
  Edit3,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  XCircle,
  Calendar,
  ArrowRight,
  UserCheck,
  Key,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Trash2,
} from "lucide-react";
import { ApplicationStatus, JourneyStageStatus, MockInterviewOutcome, TaskPriority } from "@/types/database.types";

const tabList = [
  { id: "overview", label: "1. Overview", icon: User },
  { id: "personal", label: "2. Personal Details", icon: User },
  { id: "academic", label: "3. Academic Profile", icon: GraduationCap },
  { id: "applications", label: "4. Applications", icon: GraduationCap },
  { id: "documents", label: "5. Documents", icon: FolderLock },
  { id: "journey", label: "6. Student Journey", icon: Compass },
  { id: "tasks", label: "7. Tasks", icon: CheckSquare },
  { id: "interviews", label: "8. Mock Interviews", icon: Video },
  { id: "loan", label: "9. Loan Tracker", icon: Banknote },
  { id: "communication", label: "10. Chat & Internal Notes", icon: MessageSquare },
  { id: "activity", label: "11. Audit History", icon: History },
];

const loanStagesList = [
  { id: "bank_selected", step: 1, label: "Bank Selected" },
  { id: "info_submitted", step: 2, label: "Info Submitted" },
  { id: "bank_login", step: 3, label: "File Login" },
  { id: "credit_call", step: 4, label: "Credit Call" },
  { id: "doc_verification", step: 5, label: "Doc Verification" },
  { id: "physical_verification", step: 6, label: "Physical Check" },
  { id: "approved", step: 7, label: "Sanction Approved" },
  { id: "sanction_letter", step: 8, label: "Sanction Letter" },
  { id: "disbursement_pending", step: 9, label: "Disbursal Pending" },
  { id: "disbursed", step: 10, label: "Tuition Disbursed" },
];

export default function AdminStudentWorkspacePage() {
  const params = useParams();
  const studentId = (params?.id as string) || "usr-student-01";
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const tabParam = searchParams?.get("tab");
    if (tabParam && tabList.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // State from dataStore
  const [student, setStudent] = useState(() => dataStore.getStudentProfile(studentId));
  const [assignedCounselor, setAssignedCounselor] = useState(() => dataStore.getAssignedCounselor(studentId));
  const [allCounselors, setAllCounselors] = useState(() => dataStore.getAllCounselors());
  const [applications, setApplications] = useState(() => dataStore.getStudentApplications(studentId));
  const [documents, setDocuments] = useState(() => dataStore.getStudentDocuments(studentId));
  const [journey, setJourney] = useState(() => dataStore.getStudentJourney(studentId));
  const [tasks, setTasks] = useState(() => dataStore.getStudentTasks(studentId, true));
  const [mockInterviews, setMockInterviews] = useState(() => dataStore.getStudentMockInterviews(studentId));
  const [loanCase, setLoanCase] = useState(() => dataStore.getStudentLoanCase(studentId));
  const [messages, setMessages] = useState(() => dataStore.getMessages(studentId));
  const [internalNotes, setInternalNotes] = useState(() => dataStore.getCounselorInternalNotes(studentId, "admin"));
  const [activityLogs, setActivityLogs] = useState(() => dataStore.getActivityLogs(studentId));

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToChatBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (activeTab === "communication") {
      scrollToChatBottom();
      const t1 = setTimeout(scrollToChatBottom, 50);
      const t2 = setTimeout(scrollToChatBottom, 200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [activeTab, messages.length]);

  // Edit Personal/Academic state
  const [editPersonalForm, setEditPersonalForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    targetDegree: "",
    preferredCountry: "",
    targetIntake: "",
  });

  // Credentials reveal and copy states
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopyText = (text: string, field: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };
  const [editAcademicForm, setEditAcademicForm] = useState({
    ugCollege: "",
    ugCgpa: 8.0,
    ugBacklogs: 0,
    englishTestType: "IELTS",
    englishScore: 7.0,
    greScore: 0,
  });

  // Modals & Application Creator State (NO AUTOFILL)
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedNewCounselorId, setSelectedNewCounselorId] = useState("");
  const [reassignNotes, setReassignNotes] = useState("");

  const [createAppModalOpen, setCreateAppModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [isCustomCourse, setIsCustomCourse] = useState(false);
  const [customCourseTitle, setCustomCourseTitle] = useState("");
  const [selectedIntake, setSelectedIntake] = useState("");
  const [newFee, setNewFee] = useState<number | "">("");

  // Destination countries catalog
  const destinationCountries = [
    { id: "United Kingdom", name: "United Kingdom", flag: "🇬🇧", currency: "GBP", symbol: "£" },
    { id: "USA", name: "USA", flag: "🇺🇸", currency: "USD", symbol: "$" },
    { id: "Australia", name: "Australia", flag: "🇦🇺", currency: "AUD", symbol: "A$" },
    { id: "Canada", name: "Canada", flag: "🇨🇦", currency: "CAD", symbol: "C$" },
    { id: "Germany", name: "Germany", flag: "🇩🇪", currency: "EUR", symbol: "€" },
    { id: "New Zealand", name: "New Zealand", flag: "🇳🇿", currency: "NZD", symbol: "NZ$" },
  ];

  // Check whether prerequisite stages (3: Documents, 4: Shortlisting) are completed
  const stage1 = journey.find((j) => j.stageNumber === 1);
  const stage2 = journey.find((j) => j.stageNumber === 2);
  const stage3 = journey.find((j) => j.stageNumber === 3);
  const stage4 = journey.find((j) => j.stageNumber === 4);
  const arePrerequisitesCompleted =
    stage3?.status === "completed" && stage4?.status === "completed";

  const handleMarkStageOffline = (stageNum: number) => {
    dataStore.markStageOfflineCompleted(studentId, stageNum, "usr-admin-01", "admin");
    setJourney(dataStore.getStudentJourney(studentId));
  };

  const handleMarkAllPrerequisitesOffline = () => {
    dataStore.markPrerequisiteStagesCompleted(studentId, "usr-admin-01", "admin");
    setJourney(dataStore.getStudentJourney(studentId));
  };

  // Confirmation modal state for application removal
  const [deleteConfirmApp, setDeleteConfirmApp] = useState<{ id: string; universityName: string; courseName?: string } | null>(null);

  const handleInitiateDelete = (app: { id: string; universityName: string; courseName?: string }) => {
    setDeleteConfirmApp(app);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmApp) return;
    dataStore.deleteApplication(deleteConfirmApp.id, "usr-admin-01");
    setApplications(dataStore.getStudentApplications(studentId));
    setDeleteConfirmApp(null);
  };

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

  // Universities filtered by selected country
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

  // Selected university object
  const activeUni = React.useMemo(() => {
    if (!selectedUniversity) return null;
    return (
      ALL_GLOBAL_UNIVERSITIES.find(
        (u) => u.name.toLowerCase() === selectedUniversity.toLowerCase() || u.id === selectedUniversity
      ) || null
    );
  }, [selectedUniversity]);

  // Courses available for selected university
  const coursesForUniversity = React.useMemo(() => {
    if (!activeUni) return [];
    const list: string[] = [];
    if (activeUni.course) list.push(activeUni.course);
    if (activeUni.alternativeCourses && activeUni.alternativeCourses.length > 0) {
      list.push(...activeUni.alternativeCourses);
    }
    // Master catalog courses from store
    const storeCourses = dataStore.getAllCourses();
    const matchingStoreCourses = storeCourses.filter(
      (c) => c.universityName.toLowerCase() === activeUni.name.toLowerCase()
    );
    matchingStoreCourses.forEach((c) => {
      if (!list.includes(c.courseName)) list.push(c.courseName);
    });
    return Array.from(new Set(list));
  }, [activeUni]);

  // Available intakes for selected university
  const intakesForUniversity = React.useMemo(() => {
    if (!activeUni) return ["September 2026 / Fall 2026", "January 2027 / Spring 2027", "May 2027 / Summer 2027"];
    const intakes: string[] = [];
    if (activeUni.mainIntakes) {
      const parts = activeUni.mainIntakes.split(",").map((p) => p.trim());
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
    if (activeUni.intake && !intakes.includes(activeUni.intake)) {
      intakes.push(activeUni.intake);
    }
    if (intakes.length === 0) {
      intakes.push("September 2026 / Fall 2026", "January 2027 / Spring 2027");
    }
    return Array.from(new Set(intakes));
  }, [activeUni]);

  // Currency symbol
  const currencySymbol = React.useMemo(() => {
    if (!activeUni) {
      const foundCountry = destinationCountries.find((c) => c.id === selectedCountry);
      return foundCountry?.symbol || "£";
    }
    if (activeUni.currency === "EUR" || activeUni.country.toLowerCase().includes("germany")) return "€";
    if (activeUni.currency === "USD" || activeUni.country.toLowerCase().includes("usa")) return "$";
    if (activeUni.currency === "AUD" || activeUni.country.toLowerCase().includes("australia")) return "A$";
    if (activeUni.currency === "CAD" || activeUni.country.toLowerCase().includes("canada")) return "C$";
    if (activeUni.currency === "NZD" || activeUni.country.toLowerCase().includes("new zealand")) return "NZ$";
    return "£";
  }, [activeUni, selectedCountry]);

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    setSelectedUniversity("");
    setSelectedCourse("");
    setIsCustomCourse(false);
    setCustomCourseTitle("");
    setSelectedIntake("");
    setNewFee("");
  };

  const handleUniversityChange = (uniName: string) => {
    setSelectedUniversity(uniName);
    setSelectedCourse("");
    setIsCustomCourse(false);
    setCustomCourseTitle("");

    const uni = ALL_GLOBAL_UNIVERSITIES.find((u) => u.name === uniName || u.id === uniName);
    if (uni) {
      // Auto-load tuition fee from catalog
      const fee = uni.tuitionFee || uni.tuition1Year || 22000;
      setNewFee(fee);

      // Default to first valid intake
      if (uni.mainIntakes) {
        if (uni.mainIntakes.toLowerCase().includes("sep") || uni.mainIntakes.toLowerCase().includes("fall")) {
          setSelectedIntake("September 2026 / Fall 2026");
        } else if (uni.mainIntakes.toLowerCase().includes("jan") || uni.mainIntakes.toLowerCase().includes("spring")) {
          setSelectedIntake("January 2027 / Spring 2027");
        } else {
          setSelectedIntake(uni.mainIntakes.split(",")[0].trim());
        }
      } else {
        setSelectedIntake("September 2026 / Fall 2026");
      }
    } else {
      setNewFee("");
      setSelectedIntake("");
    }
  };

  const handleCourseChange = (course: string) => {
    if (course === "__custom__") {
      setIsCustomCourse(true);
      setSelectedCourse("__custom__");
    } else {
      setIsCustomCourse(false);
      setSelectedCourse(course);
      // Auto-load course fee if catalog has course-specific fee
      const storeCourses = dataStore.getAllCourses();
      const match = storeCourses.find(
        (c) =>
          c.courseName.toLowerCase() === course.toLowerCase() &&
          activeUni &&
          c.universityName.toLowerCase() === activeUni.name.toLowerCase()
      );
      if (match && match.tuitionFee) {
        setNewFee(match.tuitionFee);
      }
    }
  };

  const [noteInput, setNoteInput] = useState("");
  const [chatInput, setChatInput] = useState("");

  // Re-sync on store changes or studentId
  useEffect(() => {
    const sync = () => {
      const s = dataStore.getStudentProfile(studentId);
      setStudent(s);
      if (s) {
        setEditPersonalForm({
          firstName: s.firstName,
          lastName: s.lastName,
          phone: s.phone,
          email: dataStore.getUserEmail(s.id),
          password: dataStore.getUserPassword(s.id) || "Student@123",
          targetDegree: s.targetDegree,
          preferredCountry: s.preferredCountry,
          targetIntake: s.targetIntake,
        });
        setEditAcademicForm({
          ugCollege: s.ugCollege,
          ugCgpa: s.ugCgpa,
          ugBacklogs: s.ugBacklogs || 0,
          englishTestType: s.englishTestType || "IELTS",
          englishScore: s.englishScore || 7.0,
          greScore: s.greScore || 0,
        });
      }
      setAssignedCounselor(dataStore.getAssignedCounselor(studentId));
      setAllCounselors(dataStore.getAllCounselors());
      setApplications(dataStore.getStudentApplications(studentId));
      setDocuments(dataStore.getStudentDocuments(studentId));
      setJourney(dataStore.getStudentJourney(studentId));
      setTasks(dataStore.getStudentTasks(studentId, true));
      setMockInterviews(dataStore.getStudentMockInterviews(studentId));
      setLoanCase(dataStore.getStudentLoanCase(studentId));
      setMessages(dataStore.getMessages(studentId));
      setInternalNotes(dataStore.getCounselorInternalNotes(studentId, "admin"));
      setActivityLogs(dataStore.getActivityLogs(studentId));
    };

    sync();
    const unsubscribe = dataStore.subscribe(sync);
    return () => unsubscribe();
  }, [studentId]);

  if (!student) {
    return (
      <div className="bg-white rounded-2xl border border-gvk-border p-12 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-gvk-navy">Student Record Not Found</h2>
        <p className="text-xs text-gvk-text-secondary">
          No registered student exists with ID &ldquo;{studentId}&rdquo;.
        </p>
        <Link
          href="/admin/students"
          className="inline-flex items-center justify-center h-8 px-4 rounded-md font-bold text-xs bg-[#253775] hover:bg-[#1a2754] text-white transition-colors shadow-2xs"
        >
          ← Return to Student Directory
        </Link>
      </div>
    );
  }

  // Handle reassign counselor
  const handleReassign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNewCounselorId) return;

    dataStore.assignCounselor(student.id, selectedNewCounselorId);
    setReassignModalOpen(false);
  };

  // Handle personal edit
  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    dataStore.updateStudentProfile(student.id, editPersonalForm);
    alert("Personal details updated successfully!");
  };

  // Handle academic edit
  const handleSaveAcademic = (e: React.FormEvent) => {
    e.preventDefault();
    dataStore.updateStudentProfile(student.id, editAcademicForm);
    alert("Academic details updated successfully!");
  };

  // Handle add application
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
      student.id,
      activeUni.name,
      activeUni.country,
      finalCourse,
      selectedIntake,
      Number(newFee) || 0,
      assignedCounselor?.id || "usr-counselor-01"
    );
    // Real-time state updates so newly lodged application displays immediately
    setApplications(dataStore.getStudentApplications(student.id));
    setJourney(dataStore.getStudentJourney(student.id));
    setCreateAppModalOpen(false);
  };

  // Handle internal note
  const handleAddInternalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    dataStore.addCounselorInternalNote(student.id, "usr-admin-01", "Admissions Assessment", noteInput);
    setNoteInput("");
  };

  // Handle admin direct message to student
  const handleSendAdminMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    dataStore.sendMessage(
      student.id,
      "usr-admin-01",
      "counselor",
      "GVK Central Admissions Admin",
      chatInput
    );
    setChatInput("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Candidate Top Profile Header Banner */}
      <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#253775] text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
              {student.firstName.charAt(0)}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-gvk-navy tracking-tight">
                  {student.firstName} {student.lastName}
                </h1>
                <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  {student.studentIdCode}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase">
                  Active Candidate
                </span>
              </div>

              <p className="text-xs text-gvk-text-secondary">
                Targeting <strong className="text-gvk-navy">{student.targetDegree}</strong> • {student.preferredCountry} ({student.targetIntake})
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1.5">
                <span>UG: <strong className="text-gvk-navy">{student.ugCollege}</strong> (CGPA: {student.ugCgpa})</span>
                <span>•</span>
                <div className="inline-flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <strong className="text-gvk-navy">{editPersonalForm.email}</strong>
                  <button
                    type="button"
                    onClick={() => handleCopyText(editPersonalForm.email, "email")}
                    className="p-1 rounded text-slate-400 hover:text-[#253775] hover:bg-slate-100 transition-colors"
                    title="Copy Email"
                  >
                    {copiedField === "email" ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <span>•</span>
                <div className="inline-flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-slate-500 font-medium">Password:</span>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                    <span className="font-mono text-xs text-gvk-navy font-bold select-all">
                      {showPassword ? editPersonalForm.password : "••••••••"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-0.5 text-slate-400 hover:text-slate-700 transition-colors ml-1"
                      title={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyText(editPersonalForm.password, "password")}
                      className="p-0.5 text-slate-400 hover:text-[#253775] transition-colors"
                      title="Copy Password"
                    >
                      {copiedField === "password" ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
                <span>•</span>
                <span>Phone: <strong className="text-gvk-navy">{student.phone}</strong></span>
              </div>
            </div>
          </div>

          {/* Assigned Counselor Widget */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 shrink-0">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Assigned Senior Counselor
              </span>
              {assignedCounselor ? (
                <div>
                  <strong className="text-sm font-bold text-gvk-navy block">
                    {assignedCounselor.firstName} {assignedCounselor.lastName}
                  </strong>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {assignedCounselor.employeeIdCode}
                  </span>
                </div>
              ) : (
                <span className="text-xs font-bold text-amber-700 block">
                  ⚠️ Unassigned (Admissions Hold)
                </span>
              )}
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedNewCounselorId(assignedCounselor?.id || "");
                setReassignModalOpen(true);
              }}
              className="text-xs font-bold shrink-0 border-[#253775] text-[#253775] hover:bg-blue-50"
            >
              {assignedCounselor ? "Reassign" : "Assign Counselor"}
            </Button>
          </div>
        </div>

        {/* 11 Horizontal Navigation Tabs */}
        <div className="mt-6 pt-4 border-t border-gvk-border flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {tabList.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[#253775] text-white shadow-xs"
                    : "text-slate-600 hover:text-gvk-navy hover:bg-slate-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-gvk-border shadow-card space-y-1">
              <span className="text-[11px] uppercase font-bold text-slate-400">Applications</span>
              <div className="text-2xl font-black text-gvk-navy font-mono">{applications.length}</div>
              <span className="text-xs text-emerald-700 font-semibold">
                {applications.filter((a) => a.currentStatus.includes("offer")).length} Offers in Hand
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gvk-border shadow-card space-y-1">
              <span className="text-[11px] uppercase font-bold text-slate-400">Document Vault</span>
              <div className="text-2xl font-black text-gvk-navy font-mono">{documents.length}</div>
              <span className="text-xs text-blue-700 font-semibold">
                {documents.filter((d) => d.verificationStatus === "verified").length} Verified Files
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gvk-border shadow-card space-y-1">
              <span className="text-[11px] uppercase font-bold text-slate-400">Milestone Stage</span>
              <div className="text-2xl font-black text-gvk-navy font-mono">
                {journey.filter((j) => j.status === "completed").length} / {journey.length}
              </div>
              <span className="text-xs text-amber-700 font-semibold">
                {journey.find((j) => j.status === "in_progress")?.stageName || "Onboarding"}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gvk-border shadow-card space-y-1">
              <span className="text-[11px] uppercase font-bold text-slate-400">Assigned Tasks</span>
              <div className="text-2xl font-black text-gvk-navy font-mono">{tasks.length}</div>
              <span className="text-xs text-slate-500">
                {tasks.filter((t) => t.status === "completed").length} Completed
              </span>
            </div>
          </div>

          {/* Quick Snapshot Card */}
          <AdminCard title="Quick Operational Snapshot" subtitle="Summary of pending items and upcoming deadlines">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <strong className="text-gvk-navy font-bold block text-sm">Next Required Milestone Action</strong>
                <p className="text-slate-600">
                  {journey.find((j) => j.status === "in_progress")?.counselorRemarks || "Stage 01 Counseling session scheduled."}
                </p>
                <div className="pt-2 text-[11px] text-slate-500 font-mono">
                  Target Destination: {student.preferredCountry} ({student.targetIntake})
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <strong className="text-gvk-navy font-bold block text-sm">Education Loan Status</strong>
                <p className="text-slate-600">
                  {loanCase ? `Processing with ${loanCase.lenderName} (${loanCase.stage.replace(/_/g, " ")})` : "Loan file not yet initiated."}
                </p>
                <div className="pt-2 text-[11px] text-slate-500 font-mono">
                  Requested: ₹{loanCase?.amountRequested.toLocaleString() || "N/A"}
                </div>
              </div>
            </div>
          </AdminCard>
        </div>
      )}

      {/* Tab 2: Personal Information */}
      {activeTab === "personal" && (
        <AdminCard title="Personal Information & Account Details" subtitle="Edit candidate personal identifiers">
          <form onSubmit={handleSavePersonal} className="space-y-4 text-xs max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gvk-navy mb-1">First Name</label>
                <Input
                  value={editPersonalForm.firstName}
                  onChange={(e) => setEditPersonalForm({ ...editPersonalForm, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-gvk-navy mb-1">Last Name</label>
                <Input
                  value={editPersonalForm.lastName}
                  onChange={(e) => setEditPersonalForm({ ...editPersonalForm, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gvk-navy mb-1">Email</label>
                <Input
                  type="email"
                  value={editPersonalForm.email}
                  onChange={(e) => setEditPersonalForm({ ...editPersonalForm, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-gvk-navy mb-1">Login Password</label>
                <Input
                  type="text"
                  value={editPersonalForm.password}
                  onChange={(e) => setEditPersonalForm({ ...editPersonalForm, password: e.target.value })}
                  placeholder="Student@123"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block font-bold text-gvk-navy mb-1">Phone</label>
                <Input
                  value={editPersonalForm.phone}
                  onChange={(e) => setEditPersonalForm({ ...editPersonalForm, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-gvk-navy mb-1">Target Degree</label>
                <Input
                  value={editPersonalForm.targetDegree}
                  onChange={(e) => setEditPersonalForm({ ...editPersonalForm, targetDegree: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-gvk-navy mb-1">Target Country</label>
                <select
                  value={editPersonalForm.preferredCountry}
                  onChange={(e) => setEditPersonalForm({ ...editPersonalForm, preferredCountry: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Ireland">Ireland</option>
                  <option value="Australia">Australia</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-gvk-navy mb-1">Target Intake</label>
                <Input
                  value={editPersonalForm.targetIntake}
                  onChange={(e) => setEditPersonalForm({ ...editPersonalForm, targetIntake: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" className="bg-[#253775] hover:bg-[#1a2754] text-white font-bold">
                Save Personal Details
              </Button>
            </div>
          </form>
        </AdminCard>
      )}

      {/* Tab 3: Academic Profile */}
      {activeTab === "academic" && (
        <AdminCard title="Academic Profile & Qualifications" subtitle="Edit undergraduate degree, scores, and tests">
          <form onSubmit={handleSaveAcademic} className="space-y-4 text-xs max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gvk-navy mb-1">Undergraduate University</label>
                <Input
                  value={editAcademicForm.ugCollege}
                  onChange={(e) => setEditAcademicForm({ ...editAcademicForm, ugCollege: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-gvk-navy mb-1">CGPA / Percentage</label>
                <Input
                  type="number"
                  step="0.01"
                  value={editAcademicForm.ugCgpa}
                  onChange={(e) => setEditAcademicForm({ ...editAcademicForm, ugCgpa: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-gvk-navy mb-1">English Test</label>
                <select
                  value={editAcademicForm.englishTestType}
                  onChange={(e) => setEditAcademicForm({ ...editAcademicForm, englishTestType: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="IELTS">IELTS Academic</option>
                  <option value="PTE">PTE Academic</option>
                  <option value="TOEFL">TOEFL iBT</option>
                  <option value="Duolingo">Duolingo English</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-gvk-navy mb-1">Overall Band / Score</label>
                <Input
                  type="number"
                  step="0.5"
                  value={editAcademicForm.englishScore}
                  onChange={(e) => setEditAcademicForm({ ...editAcademicForm, englishScore: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block font-bold text-gvk-navy mb-1">GRE Score (Optional)</label>
                <Input
                  type="number"
                  value={editAcademicForm.greScore || ""}
                  onChange={(e) => setEditAcademicForm({ ...editAcademicForm, greScore: Number(e.target.value) })}
                  placeholder="320"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" className="bg-[#253775] hover:bg-[#1a2754] text-white font-bold">
                Save Academic Parameters
              </Button>
            </div>
          </form>
        </AdminCard>
      )}

      {/* Tab 4: University Applications */}
      {activeTab === "applications" && (
        <div className="space-y-4">
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

                  {/* Stage-by-stage status cards with 1-click offline completion */}
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

                  {/* Offline processing explanation & 1-click unlock */}
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
                  <strong>Prerequisite Stages Completed:</strong> Document verification and university shortlisting are completed. You can lodge official university applications.
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] shrink-0">
                Eligible for Applications
              </span>
            </div>
          )}

          <AdminCard
            title={`University Applications (${applications.length})`}
            subtitle="Lodged university files and admission offer statuses"
            headerAction={
              <Button
                size="sm"
                onClick={handleOpenCreateApp}
                className="bg-[#253775] hover:bg-[#1a2754] text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Application</span>
              </Button>
            }
          >
            {applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-bold text-gvk-navy">{app.universityName}</strong>
                        <span className="text-slate-400">•</span>
                        <span className="font-mono text-slate-500">{app.country}</span>
                      </div>
                      <p className="font-semibold text-gvk-navy">{app.courseName} ({app.intake})</p>
                      <div className="flex items-center gap-3 text-slate-500 text-[11px] font-mono">
                        <span>Ref: {app.appRefNumber || "Awaiting"}</span>
                        <span>•</span>
                        <span>Fee: £{app.tuitionFee?.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge type="application" status={app.currentStatus} />
                      <select
                        value={app.currentStatus}
                        onChange={(e) => {
                          dataStore.updateApplicationStatus(
                            app.id,
                            e.target.value as ApplicationStatus,
                            "usr-admin-01",
                            "Status updated by central administration."
                          );
                          setApplications(dataStore.getStudentApplications(student.id));
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-[11px] text-gvk-navy"
                      >
                        <option value="submitted">Submitted</option>
                        <option value="under_review">Under Review</option>
                        <option value="conditional_offer">Conditional Offer</option>
                        <option value="unconditional_offer">Unconditional Offer</option>
                        <option value="rejected">Rejected</option>
                        <option value="deposit_paid">Deposit Paid</option>
                        <option value="cas_received">CAS Received</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleInitiateDelete(app)}
                        className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 font-bold text-[11px] flex items-center gap-1 transition-colors"
                        title="Remove this application from portfolio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 text-xs">
                No university applications lodged for this candidate yet.
              </div>
            )}
          </AdminCard>
        </div>
      )}

      {/* Tab 5: Documents */}
      {activeTab === "documents" && (
        <div className="space-y-4">
          {stage3?.status !== "completed" ? (
            <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-blue-900">
              <div className="flex items-center gap-2.5">
                <FolderLock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Offline Physical Verification:</strong> If candidate submitted physical paper copies in office, mark Stage 03 Document Verification as completed.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleMarkStageOffline(3)}
                className="px-3 py-1.5 bg-[#253775] hover:bg-[#1a2754] text-white font-bold rounded-lg text-xs shrink-0 transition-colors shadow-2xs"
              >
                Mark Documents Verified (Offline)
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Document Verification Cleared:</strong> Stage 03 Document Collection & Verification has been marked completed.
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                Stage 03 Completed
              </span>
            </div>
          )}

          <AdminCard title={`Document Vault (${documents.length})`} subtitle="Uploaded academic records and verification review">
          {documents.length > 0 ? (
            <div className="divide-y divide-slate-100 text-xs">
              {documents.map((doc) => (
                <div key={doc.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#253775]" />
                      <strong className="text-gvk-navy font-bold">{doc.title}</strong>
                      <span className="font-mono text-[10px] text-slate-400">v{doc.latestVersion}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 capitalize block">
                      Category: {doc.category.replace(/_/g, " ")} • File: {doc.fileName || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge type="document" status={doc.verificationStatus} />
                    {doc.verificationStatus !== "verified" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          dataStore.reviewDocument(doc.id, "verified", "usr-admin-01", "Verified by Administrator.");
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                      >
                        Verify File
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              No documents uploaded to this student&apos;s vault yet.
            </div>
          )}
        </AdminCard>
      </div>
    )}

      {/* Tab 6: 25-Stage Journey */}
      {activeTab === "journey" && (
        <AdminCard title="Sequential 25-Stage Study Abroad Roadmap" subtitle="Audit milestone progression and override stage statuses">
          <div className="space-y-3">
            {journey.map((st) => (
              <div
                key={st.id}
                className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs transition-colors ${
                  st.status === "completed"
                    ? "bg-emerald-50/40 border-emerald-200"
                    : st.status === "in_progress"
                    ? "bg-blue-50/60 border-blue-300"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#253775] text-white flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                      {st.stageNumber}
                    </span>
                    <strong className="text-gvk-navy font-bold text-sm">
                      {st.stageName}
                    </strong>
                    <span className="capitalize text-[10px] text-slate-500 font-semibold px-2 py-0.5 rounded bg-white border border-slate-200">
                      Owner: {st.responsibleParty}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{st.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={st.status}
                    onChange={(e) => {
                      dataStore.updateJourneyStage(
                        student.id,
                        st.stageNumber,
                        e.target.value as JourneyStageStatus,
                        "usr-admin-01",
                        "Stage status updated by central administration."
                      );
                      setJourney(dataStore.getStudentJourney(student.id));
                    }}
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
            ))}
          </div>
        </AdminCard>
      )}

      {/* Tab 7: Tasks */}
      {activeTab === "tasks" && (
        <AdminCard title={`Candidate & Counselor Tasks (${tasks.length})`} subtitle="Milestone action deliverables">
          <div className="space-y-3">
            {tasks.map((t) => (
              <div key={t.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge type="priority" status={t.priority} />
                    <StatusBadge type="task" status={t.status} />
                    <strong className="text-gvk-navy font-bold">{t.title}</strong>
                  </div>
                  <p className="text-slate-600">{t.description}</p>
                  <span className="text-[11px] text-slate-400 font-mono mt-1 block">Due: {t.dueDate}</span>
                </div>
                {t.status !== "completed" && (
                  <Button
                    size="sm"
                    onClick={() => dataStore.completeTaskByCounselor(t.id, "usr-admin-01")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    Mark Complete
                  </Button>
                )}
              </div>
            ))}
          </div>
        </AdminCard>
      )}

      {/* Tab 8: Mock Interviews */}
      {activeTab === "interviews" && (
        <AdminCard title={`Mock Interviews (${mockInterviews.length})`} subtitle="Pre-admissions credibility assessments">
          <div className="space-y-3">
            {mockInterviews.map((m) => {
              const outcome = m.feedback?.outcome || (m as any).outcome;
              return (
                <div key={m.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-gvk-navy font-bold text-sm block">{m.title}</strong>
                    <span className="text-slate-500 font-mono block">
                      Scheduled: {m.scheduledAt ? new Date(m.scheduledAt).toLocaleString() : "Date TBD"}
                    </span>
                    {outcome && (
                      <span className={`inline-block font-bold mt-1 px-2 py-0.5 rounded text-[10px] ${outcome === "PASS" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                        Outcome: {outcome}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => dataStore.evaluateMockInterview(m.id, "usr-admin-01", "PASS", "Good communication.")}
                      className="text-emerald-700 font-bold text-xs border-emerald-300"
                    >
                      Set PASS
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => dataStore.evaluateMockInterview(m.id, "usr-admin-01", "FAIL", "Needs further preparation.")}
                      className="text-red-700 font-bold text-xs border-red-300"
                    >
                      Set FAIL
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </AdminCard>
      )}

      {/* Tab 9: Loan Tracker */}
      {activeTab === "loan" && (
        <AdminCard title="Education Loan Tracker" subtitle="10-stage lender progression">
          {loanCase ? (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Lender Partner</span>
                  <strong className="text-gvk-navy text-sm">{loanCase.lenderName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Amount Requested</span>
                  <strong className="text-gvk-navy text-sm">₹{loanCase.amountRequested.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Current Stage</span>
                  <strong className="text-amber-700 text-sm capitalize">{loanCase.stage.replace(/_/g, " ")}</strong>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block font-bold text-gvk-navy">Update Loan Stage</label>
                <div className="flex items-center gap-2">
                  <select
                    value={loanCase.stage}
                    onChange={(e) => {
                      dataStore.updateLoanCase(
                        student.id,
                        e.target.value as any,
                        loanCase.lenderName,
                        loanCase.amountRequested,
                        loanCase.sanctionAmount,
                        loanCase.counselorNotes || "",
                        loanCase.studentNextStep || "",
                        "usr-admin-01"
                      );
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-semibold"
                  >
                    {loanStagesList.map((ls) => (
                      <option key={ls.id} value={ls.id}>
                        Step {ls.step}: {ls.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              No education loan case initiated for this candidate.
            </div>
          )}
        </AdminCard>
      )}

      {/* Tab 10: Communication & Internal Notes */}
      {activeTab === "communication" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          {/* Chat Messages */}
          <AdminCard title="Student 1-on-1 Advisory Channel" subtitle="Direct messages between candidate and desk">
            <div className="space-y-3">
              <div ref={chatContainerRef} className="h-64 overflow-y-auto space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-2.5 rounded-xl ${
                        msg.senderRole === "student"
                          ? "bg-white border border-slate-200 ml-8"
                          : "bg-[#253775] text-white mr-8"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] opacity-80 mb-1">
                        <strong>{msg.senderName}</strong>
                        <span suppressHydrationWarning>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p>{msg.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    No messages exchanged yet.
                  </div>
                )}
              </div>

              <form onSubmit={handleSendAdminMessage} className="flex items-center gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Send admin update to student..."
                />
                <Button type="submit" size="sm" className="bg-[#253775] text-white font-bold">
                  Send
                </Button>
              </form>
            </div>
          </AdminCard>

          {/* Confidential Internal Notes */}
          <AdminCard title="Confidential Administrative Notes" subtitle="Internal counselor and admin intake evaluations">
            <div className="space-y-3">
              <div className="h-64 overflow-y-auto space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                {internalNotes.length > 0 ? (
                  internalNotes.map((n) => (
                    <div key={n.id} className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <strong className="text-gvk-navy">{n.counselorId === "usr-admin-01" ? "Central Admin" : "Counselor"} • {n.category}</strong>
                        <span suppressHydrationWarning>{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-700">{n.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    No internal notes logged.
                  </div>
                )}
              </div>

              <form onSubmit={handleAddInternalNote} className="flex items-center gap-2">
                <Input
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Add confidential internal note..."
                />
                <Button type="submit" size="sm" className="bg-[#253775] text-white font-bold">
                  Log Note
                </Button>
              </form>
            </div>
          </AdminCard>
        </div>
      )}

      {/* Tab 11: Audit History */}
      {activeTab === "activity" && (
        <AdminCard title="Student Audit History" subtitle="Chronological audit trail of all candidate state changes">
          <div className="divide-y divide-slate-100 text-xs">
            {activityLogs.length > 0 ? (
              activityLogs.map((act) => (
                <div key={act.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <strong className="text-gvk-navy font-bold">{act.title}</strong>
                    <p className="text-slate-600">{act.description}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {new Date(act.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No activity logs recorded for this candidate yet.
              </div>
            )}
          </div>
        </AdminCard>
      )}

      {/* Reassign Counselor Modal */}
      <AdminModal
        isOpen={reassignModalOpen}
        onClose={() => setReassignModalOpen(false)}
        title={`Allocate Counselor: ${student.firstName} ${student.lastName}`}
        subtitle={`Current Counselor: ${assignedCounselor ? `${assignedCounselor.firstName} ${assignedCounselor.lastName}` : "Unassigned"}`}
        maxWidth="md"
      >
        <form onSubmit={handleReassign} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gvk-navy mb-1.5">
              Select Senior Admissions Counselor *
            </label>
            <select
              value={selectedNewCounselorId}
              onChange={(e) => setSelectedNewCounselorId(e.target.value)}
              required
              className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white font-semibold text-gvk-navy"
            >
              <option value="">-- Choose Authorized Counselor --</option>
              {allCounselors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName} ({c.employeeIdCode}) — {c.specializationCountries?.join(", ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-gvk-navy mb-1">Transfer / Assignment Notes</label>
            <Input
              value={reassignNotes}
              onChange={(e) => setReassignNotes(e.target.value)}
              placeholder="e.g. Allocation based on UK Fall 2026 specialization"
            />
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
            Allocating a counselor immediately activates <strong>Stage 01: Initial 1-on-1 Counseling Session</strong> and dispatches onboarding deliverables to both the candidate and counselor portals.
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReassignModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-[#253775] hover:bg-[#1a2754] text-white font-bold">
              Confirm Assignment
            </Button>
          </div>
        </form>
      </AdminModal>

      {/* Create Application Modal with Cascading Auto-Detection */}
      <AdminModal
        isOpen={createAppModalOpen}
        onClose={() => setCreateAppModalOpen(false)}
        title={`Add University Application for ${student.firstName}`}
        subtitle="Select country, institution, course and intake — details and benchmarks populate automatically."
        maxWidth="lg"
      >
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

          {/* Step 2: Target University (Searchable Combobox: Typing is directly visible with real-time filtering) */}
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

          {/* Automatic Institutional Details Card (Appears automatically when university is selected) */}
          {activeUni && (
            <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <UniversityBadge name={activeUni.name} country={activeUni.country} size="sm" showCountryFlag />
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 leading-tight">{activeUni.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                      {activeUni.city}, {activeUni.country}
                    </div>
                  </div>
                </div>
                {activeUni.russellGroup && (
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300 text-[10px] shrink-0">
                    🏛️ Russell Group
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-indigo-100 text-[11px]">
                <div className="bg-white p-2 rounded-lg border border-indigo-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block font-medium">World Ranking</span>
                  <strong className="text-slate-800 font-mono text-[11px]">
                    {activeUni.qsRankDisplay || `#${activeUni.ranking}`}
                  </strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-indigo-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block font-medium">IELTS Benchmark</span>
                  <strong className="text-slate-800 text-[11px]">
                    {activeUni.typicalIelts || activeUni.minIelts || "6.5"}
                  </strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-indigo-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block font-medium">CGPA Requirement</span>
                  <strong className="text-slate-800 text-[11px]">
                    {activeUni.minCgpa ? activeUni.minCgpa.split("(")[0].trim() : "60%"}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Course Selection */}
          <div>
            <label className="block font-bold text-gvk-navy mb-1.5 flex items-center justify-between">
              <span>3. Course / Degree Title *</span>
              {coursesForUniversity.length > 0 && (
                <span className="text-[11px] font-normal text-slate-500">
                  {coursesForUniversity.length} programs available
                </span>
              )}
            </label>
            <select
              value={selectedCourse}
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
              <option value="__custom__">➕ Enter Custom Program Title...</option>
            </select>

            {isCustomCourse && (
              <div className="mt-2 animate-fade-in">
                <Input
                  type="text"
                  placeholder="Enter custom program title (e.g. MSc Advanced Computer Science with AI)"
                  value={customCourseTitle}
                  onChange={(e) => setCustomCourseTitle(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Step 4: Target Intake & Auto-Calculated Tuition Fee */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gvk-navy mb-1.5">4. Target Intake *</label>
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
                {intakesForUniversity.map((intake, idx) => (
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
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    Auto-loaded
                  </span>
                )}
              </label>
              <Input
                type="number"
                value={newFee}
                onChange={(e) => setNewFee(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder={activeUni ? "Auto-detected fee" : "e.g. 25000"}
                required
                className="w-full"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateAppModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedCountry || !selectedUniversity || (!selectedCourse && !customCourseTitle) || !selectedIntake}
              className="bg-[#253775] hover:bg-[#1a2754] text-white font-bold disabled:opacity-50"
            >
              Create Application
            </Button>
          </div>
        </form>
      </AdminModal>

      {/* Confirmation Modal for Application Removal */}
      {deleteConfirmApp && (
        <AdminModal
          isOpen={!!deleteConfirmApp}
          onClose={() => setDeleteConfirmApp(null)}
          title="Confirm Application Removal"
          subtitle="Are you sure you want to remove this university application?"
          maxWidth="md"
        >
          <div className="space-y-4 pt-1">
            <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 space-y-3">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Remove Application Record</span>
              </div>
              <p className="text-xs text-rose-800 leading-relaxed">
                This action will remove the candidate&apos;s application record from the active portfolio:
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
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center gap-1.5">
                  <span>Candidate:</span>
                  <strong className="text-slate-800 font-semibold">{student?.firstName} {student?.lastName}</strong>
                </div>
              </div>
              <p className="text-[11px] text-rose-700 font-medium">
                Associated admission statuses, document links, and milestone associations will be removed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteConfirmApp(null)}
                className="text-xs font-semibold px-4 py-2 border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDelete}
                className="text-xs font-bold px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white shadow-md flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Remove</span>
              </Button>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
