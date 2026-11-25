"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  Bell,
  Send,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Megaphone,
  Users,
  GraduationCap,
  MessageSquare,
  ShieldAlert,
  FolderLock,
  CheckSquare,
  Compass,
} from "lucide-react";

export default function NotificationsManagementPage() {
  const [tick, setTick] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [audienceFilter, setAudienceFilter] = useState("all");
  const [readFilter, setReadFilter] = useState("all");

  // Broadcast Modal
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    message: "",
    targetRole: "all" as "all" | "student" | "counselor",
  });

  const [notification, setNotification] = useState<string | null>(null);

  // Check URL query parameters and custom admin action events
  useEffect(() => {
    const checkAction = () => {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("action") === "broadcast" || urlParams.get("action") === "new") {
          setIsBroadcastOpen(true);
        }
      }
    };
    checkAction();

    const handleCustomAction = (e: any) => {
      if (e.detail?.action === "broadcast" || e.detail?.action === "new") {
        setIsBroadcastOpen(true);
      }
    };
    window.addEventListener("gvk_admin_action", handleCustomAction);
    window.addEventListener("popstate", checkAction);
    return () => {
      window.removeEventListener("gvk_admin_action", handleCustomAction);
      window.removeEventListener("popstate", checkAction);
    };
  }, []);

  useEffect(() => {
    const unsub = dataStore.subscribe(() => setTick((t) => t + 1));
    return () => unsub();
  }, []);

  const notifications = dataStore.getAllNotifications();
  const students = dataStore.getAllStudents();
  const counselors = dataStore.getAllCounselors();

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const categories = useMemo(() => {
    const set = new Set(notifications.map((n) => n.category || "general"));
    return Array.from(set).sort();
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchSearch =
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.recipientName && n.recipientName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = categoryFilter === "all" || n.category === categoryFilter;

      const isStudent = n.recipientName?.includes("Student");
      const isCounselor = n.recipientName?.includes("Counselor");
      const matchAudience =
        audienceFilter === "all" ||
        (audienceFilter === "student" && isStudent) ||
        (audienceFilter === "counselor" && isCounselor);

      const matchRead =
        readFilter === "all" ||
        (readFilter === "unread" && !n.isRead) ||
        (readFilter === "read" && n.isRead);

      return matchSearch && matchCategory && matchAudience && matchRead;
    });
  }, [notifications, searchQuery, categoryFilter, audienceFilter, readFilter]);

  // KPI Calculations
  const kpiStats = useMemo(() => {
    const total = notifications.length;
    const studentCount = notifications.filter((n) => n.recipientName?.includes("Student")).length;
    const counselorCount = notifications.filter((n) => n.recipientName?.includes("Counselor")).length;
    const unread = notifications.filter((n) => !n.isRead).length;
    const docCount = notifications.filter((n) => n.category === "document" || n.title.toLowerCase().includes("document")).length;
    const taskCount = notifications.filter((n) => n.category === "task" || n.title.toLowerCase().includes("task")).length;
    const journeyCount = notifications.filter((n) => n.category === "journey" || n.title.toLowerCase().includes("stage") || n.title.toLowerCase().includes("milestone")).length;
    return { total, studentCount, counselorCount, unread, docCount, taskCount, journeyCount };
  }, [notifications]);

  const handleOpenBroadcast = () => {
    setBroadcastForm({
      title: "",
      message: "",
      targetRole: "all",
    });
    setIsBroadcastOpen(true);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) return;

    const created = dataStore.broadcastNotification(
      broadcastForm.title,
      broadcastForm.message,
      broadcastForm.targetRole
    );

    setIsBroadcastOpen(false);
    showToast(`Broadcast sent to ${created.length} users successfully.`);
  };

  const handleMarkAllRead = () => {
    dataStore.markAllNotificationsAsRead("all", "admin");
    setReadFilter("all");
    setTick((t) => t + 1);
    showToast("All notifications marked as read.");
  };

  const handleMarkSingleRead = (id: string) => {
    dataStore.markNotificationRead(id);
    setTick((t) => t + 1);
    showToast("Notification marked as read.");
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Institutional Communications & Broadcasts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch announcements, track critical milestone alerts, and review notification delivery history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {kpiStats.unread > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold hover:bg-emerald-100 shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Mark All as Read ({kpiStats.unread})</span>
            </button>
          )}
          <button
            onClick={handleOpenBroadcast}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#253775] text-white rounded-lg text-xs font-semibold hover:bg-[#1c2a5e] shadow-sm transition-colors"
          >
            <Megaphone className="w-4 h-4" /> Broadcast Announcement
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Total Notifications
            </span>
            <Bell className="w-4 h-4 text-[#253775]" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{kpiStats.total}</div>
          <p className="text-[11px] text-slate-400 mt-1">Dispatched to candidate vaults & desks</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 uppercase">
              Student Alerts
            </span>
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-2">{kpiStats.studentCount}</div>
          <p className="text-[11px] text-blue-600 mt-1">Delivered to candidate portals</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-700 uppercase">
              Counselor Alerts
            </span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700 mt-2">
            {kpiStats.counselorCount}
          </div>
          <p className="text-[11px] text-purple-600 mt-1">Sent to counselor workspace desks</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase">Unread</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">{kpiStats.unread}</div>
          <p className="text-[11px] text-amber-600 mt-1">Pending user review</p>
        </div>
      </div>

      {/* Quick Category & Role Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setCategoryFilter("all");
            setReadFilter("all");
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            categoryFilter === "all" && readFilter === "all"
              ? "bg-[#253775] text-white shadow-xs"
              : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
          }`}
        >
          All Alerts ({notifications.length})
        </button>

        <button
          type="button"
          onClick={() => {
            setCategoryFilter("document");
            setReadFilter("all");
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            categoryFilter === "document"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
          }`}
        >
          <FolderLock className="w-3.5 h-3.5" />
          <span>Document Uploads ({kpiStats.docCount})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setCategoryFilter("task");
            setReadFilter("all");
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            categoryFilter === "task"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200"
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Candidate Tasks ({kpiStats.taskCount})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setCategoryFilter("journey");
            setReadFilter("all");
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            categoryFilter === "journey"
              ? "bg-emerald-700 text-white shadow-xs"
              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Milestones ({kpiStats.journeyCount})</span>
        </button>

        {kpiStats.unread > 0 && (
          <button
            type="button"
            onClick={() => setReadFilter("unread")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              readFilter === "unread"
                ? "bg-[#FF0008] text-white shadow-xs"
                : "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Unread Only ({kpiStats.unread})</span>
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by announcement title, message content, or recipient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#253775]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs px-3 py-2 outline-none focus:border-[#253775] bg-white text-slate-700"
          >
            <option value="all">All Notification Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.toUpperCase()}
              </option>
            ))}
          </select>

          <select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs px-3 py-2 outline-none focus:border-[#253775] bg-white text-slate-700"
          >
            <option value="all">All Audiences</option>
            <option value="student">Students Only</option>
            <option value="counselor">Counselors Only</option>
          </select>

          <select
            value={readFilter}
            onChange={(e) => setReadFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs px-3 py-2 outline-none focus:border-[#253775] bg-white text-slate-700"
          >
            <option value="all">Read & Unread</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>
        </div>
      </div>

      {/* Main Notifications Table */}
      <AdminCard
        title="Dispatched Communications Stream"
        subtitle={`Showing ${filteredNotifications.length} of ${notifications.length} notifications`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Subject & Message</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNotifications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No notifications match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredNotifications.map((notif) => (
                  <tr key={notif.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {notif.recipientName || notif.userId}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 font-mono">
                        {notif.category || "announcement"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="font-bold text-slate-900">{notif.title}</div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        {notif.message}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(notif.createdAt).toLocaleString([], {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {notif.isRead ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-500">
                          Read
                        </span>
                      ) : (
                        <button
                          onClick={() => handleMarkSingleRead(notif.id)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                          title="Mark this alert as read"
                        >
                          Mark read
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {/* BROADCAST MODAL */}
      <AdminModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        title="Broadcast Platform Announcement"
        description="Dispatch a real-time institutional message to candidates and counselor desks."
      >
        <form onSubmit={handleSendBroadcast} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Audience
            </label>
            <select
              value={broadcastForm.targetRole}
              onChange={(e) =>
                setBroadcastForm({
                  ...broadcastForm,
                  targetRole: e.target.value as any,
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white text-slate-800"
            >
              <option value="all">Everyone (All Students & All Counselors)</option>
              <option value="student">All Registered Student Candidates</option>
              <option value="counselor">All Active Counselor Desks</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Announcement Title / Subject
            </label>
            <input
              type="text"
              required
              value={broadcastForm.title}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
              placeholder="e.g. UKVI Priority Visa Processing Update for Fall 2026 Intakes"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Message Content Body
            </label>
            <textarea
              rows={4}
              required
              value={broadcastForm.message}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
              placeholder="Type your official announcement here. It will immediately appear in the user's notification center..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsBroadcastOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#253775] text-white rounded-lg text-xs font-semibold hover:bg-[#1c2a5e]"
            >
              Dispatch Broadcast
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
