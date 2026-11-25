"use client";

import React, { useState, useEffect, useRef } from "react";
import { dataStore } from "@/lib/data/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  User,
  Phone,
  Mail,
  Send,
  Clock,
  ShieldCheck,
  CheckCheck,
  AlertCircle,
  Search,
  Video,
  Sparkles,
  ExternalLink,
  Briefcase,
  Award,
  Calendar,
  CheckCircle2,
} from "lucide-react";

export default function StudentCounselorPage() {
  const { user } = useCurrentUser();
  const studentId = user?.role === "student" ? user.id : "usr-student-01";
  const [student, setStudent] = useState(() => dataStore.getStudentProfile(studentId));

  const [threads, setThreads] = useState(() => dataStore.getStudentCounselorThreads(studentId));
  const [selectedCounselorId, setSelectedCounselorId] = useState<string>(() => {
    const list = dataStore.getStudentCounselorThreads(studentId);
    return list.length > 0 ? list[0].counselor.id : "usr-counselor-01";
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [tick, setTick] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Sync threads and auto-select primary counselor if none selected
  const refreshThreads = () => {
    const updatedThreads = dataStore.getStudentCounselorThreads(studentId);
    setThreads(updatedThreads);
    setStudent(dataStore.getStudentProfile(studentId));

    if (!updatedThreads.some((t) => t.counselor.id === selectedCounselorId) && updatedThreads.length > 0) {
      setSelectedCounselorId(updatedThreads[0].counselor.id);
    }
    if (selectedCounselorId) {
      dataStore.markStudentMessagesAsRead(studentId, selectedCounselorId);
    }
    setTick((t) => t + 1);
  };

  useEffect(() => {
    refreshThreads();
    const unsubscribe = dataStore.subscribe(refreshThreads);
    return () => unsubscribe();
  }, [studentId, selectedCounselorId]);

  // When selected counselor changes, mark that counselor's incoming messages as read
  useEffect(() => {
    if (selectedCounselorId) {
      dataStore.markStudentMessagesAsRead(studentId, selectedCounselorId);
      refreshThreads();
    }
  }, [selectedCounselorId, studentId]);

  // Scroll to bottom of active conversation
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const activeThread = threads.find((t) => t.counselor.id === selectedCounselorId) || threads[0];
  const activeCounselor = activeThread?.counselor;

  const currentMessages = activeCounselor
    ? dataStore.getStudentCounselorMessages(studentId, activeCounselor.id)
    : [];

  useEffect(() => {
    scrollToBottom();
    const t1 = setTimeout(scrollToBottom, 50);
    const t2 = setTimeout(scrollToBottom, 200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [selectedCounselorId, currentMessages.length, tick]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeCounselor) return;

    const studentName = student
      ? `${student.firstName} ${student.lastName}`
      : user?.fullName || "Rahul Sharma";

    dataStore.sendMessage(
      studentId,
      activeCounselor.id,
      "student",
      studentName,
      inputMessage.trim()
    );

    setInputMessage("");
    refreshThreads();
    setTimeout(scrollToBottom, 50);
  };

  const handleQuickChip = (text: string) => {
    setInputMessage(text);
  };

  // Filter counselors by search
  const filteredThreads = threads.filter((t) => {
    const q = searchQuery.toLowerCase();
    const fullName = `${t.counselor.firstName} ${t.counselor.lastName}`.toLowerCase();
    const role = t.roleTag.toLowerCase();
    const code = t.counselor.employeeIdCode.toLowerCase();
    const spec = (t.counselor.specializationCountries || []).join(" ").toLowerCase();
    return fullName.includes(q) || role.includes(q) || code.includes(q) || spec.includes(q);
  });

  const getQuickPrompts = (roleTag: string) => {
    if (roleTag.includes("Visa")) {
      return [
        "What financial documents are required for my CAS?",
        "How long does the student visa processing take?",
        "Please check my TB test and maintenance funds requirement.",
      ];
    }
    if (roleTag.includes("Loan") || roleTag.includes("Finance")) {
      return [
        "Which bank is best for an unsecured education loan?",
        "Can you help follow up with the lender branch manager?",
        "What is the disbursement timeline before tuition fee deadline?",
      ];
    }
    if (roleTag.includes("SOP") || roleTag.includes("Applications")) {
      return [
        "Can you review my draft Statement of Purpose?",
        "How should I structure my academic LORs?",
        "Are there university scholarship deadlines for my intake?",
      ];
    }
    return [
      "When can we schedule our next 1-on-1 counseling call?",
      "Can we review my shortlisted universities in the UK?",
      "What documents do I need to prioritize this week?",
    ];
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
              Direct communication channels with your primary assigned counselor and specialized GVK advisory desks.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-gvk-text-secondary bg-slate-50 p-2.5 px-3.5 rounded-xl border border-gvk-border">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-gvk-navy font-bold">{threads.length} Advisory Desks Active</span>
          </div>
        </div>
      </div>

      {threads.length === 0 ? (
        /* Zero Counselors State */
        <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center space-y-4 shadow-card">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="text-lg font-bold text-gvk-navy">
              Advisory Desks Initializing
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              GVK Central Operations is configuring your overseas counseling team. Your primary admissions counselor and specialists will activate here shortly.
            </p>
          </div>
        </div>
      ) : (
        /* Multi-Counselor 2-Column Hub */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: COUNSELOR ROSTER & THREADS (4 COLS) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-gvk-border shadow-card overflow-hidden flex flex-col h-[680px]">
            {/* Roster Header & Search */}
            <div className="p-4 border-b border-gvk-border bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gvk-navy" />
                  <span className="text-xs font-bold text-gvk-navy uppercase tracking-wider">
                    My Advisors & Specialists
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200 text-gvk-navy">
                  {threads.length} Available
                </span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, visa, loan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gvk-navy/20 focus:border-gvk-navy"
                />
              </div>
            </div>

            {/* Counselors Scroll List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredThreads.map((thread) => {
                const c = thread.counselor;
                const isSelected = c.id === selectedCounselorId;
                const lastMsg = thread.lastMessage;

                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCounselorId(c.id)}
                    className={`w-full p-4 text-left transition-all flex items-start gap-3 relative ${
                      isSelected
                        ? "bg-slate-50/90 border-l-4 border-l-gvk-navy shadow-xs"
                        : "hover:bg-slate-50/50 bg-white"
                    }`}
                  >
                    {/* Avatar with Status Dot */}
                    <div className="relative shrink-0">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-xs ${
                        thread.isPrimary ? "bg-emerald-600" : "bg-gvk-navy"
                      }`}>
                        {c.firstName.charAt(0)}
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
                    </div>

                    {/* Metadata & Preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <strong className="text-xs font-bold text-gvk-navy truncate">
                          {c.firstName} {c.lastName}
                        </strong>
                        {lastMsg && (
                          <span suppressHydrationWarning className="text-[10px] font-mono text-slate-400 shrink-0">
                            {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </div>

                      {/* Specialist Badge */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider truncate ${
                          thread.isPrimary
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-blue-50 text-blue-800 border border-blue-200"
                        }`}>
                          {thread.roleTag}
                        </span>
                      </div>

                      {/* Last Message Snippet */}
                      <p className="text-[11px] text-slate-500 truncate leading-tight">
                        {lastMsg ? (
                          <>
                            <span className="font-semibold text-slate-600">
                              {lastMsg.senderRole === "student" ? "You: " : `${c.firstName}: `}
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

              {filteredThreads.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400">
                  No advisors match &ldquo;{searchQuery}&rdquo;
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: ACTIVE CHAT & SPECIALIST DESK (8 COLS) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-gvk-border shadow-card overflow-hidden flex flex-col h-[680px]">
            {activeCounselor ? (
              <>
                {/* Advisor Profile & Chat Header */}
                <div className="p-4 sm:px-6 bg-slate-50/90 border-b border-gvk-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base text-white shadow-sm shrink-0 ${
                      activeThread?.isPrimary ? "bg-emerald-600" : "bg-gvk-navy"
                    }`}>
                      {activeCounselor.firstName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm sm:text-base font-bold text-gvk-navy">
                          {activeCounselor.firstName} {activeCounselor.lastName}
                        </h2>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          activeThread?.isPrimary
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                        }`}>
                          {activeThread?.roleTag || "Admissions Specialist"}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 font-mono mt-0.5">
                        <span>{activeCounselor.employeeIdCode}</span>
                        <span>•</span>
                        <span>{activeCounselor.phone}</span>
                        <span>•</span>
                        <span className="text-slate-600 font-sans">
                          {(activeCounselor.specializationCountries || []).join(", ") || "UK, Ireland, Australia"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {activeCounselor.defaultZoomMeetingUrl && (
                      <a
                        href={activeCounselor.defaultZoomMeetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Meeting</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Messages Body */}
                <div ref={chatContainerRef} className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/30">
                  {currentMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-gvk-navy">
                        <MessageSquare className="w-6 h-6 opacity-40" />
                      </div>
                      <div className="max-w-md space-y-1">
                        <p className="font-bold text-gvk-navy text-sm">
                          Direct Communication Channel Activated
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          This is your dedicated channel with <strong>{activeCounselor.firstName} {activeCounselor.lastName}</strong> ({activeThread?.roleTag}). Send your questions, document queries, or application updates below.
                        </p>
                      </div>
                    </div>
                  ) : (
                    currentMessages.map((msg) => {
                      const isMe = msg.senderRole === "student";

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1`}
                        >
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
                            <span className="font-bold text-gvk-navy">
                              {isMe ? "You" : msg.senderName}
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
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Suggestion Chips */}
                <div className="px-4 sm:px-6 py-2 bg-slate-50 border-t border-gvk-border flex items-center gap-2 overflow-x-auto text-xs">
                  <span className="text-[10px] font-bold text-gvk-navy whitespace-nowrap flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Suggestion:
                  </span>
                  {getQuickPrompts(activeThread?.roleTag || "").map((prompt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleQuickChip(prompt)}
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
                    placeholder={`Type your message to ${activeCounselor.firstName} (${activeThread?.roleTag})...`}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="text-xs bg-slate-50/50 border-slate-200 focus:bg-white"
                  />
                  <Button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="bg-gvk-navy hover:bg-gvk-navy-dark text-white font-bold text-xs flex items-center gap-1.5 px-4 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </Button>
                </form>
              </>
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-center text-xs text-slate-400">
                Select an advisor from the left panel to begin.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
