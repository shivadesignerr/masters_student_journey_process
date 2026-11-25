"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GvkLogo } from "@/components/shared/GvkLogo";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { dataStore } from "@/lib/data/store";
import {
  Menu,
  X,
  Bell,
  Compass,
  GraduationCap,
  FolderLock,
  CheckSquare,
  Video,
  Banknote,
  MessageSquare,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

interface StudentNavbarProps {
  unreadNotificationsCount?: number;
}

const navItems = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/journey", label: "My Journey", icon: Compass },
  { href: "/student/universities", label: "My Universities", icon: GraduationCap },
  { href: "/student/documents", label: "Document Vault", icon: FolderLock },
  { href: "/student/tasks", label: "My Tasks", icon: CheckSquare },
  { href: "/student/interview", label: "Interview", icon: Video },
  { href: "/student/loan", label: "Loan Tracking", icon: Banknote },
  { href: "/student/counselor", label: "Counselor Support", icon: MessageSquare },
  { href: "/student/notifications", label: "Notifications", icon: Bell },
  { href: "/student/profile", label: "My Profile", icon: User },
];

export function StudentNavbar({
  unreadNotificationsCount = 0,
}: StudentNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const studentName = user?.fullName || "Student";
  const studentIdCode = user?.identifierCode || "";
  const studentId = user?.role === "student" ? user.id : "usr-student-01";

  const [messageCount, setMessageCount] = useState(() => dataStore.getUnreadMessageSendersCount("student", studentId));
  const [notifCount, setNotifCount] = useState(() => dataStore.getUnreadNotificationsCount(studentId, "student"));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const update = () => {
      setMessageCount(dataStore.getUnreadMessageSendersCount("student", studentId));
      setNotifCount(dataStore.getUnreadNotificationsCount(studentId, "student"));
    };
    update();
    const unsubscribe = dataStore.subscribe(update);
    return () => unsubscribe();
  }, [studentId]);

  return (
    <header className="bg-white border-b border-gvk-border sticky top-0 z-40 px-4 py-3 md:px-8 flex items-center justify-between shadow-sm">
      {/* Mobile brand & hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 rounded-lg text-gvk-text-primary hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="w-6 h-6 text-gvk-navy" /> : <Menu className="w-6 h-6 text-gvk-navy" />}
        </button>
        <GvkLogo href="/student/dashboard" className="lg:hidden" />
      </div>

      {/* Title / Breadcrumb (desktop) */}
      <div className="hidden lg:flex items-center gap-3">
        <span className="text-xs uppercase font-extrabold tracking-wider text-gvk-navy bg-gvk-navy-50 px-2.5 py-1 rounded-md border border-gvk-navy/20">
          Student Portal
        </span>
        <span className="text-xs text-gvk-text-secondary font-medium">
          Overseas Masters Intake 2026
        </span>
      </div>

      {/* Right vitals */}
      <div className="flex items-center gap-3">

        {/* Counselor Support / Chat Live Message Badge */}
        {mounted && messageCount > 0 ? (
          <Link
            href="/student/counselor"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold min-h-[40px] transition-colors border bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 animate-fade-in"
            title="Counselor Support Messages"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>{messageCount} Message{messageCount > 1 ? "s" : ""}</span>
          </Link>
        ) : (
          <Link
            href="/student/counselor"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold min-h-[40px] transition-colors border bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            title="Counselor Support Messages"
          >
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <span>Messages</span>
          </Link>
        )}

        {/* Notification Bell */}
        <Link
          href="/student/notifications"
          className="relative p-2 rounded-lg text-gvk-text-secondary hover:text-gvk-navy hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
          aria-label="View notifications"
        >
          <Bell className="w-5 h-5" />
          {mounted && notifCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gvk-red text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
              {notifCount}
            </span>
          )}
        </Link>

        {/* User Badge */}
        <Link
          href="/student/profile"
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-gvk-border"
        >
          <div className="w-8 h-8 rounded-full bg-gvk-navy text-white flex items-center justify-center text-xs font-bold">
            {mounted ? studentName.charAt(0) : "S"}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-gvk-text-primary leading-tight truncate max-w-[120px]">
              {mounted ? studentName : "Student"}
            </span>
            <span className="text-[10px] text-gvk-text-secondary font-mono leading-none">
              {mounted ? studentIdCode : ""}
            </span>
          </div>
        </Link>

        {/* Desktop Quick Sign Out Button */}
        <a
          href="/api/auth/logout"
          title="Sign Out of Student Portal"
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
                <GvkLogo variant="light" href="/student/dashboard" />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Student badge inside drawer */}
              <div className="my-4 p-3 bg-white/10 rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white shrink-0">
                  {studentName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{studentName}</p>
                  <p className="text-[11px] font-mono text-slate-300">{studentIdCode}</p>
                </div>
              </div>

              {/* Links */}
              <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  const isComm = item.href === "/student/counselor";
                  const isNotif = item.href === "/student/notifications";
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-white text-gvk-navy font-bold"
                          : "text-slate-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-4 h-4 ${isActive ? "text-gvk-navy" : "text-slate-400"}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {isComm && messageCount > 0 && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {messageCount}
                        </span>
                      )}
                      {isNotif && notifCount > 0 && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                          {notifCount}
                        </span>
                      )}
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
