"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  User,
  Send,
  Lock,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Building2,
  Sparkles,
  Search,
  Video,
  Users,
  Briefcase,
  Phone,
  Mail,
  GraduationCap,
  ExternalLink,
} from "lucide-react";

type ChannelCategory = "candidates" | "counselors" | "admin";

export default function CounselorCommunicationPage() {
  const { user } = useCurrentUser();
  const counselorId = user?.role === "counselor" ? user.id : "usr-counselor-01";

  // Category selection: candidates, peer counselors, or central admin
  const [activeCategory, setActiveCategory] = useState<ChannelCategory>("candidates");
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tick, setTick] = useState(0);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Data queries
  const candidateThreads = dataStore.getAllMessageThreads(counselorId);
  const counselorPeerThreads = dataStore.getAllCounselorPeerThreads(counselorId);
  const adminMessages = dataStore.getAdminCounselorMessages(counselorId, "counselor");

  // Unread badge calculations
  const unreadCandidateCount = candidateThreads.reduce((acc, t) => acc + (t.unreadCount || 0), 0);
  const unreadPeerCount = counselorPeerThreads.reduce((acc, t) => acc + (t.unreadCount || 0), 0);
  const unreadAdminCount = adminMessages.filter(
    (m) => m.senderRole === "admin" && (m.isRead === false || m.isRead === undefined)
  ).length;

  const totalActiveDesks = candidateThreads.length + counselorPeerThreads.length + 1;

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Helper for counselor specialist role tag
  const getCounselorRoleTag = (c: any) => {
    const specs = c.specializationCountries || [];
    if (specs.some((s: string) => s.toLowerCase().includes("loan") || s.toLowerCase().includes("finance"))) {
      return "Education Loans & Financial Aid Specialist";
    }
    if (specs.some((s: string) => s.toLowerCase().includes("visa") || s.toLowerCase().includes("canada") || s.toLowerCase().includes("usa"))) {
      return "Visa, Compliance & CAS Specialist";
    }
    if (specs.some((s: string) => s.toLowerCase().includes("germany") || s.toLowerCase().includes("sop"))) {
      return "University Shortlisting & SOP Lead";
    }
    return "Primary Admissions Counselor";
  };

  // Parse URL query parameters (?tab=admin or ?tab=counselors or ?studentId=... or ?counselorId=...)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab");
      const sId = urlParams.get("studentId");
      const cId = urlParams.get("counselorId");

      if (tabParam === "admin" || tabParam === "management") {
        setActiveCategory("admin");
        setSelectedContactId("admin");
      } else if (tabParam === "counselors" || tabParam === "peers" || cId) {
        setActiveCategory("counselors");
        if (cId) setSelectedContactId(cId);
      } else if (sId) {
        setActiveCategory("candidates");
        setSelectedContactId(sId);
      }
    }
  }, []);

  // Set default selection when category changes or if current selection is invalid
  useEffect(() => {
    if (activeCategory === "admin") {
      setSelectedContactId("admin");
    } else if (activeCategory === "candidates") {
      if (!candidateThreads.some((t) => t.student.id === selectedContactId)) {
        if (candidateThreads.length > 0) {
          setSelectedContactId(candidateThreads[0].student.id);
        } else {
          setSelectedContactId("");
        }
      }
    } else if (activeCategory === "counselors") {
      if (!counselorPeerThreads.some((t) => t.counselor.id === selectedContactId)) {
        if (counselorPeerThreads.length > 0) {
          setSelectedContactId(counselorPeerThreads[0].counselor.id);
        } else {
          setSelectedContactId("");
        }
      }
    }
  }, [activeCategory, candidateThreads.length, counselorPeerThreads.length]);

  // Mark active messages as read
  useEffect(() => {
    if (activeCategory === "admin") {
      dataStore.markAdminCounselorMessagesAsRead(counselorId, "counselor");
    } else if (activeCategory === "candidates" && selectedContactId) {
      dataStore.markCounselorMessagesAsRead(counselorId, selectedContactId);
    } else if (activeCategory === "counselors" && selectedContactId) {
      dataStore.markCounselorPeerMessagesAsRead(counselorId, selectedContactId);
    }
  }, [activeCategory, selectedContactId, counselorId, tick]);

  // Auto-scroll when messages or selected contact changes
  useEffect(() => {
    scrollToBottom();
    const t1 = setTimeout(scrollToBottom, 50);
    const t2 = setTimeout(scrollToBottom, 200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [activeCategory, selectedContactId, adminMessages.length, tick]);

  // Subscribe to real-time data changes
  useEffect(() => {
    const unsubscribe = dataStore.subscribe(() => {
      setTick((t) => t + 1);
    });
    return () => unsubscribe();
  }, []);

  // Resolve current active participant data & messages
  let activeParticipant: any = null;
  let activeMessages: any[] = [];

  if (activeCategory === "candidates") {
    const thread = candidateThreads.find((t) => t.student.id === selectedContactId) || candidateThreads[0];
    if (thread) {
      const stu = thread.student;
      activeParticipant = {
        id: stu.id,
        name: `${stu.firstName} ${stu.lastName}`,
        code: stu.studentIdCode,
        roleTag: `Candidate • ${stu.targetDegree}`,
        phone: stu.phone,
        email: dataStore.getUserEmail(stu.id) || `${stu.firstName.toLowerCase()}@example.com`,
        extra: `${stu.preferredCountry} • Intake: ${stu.targetIntake}`,
        avatarLetter: stu.firstName.charAt(0),
        workspaceUrl: `/counselor/students/${stu.id}`,
      };
      activeMessages = dataStore.getStudentCounselorMessages(stu.id, counselorId);
    }
  } else if (activeCategory === "counselors") {
    const thread = counselorPeerThreads.find((t) => t.counselor.id === selectedContactId) || counselorPeerThreads[0];
    if (thread) {
      const c = thread.counselor;
      activeParticipant = {
        id: c.id,
        name: c.name || `${c.firstName} ${c.lastName}`,
        code: c.employeeIdCode,
        roleTag: getCounselorRoleTag(c),
        phone: c.phone,
        email: c.email || dataStore.getUserEmail(c.id),
        extra: (c.specializationCountries || []).join(", ") || "Global Admissions",
        avatarLetter: c.firstName.charAt(0),
        meetingUrl: c.defaultZoomMeetingUrl,
      };
      activeMessages = dataStore.getCounselorPeerMessages(counselorId, c.id);
    }
  } else if (activeCategory === "admin") {
    activeParticipant = {
      id: "admin",
      name: "GVK Central Admissions Admin",
      code: "SUPER-ADMIN-01",
      roleTag: "Central Leadership & Operations Desk",
      phone: "+91 98490 99999",
      email: "admissions.admin@gvkedutech.com",
      extra: "Operational directives, escalations & policy guidance",
      avatarLetter: "GA",
    };
    activeMessages = adminMessages;
  }

  // Filtered contacts list
  const filteredCandidates = candidateThreads.filter((t) => {
    const q = searchQuery.toLowerCase();
    const fullName = `${t.student.firstName} ${t.student.lastName}`.toLowerCase();
    const code = (t.student.studentIdCode || "").toLowerCase();
    const degree = (t.student.targetDegree || "").toLowerCase();
    const country = (t.student.preferredCountry || "").toLowerCase();
    return fullName.includes(q) || code.includes(q) || degree.includes(q) || country.includes(q);
  });

  const filteredPeers = counselorPeerThreads.filter((t) => {
    const q = searchQuery.toLowerCase();
    const fullName = (t.counselor.name || `${t.counselor.firstName} ${t.counselor.lastName}`).toLowerCase();
    const code = (t.counselor.employeeIdCode || "").toLowerCase();
    const role = getCounselorRoleTag(t.counselor).toLowerCase();
    const spec = (t.counselor.specializationCountries || []).join(" ").toLowerCase();
    return fullName.includes(q) || code.includes(q) || role.includes(q) || spec.includes(q);
  });

  // Suggestion chips tailored to current channel
  const getSuggestions = () => {
    if (activeCategory === "candidates") {
      const firstName = activeParticipant ? activeParticipant.name.split(" ")[0] : "Candidate";
      return [
        `${firstName}, please upload your latest passport copy for CAS.`,
        `Can we review your shortlisted universities in the UK?`,
        `Let's schedule a mock visa interview session this week.`,
        `Your university application has been successfully submitted!`,
        `We have received an update on your conditional offer.`,
      ];
    }
    if (activeCategory === "counselors") {
      return [
        `Can you review the CAS checklist for this candidate?`,
        `Could you cover my mock interview slot tomorrow?`,
        `Let's align on the university application deadlines for Fall 2026.`,
        `Candidate profile documents have been verified and ready.`,
        `Sharing notes from my counseling session.`,
      ];
    }
    return [
      `Understood Central Admin. The visa checklist is updated.`,
      `Priority applications submitted. Awaiting university responses.`,
      `Requesting additional guidance on Fall 2026 scholarship criteria.`,
      `Weekly counseling progress and lodgement report submitted.`,
    ];
  };

  // Send message handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const counselorProfile = dataStore.getCounselorProfile(counselorId);
    const counselorName = counselorProfile
      ? `${counselorProfile.firstName} ${counselorProfile.lastName}`
      : user?.fullName || "Priya Varma";

    if (activeCategory === "candidates" && selectedContactId) {
      dataStore.sendMessage(
        selectedContactId,
        counselorId,
        "counselor",
        counselorName,
        inputText.trim()
      );
    } else if (activeCategory === "counselors" && selectedContactId) {
      dataStore.sendCounselorPeerMessage(
        counselorId,
        counselorName,
        selectedContactId,
        activeParticipant?.name || "Colleague Counselor",
        inputText.trim()
      );
    } else if (activeCategory === "admin") {
      dataStore.sendAdminCounselorMessage(
        counselorId,
        "counselor",
        counselorName,
        inputText.trim()
      );
    }

    setInputText("");
    setIsSubmitting(false);
    setTick((t) => t + 1);
    setTimeout(scrollToBottom, 50);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-lg bg-gvk-navy-50 text-gvk-navy">
                <MessageSquare className="w-5 h-5 text-gvk-navy" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-gvk-navy tracking-tight">
                Advisory & Counselor Communications Hub
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gvk-text-secondary">
              Direct communication channels with your candidates, fellow counselors, and GVK Central Admissions Admin.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-gvk-text-secondary bg-slate-50 p-2.5 px-3.5 rounded-xl border border-gvk-border">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-gvk-navy font-bold">{totalActiveDesks} Advisory Desks Active</span>
          </div>
        </div>

        {/* Category Channel Switcher */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-gvk-border">
          <button
            type="button"
            onClick={() => {
              setActiveCategory("candidates");
              if (candidateThreads.length > 0) setSelectedContactId(candidateThreads[0].student.id);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === "candidates"
                ? "bg-gvk-navy text-white shadow-sm"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Candidates ({candidateThreads.length})</span>
            {unreadCandidateCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF0008] text-white animate-pulse">
                {unreadCandidateCount} new
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveCategory("counselors");
              if (counselorPeerThreads.length > 0) setSelectedContactId(counselorPeerThreads[0].counselor.id);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === "counselors"
                ? "bg-gvk-navy text-white shadow-sm"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Fellow Counselors ({counselorPeerThreads.length})</span>
            {unreadPeerCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF0008] text-white animate-pulse">
                {unreadPeerCount} new
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveCategory("admin");
              setSelectedContactId("admin");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === "admin"
                ? "bg-gvk-navy text-white shadow-sm"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Central Admin</span>
            {unreadAdminCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF0008] text-white animate-pulse">
                {unreadAdminCount} new
              </span>
            )}
            <span className="hidden sm:inline-block ml-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
              Admin Only
            </span>
          </button>
        </div>
      </div>

      {/* 2-COLUMN COMMUNICATIONS DESK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: ROSTER LIST (4 COLS) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gvk-border shadow-card overflow-hidden flex flex-col h-[680px]">
          {/* Header & Search */}
          <div className="p-4 border-b border-gvk-border bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {activeCategory === "candidates" && <User className="w-4 h-4 text-gvk-navy" />}
                {activeCategory === "counselors" && <Users className="w-4 h-4 text-gvk-navy" />}
                {activeCategory === "admin" && <Building2 className="w-4 h-4 text-gvk-navy" />}
                <span className="text-xs font-bold text-gvk-navy uppercase tracking-wider">
                  {activeCategory === "candidates" && "All Enrolled Candidates"}
                  {activeCategory === "counselors" && "Counselor Peer Network"}
                  {activeCategory === "admin" && "Executive Management"}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200 text-gvk-navy">
                {activeCategory === "candidates" && `${filteredCandidates.length} Active`}
                {activeCategory === "counselors" && `${filteredPeers.length} Colleagues`}
                {activeCategory === "admin" && "Direct Line"}
              </span>
            </div>

            {activeCategory !== "admin" && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={
                    activeCategory === "candidates"
                      ? "Search candidate by name, degree, id..."
                      : "Search fellow counselor by name, role..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gvk-navy/20 focus:border-gvk-navy"
                />
              </div>
            )}
          </div>

          {/* Roster Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {/* CATEGORY 1: CANDIDATES */}
            {activeCategory === "candidates" && (
              <>
                {filteredCandidates.map((thread) => {
                  const stu = thread.student;
                  const isSelected = stu.id === selectedContactId;
                  const lastMsg = thread.lastMessage;

                  return (
                    <button
                      key={stu.id}
                      type="button"
                      onClick={() => setSelectedContactId(stu.id)}
                      className={`w-full p-4 text-left transition-all flex items-start gap-3 relative ${
                        isSelected
                          ? "bg-slate-50/90 border-l-4 border-l-gvk-navy shadow-xs"
                          : "hover:bg-slate-50/50 bg-white"
                      }`}
                    >
                      {/* Avatar with Status Dot */}
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-full bg-gvk-navy text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          {stu.firstName.charAt(0)}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
                      </div>

                      {/* Info & Preview */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <strong className="text-xs font-bold text-gvk-navy truncate">
                            {stu.firstName} {stu.lastName}
                          </strong>
                          {lastMsg && (
                            <span suppressHydrationWarning className="text-[10px] font-mono text-slate-400 shrink-0">
                              {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>

                        {/* Candidate Target Badge */}
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider truncate bg-blue-50 text-blue-800 border border-blue-200">
                            {stu.targetDegree || "Undergraduate"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {stu.preferredCountry}
                          </span>
                        </div>

                        {/* Last Message Snippet */}
                        <p className="text-[11px] text-slate-500 truncate leading-tight">
                          {lastMsg ? (
                            <>
                              <span className="font-semibold text-slate-600">
                                {lastMsg.senderRole === "counselor" ? "You: " : `${stu.firstName}: `}
                              </span>
                              {lastMsg.content}
                            </>
                          ) : (
                            <span className="italic text-slate-400">Click to start conversation</span>
                          )}
                        </p>
                      </div>

                      {/* Unread Pill Counter */}
                      {thread.unreadCount > 0 && (
                        <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-[#FF0008] text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-pulse">
                          {thread.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })}

                {filteredCandidates.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No candidates found matching &ldquo;{searchQuery}&rdquo;
                  </div>
                )}
              </>
            )}

            {/* CATEGORY 2: FELLOW COUNSELORS */}
            {activeCategory === "counselors" && (
              <>
                {filteredPeers.map((thread) => {
                  const peer = thread.counselor;
                  const isSelected = peer.id === selectedContactId;
                  const lastMsg = thread.lastMessage;
                  const roleTag = getCounselorRoleTag(peer);

                  return (
                    <button
                      key={peer.id}
                      type="button"
                      onClick={() => setSelectedContactId(peer.id)}
                      className={`w-full p-4 text-left transition-all flex items-start gap-3 relative ${
                        isSelected
                          ? "bg-slate-50/90 border-l-4 border-l-gvk-navy shadow-xs"
                          : "hover:bg-slate-50/50 bg-white"
                      }`}
                    >
                      {/* Avatar with Status Dot */}
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          {peer.firstName.charAt(0)}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
                      </div>

                      {/* Info & Preview */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <strong className="text-xs font-bold text-gvk-navy truncate">
                            {peer.firstName} {peer.lastName}
                          </strong>
                          {lastMsg && (
                            <span suppressHydrationWarning className="text-[10px] font-mono text-slate-400 shrink-0">
                              {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>

                        {/* Specialist Badge */}
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider truncate bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {roleTag}
                          </span>
                        </div>

                        {/* Last Message Snippet */}
                        <p className="text-[11px] text-slate-500 truncate leading-tight">
                          {lastMsg ? (
                            <>
                              <span className="font-semibold text-slate-600">
                                {lastMsg.senderId === counselorId ? "You: " : `${peer.firstName}: `}
                              </span>
                              {lastMsg.content}
                            </>
                          ) : (
                            <span className="italic text-slate-400">Click to start conversation</span>
                          )}
                        </p>
                      </div>

                      {/* Unread Pill Counter */}
                      {thread.unreadCount > 0 && (
                        <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-[#FF0008] text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-pulse">
                          {thread.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })}

                {filteredPeers.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No colleague counselors matching &ldquo;{searchQuery}&rdquo;
                  </div>
                )}
              </>
            )}

            {/* CATEGORY 3: CENTRAL ADMIN */}
            {activeCategory === "admin" && (
              <button
                type="button"
                onClick={() => setSelectedContactId("admin")}
                className="w-full p-4 text-left transition-all flex items-start gap-3 relative bg-slate-50/90 border-l-4 border-l-gvk-navy shadow-xs"
              >
                {/* Avatar with Status Dot */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-gvk-navy text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    GA
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
                </div>

                {/* Info & Preview */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <strong className="text-xs font-bold text-gvk-navy truncate">
                      GVK Central Admissions Admin
                    </strong>
                    {adminMessages.length > 0 && (
                      <span suppressHydrationWarning className="text-[10px] font-mono text-slate-400 shrink-0">
                        {new Date(adminMessages[adminMessages.length - 1].createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>

                  {/* Specialist Badge */}
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider truncate bg-purple-50 text-purple-800 border border-purple-200">
                      Super Admin Desk
                    </span>
                    <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 rounded border border-amber-200">
                      Confidential
                    </span>
                  </div>

                  {/* Last Message Snippet */}
                  <p className="text-[11px] text-slate-500 truncate leading-tight">
                    {adminMessages.length > 0 ? (
                      <>
                        <span className="font-semibold text-slate-600">
                          {adminMessages[adminMessages.length - 1].senderRole === "counselor" ? "You: " : "Admin: "}
                        </span>
                        {adminMessages[adminMessages.length - 1].content}
                      </>
                    ) : (
                      <span className="italic text-slate-400">Direct leadership channel</span>
                    )}
                  </p>
                </div>

                {/* Unread Pill Counter */}
                {unreadAdminCount > 0 && (
                  <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-[#FF0008] text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-pulse">
                    {unreadAdminCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE CHAT DESK (8 COLS) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gvk-border shadow-card overflow-hidden flex flex-col h-[680px]">
          {activeParticipant ? (
            <>
              {/* Active Header */}
              <div className="p-4 sm:px-6 bg-slate-50/90 border-b border-gvk-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base text-white shadow-sm shrink-0 ${
                    activeCategory === "counselors" ? "bg-emerald-700" : "bg-gvk-navy"
                  }`}>
                    {activeParticipant.avatarLetter}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-bold text-gvk-navy">
                        {activeParticipant.name}
                      </h2>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        activeCategory === "counselors"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : activeCategory === "candidates"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-purple-100 text-purple-800 border border-purple-200"
                      }`}>
                        {activeParticipant.roleTag}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 font-mono mt-0.5">
                      <span>{activeParticipant.code}</span>
                      <span>•</span>
                      <span>{activeParticipant.phone}</span>
                      <span>•</span>
                      <span className="text-slate-600 font-sans">{activeParticipant.extra}</span>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {activeCategory === "candidates" && activeParticipant.workspaceUrl && (
                    <Link href={activeParticipant.workspaceUrl}>
                      <Button variant="outline" size="sm" className="font-bold text-xs h-8 flex items-center gap-1.5">
                        <span>Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  )}

                  {activeCategory === "counselors" && activeParticipant.meetingUrl && (
                    <a
                      href={activeParticipant.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Zoom</span>
                    </a>
                  )}

                  {activeCategory === "admin" && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      🔒 Leadership Direct Desk
                    </span>
                  )}
                </div>
              </div>

              {/* Messages Body */}
              <div ref={chatContainerRef} className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/30">
                {activeMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-gvk-navy">
                      <MessageSquare className="w-6 h-6 opacity-40" />
                    </div>
                    <div className="max-w-md space-y-1">
                      <p className="font-bold text-gvk-navy text-sm">
                        Direct Communication Channel Ready
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Send guidance, status updates, or coordinate activities with <strong>{activeParticipant.name}</strong> below.
                      </p>
                    </div>
                  </div>
                ) : (
                  activeMessages.map((msg) => {
                    const isMe =
                      activeCategory === "candidates"
                        ? msg.senderRole === "counselor"
                        : activeCategory === "counselors"
                        ? msg.senderId === counselorId
                        : msg.senderRole === "counselor";

                    const senderLabel = isMe
                      ? "You (Counselor)"
                      : activeCategory === "candidates"
                      ? msg.senderName
                      : activeCategory === "counselors"
                      ? msg.senderName
                      : "GVK Central Admissions Admin";

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
                          <span className="font-bold text-gvk-navy">{senderLabel}</span>
                          <span>•</span>
                          <span suppressHydrationWarning>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div
                          className={`max-w-[82%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                            isMe
                              ? "bg-gvk-navy text-white rounded-tr-none"
                              : "bg-white text-slate-800 border border-slate-200/90 rounded-tl-none"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Suggestion Chips */}
              <div className="px-4 sm:px-6 py-2 bg-slate-50 border-t border-gvk-border flex items-center gap-2 overflow-x-auto text-xs">
                <span className="text-[10px] font-bold text-gvk-navy whitespace-nowrap flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Suggestion:
                </span>
                {getSuggestions().map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setInputText(prompt)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-gvk-navy hover:text-gvk-navy text-[11px] font-medium text-slate-600 transition-colors shrink-0 shadow-2xs"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 bg-white border-t border-gvk-border flex items-center gap-2"
              >
                <Input
                  type="text"
                  placeholder={`Type your message to ${activeParticipant.name}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="text-xs bg-slate-50/50 border-slate-200 focus:bg-white"
                />
                <Button
                  type="submit"
                  disabled={!inputText.trim() || isSubmitting}
                  className="bg-gvk-navy hover:bg-gvk-navy-dark text-white font-bold text-xs flex items-center gap-1.5 px-4 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </Button>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center p-8 text-center text-xs text-slate-400">
              Select a contact from the left panel to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
