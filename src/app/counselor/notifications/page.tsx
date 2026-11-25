"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import {
  Bell,
  CheckCheck,
  FolderLock,
  CheckSquare,
  Compass,
  Award,
  Video,
  Banknote,
  MessageSquare,
  CheckCircle2,
  Search,
  ExternalLink,
  Clock,
  Filter,
  ShieldCheck,
  ArrowRight,
  User,
} from "lucide-react";

export default function CounselorNotificationsPage() {
  const { user } = useCurrentUser();
  const counselorId = user?.role === "counselor" ? user.id : "usr-counselor-01";

  const [tick, setTick] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "document" | "task" | "journey" | "communication" | "unread"
  >("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = dataStore.subscribe(() => setTick((t) => t + 1));
    return () => unsub();
  }, []);

  const notifications = dataStore.getNotifications(counselorId);
  const students = dataStore.getAllStudents();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const docCount = notifications.filter((n) => n.category === "document" || n.title.toLowerCase().includes("document")).length;
  const taskCount = notifications.filter((n) => n.category === "task" || n.title.toLowerCase().includes("task")).length;
  const journeyCount = notifications.filter((n) => n.category === "journey" || n.title.toLowerCase().includes("stage") || n.title.toLowerCase().includes("milestone")).length;
  const commCount = notifications.filter((n) => n.category === "communication" || n.category === "message" || n.title.toLowerCase().includes("directive") || n.title.toLowerCase().includes("message")).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeFilter === "unread" && n.isRead) return false;
      if (activeFilter === "document" && n.category !== "document" && !n.title.toLowerCase().includes("document")) return false;
      if (activeFilter === "task" && n.category !== "task" && !n.title.toLowerCase().includes("task")) return false;
      if (activeFilter === "journey" && n.category !== "journey" && !n.title.toLowerCase().includes("stage") && !n.title.toLowerCase().includes("milestone")) return false;
      if (activeFilter === "communication" && n.category !== "communication" && n.category !== "message" && !n.title.toLowerCase().includes("directive") && !n.title.toLowerCase().includes("message")) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        (n.category && n.category.toLowerCase().includes(q))
      );
    });
  }, [notifications, activeFilter, searchQuery]);

  const handleMarkAllRead = () => {
    dataStore.markAllNotificationsAsRead(counselorId, "counselor");
    showToast("All counselor notifications marked as read.");
  };

  const handleMarkSingleRead = (id: string) => {
    dataStore.markNotificationRead(id);
    showToast("Notification marked as read.");
  };

  const getCategoryIcon = (category: string, title: string) => {
    const t = title.toLowerCase();
    if (category === "document" || t.includes("document")) {
      return <FolderLock className="w-5 h-5 text-amber-600" />;
    }
    if (category === "task" || t.includes("task")) {
      return <CheckSquare className="w-5 h-5 text-blue-600" />;
    }
    if (category === "journey" || t.includes("stage") || t.includes("milestone")) {
      return <Compass className="w-5 h-5 text-emerald-600" />;
    }
    if (category === "interview" || t.includes("interview")) {
      return <Video className="w-5 h-5 text-purple-600" />;
    }
    if (category === "loan" || t.includes("loan")) {
      return <Banknote className="w-5 h-5 text-emerald-600" />;
    }
    if (category === "communication" || category === "message" || t.includes("directive") || t.includes("message")) {
      return <MessageSquare className="w-5 h-5 text-[#253775]" />;
    }
    return <Bell className="w-5 h-5 text-slate-500" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2 border border-slate-700 animate-slide-in-right">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-lg bg-gvk-navy-50 text-gvk-navy">
                <Bell className="w-5 h-5 text-gvk-navy" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-gvk-navy tracking-tight">
                Counselor Notifications & Alerts Center
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gvk-text-secondary">
              Real-time alerts on candidate document uploads, submitted tasks, stage milestone achievements, and central directives.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {unreadCount > 0 ? (
              <span className="text-xs text-[#FF0008] font-bold bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#FF0008] animate-pulse"></span>
                {unreadCount} Unread Alert{unreadCount > 1 ? "s" : ""}
              </span>
            ) : (
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                All Caught Up (0 Unread)
              </span>
            )}

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                className="text-xs font-bold border-gvk-border hover:bg-slate-50 flex items-center gap-1.5"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark All Read</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filter Pills & Search Bar */}
        <div className="mt-6 pt-4 border-t border-gvk-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === "all"
                  ? "bg-gvk-navy text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              All Alerts ({notifications.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("document")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === "document"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
              }`}
            >
              <FolderLock className="w-3.5 h-3.5" />
              <span>Document Uploads ({docCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("task")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === "task"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200"
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Candidate Tasks ({taskCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("journey")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === "journey"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Milestones ({journeyCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("communication")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === "communication"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Directives ({commCount})</span>
            </button>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveFilter("unread")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeFilter === "unread"
                    ? "bg-[#FF0008] text-white shadow-xs"
                    : "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                }`}
              >
                <span>Unread Only ({unreadCount})</span>
              </button>
            )}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by keyword or candidate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gvk-navy/20 focus:border-gvk-navy focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Notifications Stream */}
      <div className="space-y-3.5">
        {filteredNotifications.map((n) => {
          const isDoc = n.category === "document" || n.title.toLowerCase().includes("document");
          const isTask = n.category === "task" || n.title.toLowerCase().includes("task");
          const isJourney = n.category === "journey" || n.title.toLowerCase().includes("stage") || n.title.toLowerCase().includes("milestone");

          return (
            <div
              key={n.id}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                !n.isRead
                  ? "bg-white border-l-4 border-l-[#253775] border-gvk-border shadow-md"
                  : "bg-white/80 border-gvk-border hover:bg-white text-slate-500 shadow-xs"
              }`}
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Icon Capsule */}
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs border ${
                    !n.isRead ? "bg-slate-50 border-slate-200" : "bg-slate-100/60 border-slate-200"
                  }`}
                >
                  {getCategoryIcon(n.category, n.title)}
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={`text-sm font-bold truncate ${!n.isRead ? "text-gvk-navy" : "text-slate-700"}`}>
                      {n.title}
                    </h3>

                    {/* Category Capsule */}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isDoc
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : isTask
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : isJourney
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {n.category || "General"}
                    </span>

                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#FF0008] shrink-0 animate-pulse" />
                    )}
                  </div>

                  <p className={`text-xs leading-relaxed max-w-3xl ${!n.isRead ? "text-slate-700" : "text-slate-500"}`}>
                    {n.message}
                  </p>

                  {/* Direct Action Link Shortcuts */}
                  <div className="pt-1.5 flex flex-wrap items-center gap-3 text-[11px]">
                    {isDoc && (
                      <Link
                        href="/counselor/documents"
                        className="text-amber-800 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                        <span>Go to Document Verification Queue &rarr;</span>
                      </Link>
                    )}

                    {isTask && (
                      <Link
                        href="/counselor/tasks"
                        className="text-blue-800 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                        <span>Review in Task Dispatcher &rarr;</span>
                      </Link>
                    )}

                    {isJourney && (
                      <Link
                        href="/counselor/students"
                        className="text-emerald-800 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <Compass className="w-3.5 h-3.5 text-emerald-600" />
                        <span>View Candidate Journey &rarr;</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Timestamp & Quick Mark Read Button */}
              <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span suppressHydrationWarning>
                    {new Date(n.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </span>

                {!n.isRead ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMarkSingleRead(n.id)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 h-8 px-2.5"
                  >
                    Mark read
                  </Button>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Read
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filteredNotifications.length === 0 && (
          <div className="bg-white rounded-2xl border border-gvk-border p-12 text-center text-slate-400 space-y-2 shadow-card">
            <Bell className="w-10 h-10 opacity-30 mx-auto text-gvk-navy" />
            <p className="font-bold text-gvk-navy text-sm">No notifications match your filter</p>
            <p className="text-xs">Try selecting &ldquo;All Alerts&rdquo; or clearing your search keywords.</p>
          </div>
        )}
      </div>
    </div>
  );
}
