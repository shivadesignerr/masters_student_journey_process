"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GvkLogo } from "@/components/shared/GvkLogo";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { dataStore } from "@/lib/data/store";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ShieldCheck,
  CheckSquare,
  Video,
  Banknote,
  PhoneCall,
  MessageSquare,
  LogOut,
  Briefcase,
  UserCheck,
  History,
  Bell,
} from "lucide-react";

interface CounselorSidebarProps {
  onLogout?: () => void;
  className?: string;
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

export function CounselorSidebar({
  onLogout,
  className = "",
}: CounselorSidebarProps) {
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

  useEffect(() => {
    setMounted(true);
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
    <aside
      className={`w-64 bg-gvk-navy text-white flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-gvk-navy-dark shadow-xl z-30 ${className}`}
    >
      <div className="flex flex-col">
        {/* Brand */}
        <div className="p-5 border-b border-white/10">
          <GvkLogo variant="light" href="/counselor/dashboard" />
        </div>

        {/* Counselor Identity Capsule */}
        <div className="mx-4 my-3 p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-sm">
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-white truncate leading-tight">
                {mounted ? counselorName : "Counselor"}
              </p>
            </div>
            <p className="text-[11px] font-mono text-emerald-400 truncate mt-0.5 font-semibold">
              {mounted ? employeeIdCode : ""} • Counselor
            </p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="px-3 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const currentPath = pathname || "";
            const isActive = currentPath === item.href || (item.href !== "/counselor/dashboard" && currentPath.startsWith(item.href));
            const isComm = item.href === "/counselor/communication";
            const isNotif = item.href === "/counselor/notifications";

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
                {mounted && isNotif && notifCount > 0 && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FF0008] text-white animate-pulse shadow-xs">
                    {notifCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
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
