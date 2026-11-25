"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GvkLogo } from "@/components/shared/GvkLogo";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { dataStore } from "@/lib/data/store";
import {
  LayoutDashboard,
  Compass,
  GraduationCap,
  FolderLock,
  CheckSquare,
  Video,
  Banknote,
  MessageSquare,
  Bell,
  User,
  LogOut,
} from "lucide-react";

interface StudentSidebarProps {
  onLogout?: () => void;
  className?: string;
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

export function StudentSidebar({
  onLogout,
  className = "",
}: StudentSidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { user } = useCurrentUser();
  const studentName = user?.fullName || "Student";
  const studentIdCode = user?.identifierCode || "";
  const studentId = user?.role === "student" ? user.id : "usr-student-01";

  const [messageCount, setMessageCount] = useState(() => dataStore.getUnreadMessageSendersCount("student", studentId));
  const [unreadNotifs, setUnreadNotifs] = useState(() => dataStore.getUnreadNotificationsCount(studentId, "student"));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const update = () => {
      setMessageCount(dataStore.getUnreadMessageSendersCount("student", studentId));
      setUnreadNotifs(dataStore.getUnreadNotificationsCount(studentId, "student"));
    };
    update();
    const unsub = dataStore.subscribe(update);
    return () => unsub();
  }, [studentId]);

  return (
    <aside
      className={`w-64 bg-gvk-navy text-white flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-gvk-navy-dark shadow-xl z-30 ${className}`}
    >
      {/* Top Header */}
      <div className="flex flex-col">
        <div className="p-5 border-b border-white/10">
          <GvkLogo variant="light" href="/student/dashboard" />
        </div>

        {/* Student Vitals Capsule */}
        <div className="mx-4 my-3 p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-sm">
            {mounted ? studentName.charAt(0) : "S"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white truncate leading-tight">
              {mounted ? studentName : "Student"}
            </p>
            <p className="text-[11px] font-mono text-slate-300 truncate mt-0.5">
              {mounted ? studentIdCode : ""}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const currentPath = pathname || "";
            const isActive = currentPath === item.href || (item.href !== "/student/dashboard" && currentPath.startsWith(item.href + "/"));
            const isComm = item.href === "/student/counselor";
            const isNotif = item.href === "/student/notifications";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white text-gvk-navy shadow-sm font-bold"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-gvk-navy" : "text-slate-400"}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {mounted && isComm && messageCount > 0 && (
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isActive ? "bg-emerald-600 text-white" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  }`}>
                    {messageCount}
                  </span>
                )}
                {mounted && isNotif && unreadNotifs > 0 && (
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isActive ? "bg-[#FF0008] text-white" : "bg-red-500/20 text-red-300 border border-red-500/30"
                  }`}>
                    {unreadNotifs}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-white/10 bg-gvk-navy-dark/40">
        <a
          href="/api/auth/logout"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors w-full cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-gvk-red" />
          <span>Exit / Sign Out</span>
        </a>
      </div>
    </aside>
  );
}
