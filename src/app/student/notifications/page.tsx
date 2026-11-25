"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import {
  Bell,
  CheckCheck,
  Award,
  FolderLock,
  CheckSquare,
  Video,
  Info,
  Banknote,
  MessageSquare,
  CheckCircle2,
  Search,
  Clock,
  Compass,
  ArrowRight,
} from "lucide-react";

export default function StudentNotificationsPage() {
  const { user } = useCurrentUser();
  const studentId = user?.role === "student" ? user.id : "usr-student-01";

  const [tick, setTick] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "document" | "task" | "journey" | "unread"
  >("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = dataStore.subscribe(() => setTick((t) => t + 1));
    return () => unsub();
  }, []);

  const notifications = dataStore.getNotifications(studentId);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const docCount = notifications.filter((n) => n.category === "document" || n.title.toLowerCase().includes("document")).length;
  const taskCount = notifications.filter((n) => n.category === "task" || n.title.toLowerCase().includes("task")).length;
  const journeyCount = notifications.filter((n) => n.category === "journey" || n.title.toLowerCase().includes("stage") || n.title.toLowerCase().includes("milestone")).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeFilter === "unread" && n.isRead) return false;
      if (activeFilter === "document" && n.category !== "document" && !n.title.toLowerCase().includes("document")) return false;
      if (activeFilter === "task" && n.category !== "task" && !n.title.toLowerCase().includes("task")) return false;
      if (activeFilter === "journey" && n.category !== "journey" && !n.title.toLowerCase().includes("stage") && !n.title.toLowerCase().includes("milestone")) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        (n.category && n.category.toLowerCase().includes(q))
      );
    });
  }, [notifications, activeFilter, searchQuery]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleMarkAllRead = () => {
    dataStore.markAllNotificationsAsRead(studentId, "student");
    showToast("All notifications marked as read. Alerts cleared.");
  };

  const handleMarkSingleRead = (id: string) => {
    dataStore.markNotificationRead(id);
    showToast("Notification marked as read.");
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "application":
        return <Award className="w-5 h-5 text-gvk-navy" />;
      case "document":
        return <FolderLock className="w-5 h-5 text-amber-600" />;
      case "task":
        return <CheckSquare className="w-5 h-5 text-blue-600" />;
      case "journey":
        return <Compass className="w-5 h-5 text-emerald-600" />;
      case "interview":
        return <Video className="w-5 h-5 text-gvk-navy" />;
      case "loan":
        return <Banknote className="w-5 h-5 text-emerald-600" />;
      case "message":
        return <MessageSquare className="w-5 h-5 text-gvk-navy" />;
      default:
        return <Info className="w-5 h-5 text-gvk-text-muted" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-lg bg-gvk-navy-50 text-gvk-navy">
                <Bell className="w-5 h-5 text-gvk-navy" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-gvk-navy tracking-tight">
                Notifications Center
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gvk-text-secondary">
              Real-time activity alerts, document upload confirmations, verification feedback, and roadmap updates.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {unreadCount > 0 ? (
              <span className="text-xs text-[#FF0008] font-bold bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#FF0008] animate-pulse"></span>
                {unreadCount} Unread Alert{unreadCount > 1 ? "s" : ""}
              </span>
            ) : (
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                All Caught Up (0 Unread)
              </span>
            )}

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                className="text-xs font-semibold"
              >
                <CheckCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
                <span>Mark All as Read</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
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
              <span>Documents ({docCount})</span>
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
              <span>Tasks ({taskCount})</span>
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

          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gvk-navy/20 focus:border-gvk-navy focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Floating Confirmation Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="space-y-3">
        {filteredNotifications.map((notif) => {
          const isDoc = notif.category === "document" || notif.title.toLowerCase().includes("document");
          const isTask = notif.category === "task" || notif.title.toLowerCase().includes("task");
          const isJourney = notif.category === "journey" || notif.title.toLowerCase().includes("stage") || notif.title.toLowerCase().includes("milestone");

          return (
            <div
              key={notif.id}
              className={`p-5 rounded-2xl border bg-white shadow-card transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                !notif.isRead ? "border-gvk-navy/30 bg-gvk-navy-50/20 ring-1 ring-gvk-navy/10" : "border-gvk-border"
              }`}
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="p-2.5 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                  {getCategoryIcon(notif.category)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={`text-sm font-bold ${!notif.isRead ? "text-gvk-navy" : "text-slate-800"}`}>
                      {notif.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {notif.category || "General"}
                    </span>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#FF0008] animate-pulse" />
                    )}
                  </div>

                  <p className="text-xs text-gvk-text-secondary leading-relaxed">
                    {notif.message}
                  </p>

                  {/* Direct shortcuts */}
                  <div className="pt-1 flex items-center gap-3 text-[11px]">
                    {isDoc && (
                      <Link
                        href="/student/documents"
                        className="text-amber-800 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <span>Open Document Vault</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                    {isTask && (
                      <Link
                        href="/student/tasks"
                        className="text-blue-800 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <span>Open My Tasks</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                    {isJourney && (
                      <Link
                        href="/student/journey"
                        className="text-emerald-800 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <span>Track My Journey</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <span suppressHydrationWarning className="text-[10px] font-mono text-gvk-text-muted flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                {!notif.isRead ? (
                  <button
                    onClick={() => handleMarkSingleRead(notif.id)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                  >
                    Mark read
                  </button>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
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
            <p className="text-xs">Try selecting &ldquo;All Alerts&rdquo; or clearing your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
