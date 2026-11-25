"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GvkLogo } from "@/components/shared/GvkLogo";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { dataStore } from "@/lib/data/store";
import {
  Menu,
  X,
  Bell,
  Users,
  GraduationCap,
  ShieldCheck,
  CheckSquare,
  Video,
  Banknote,
  PhoneCall,
  MessageSquare,
  LogOut,
  LayoutDashboard,
  Briefcase,
  UserCheck,
  History,
  ArrowRight,
} from "lucide-react";

interface CounselorNavbarProps {
  pendingReviewsCount?: number;
}

const navItems = [
  { href: "/counselor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/counselor/students", label: "Students", icon: Users },
  { href: "/counselor/counselors", label: "Counselors", icon: UserCheck },
  { href: "/counselor/applications", label: "Applications", icon: GraduationCap },
  { href: "/counselor/documents", label: "Verification Queue", icon: ShieldCheck },
  { href: "/counselor/tasks", label: "Task Dispatcher", icon: CheckSquare },
  { href: "/counselor/mock-interviews", label: "Interviews", icon: Video },
  { href: "/counselor/loans", label: "Loan Cases", icon: Banknote },
  { href: "/counselor/follow-ups", label: "Follow-up Workbench", icon: PhoneCall },
  { href: "/counselor/communication", label: "Communications", icon: MessageSquare },
  { href: "/counselor/activity", label: "Activity Log", icon: History },
  { href: "/counselor/notifications", label: "Notifications", icon: Bell },
];

export function CounselorNavbar({
  pendingReviewsCount = 0,
}: CounselorNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const counselorName = user?.fullName || "Counselor";
  const employeeIdCode = user?.identifierCode || "";
  const counselorId = user?.role === "counselor" ? user.id : "usr-counselor-01";

  const [messageCount, setMessageCount] = useState(() =>
    dataStore.getUnreadMessageSendersCount("counselor", counselorId)
  );
  const [notifCount, setNotifCount] = useState(() =>
    dataStore.getUnreadNotificationsCount(counselorId, "counselor")
  );
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const notifOpenRef = useRef(notificationsOpen);
  notifOpenRef.current = notificationsOpen;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!notifOpenRef.current) return;
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
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
    const update = () => {
      setMessageCount(dataStore.getUnreadMessageSendersCount("counselor", counselorId));
      setNotifCount(dataStore.getUnreadNotificationsCount(counselorId, "counselor"));
    };
    update();
    const unsubscribe = dataStore.subscribe(update);
    return () => unsubscribe();
  }, [counselorId]);

  return (
    <header className="bg-white border-b border-gvk-border sticky top-0 z-40 px-4 py-3 md:px-8 flex items-center justify-between shadow-sm">
      {/* Mobile brand & hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 rounded-lg text-gvk-text-primary hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none"
          aria-label="Toggle counselor navigation menu"
        >
          {isOpen ? <X className="w-6 h-6 text-gvk-navy" /> : <Menu className="w-6 h-6 text-gvk-navy" />}
        </button>
        <GvkLogo href="/counselor/dashboard" className="lg:hidden" />
      </div>

      {/* Title / Badge (desktop) */}
      <div className="hidden lg:flex items-center gap-3">
        <span className="text-xs uppercase font-extrabold tracking-wider text-gvk-navy bg-gvk-navy-50 px-2.5 py-1 rounded-md border border-gvk-navy-200 flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5" />
          Counselor Command Center
        </span>
        <span className="text-xs text-gvk-text-secondary font-medium">
          Masters Portfolio & University Desk
        </span>
      </div>

      {/* Right vitals */}
      <div className="flex items-center gap-3">

        {/* Communications Live Notification Badge */}
        {mounted && messageCount > 0 ? (
          <Link
            href="/counselor/communication"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold min-h-[40px] transition-colors border bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 animate-fade-in"
            title="Candidate Communications Inbox"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>{messageCount} Message{messageCount > 1 ? "s" : ""}</span>
          </Link>
        ) : (
          <Link
            href="/counselor/communication"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold min-h-[40px] transition-colors border bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            title="Candidate Communications Inbox"
          >
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <span>Messages</span>
          </Link>
        )}

        {/* Verification Queue Alert */}
        <Link
          href="/counselor/documents"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gvk-warning-light text-gvk-warning border border-gvk-warning-border hover:bg-amber-100 min-h-[40px] transition-colors"
          title="Documents awaiting your review"
        >
          <ShieldCheck className="w-4 h-4 text-gvk-warning" />
          <span>{pendingReviewsCount} Reviews</span>
        </Link>

        {/* Notification Bell Dropdown */}
        <div ref={notificationsRef} className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-lg text-gvk-text-secondary hover:text-gvk-navy hover:bg-slate-100 min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
            title="Counselor Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            {mounted && notifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF0008] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                {notifCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-gvk-border shadow-2xl p-4 z-50 text-xs space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-gvk-navy text-sm">
                  Notifications {mounted && notifCount > 0 ? `(${notifCount} unread)` : ""}
                </span>
                {mounted && notifCount > 0 && (
                  <button
                    onClick={() => {
                      dataStore.markAllNotificationsAsRead(counselorId, "counselor");
                    }}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {dataStore.getNotifications(counselorId).length === 0 ? (
                  <p className="text-slate-400 text-center py-4 text-xs">No notifications yet.</p>
                ) : (
                  dataStore.getNotifications(counselorId).map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl border text-[11px] ${
                        !n.isRead
                          ? "bg-slate-50 border-slate-200"
                          : "bg-white border-slate-100 text-slate-500"
                      }`}
                    >
                      <strong className="text-gvk-navy font-bold block">{n.title}</strong>
                      <p className="text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span suppressHydrationWarning className="text-[10px] text-slate-400 font-mono">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                        {!n.isRead && (
                          <button
                            onClick={() => dataStore.markNotificationRead(n.id)}
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
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href="/counselor/notifications"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-[11px] font-bold text-[#253775] hover:underline flex items-center gap-1"
                >
                  <span>View All Notifications & Alerts</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Counselor Badge */}
        <div className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg bg-slate-50 border border-gvk-border">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
            {mounted ? counselorName.charAt(0) : "C"}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-gvk-text-primary leading-tight truncate max-w-[120px]">
              {mounted ? counselorName : "Counselor"}
            </span>
            <span className="text-[10px] text-emerald-600 font-mono font-semibold leading-none">
              {mounted ? employeeIdCode : ""}
            </span>
          </div>
        </div>

        {/* Desktop Quick Sign Out Button */}
        <a
          href="/api/auth/logout"
          title="Sign Out of Counselor Portal"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-gvk-text-secondary hover:text-gvk-red hover:bg-red-50 border border-gvk-border hover:border-red-200 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 text-gvk-red" />
          <span className="hidden sm:inline">Sign Out</span>
        </a>
      </div>

      {/* Mobile Slide-in Drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-50 lg:hidden animate-fade-in backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-72 bg-gvk-navy text-white flex flex-col justify-between p-5 shadow-2xl z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <GvkLogo variant="light" href="/counselor/dashboard" />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Counselor identity inside drawer */}
              <div className="my-4 p-3 bg-white/10 rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white shrink-0">
                  {counselorName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{counselorName}</p>
                  <p className="text-[11px] font-mono text-emerald-300 font-semibold">{employeeIdCode}</p>
                </div>
              </div>

              {/* Navigation links */}
              <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-white text-gvk-navy font-bold"
                          : "text-slate-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-gvk-navy" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-white/10">
              <a
                href="/api/auth/logout"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <LogOut className="w-4 h-4 text-gvk-red" />
                <span>Exit / Sign Out</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
