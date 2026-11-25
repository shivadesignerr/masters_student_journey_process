"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  Users,
  GraduationCap,
  FileCheck2,
  FolderLock,
  Video,
  CheckSquare,
  History,
  Mail,
  Phone,
  Clock,
  Briefcase,
  ChevronLeft,
  Edit,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock3,
  MessageSquare,
  Send,
  Sparkles,
  Lock,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
} from "lucide-react";

export default function CounselorWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const counselorId = params?.id as string;

  const [tick, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<
    "overview" | "students" | "applications" | "documents" | "tasks" | "interviews" | "activity" | "messages"
  >("overview");

  // Direct Message State
  const [adminMsgInput, setAdminMsgInput] = useState("");
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Sync tab from URL query params
  useEffect(() => {
    const tabParam = searchParams?.get("tab");
    if (tabParam) {
      if (["overview", "students", "applications", "documents", "tasks", "interviews", "activity", "messages"].includes(tabParam)) {
        setActiveTab(tabParam as any);
      } else if (tabParam === "chat" || tabParam === "communication") {
        setActiveTab("messages");
      }
    }
  }, [searchParams]);

  // Mark counselor messages as read when opening message tab or receiving new messages
  useEffect(() => {
    if (activeTab === "messages" && counselorId) {
      dataStore.markAdminCounselorMessagesAsRead(counselorId);
    }
  }, [activeTab, counselorId, tick]);

  // Auto-scroll messages to bottom when messages tab is active or messages update
  useEffect(() => {
    if (activeTab === "messages") {
      scrollToBottom();
      const t1 = setTimeout(scrollToBottom, 50);
      const t2 = setTimeout(scrollToBottom, 200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [activeTab, tick]);

  const handleTabChange = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tabId);
      window.history.replaceState({}, "", url.toString());
    }
  };

  // Edit Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    officeHours: "",
    isActive: true,
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

  // Zoom Config Modal
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomUrl, setZoomUrl] = useState("");
  const [zoomId, setZoomId] = useState("");
  const [zoomPasscode, setZoomPasscode] = useState("");

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const unsub = dataStore.subscribe(() => setTick((t) => t + 1));
    return () => unsub();
  }, []);

  const counselors = dataStore.getAllCounselors();
  const counselor = counselors.find(
    (c) => c.id === counselorId || c.employeeId === counselorId
  );

  useEffect(() => {
    if (counselor) {
      setEditForm({
        name: counselor.name,
        email: counselor.email,
        password: counselor.password || dataStore.getUserPassword(counselor.id) || "Counselor@123",
        phone: counselor.phone || "",
        specialization: counselor.specialization || "",
        officeHours: counselor.officeHours || "Mon - Sat (10:00 AM - 6:30 PM IST)",
        isActive: counselor.isActive !== false,
      });

      const z = dataStore.getCounselorDefaultZoom(counselor.id);
      if (z) {
        setZoomUrl(z.zoomUrl || "");
        setZoomId(z.meetingId || "");
        setZoomPasscode(z.passcode || "");
      }
    }
  }, [counselorId]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  if (!counselor) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Counselor Not Found</h2>
        <p className="text-slate-500 text-sm">
          The requested counselor desk identifier does not exist or has been removed.
        </p>
        <Link
          href="/admin/counselors"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#253775] text-white rounded-lg text-sm font-medium hover:bg-[#1c2a5e]"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Counselors Roster
        </Link>
      </div>
    );
  }

  // Related Entities
  const allStudents = dataStore.getAllStudents();
  const assignedStudents = allStudents.filter(
    (s) => dataStore.getAssignedCounselor(s.id)?.id === counselor.id
  );
  const applications = dataStore.getAllApplications(counselor.id);
  const pendingDocs = dataStore.getAllPendingReviewDocuments(counselor.id);
  const allDocs = assignedStudents.flatMap((s) => dataStore.getStudentDocuments(s.id));
  const tasks = dataStore.getAllCounselorTasks(counselor.id);
  const interviews = dataStore.getAllMockInterviews(counselor.id);
  const auditLogs = dataStore
    .getActivityLogs()
    .filter((l) => l.userId === counselor.id || l.affectedCounselorId === counselor.id);
  const adminCounselorMessages = dataStore.getAdminCounselorMessages(counselor.id, "admin");
  const unreadCounselorMsgCount = adminCounselorMessages.filter(
    (m) => m.senderRole === "counselor" && (m.isRead === false || m.isRead === undefined)
  ).length;

  const handleSendAdminMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMsgInput.trim() || isSendingMsg) return;
    setIsSendingMsg(true);
    dataStore.sendAdminCounselorMessage(
      counselor.id,
      "admin",
      "GVK Central Admissions Admin",
      adminMsgInput.trim()
    );
    setAdminMsgInput("");
    setIsSendingMsg(false);
    showNotification("Direct management directive dispatched to counselor desk.");
    setTimeout(scrollToBottom, 50);
  };

  const handleMsgQuickChip = (text: string) => {
    setAdminMsgInput((prev) => (prev ? `${prev} ${text}` : text));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    dataStore.updateCounselorProfile(counselor.id, {
      name: editForm.name,
      email: editForm.email,
      password: editForm.password,
      phone: editForm.phone,
      specialization: editForm.specialization,
      officeHours: editForm.officeHours,
      isActive: editForm.isActive,
    });
    setIsEditOpen(false);
    showNotification("Counselor profile updated successfully.");
  };

  const handleSaveZoom = (e: React.FormEvent) => {
    e.preventDefault();
    dataStore.updateCounselorDefaultZoom(
      counselor.id,
      zoomUrl,
      zoomId,
      zoomPasscode
    );
    setIsZoomOpen(false);
    showNotification("Default Zoom configuration saved.");
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

      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/counselors"
            onClick={() => {
              try {
                router.push("/admin/counselors");
              } catch {
                window.location.href = "/admin/counselors";
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#253775] mb-1 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Counselors Roster
          </Link>
          <div className="flex items-center gap-3">
            <h1 suppressHydrationWarning className="text-2xl font-bold text-slate-900 tracking-tight">
              {counselor.name}
            </h1>
            <span suppressHydrationWarning className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#253775]/10 text-[#253775]">
              {counselor.employeeId}
            </span>
            <span
              suppressHydrationWarning
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                counselor.isActive !== false
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {counselor.isActive !== false ? "Active Desk" : "Deactivated"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTabChange("messages")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
              activeTab === "messages"
                ? "bg-[#253775] text-white"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Direct Messages</span>
            {unreadCounselorMsgCount > 0 && (
              <span
                suppressHydrationWarning
                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF0008] text-white animate-pulse"
              >
                {unreadCounselorMsgCount} new
              </span>
            )}
          </button>
          <button
            onClick={() => setIsZoomOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <Video className="w-3.5 h-3.5 text-blue-600" />
            Zoom Config
          </button>
          <button
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Edit className="w-3.5 h-3.5 text-slate-500" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Counselor Summary Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-4 md:col-span-2">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#253775] to-[#1c2a5e] text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              {counselor.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-800">
                  {counselor.specialization || "General Overseas Education Admissions"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-semibold text-gvk-navy">{counselor.email}</span>
                <button
                  type="button"
                  onClick={() => handleCopyText(counselor.email, "email")}
                  className="p-1 rounded text-slate-400 hover:text-[#253775] hover:bg-slate-100 transition-colors"
                  title="Copy Official Email"
                >
                  {copiedField === "email" ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Key className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-slate-500 font-medium">Desk Password:</span>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                  <span className="font-mono text-xs text-gvk-navy font-bold select-all">
                    {showPassword ? editForm.password : "••••••••"}
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
                    onClick={() => handleCopyText(editForm.password, "password")}
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
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{counselor.phone || "Not specified"}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{counselor.officeHours || "Mon - Sat 10:00 AM - 6:30 PM IST"}</span>
              </div>
            </div>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Workload Portfolio
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span suppressHydrationWarning className="text-2xl font-bold text-slate-900">
                  {assignedStudents.length}
                </span>
                <p className="text-xs text-slate-500">Assigned Students</p>
              </div>
              <div>
                <span suppressHydrationWarning className="text-2xl font-bold text-blue-600">
                  {applications.length}
                </span>
                <p className="text-xs text-slate-500">Active Apps</p>
              </div>
            </div>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Queue Status
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span
                  suppressHydrationWarning
                  className={`text-2xl font-bold ${
                    pendingDocs.length > 0 ? "text-amber-600" : "text-slate-900"
                  }`}
                >
                  {pendingDocs.length}
                </span>
                <p className="text-xs text-slate-500">Pending Reviews</p>
              </div>
              <div>
                <span
                  suppressHydrationWarning
                  className={`text-2xl font-bold ${
                    tasks.filter((t) => t.isOverdue).length > 0
                      ? "text-red-600"
                      : "text-slate-900"
                  }`}
                >
                  {tasks.filter((t) => t.isOverdue).length}
                </span>
                <p className="text-xs text-slate-500">Overdue Tasks</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto scrollbar-none" aria-label="Tabs">
          {[
            { id: "overview", label: "Overview", icon: Users },
            {
              id: "students",
              label: `Assigned Students (${assignedStudents.length})`,
              icon: GraduationCap,
            },
            {
              id: "applications",
              label: `Applications (${applications.length})`,
              icon: FileCheck2,
            },
            {
              id: "documents",
              label: `Documents (${pendingDocs.length} pending)`,
              icon: FolderLock,
            },
            { id: "tasks", label: `Tasks (${tasks.length})`, icon: CheckSquare },
            { id: "interviews", label: `Mock Interviews (${interviews.length})`, icon: Video },
            {
              id: "messages",
              label: unreadCounselorMsgCount > 0 ? `Direct Messages (${unreadCounselorMsgCount} new)` : "Direct Messages",
              icon: MessageSquare,
            },
            { id: "activity", label: `Audit Logs (${auditLogs.length})`, icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                suppressHydrationWarning
                onClick={() => handleTabChange(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-[#253775] text-[#253775]"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#253775]" : "text-slate-400"}`} />
                <span suppressHydrationWarning>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AdminCard title="Assigned Candidates Quick View" subtitle="Active students managed under this desk">
              {assignedStudents.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                  No students assigned to this counselor yet.
                  <div className="mt-2">
                    <Link
                      href="/admin/assignments"
                      className="text-xs font-semibold text-[#253775] hover:underline"
                    >
                      Allocate unassigned students →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {assignedStudents.map((s) => (
                    <div
                      key={s.id}
                      className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                          {s.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <Link
                            href={`/admin/students/${s.id}`}
                            className="text-xs font-bold text-slate-900 hover:text-[#253775] flex items-center gap-1.5"
                          >
                            {s.name}
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({s.studentId})
                            </span>
                          </Link>
                          <p className="text-[11px] text-slate-500">
                            {s.targetCountry || "Country TBD"} • {s.targetIntake || "Intake TBD"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">
                          {dataStore.getStudentApplications(s.id).length} apps
                        </span>
                        <Link
                          href={`/admin/students/${s.id}`}
                          className="p-1 text-slate-400 hover:text-[#253775]"
                          title="View Student Profile"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AdminCard>

            <AdminCard title="Upcoming Scheduled Mock Interviews" subtitle="Video prep sessions booked">
              {interviews.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No mock interviews currently scheduled for this counselor.
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {interviews.map((iv) => (
                    <div key={iv.id} className="py-3 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">
                            {iv.studentName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            ({iv.studentId || "Student"})
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700">
                            ADMISSIONS MOCK
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-2">
                          <span suppressHydrationWarning>
                            {new Date(iv.scheduledAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                          </span>
                          <span>• {iv.title}</span>
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          iv.status === "completed"
                            ? "bg-emerald-50 text-emerald-700"
                            : iv.status === "cancelled"
                            ? "bg-slate-100 text-slate-500"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {iv.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </AdminCard>
          </div>

          <div className="space-y-6">
            <AdminCard title="Desk Video Details" subtitle="Default Zoom Room credentials">
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Join URL:</span>
                  <div className="mt-1 p-2 bg-slate-50 rounded border border-slate-100 break-all font-mono text-[11px] text-slate-700">
                    {zoomUrl || "No default Zoom URL configured"}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 font-medium">Meeting ID:</span>
                    <div className="mt-1 p-2 bg-slate-50 rounded border border-slate-100 font-mono text-[11px] text-slate-700">
                      {zoomId || "N/A"}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Passcode:</span>
                    <div className="mt-1 p-2 bg-slate-50 rounded border border-slate-100 font-mono text-[11px] text-slate-700">
                      {zoomPasscode || "None"}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsZoomOpen(true)}
                  className="w-full mt-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Configure Video Room
                </button>
              </div>
            </AdminCard>

            <AdminCard title="Desk Audit Log" subtitle="Recent actions by this counselor">
              {auditLogs.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No activity recorded for this desk yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="text-xs space-y-0.5 border-b border-slate-100 pb-2">
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span suppressHydrationWarning>{new Date(log.createdAt).toLocaleDateString()}</span>
                        <span className="font-mono">{log.action}</span>
                      </div>
                      <p className="font-medium text-slate-800">{log.title}</p>
                      {log.description && (
                        <p className="text-slate-500 text-[11px]">{log.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </AdminCard>
          </div>
        </div>
      )}

      {/* TAB 2: ASSIGNED STUDENTS */}
      {activeTab === "students" && (
        <AdminCard title="Assigned Students Portfolio" subtitle="Students under this counselor's supervision">
          {assignedStudents.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No students assigned to this counselor desk.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Destination</th>
                    <th className="py-3 px-4">Target Intake</th>
                    <th className="py-3 px-4">Applications</th>
                    <th className="py-3 px-4">Active Stage</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignedStudents.map((s) => {
                    const apps = dataStore.getStudentApplications(s.id);
                    const journey = dataStore.getStudentJourney(s.id);
                    const activeStage = journey.find((j) => j.status === "in_progress") || journey[0];
                    return (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <Link
                            href={`/admin/students/${s.id}`}
                            className="font-bold text-slate-900 hover:text-[#253775]"
                          >
                            {s.name}
                          </Link>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {s.studentId} • {s.email}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {s.targetCountry || "United Kingdom"}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {s.targetIntake || "Fall 2026"}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700">
                            {apps.length} applications
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs font-medium text-slate-800">
                            Stage {activeStage?.stageNumber || 1}: {activeStage?.stageName}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/admin/students/${s.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-[#253775] hover:text-white rounded text-xs font-semibold transition-colors"
                          >
                            Workspace
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>
      )}

      {/* TAB 3: APPLICATIONS */}
      {activeTab === "applications" && (
        <AdminCard title="Applications Under Review" subtitle="University applications submitted or prepared">
          {applications.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              No applications currently associated with this counselor's students.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">University & Course</th>
                    <th className="py-3 px-4">Intake</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Offer</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">{app.studentName}</span>
                        <div className="text-[11px] text-slate-400 font-mono">{app.studentIdCode}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{app.universityName}</div>
                        <div className="text-[11px] text-slate-500">{app.courseName}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{app.intake}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700">
                          {app.currentStatus?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            app.offerType === "unconditional" || app.currentStatus === "unconditional_offer"
                              ? "bg-emerald-50 text-emerald-700"
                              : app.offerType === "conditional" || app.currentStatus === "conditional_offer"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {app.offerType !== "none" ? app.offerType : "Pending"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/admin/students/${app.studentId}`}
                          className="text-[#253775] font-semibold hover:underline text-xs"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>
      )}

      {/* TAB 4: DOCUMENTS */}
      {activeTab === "documents" && (
        <AdminCard title="Student Document Verification" subtitle="All documents submitted by students of this counselor">
          {allDocs.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No documents submitted yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Document</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Uploaded</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allDocs.map((doc) => {
                    const student = allStudents.find((s) => s.id === doc.studentId);
                    return (
                      <tr key={doc.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800">{doc.documentName}</span>
                          <div className="text-[10px] text-slate-400 font-mono">{doc.fileType}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800">
                            {student?.name || doc.studentId}
                          </span>
                        </td>
                        <td className="py-3 px-4 capitalize text-slate-600">{doc.category}</td>
                        <td className="py-3 px-4 text-slate-500">
                          <span suppressHydrationWarning>
                            {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : "Recent"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              doc.verificationStatus === "verified"
                                ? "bg-emerald-50 text-emerald-700"
                                : doc.verificationStatus === "rejected"
                                ? "bg-red-50 text-red-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {doc.verificationStatus.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href="/admin/documents"
                            className="text-[#253775] font-semibold hover:underline text-xs"
                          >
                            Review in Queue
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>
      )}

      {/* TAB 5: TASKS */}
      {activeTab === "tasks" && (
        <AdminCard title="Counselor & Student Tasks" subtitle="Tasks assigned to or created by this counselor">
          {tasks.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No tasks recorded for this desk.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Task</th>
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks.map((t) => {
                    const student = allStudents.find((s) => s.id === t.studentId);
                    return (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800">{t.title}</span>
                          {t.description && (
                            <p className="text-[11px] text-slate-500">{t.description}</p>
                          )}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {student?.name || t.studentId}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-medium ${
                              t.isOverdue ? "text-red-600 font-bold" : "text-slate-600"
                            }`}
                          >
                            {t.dueDate}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              t.priority === "urgent"
                                ? "bg-red-50 text-red-700"
                                : t.priority === "high"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              t.status === "completed"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>
      )}

      {/* TAB 6: MOCK INTERVIEWS */}
      {activeTab === "interviews" && (
        <AdminCard title="Mock Interview Portfolio" subtitle="Practice sessions conducted or scheduled">
          {interviews.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No mock interviews recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Interview Type</th>
                    <th className="py-3 px-4">Schedule</th>
                    <th className="py-3 px-4">Target University</th>
                    <th className="py-3 px-4">Status & Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {interviews.map((iv) => (
                    <tr key={iv.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-800">{iv.studentName}</td>
                      <td className="py-3 px-4 font-semibold text-purple-700 uppercase text-[11px]">
                        ADMISSIONS
                      </td>
                      <td suppressHydrationWarning className="py-3 px-4 text-slate-600">
                        {new Date(iv.scheduledAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td className="py-3 px-4 text-slate-700">{iv.title}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                            {iv.status}
                          </span>
                          {iv.feedback?.outcome && (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                iv.feedback.outcome === "PASS"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {iv.feedback.outcome.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>
      )}

      {/* TAB 7: ACTIVITY LOGS */}
      {activeTab === "activity" && (
        <AdminCard title="Counselor Activity History" subtitle="Audit log of actions performed by this counselor">
          {auditLogs.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No activity entries logged.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{log.title}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600">
                        {log.action}
                      </span>
                    </div>
                    {log.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{log.description}</p>
                    )}
                  </div>
                  <span suppressHydrationWarning className="text-[11px] text-slate-400 shrink-0">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </AdminCard>
      )}

      {/* TAB 8: DIRECT MESSAGES WITH COUNSELOR */}
      {activeTab === "messages" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#253775] text-white">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#253775]">
                  Confidential Leadership & Counselor Communications Desk
                </h3>
                <p className="text-[11px] text-slate-600">
                  Direct management channel between GVK Central Admissions Admin and {counselor.name}.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              🔒 Candidates & Students Have Zero Access
            </span>
          </div>

          <AdminCard
            title={`Direct Messages with ${counselor.name}`}
            subtitle="Real-time two-way operational communication channel"
          >
            <div className="space-y-4">
              {/* Message scroll area */}
              <div ref={messagesContainerRef} className="p-4 max-h-[500px] min-h-[300px] overflow-y-auto space-y-4 bg-slate-50 rounded-xl border border-slate-200">
                {adminCounselorMessages.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500">
                    <MessageSquare className="w-10 h-10 opacity-30 text-[#253775] mx-auto mb-2" />
                    <p className="font-bold text-[#253775]">No direct messages exchanged yet</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                      Send operational instructions, priority student allocations, or milestone queries directly to {counselor.name}.
                    </p>
                  </div>
                ) : (
                  adminCounselorMessages.map((msg) => {
                    const isAdmin = msg.senderRole === "admin";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isAdmin ? "items-end" : "items-start"} space-y-1`}
                      >
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 px-1">
                          <span className="font-bold text-slate-800">
                            {isAdmin ? "You (Central Admin)" : counselor.name}
                          </span>
                          <span>•</span>
                          <span suppressHydrationWarning>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div
                          className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed shadow-xs ${
                            isAdmin
                              ? "bg-[#253775] text-white rounded-tr-none"
                              : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                          }`}
                        >
                          <p>{msg.content}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Action Chips */}
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Directives:
                </span>
                <button
                  type="button"
                  onClick={() => handleMsgQuickChip("Please prioritize Fall 2026 application submissions this week.")}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-medium text-slate-700 transition-colors shrink-0 shadow-2xs"
                >
                  Prioritize Fall 2026 apps
                </button>
                <button
                  type="button"
                  onClick={() => handleMsgQuickChip("Check visa documentation checklists for assigned candidates.")}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-medium text-slate-700 transition-colors shrink-0 shadow-2xs"
                >
                  Visa checklist review
                </button>
                <button
                  type="button"
                  onClick={() => handleMsgQuickChip("Please submit the mock interview evaluation scores today.")}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-medium text-slate-700 transition-colors shrink-0 shadow-2xs"
                >
                  Mock interview scores
                </button>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendAdminMessage} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={adminMsgInput}
                  onChange={(e) => setAdminMsgInput(e.target.value)}
                  placeholder={`Dispatch management instruction or query to ${counselor.name}...`}
                  className="flex-1 px-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
                />
                <button
                  type="submit"
                  disabled={!adminMsgInput.trim() || isSendingMsg}
                  className="px-4 py-2.5 bg-[#253775] hover:bg-[#1c2a5e] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </form>
            </div>
          </AdminCard>
        </div>
      )}

      {/* EDIT COUNSELOR MODAL */}
      <AdminModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Counselor: ${counselor.name}`}
        description="Update profile details, contact information, and desk status."
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Desk Password</label>
              <input
                type="text"
                required
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none font-mono"
                placeholder="Counselor@123"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
            <input
              type="text"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization</label>
            <input
              type="text"
              value={editForm.specialization}
              onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
              placeholder="e.g. UK Russell Group, Ireland, USA STEM"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Office Hours</label>
            <input
              type="text"
              value={editForm.officeHours}
              onChange={(e) => setEditForm({ ...editForm, officeHours: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
              placeholder="e.g. Mon - Sat (10:00 AM - 6:30 PM IST)"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={editForm.isActive}
              onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
              className="w-4 h-4 text-[#253775] rounded border-slate-300"
            />
            <label htmlFor="isActive" className="text-xs font-medium text-slate-700">
              Active Desk (can receive new student allocations and conduct sessions)
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#253775] text-white rounded-lg text-xs font-semibold hover:bg-[#1c2a5e]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </AdminModal>

      {/* ZOOM CONFIG MODAL */}
      <AdminModal
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        title="Counselor Zoom Room Configuration"
        description="Configure default video room links used for counseling sessions and mock interviews."
      >
        <form onSubmit={handleSaveZoom} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Personal Meeting Room URL
            </label>
            <input
              type="url"
              required
              value={zoomUrl}
              onChange={(e) => setZoomUrl(e.target.value)}
              placeholder="https://zoom.us/j/1234567890?pwd=..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meeting ID
              </label>
              <input
                type="text"
                value={zoomId}
                onChange={(e) => setZoomId(e.target.value)}
                placeholder="123 456 7890"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Passcode (Optional)
              </label>
              <input
                type="text"
                value={zoomPasscode}
                onChange={(e) => setZoomPasscode(e.target.value)}
                placeholder="gvk2026"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none font-mono"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#253775] text-white rounded-lg text-xs font-semibold hover:bg-[#1c2a5e]"
            >
              Save Zoom Details
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
