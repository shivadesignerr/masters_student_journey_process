"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  Users,
  GraduationCap,
  Send,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Building2,
  ExternalLink,
  Megaphone,
  Bell,
  ArrowRight,
  Filter,
  CheckCheck,
} from "lucide-react";

export default function AdminCommunicationPage() {
  const { user } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<"counselors" | "candidates" | "broadcast">("counselors");
  const [counselors, setCounselors] = useState(() => dataStore.getAllCounselors());
  const [selectedCounselorId, setSelectedCounselorId] = useState<string>("usr-counselor-01");
  const [counselorSearch, setCounselorSearch] = useState("");
  const [candidateSearch, setCandidateSearch] = useState("");
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("usr-student-01");
  const [tick, setTick] = useState(0);

  // Broadcast announcement state
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState<"all" | "counselor" | "student">("all");
  const [broadcastCategory, setBroadcastCategory] = useState<"system" | "deadline" | "general">("system");
  const [broadcastSentNotification, setBroadcastSentNotification] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const counselorMessagesContainerRef = useRef<HTMLDivElement>(null);
  const candidateMessagesContainerRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const broadcastTitleRef = useRef<HTMLInputElement>(null);
  const broadcastMessageRef = useRef<HTMLTextAreaElement>(null);

  // Read URL query params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const counselorParam = params.get("counselor");
      const tabParam = params.get("tab");
      if (tabParam === "candidates" || tabParam === "broadcast") {
        setActiveTab(tabParam);
      }
      if (counselorParam) {
        setSelectedCounselorId(counselorParam);
      }
    }
  }, []);

  // Sync dataStore changes
  const refreshData = () => {
    setCounselors(dataStore.getAllCounselors());
    setTick((t) => t + 1);
  };

  useEffect(() => {
    const unsubscribe = dataStore.subscribe(refreshData);
    return () => unsubscribe();
  }, []);

  // Automatically mark active counselor messages as read by admin
  useEffect(() => {
    if (activeTab === "counselors" && selectedCounselorId) {
      dataStore.markAdminCounselorMessagesAsRead(selectedCounselorId);
    }
  }, [activeTab, selectedCounselorId, tick]);

  const scrollToCounselorBottom = () => {
    if (counselorMessagesContainerRef.current) {
      counselorMessagesContainerRef.current.scrollTop = counselorMessagesContainerRef.current.scrollHeight;
    }
  };

  const scrollToCandidateBottom = () => {
    if (candidateMessagesContainerRef.current) {
      candidateMessagesContainerRef.current.scrollTop = candidateMessagesContainerRef.current.scrollHeight;
    }
  };

  // Active counselor profile
  const selectedCounselor = useMemo(() => {
    const found = counselors.find((c) => c.id === selectedCounselorId);
    if (found) return found;
    return (
      counselors[0] || {
        id: "usr-counselor-01",
        firstName: "Priya",
        lastName: "Varma",
        employeeIdCode: "GVK-EMP-014",
        email: "counselor.priya@gvkedutech.com",
        phone: "+91 98490 12345",
        specialization: "United Kingdom, Ireland, Australia",
        assignedStudentIds: ["usr-student-01"],
        status: "active",
      }
    );
  }, [counselors, selectedCounselorId]);

  // Admin <-> Counselor messages for selected counselor
  const currentThreadMessages = useMemo(() => {
    return dataStore.getAdminCounselorMessages(selectedCounselorId, "admin");
  }, [selectedCounselorId, counselors, tick]);

  // Unread status per counselor
  const unreadPerCounselor = useMemo(() => {
    const unreadMap: Record<string, number> = {};
    counselors.forEach((c) => {
      const msgs = dataStore.getAdminCounselorMessages(c.id, "admin");
      const unread = msgs.filter((m) => m.senderRole === "counselor" && m.isRead !== true).length;
      unreadMap[c.id] = unread;
    });
    return unreadMap;
  }, [counselors, currentThreadMessages, tick]);

  const totalUnreadCounselorAlerts = useMemo(() => {
    return dataStore.getUnreadMessageSendersCount("admin");
  }, [counselors, currentThreadMessages, tick]);

  // Students for Candidate Oversight tab
  const allStudents = useMemo(() => {
    return dataStore.getAllStudents();
  }, [tick]);

  const filteredStudents = useMemo(() => {
    if (!candidateSearch.trim()) return allStudents;
    const q = candidateSearch.toLowerCase();
    return allStudents.filter(
      (s) =>
        (s.name || `${s.firstName} ${s.lastName}`).toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.studentIdCode || s.id).toLowerCase().includes(q) ||
        (s.targetCountry || s.preferredCountry || "").toLowerCase().includes(q)
    );
  }, [allStudents, candidateSearch]);

  const selectedStudent = useMemo(() => {
    return allStudents.find((s) => s.id === selectedStudentId) || allStudents[0];
  }, [allStudents, selectedStudentId]);

  const studentCounselorThread = useMemo(() => {
    if (!selectedStudent) return [];
    return dataStore.getMessages(selectedStudent.id);
  }, [selectedStudent, tick]);

  // Scroll counselor messages to bottom instantly on switch or new message
  useEffect(() => {
    if (activeTab === "counselors") {
      scrollToCounselorBottom();
      const t1 = setTimeout(scrollToCounselorBottom, 50);
      const t2 = setTimeout(scrollToCounselorBottom, 200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [selectedCounselorId, activeTab, currentThreadMessages.length]);

  // Scroll candidate messages to bottom instantly on switch
  useEffect(() => {
    if (activeTab === "candidates") {
      scrollToCandidateBottom();
      const t1 = setTimeout(scrollToCandidateBottom, 50);
      const t2 = setTimeout(scrollToCandidateBottom, 200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [selectedStudentId, activeTab, studentCounselorThread.length]);

  // Handler: Mark all counselor messages read
  const handleMarkAllRead = () => {
    dataStore.markAdminCounselorMessagesAsRead();
    refreshData();
  };

  // Handler: Send directive / message to counselor
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) {
      composerRef.current?.focus();
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    const adminName = user?.fullName || "Super Administrator";

    dataStore.sendAdminCounselorMessage(
      selectedCounselorId,
      "admin",
      adminName,
      replyText.trim()
    );

    dataStore.markAdminCounselorMessagesAsRead(selectedCounselorId);
    setReplyText("");
    setIsSubmitting(false);
    refreshData();
  };

  // Quick directive chip appender
  const handleAddChip = (text: string) => {
    setReplyText((prev) => (prev ? `${prev} ${text}` : text));
  };

  // Handler: Dispatch System Broadcast Announcement
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim()) {
      broadcastTitleRef.current?.focus();
      return;
    }
    if (!broadcastMessage.trim()) {
      broadcastMessageRef.current?.focus();
      return;
    }

    dataStore.broadcastNotification(
      broadcastTitle.trim(),
      broadcastMessage.trim(),
      broadcastTarget
    );

    setBroadcastSentNotification(`Announcement "${broadcastTitle.trim()}" dispatched successfully to ${broadcastTarget.toUpperCase()}!`);
    setBroadcastTitle("");
    setBroadcastMessage("");
    setTimeout(() => {
      setBroadcastSentNotification(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-[#253775]/10 text-[#253775] text-[11px] font-extrabold uppercase tracking-wider">
              Central Command
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-500 text-xs font-semibold">Executive Operations</span>
          </div>
          <h1 className="text-2xl font-black text-gvk-navy tracking-tight mt-1">
            Communications & Directives Hub
          </h1>
          <p className="text-xs text-gvk-text-secondary mt-1">
            Super Administrator direct operational channels with counselors, candidate thread oversight, and central announcements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {totalUnreadCounselorAlerts > 0 ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-xs animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{totalUnreadCounselorAlerts} Unread Counselor Channel{totalUnreadCounselorAlerts > 1 ? "s" : ""}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>All Counselor Channels Synchronized</span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-slate-700 hover:text-gvk-navy hover:bg-slate-50 border-slate-300"
          >
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-gvk-border gap-2">
        <button
          onClick={() => setActiveTab("counselors")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "counselors"
              ? "border-[#253775] text-[#253775] bg-white rounded-t-xl shadow-xs"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Counselor Leadership Channels</span>
          {totalUnreadCounselorAlerts > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
              {totalUnreadCounselorAlerts}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("candidates")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "candidates"
              ? "border-[#253775] text-[#253775] bg-white rounded-t-xl shadow-xs"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Candidate & Counselor Oversight</span>
        </button>

        <button
          onClick={() => setActiveTab("broadcast")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "broadcast"
              ? "border-[#253775] text-[#253775] bg-white rounded-t-xl shadow-xs"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Dispatch System Announcement</span>
        </button>
      </div>

      {/* TAB 1: COUNSELOR CHANNELS */}
      {activeTab === "counselors" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Counselors Roster Sidebar (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-gvk-border shadow-card overflow-hidden">
            <div className="p-4 border-b border-gvk-border bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gvk-navy">Counselor Desks</h3>
                <p className="text-[11px] text-gvk-text-secondary">Direct management directives</p>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                {counselors.length} Active
              </span>
            </div>

            <div className="p-3 border-b border-gvk-border">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <Input
                  value={counselorSearch}
                  onChange={(e) => setCounselorSearch(e.target.value)}
                  placeholder="Filter counselors..."
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {counselors
                .filter(
                  (c) =>
                    !counselorSearch.trim() ||
                    `${c.firstName} ${c.lastName}`.toLowerCase().includes(counselorSearch.toLowerCase()) ||
                    (c.employeeIdCode || c.id).toLowerCase().includes(counselorSearch.toLowerCase())
                )
                .map((c) => {
                  const isSelected = c.id === selectedCounselorId;
                  const unread = unreadPerCounselor[c.id] || 0;
                  const specDisplay = Array.isArray(c.specialization)
                    ? c.specialization.join(", ")
                    : c.specialization || (c as any).specializationCountries?.join(", ") || "Admissions Specialist";

                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCounselorId(c.id);
                        dataStore.markAdminCounselorMessagesAsRead(c.id);
                      }}
                      className={`w-full p-4 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-slate-50 border-l-4 border-[#253775]"
                          : "hover:bg-slate-50/60"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#253775] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                        {c.firstName.charAt(0)}
                        {c.lastName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-gvk-navy truncate">
                            {c.firstName} {c.lastName}
                          </span>
                          {unread > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shrink-0">
                              {unread} new
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-slate-500 font-semibold mt-0.5">
                          {c.employeeIdCode || c.id}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-1">
                          {specDisplay}
                        </p>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Active Counselor Communication Workspace (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-gvk-border shadow-card flex flex-col h-[700px] overflow-hidden">
            {/* Thread Header */}
            <div className="p-4 border-b border-gvk-border bg-slate-50/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-[#253775] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                  {selectedCounselor.firstName.charAt(0)}
                  {selectedCounselor.lastName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-gvk-navy truncate">
                      {selectedCounselor.firstName} {selectedCounselor.lastName}
                    </h2>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
                      {selectedCounselor.employeeIdCode || selectedCounselor.id}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active Desk"></span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {selectedCounselor.email} • {selectedCounselor.phone} • {Array.isArray(selectedCounselor.specialization) ? selectedCounselor.specialization.join(", ") : selectedCounselor.specialization || "Admissions Specialist"}
                  </p>
                </div>
              </div>

              <Link
                href={`/admin/counselors/${selectedCounselor.id}`}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-gvk-navy hover:bg-slate-50 transition-colors shadow-xs"
              >
                <span>Desk Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Directive Quick Chips Bar */}
            <div className="px-4 py-2.5 bg-slate-50 border-b border-gvk-border flex items-center gap-2 overflow-x-auto text-xs">
              <span className="font-bold text-[11px] text-slate-600 flex items-center gap-1 shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Directive Chips:
              </span>
              <button
                type="button"
                onClick={() => handleAddChip("Prioritize Fall 2026 intake applications and document verification today.")}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-[#253775] hover:text-[#253775] text-[11px] font-semibold transition-colors shrink-0 cursor-pointer"
              >
                + Fall 2026 Priority
              </button>
              <button
                type="button"
                onClick={() => handleAddChip("Please ensure 28-day financial statement audit is signed off for visa submission.")}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-[#253775] hover:text-[#253775] text-[11px] font-semibold transition-colors shrink-0 cursor-pointer"
              >
                + Visa Financial Audit
              </button>
              <button
                type="button"
                onClick={() => handleAddChip("Schedule mock visa interview before CAS issuance deadline.")}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-[#253775] hover:text-[#253775] text-[11px] font-semibold transition-colors shrink-0 cursor-pointer"
              >
                + Mock Interview Setup
              </button>
            </div>

            {/* Messages Stream */}
            <div ref={counselorMessagesContainerRef} className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/30">
              {currentThreadMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                  <MessageSquare className="w-10 h-10 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-600">No directives exchanged with this counselor yet.</p>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Dispatch an instruction or policy update using the composer below. Counselors receive real-time updates on their portal.
                  </p>
                </div>
              ) : (
                currentThreadMessages.map((msg) => {
                  const isAdmin = msg.senderRole === "admin";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[11px] font-bold text-slate-700">
                          {isAdmin ? "Super Administrator" : msg.senderName || `${selectedCounselor.firstName} ${selectedCounselor.lastName}`}
                        </span>
                        <span suppressHydrationWarning className="text-[10px] text-slate-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div
                        className={`max-w-[78%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                          isAdmin
                            ? "bg-[#253775] text-white rounded-tr-none font-medium"
                            : "bg-white text-slate-800 border border-slate-200 rounded-tl-none font-medium"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Composer */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gvk-border bg-white flex flex-col gap-2">
              <Textarea
                ref={composerRef}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Dispatch directive or operational query to ${selectedCounselor.firstName}... (Enter to send)`}
                rows={2}
                className="resize-none text-xs focus-visible:ring-[#253775]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Press <kbd className="px-1.5 py-0.5 rounded-md bg-slate-100 border text-[10px]">Enter</kbd> to dispatch
                </span>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-[#253775] hover:bg-[#1a2754] text-white font-bold text-xs gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Directive</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: CANDIDATE & COUNSELOR OVERSIGHT */}
      {activeTab === "candidates" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Candidates Roster Sidebar */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-gvk-border shadow-card overflow-hidden">
            <div className="p-4 border-b border-gvk-border bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gvk-navy">Enrolled Candidates</h3>
                <p className="text-[11px] text-gvk-text-secondary">Student-counselor live chat audit</p>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                {allStudents.length} Students
              </span>
            </div>

            <div className="p-3 border-b border-gvk-border">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <Input
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  placeholder="Search candidate by name, course..."
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {filteredStudents.map((s) => {
                const isSelected = s.id === selectedStudentId;
                const assignedCounselor = dataStore.getAssignedCounselor(s.id);

                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStudentId(s.id)}
                    className={`w-full p-4 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-slate-50 border-l-4 border-[#253775]"
                        : "hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                      {(s.name || s.firstName || "S").charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-gvk-navy truncate">
                          {s.name || `${s.firstName} ${s.lastName}`}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {s.targetIntake}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate mt-0.5">
                        {s.targetDegree} • {s.targetCountry || s.preferredCountry}
                      </p>
                      <p className="text-[11px] text-indigo-700 font-semibold truncate mt-1">
                        Counselor: {assignedCounselor ? `${assignedCounselor.firstName} ${assignedCounselor.lastName}` : "Admissions Pool"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Candidate Conversation Audit View */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-gvk-border shadow-card flex flex-col h-[700px] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gvk-border bg-slate-50/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {(selectedStudent.name || selectedStudent.firstName || "S").charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-gvk-navy truncate">
                      {selectedStudent.name || `${selectedStudent.firstName} ${selectedStudent.lastName}`}
                    </h2>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold font-mono">
                      {selectedStudent.studentIdCode || selectedStudent.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                      Audit Stream
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {selectedStudent.email} • {selectedStudent.targetDegree} ({selectedStudent.targetCountry || selectedStudent.preferredCountry})
                  </p>
                </div>
              </div>

              <Link
                href={`/admin/students/${selectedStudent.id}`}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-gvk-navy hover:bg-slate-50 transition-colors shadow-xs"
              >
                <span>Student Dossier</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Conversation Messages */}
            <div ref={candidateMessagesContainerRef} className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/30">
              {studentCounselorThread.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                  <GraduationCap className="w-10 h-10 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-600">No message history recorded for this candidate.</p>
                  <p className="text-xs text-slate-400 max-w-sm">
                    When the student exchanges messages with their assigned counselor, the thread is archived here for quality assurance.
                  </p>
                </div>
              ) : (
                studentCounselorThread.map((msg) => {
                  const isStudent = msg.senderRole === "student";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isStudent ? "items-start" : "items-end"}`}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[11px] font-bold text-slate-700">
                          {isStudent ? (selectedStudent.name || `${selectedStudent.firstName} ${selectedStudent.lastName}`) : msg.senderName || "Counselor"}
                        </span>
                        <span suppressHydrationWarning className="text-[10px] text-slate-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div
                        className={`max-w-[78%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                          isStudent
                            ? "bg-white text-slate-800 border border-slate-200 rounded-tl-none font-medium"
                            : "bg-[#253775] text-white rounded-tr-none font-medium"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Audit Notice Footer */}
            <div className="p-3.5 border-t border-gvk-border bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Super Administrator Oversight Mode (Read-only Compliance Trail)</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Audit Hash: SHA-256 Verified
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DISPATCH SYSTEM ANNOUNCEMENT */}
      {activeTab === "broadcast" && (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-6">
          <div>
            <h2 className="text-base font-bold text-gvk-navy flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#FF0008]" />
              Dispatch Organization-wide Announcement
            </h2>
            <p className="text-xs text-gvk-text-secondary mt-1">
              Broadcast critical intake dates, regulatory advisories, or operational notices across portals.
            </p>
          </div>

          {broadcastSentNotification && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{broadcastSentNotification}</span>
            </div>
          )}

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Audience *
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setBroadcastTarget("all")}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                    broadcastTarget === "all"
                      ? "border-[#253775] bg-[#253775]/5 text-[#253775] ring-2 ring-[#253775]/20"
                      : "border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  Entire Network (All)
                </button>
                <button
                  type="button"
                  onClick={() => setBroadcastTarget("counselor")}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                    broadcastTarget === "counselor"
                      ? "border-[#253775] bg-[#253775]/5 text-[#253775] ring-2 ring-[#253775]/20"
                      : "border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  Counselors Only
                </button>
                <button
                  type="button"
                  onClick={() => setBroadcastTarget("student")}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                    broadcastTarget === "student"
                      ? "border-[#253775] bg-[#253775]/5 text-[#253775] ring-2 ring-[#253775]/20"
                      : "border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  Candidates & Students
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Announcement Title *
                </label>
                <Input
                  ref={broadcastTitleRef}
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. UKVI Visa Policy Directive Update"
                  className="text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Category / Urgency
                </label>
                <select
                  value={broadcastCategory}
                  onChange={(e) => setBroadcastCategory(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="system">System / Operations Update</option>
                  <option value="deadline">Intake Deadline Alert (Urgent)</option>
                  <option value="general">General Notice</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Announcement Message *
              </label>
              <Textarea
                ref={broadcastMessageRef}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Enter complete directive details to be displayed on recipients' notification feed..."
                rows={4}
                className="text-xs"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="submit"
                className="bg-[#253775] hover:bg-[#1a2754] text-white font-bold text-xs gap-1.5 px-6 cursor-pointer"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Broadcast Announcement Now</span>
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
