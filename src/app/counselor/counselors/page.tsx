"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  UserCheck,
  ShieldCheck,
  Phone,
  Mail,
  Video,
  MessageSquare,
  Globe,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Briefcase,
  Clock,
} from "lucide-react";

export default function CounselorDirectoryPage() {
  const { user } = useCurrentUser();
  const currentCounselorId = user?.role === "counselor" ? user.id : "usr-counselor-01";

  const [counselors, setCounselors] = useState(() => dataStore.getAllCounselors());
  const [users, setUsers] = useState(() => dataStore.getAllUsers());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSpecialization, setFilterSpecialization] = useState("all");

  useEffect(() => {
    setCounselors(dataStore.getAllCounselors());
    setUsers(dataStore.getAllUsers());
    const unsubscribe = dataStore.subscribe(() => {
      setCounselors(dataStore.getAllCounselors());
      setUsers(dataStore.getAllUsers());
    });
    return () => unsubscribe();
  }, []);

  // Specialist role helper
  const getCounselorRoleTag = (c: any) => {
    const specs = c.specializationCountries || [];
    if (specs.some((s: string) => s.toLowerCase().includes("loan") || s.toLowerCase().includes("finance"))) {
      return "Education Loans & Financial Aid Specialist";
    }
    if (specs.some((s: string) => s.toLowerCase().includes("visa") || s.toLowerCase().includes("canada") || s.toLowerCase().includes("usa"))) {
      return "Visa, Compliance & CAS Specialist";
    }
    if (specs.some((s: string) => s.toLowerCase().includes("germany") || s.toLowerCase().includes("sop"))) {
      return "University Shortlisting & SOP Lead";
    }
    return "Primary Admissions Counselor";
  };

  const filteredCounselors = counselors.filter((c) => {
    const email = users.find((u) => u.id === c.id)?.email || "";
    const roleTag = getCounselorRoleTag(c);
    const specStr = (c.specializationCountries || []).join(" ").toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      c.firstName.toLowerCase().includes(query) ||
      c.lastName.toLowerCase().includes(query) ||
      c.employeeIdCode.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query) ||
      roleTag.toLowerCase().includes(query) ||
      specStr.includes(query);

    if (!matchesSearch) return false;

    if (filterSpecialization === "visa" && !roleTag.includes("Visa")) return false;
    if (filterSpecialization === "loans" && !roleTag.includes("Loan")) return false;
    if (filterSpecialization === "sop" && !roleTag.includes("SOP") && !roleTag.includes("Shortlisting")) return false;
    if (filterSpecialization === "admissions" && !roleTag.includes("Primary")) return false;

    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-gvk-navy tracking-tight">
                Counselors & Advisory Desks Directory ({counselors.length})
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gvk-text-secondary">
              Colleague counselors, destination specialists, and peer collaboration network across GVK Edutech.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 px-3.5 rounded-xl border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{counselors.length} Advisory Desks Active & Collaborative</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 pt-4 border-t border-gvk-border flex flex-col md:flex-row items-center gap-3">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search colleague by name, ID, role, or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-gvk-navy placeholder:text-slate-400 focus:outline-hidden focus:border-gvk-navy focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {[
              { id: "all", label: "All Desks" },
              { id: "admissions", label: "Admissions" },
              { id: "visa", label: "Visa & Compliance" },
              { id: "loans", label: "Loans & Finance" },
              { id: "sop", label: "Shortlisting & SOP" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterSpecialization(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterSpecialization === f.id
                    ? "bg-gvk-navy text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Counselors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCounselors.map((c) => {
          const email = users.find((u) => u.id === c.id)?.email || `${c.firstName.toLowerCase()}@gvkedutech.com`;
          const roleTag = getCounselorRoleTag(c);
          const isCurrentUser = c.id === currentCounselorId;
          const assignedCount = dataStore.getPrimaryAssignedStudents(c.id).length;

          return (
            <div
              key={c.id}
              className={`rounded-2xl border bg-white p-6 shadow-card flex flex-col justify-between transition-all hover:shadow-elevated ${
                isCurrentUser ? "border-emerald-300 ring-2 ring-emerald-500/20" : "border-gvk-border"
              }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base text-white shadow-sm ${
                        isCurrentUser ? "bg-emerald-600" : "bg-gvk-navy"
                      }`}>
                        {c.firstName.charAt(0)}
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-gvk-navy">
                          {c.firstName} {c.lastName}
                        </h3>
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            You
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-gvk-text-muted">
                        {c.employeeIdCode}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active Desk
                  </span>
                </div>

                {/* Role Tag */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-gvk-navy block">
                    {roleTag}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Mon - Sat • 10:00 AM - 6:30 PM IST</span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-1.5 text-xs text-gvk-text-secondary">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{c.phone}</span>
                  </div>
                </div>

                {/* Country Specialization */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                    Destination Specializations
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(c.specializationCountries || []).map((country: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200"
                      >
                        {country}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Workload metric */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Primary Candidates:</span>
                  <strong className="text-gvk-navy font-bold font-mono">
                    {assignedCount} Student{assignedCount !== 1 ? "s" : ""}
                  </strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-gvk-border flex items-center gap-2">
                {isCurrentUser ? (
                  <Link href="/counselor/communication" className="w-full">
                    <Button variant="outline" size="sm" className="w-full font-bold text-xs">
                      Open Your Communications Desk →
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link
                      href={`/counselor/communication?tab=counselors&counselorId=${c.id}`}
                      className="flex-1"
                    >
                      <Button
                        size="sm"
                        className="w-full font-bold text-xs flex items-center justify-center gap-1.5 bg-gvk-navy hover:bg-gvk-navy-dark text-white"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Message</span>
                      </Button>
                    </Link>

                    {c.defaultZoomMeetingUrl && (
                      <a
                        href={c.defaultZoomMeetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-bold text-xs flex items-center gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Zoom</span>
                        </Button>
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}

        {filteredCounselors.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-gvk-border p-12 text-center text-slate-400 space-y-2">
            <Users className="w-10 h-10 opacity-40 mx-auto text-gvk-navy" />
            <p className="font-bold text-gvk-navy text-sm">No counselors found</p>
            <p className="text-xs">No colleague counselor matches &ldquo;{searchQuery}&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  );
}
