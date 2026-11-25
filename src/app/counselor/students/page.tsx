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
  Filter,
  GraduationCap,
  Calendar,
  Building,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  MessageSquare,
} from "lucide-react";

export default function CounselorStudentsPage() {
  const { user } = useCurrentUser();
  const counselorId = user?.role === "counselor" ? user.id : "usr-counselor-01";

  const [assignedStudents, setAssignedStudents] = useState(() => dataStore.getAllStudents());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    setAssignedStudents(dataStore.getAllStudents());
    const unsubscribe = dataStore.subscribe(() => {
      setAssignedStudents(dataStore.getAllStudents());
    });
    return () => unsubscribe();
  }, [counselorId]);

  const filteredStudents = assignedStudents.filter((stu) => {
    const matchesSearch =
      stu.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.studentIdCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.targetDegree.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-lg bg-gvk-navy-50 text-gvk-navy">
                <Users className="w-5 h-5 text-emerald-600" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-gvk-navy tracking-tight">
                All Enrolled Candidates Directory ({assignedStudents.length})
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gvk-text-secondary">
              Collaborative candidate database: Every counselor can review candidate portfolios, documents, journeys, and collaborate on student success.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 px-3.5 rounded-xl border border-emerald-200">
            <ShieldCheck className="w-4 h-4" />
            <span>Shared Collaborative Candidate Access</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 pt-4 border-t border-gvk-border flex flex-col md:flex-row items-center gap-3">
          <div className="w-full md:w-80">
            <Input
              type="text"
              placeholder="Search by student name, ID or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {["all", "applications_in_progress", "documents_pending", "offer_received", "follow_up_required"].map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors capitalize ${
                    activeFilter === f
                      ? "bg-gvk-navy text-white shadow-xs"
                      : "bg-slate-100 text-gvk-text-secondary hover:bg-slate-200"
                  }`}
                >
                  {f.replace(/_/g, " ")}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Roster Table / Card View (Responsive) */}
      <div className="bg-white rounded-2xl border border-gvk-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-gvk-border text-gvk-text-secondary font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 sm:px-6">Student ID & Name</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Target Course & Intake</th>
                <th className="py-3.5 px-4">Applications</th>
                <th className="py-3.5 px-4">Next Action Priority</th>
                <th className="py-3.5 px-4 text-right">Workspace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gvk-border">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gvk-text-muted">
                    <Users className="w-10 h-10 opacity-40 mx-auto mb-3 text-gvk-navy" />
                    {assignedStudents.length === 0 ? (
                      <>
                        <p className="font-bold text-gvk-navy text-sm">No Candidates Assigned Yet</p>
                        <p className="text-xs text-gvk-text-secondary mt-1 max-w-sm mx-auto">
                          Your desk is fresh and ready. As GVK Admissions Administration allocates candidates to your specialization, they will appear here.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-bold text-gvk-navy text-sm">No Matching Candidates Found</p>
                        <p className="text-xs text-gvk-text-secondary mt-1">
                          No students in your roster match your search or filter criteria.
                        </p>
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => {
                  const apps = dataStore.getStudentApplications(stu.id);
                  const nextAct = dataStore.calculateNextAction(stu.id);
                  const primaryCounselor = dataStore.getAssignedCounselor(stu.id);
                  const studentEmail = dataStore.getUserEmail(stu.id) || `${stu.firstName.toLowerCase()}@example.com`;

                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Student Identity */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gvk-navy text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {stu.firstName.charAt(0)}
                          </div>
                          <div>
                            <strong className="text-sm font-bold text-gvk-navy block">
                              {stu.firstName} {stu.lastName}
                            </strong>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[11px] text-gvk-text-muted">
                                {stu.studentIdCode}
                              </span>
                              {primaryCounselor && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Primary: {primaryCounselor.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-4 text-gvk-text-secondary space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-gvk-text-muted" />
                          <span className="font-mono">{stu.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-gvk-text-muted" />
                          <span>{studentEmail}</span>
                        </div>
                      </td>

                    {/* Course & Destination */}
                    <td className="py-4 px-4">
                      <strong className="text-gvk-text-primary block font-bold">
                        {stu.targetDegree}
                      </strong>
                      <span className="text-gvk-text-secondary text-[11px]">
                        {stu.preferredCountry} ({stu.targetIntake})
                      </span>
                    </td>

                    {/* Applications */}
                    <td className="py-4 px-4">
                      <span className="font-mono font-bold text-gvk-navy text-sm">
                        {apps.length} Applications
                      </span>
                      <span className="block text-[11px] text-emerald-700 font-semibold">
                        {apps.filter((a) => a.currentStatus.includes("offer")).length} Offers in Hand
                      </span>
                    </td>

                    {/* Next Action */}
                    <td className="py-4 px-4 max-w-xs">
                      <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 truncate">
                        <strong>Action:</strong> {nextAct.title}
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/counselor/students/${stu.id}?tab=communication`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-bold text-xs flex items-center gap-1.5 border-slate-300 text-gvk-navy hover:bg-gvk-navy hover:text-white transition-colors"
                            title={`Open Chat with ${stu.firstName}`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Chat</span>
                          </Button>
                        </Link>
                        <Link href={`/counselor/students/${stu.id}`}>
                          <Button variant="default" size="sm" className="font-bold text-xs">
                            <span>Open Profile</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
