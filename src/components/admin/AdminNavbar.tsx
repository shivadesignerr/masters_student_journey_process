"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { dataStore } from "@/lib/data/store";
import { adminLogoutAction } from "@/app/actions/adminAuth";
import {
  Menu,
  Search,
  Plus,
  Bell,
  ChevronDown,
  UserPlus,
  GraduationCap,
  Users,
  FileCheck2,
  Video,
  Database,
  ShieldCheck,
  LogOut,
  Settings,
  X,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";

export function AdminNavbar({
  onOpenMobileMenu,
  onOpenQuickModal,
}: {
  onOpenMobileMenu?: () => void;
  onOpenQuickModal?: (modalType: "enrol_student" | "create_counselor" | "create_app" | "schedule_interview" | "broadcast_notif") => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Element refs for outside click dismissal
  const searchRef = useRef<HTMLDivElement>(null);
  const quickActionRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState(() => dataStore.getAllNotifications().slice(0, 5));
  const [unreadCount, setUnreadCount] = useState(() => dataStore.getUnreadNotificationsCount("admin", "admin"));
  const [counselorMsgCount, setCounselorMsgCount] = useState(() => {
    return dataStore.getUnreadMessageSendersCount("admin");
  });

  // Track open state refs so click handlers always have current values without re-subscribing
  const openStatesRef = useRef({
    quickAction: quickActionOpen,
    notifications: notificationsOpen,
    profile: profileOpen,
    search: searchOpen,
  });
  openStatesRef.current = {
    quickAction: quickActionOpen,
    notifications: notificationsOpen,
    profile: profileOpen,
    search: searchOpen,
  };

  // Click-outside and Escape key listener to dismiss dropdowns safely without swallowing button clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const { quickAction, notifications, profile, search } = openStatesRef.current;
      if (!quickAction && !notifications && !profile && !search) return;

      const target = event.target as Node;
      if (quickAction && quickActionRef.current && !quickActionRef.current.contains(target)) {
        setQuickActionOpen(false);
      }
      if (notifications && notificationsRef.current && !notificationsRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
      if (profile && profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
      if (search && searchRef.current && !searchRef.current.contains(target)) {
        setSearchOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setQuickActionOpen(false);
        setNotificationsOpen(false);
        setProfileOpen(false);
        setSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
    const update = () => {
      const allNotifs = dataStore.getAllNotifications();
      setNotifications(allNotifs.slice(0, 5));
      setUnreadCount(dataStore.getUnreadNotificationsCount("admin", "admin"));
      setCounselorMsgCount(dataStore.getUnreadMessageSendersCount("admin"));
    };
    const unsubscribe = dataStore.subscribe(update);
    return () => unsubscribe();
  }, []);

  // Quick action dispatcher
  const handleTriggerQuickAction = (actionKey: string, targetPath: string) => {
    setQuickActionOpen(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("gvk_admin_action", { detail: { action: actionKey } }));
    }
    router.push(targetPath);
  };

  // Quick search results
  const allStudents = dataStore.getAllStudents();
  const allCounselors = dataStore.getAllCounselors();
  const allUniversities = dataStore.getAllUniversities();

  const searchResults = searchQuery.trim()
    ? {
        students: allStudents.filter(
          (s) =>
            s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.studentIdCode.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 3),
        counselors: allCounselors.filter(
          (c) =>
            c.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.employeeIdCode.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 3),
        universities: allUniversities.filter(
          (u) =>
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.city.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 3),
      }
    : null;

  // Format breadcrumb title
  const getPageTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length <= 1) return "Executive Overview";
    const sub = segments[1];
    switch (sub) {
      case "dashboard": return "Executive Overview";
      case "students": return "Student Master Directory";
      case "counselors": return "Counselor Desks Directory";
      case "assignments": return "Counselor Assignment Workbench";
      case "universities": return "University Management";
      case "courses": return "Course Catalog & Intakes";
      case "applications": return "Cross-Student Applications Matrix";
      case "journeys": return "22-Stage Student Journey Pipeline";
      case "documents": return "Central Document Oversight";
      case "tasks": return "Task Dispatcher & Monitor";
      case "interviews": return "Mock Interview Management";
      case "loans": return "Education Loan Management";
      case "notifications": return "Notification Oversight & Broadcast";
      case "reports": return "Reports & Business Intelligence";
      case "activity": return "Immutable Audit Trail";
      case "settings": return "System Settings & Configuration";
      default: return sub.charAt(0).toUpperCase() + sub.slice(1);
    }
  };

  const handleNotificationClick = (notif: any) => {
    if (!notif.isRead) {
      dataStore.markNotificationRead(notif.id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) =>
        prev.map((item) => (item.id === notif.id ? { ...item, isRead: true } : item))
      );
    }
    setNotificationsOpen(false);

    // Route intelligently based on notification title/content
    const text = `${notif.title} ${notif.message}`.toLowerCase();
    if (text.includes("counselor") || text.includes("message from") || text.includes("directive")) {
      router.push("/admin/communication");
    } else if (text.includes("application") || text.includes("offer")) {
      router.push("/admin/applications");
    } else if (text.includes("journey") || text.includes("stage")) {
      router.push("/admin/journeys");
    } else if (text.includes("interview")) {
      router.push("/admin/interviews");
    } else if (text.includes("loan")) {
      router.push("/admin/loans");
    } else {
      router.push("/admin/notifications");
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gvk-border shadow-xs">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 gap-3">
        {/* Left: Mobile hamburger & Breadcrumb title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-gvk-navy hover:bg-slate-100 transition-colors"
            aria-label="Open mobile navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-1.5 text-[11px] text-gvk-text-muted font-medium">
              <span>Admin Console</span>
              <span>/</span>
              <span className="text-gvk-navy font-bold">{getPageTitle()}</span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-gvk-navy tracking-tight truncate leading-tight">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div ref={searchRef} className="hidden md:flex flex-1 max-w-md mx-4 relative">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search students, counselors, universities... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => {
                setSearchOpen(true);
                setQuickActionOpen(false);
                setNotificationsOpen(false);
                setProfileOpen(false);
              }}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-gvk-navy placeholder:text-slate-400 focus:outline-hidden focus:border-[#253775] focus:bg-white transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchOpen && searchResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gvk-border shadow-2xl p-3 space-y-3 z-50 animate-fade-in text-xs max-h-96 overflow-y-auto">
              {/* Students */}
              {searchResults.students.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 block mb-1">
                    Students
                  </span>
                  {searchResults.students.map((s) => (
                    <Link
                      key={s.id}
                      href={`/admin/students/${s.id}`}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-[#253775]" />
                        <div>
                          <strong className="text-gvk-navy font-bold block">{s.firstName} {s.lastName}</strong>
                          <span className="text-[11px] text-slate-400 font-mono">{s.studentIdCode} • {s.targetDegree}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[#253775]">View Profile →</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Counselors */}
              {searchResults.counselors.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 block mb-1">
                    Counselors
                  </span>
                  {searchResults.counselors.map((c) => (
                    <Link
                      key={c.id}
                      href={`/admin/counselors/${c.id}`}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-600" />
                        <div>
                          <strong className="text-gvk-navy font-bold block">{c.firstName} {c.lastName}</strong>
                          <span className="text-[11px] text-slate-400 font-mono">{c.employeeIdCode}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700">View Desk →</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Universities */}
              {searchResults.universities.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 block mb-1">
                    Universities
                  </span>
                  {searchResults.universities.map((u) => (
                    <Link
                      key={u.id}
                      href="/admin/universities"
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🏛️</span>
                        <div>
                          <strong className="text-gvk-navy font-bold block">{u.name}</strong>
                          <span className="text-[11px] text-slate-400">{u.city}, {u.country} • Rank #{u.ranking}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[#253775]">Manage →</span>
                    </Link>
                  ))}
                </div>
              )}

              {searchResults.students.length === 0 &&
                searchResults.counselors.length === 0 &&
                searchResults.universities.length === 0 && (
                  <p className="p-4 text-center text-slate-400 text-xs">
                    No results found for &ldquo;{searchQuery}&rdquo;.
                  </p>
                )}
            </div>
          )}
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Counselor Direct Messages Live Notification Badge */}
          {mounted && counselorMsgCount > 0 ? (
            <Link
              href="/admin/communication"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold min-h-[38px] transition-colors border bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 animate-fade-in"
              title="Counselor Direct Messages & Communications"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>{counselorMsgCount} Counselor Message{counselorMsgCount > 1 ? "s" : ""}</span>
            </Link>
          ) : (
            <Link
              href="/admin/communication"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold min-h-[38px] transition-colors border bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              title="Central Communications Hub"
            >
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <span>Communications</span>
            </Link>
          )}

          {/* Quick Action Dropdown */}
          <div ref={quickActionRef} className="relative">
            <button
              onClick={() => {
                setQuickActionOpen(!quickActionOpen);
                setNotificationsOpen(false);
                setProfileOpen(false);
                setSearchOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#253775] hover:bg-[#1a2754] text-white font-bold text-xs transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Quick Action</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {quickActionOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-gvk-border shadow-2xl p-2 z-50 text-xs space-y-1 animate-fade-in"
              >
                <button
                  type="button"
                  onClick={() => handleTriggerQuickAction("enrol", "/admin/students?action=enrol")}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-gvk-navy font-semibold transition-colors"
                >
                  <UserPlus className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Enrol New Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerQuickAction("provision", "/admin/counselors?action=provision")}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-gvk-navy font-semibold transition-colors"
                >
                  <Users className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Provision New Counselor</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerQuickAction("create", "/admin/applications?action=create")}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-gvk-navy font-semibold transition-colors"
                >
                  <FileCheck2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Add University Application</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerQuickAction("schedule", "/admin/interviews?action=schedule")}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-gvk-navy font-semibold transition-colors"
                >
                  <Video className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Schedule Mock Interview</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerQuickAction("broadcast", "/admin/notifications?action=broadcast")}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-gvk-navy font-semibold transition-colors"
                >
                  <Bell className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Broadcast Announcement</span>
                </button>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div ref={notificationsRef} className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setQuickActionOpen(false);
                setProfileOpen(false);
                setSearchOpen(false);
              }}
              className="p-2 rounded-xl text-slate-600 hover:text-gvk-navy hover:bg-slate-100 transition-colors relative"
              title="System Notifications"
            >
              <Bell className="w-4 h-4" />
              {mounted && unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-[#FF0008] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-gvk-border shadow-2xl p-4 z-50 text-xs space-y-3 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-gvk-navy text-sm">Notifications {mounted && unreadCount > 0 ? `(${unreadCount} new)` : ""}</span>
                  <div className="flex items-center gap-2">
                    {mounted && unreadCount > 0 && (
                      <button
                        onClick={() => {
                          dataStore.markAllNotificationsAsRead("all", "admin");
                          setUnreadCount(0);
                          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                        }}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                    <Link
                      href="/admin/notifications"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-[11px] font-bold text-[#253775] hover:underline"
                    >
                      View All →
                    </Link>
                  </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-center text-slate-400 py-4 text-xs">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-2.5 rounded-xl border text-[11px] cursor-pointer transition-all ${
                          !n.isRead
                            ? "bg-blue-50/70 border-blue-200 hover:bg-blue-100/70"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <strong className="text-gvk-navy font-bold block truncate">{n.title}</strong>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#FF0008] shrink-0"></span>
                          )}
                        </div>
                        <p className="text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span suppressHydrationWarning className="text-[10px] text-slate-400 font-mono">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                          {!n.isRead && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                dataStore.markNotificationRead(n.id);
                                setUnreadCount((prev) => Math.max(0, prev - 1));
                                setNotifications((prev) =>
                                  prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
                                );
                              }}
                              className="text-[10px] font-bold text-emerald-700 hover:underline"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Admin Profile & Logout */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setQuickActionOpen(false);
                setNotificationsOpen(false);
                setSearchOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[#253775] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                SA
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-gvk-border shadow-2xl p-3 z-50 text-xs space-y-2 animate-fade-in">
                <div className="p-2 border-b border-slate-100">
                  <strong className="text-gvk-navy font-bold block text-sm">GVK_masters_admin</strong>
                  <span className="text-[11px] text-slate-400 font-mono">Super Administrator • Root Level</span>
                </div>

                <Link
                  href="/admin/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 text-gvk-navy font-semibold transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>Admin Console Settings</span>
                </Link>

                <Link
                  href="/admin/activity"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 text-gvk-navy font-semibold transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  <span>Security Audit Logs</span>
                </Link>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={async () => {
                      setProfileOpen(false);
                      await adminLogoutAction();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-bold transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Terminate Session & Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
