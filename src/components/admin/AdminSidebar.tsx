"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GvkLogo } from "@/components/shared/GvkLogo";
import { dataStore } from "@/lib/data/store";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserCheck,
  Building2,
  BookOpen,
  FileCheck2,
  Compass,
  FolderLock,
  CheckSquare,
  Video,
  Banknote,
  Bell,
  BarChart3,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Menu,
  X,
  ExternalLink,
  MessageSquare,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export function AdminSidebar({
  isMobileOpen,
  setIsMobileOpen,
}: {
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Live badge counters from dataStore
  const [counts, setCounts] = useState({
    unassigned: 0,
    pendingDocs: 0,
    overdueTasks: 0,
    counselorMessages: 0,
    unreadNotifs: 0,
  });

  useEffect(() => {
    setMounted(true);
    const update = () => {
      const unassignedCount = dataStore
        .getAllStudents()
        .filter((s) => !dataStore.getAssignedCounselor(s.id)).length;
      const pendingDocsCount = dataStore.getAllPendingReviewDocuments().length;
      const overdueTasksCount = dataStore
        .getAllCounselorTasks()
        .filter((t) => t.isOverdue && t.status !== "completed").length;
      const counselorMsgCount = dataStore.getUnreadMessageSendersCount("admin");
      const unreadNotifsCount = dataStore.getUnreadNotificationsCount("admin", "admin");
      setCounts({
        unassigned: unassignedCount,
        pendingDocs: pendingDocsCount,
        overdueTasks: overdueTasksCount,
        counselorMessages: counselorMsgCount,
        unreadNotifs: unreadNotifsCount,
      });
    };
    update();
    const unsubscribe = dataStore.subscribe(update);
    return () => unsubscribe();
  }, []);

  const navGroups: NavGroup[] = [
    {
      groupTitle: "Core Operations",
      items: [
        { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Students", href: "/admin/students", icon: GraduationCap },
        {
          label: "Counselors",
          href: "/admin/counselors",
          icon: Users,
        },
        {
          label: "Assignments",
          href: "/admin/assignments",
          icon: UserCheck,
          badge: counts.unassigned > 0 ? `${counts.unassigned} unassigned` : undefined,
          badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        },
        {
          label: "Communications",
          href: "/admin/communication",
          icon: MessageSquare,
          badge: counts.counselorMessages > 0 ? counts.counselorMessages : undefined,
          badgeColor: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
        },
      ],
    },
    {
      groupTitle: "Academic & Admissions",
      items: [
        { label: "Universities", href: "/admin/universities", icon: Building2 },
        { label: "Course Catalog", href: "/admin/courses", icon: BookOpen },
        { label: "Applications", href: "/admin/applications", icon: FileCheck2 },
        { label: "Student Journeys", href: "/admin/journeys", icon: Compass },
        {
          label: "Documents",
          href: "/admin/documents",
          icon: FolderLock,
          badge: counts.pendingDocs > 0 ? counts.pendingDocs : undefined,
          badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
        },
      ],
    },
    {
      groupTitle: "Student Services",
      items: [
        {
          label: "Tasks & Follow-ups",
          href: "/admin/tasks",
          icon: CheckSquare,
          badge: counts.overdueTasks > 0 ? `${counts.overdueTasks} overdue` : undefined,
          badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
        },
        { label: "Mock Interviews", href: "/admin/interviews", icon: Video },
        { label: "Loan Management", href: "/admin/loans", icon: Banknote },
      ],
    },
    {
      groupTitle: "Governance & Intelligence",
      items: [
        {
          label: "Notifications",
          href: "/admin/notifications",
          icon: Bell,
          badge: counts.unreadNotifs > 0 ? counts.unreadNotifs : undefined,
          badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
        },
        { label: "Reports & Analytics", href: "/admin/reports", icon: BarChart3 },
        { label: "Activity Logs", href: "/admin/activity", icon: History },
        { label: "Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-gvk-navy text-slate-200 border-r border-gvk-navy-dark select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-white shadow-xs">
            <span className="font-black text-xs text-[#253775] tracking-tight">GVK</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="font-extrabold text-sm text-white tracking-tight block leading-tight truncate">
                GVK EDUTECH
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300 block">
                Enterprise Admin
              </span>
            </div>
          )}
        </Link>

        {/* Desktop collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile close button */}
        {setIsMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Security Status Bar */}
      {!collapsed && (
        <div className="px-4 py-2.5 bg-gvk-navy-dark border-b border-white/10 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Super Admin Online</span>
          </div>
          <span className="font-mono text-[10px] text-slate-300 bg-white/10 px-2 py-0.5 rounded border border-white/15">
            PROV-V2
          </span>
        </div>
      )}

      {/* Navigation Links Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-white/20">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <h3 className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-300 mb-2">
                {group.groupTitle}
              </h3>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const currentPath = pathname || "";
              const isActive =
                currentPath === item.href ||
                (item.href !== "/admin/dashboard" && currentPath.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative group cursor-pointer ${
                    isActive
                      ? "bg-white/15 text-white shadow-xs border border-white/20 font-bold"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? "text-white" : "text-slate-300 group-hover:text-white"
                    }`}
                  />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {!collapsed && mounted && item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        item.badgeColor || "bg-white/10 text-white border-white/20"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {collapsed && mounted && item.badge && (
                    <span className="w-2 h-2 rounded-full bg-[#FF0008] absolute top-2 right-2"></span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom User Indicator & Console Badge */}
      <div className="p-3 border-t border-white/10 bg-gvk-navy-dark">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#253775] text-white flex items-center justify-center font-bold text-xs shrink-0 border border-white/30 shadow-xs">
                SA
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs text-white block truncate">
                  GVK_masters_admin
                </span>
                <span className="text-[10px] text-slate-300 block truncate">
                  Super Administrator
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-[#253775] text-white flex items-center justify-center font-bold text-xs border border-white/30">
              SA
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 transition-all duration-200 ${
          collapsed ? "w-20" : "w-64"
        } h-screen sticky top-0 z-40`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs animate-fade-in"
            onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
          ></div>
          <div className="relative w-72 max-w-[85vw] h-full z-10 animate-slide-in-right">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
