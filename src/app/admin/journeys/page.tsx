"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  Compass,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Lock,
} from "lucide-react";

export default function StudentJourneysPage() {
  const [tick, setTick] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [counselorFilter, setCounselorFilter] = useState("all");
  const [stagePhaseFilter, setStagePhaseFilter] = useState("all");

  // Advance Stage Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [stageNumber, setStageNumber] = useState<number>(1);
  const [stageStatus, setStageStatus] = useState<
    "not_started" | "in_progress" | "completed" | "on_hold" | "waiting_student"
  >("completed");
  const [remarks, setRemarks] = useState("");

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const unsub = dataStore.subscribe(() => setTick((t) => t + 1));
    return () => unsub();
  }, []);

  const students = dataStore.getAllStudents();
  const counselors = dataStore.getAllCounselors();

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Student journey details computed
  const candidateJourneys = useMemo(() => {
    return students.map((s) => {
      const journey = dataStore.getStudentJourney(s.id);
      const counselor = dataStore.getAssignedCounselor(s.id);
      const completedCount = journey.filter((j) => j.status === "completed").length;
      const activeStage = journey.find((j) => j.status === "in_progress") || journey[0];
      const blockedStage = journey.find((j) => j.status === "on_hold");
      const progressPercent = Math.round((completedCount / (journey.length || 25)) * 100);

      // Phase classification
      let phase = "pre_submission"; // 1-5
      if (activeStage) {
        if (activeStage.stageNumber >= 6 && activeStage.stageNumber <= 11) {
          phase = "offers_admissions";
        } else if (activeStage.stageNumber >= 12 && activeStage.stageNumber <= 16) {
          phase = "cas_visa";
        } else if (activeStage.stageNumber >= 17) {
          phase = "travel_enrollment";
        }
      }

      return {
        student: s,
        counselor,
        journey,
        completedCount,
        activeStage,
        blockedStage,
        progressPercent,
        phase,
      };
    });
  }, [students, tick]);

  const filteredCandidates = useMemo(() => {
    return candidateJourneys.filter((c) => {
      const matchSearch =
        c.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.counselor && c.counselor.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCounselor =
        counselorFilter === "all" || (c.counselor && c.counselor.id === counselorFilter);

      const matchPhase = stagePhaseFilter === "all" || c.phase === stagePhaseFilter;

      return matchSearch && matchCounselor && matchPhase;
    });
  }, [candidateJourneys, searchQuery, counselorFilter, stagePhaseFilter]);

  // Phase KPI breakdown
  const phaseStats = useMemo(() => {
    let pre = 0;
    let offers = 0;
    let visa = 0;
    let travel = 0;
    candidateJourneys.forEach((c) => {
      if (c.phase === "pre_submission") pre++;
      else if (c.phase === "offers_admissions") offers++;
      else if (c.phase === "cas_visa") visa++;
      else if (c.phase === "travel_enrollment") travel++;
    });
    return { pre, offers, visa, travel };
  }, [candidateJourneys]);

  const handleOpenModal = (studentId: string, currentStageNum: number) => {
    setSelectedStudentId(studentId);
    setStageNumber(currentStageNum);
    setStageStatus("completed");
    setRemarks("");
    setIsModalOpen(true);
  };

  const handleSaveStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    dataStore.updateJourneyStage(
      selectedStudentId,
      stageNumber,
      stageStatus,
      remarks,
      "usr-admin-01"
    );

    setIsModalOpen(false);
    const stu = students.find((s) => s.id === selectedStudentId);
    showToast(`Updated Stage ${stageNumber} status to "${stageStatus}" for ${stu?.name}.`);
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
            25-Stage Master Journey Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sequential study abroad milestone progress monitoring from Day 1 counseling session to UK settlement, GP, NI and part-time job placement.
          </p>
        </div>
      </div>

      {/* Phase Progression KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Phase 1: Pre-Submission
            </span>
            <span className="text-[11px] font-mono text-slate-400">Stages 1-5</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{phaseStats.pre}</div>
          <p className="text-[11px] text-slate-400 mt-1">Counseling, Profile & Shortlisting</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 uppercase">
              Phase 2: Admissions & Offers
            </span>
            <span className="text-[11px] font-mono text-blue-500">Stages 6-11</span>
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-2">{phaseStats.offers}</div>
          <p className="text-[11px] text-blue-600 mt-1">Offers, Interviews & TB test</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-700 uppercase">
              Phase 3: CAS & Visa
            </span>
            <span className="text-[11px] font-mono text-purple-500">Stages 12-16</span>
          </div>
          <div className="text-2xl font-bold text-purple-700 mt-2">{phaseStats.visa}</div>
          <p className="text-[11px] text-purple-600 mt-1">CAS issuance & UKVI approval</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase">
              Phase 4: Settlement & Jobs
            </span>
            <span className="text-[11px] font-mono text-emerald-500">Stages 17-25</span>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{phaseStats.travel}</div>
          <p className="text-[11px] text-emerald-600 mt-1">Enrollment, GP, NI & Jobs</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate, student ID, or counselor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#253775]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={stagePhaseFilter}
            onChange={(e) => setStagePhaseFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs px-3 py-2 outline-none focus:border-[#253775] bg-white text-slate-700"
          >
            <option value="all">All Journey Phases</option>
            <option value="pre_submission">Phase 1: Pre-Submission (1-5)</option>
            <option value="offers_admissions">Phase 2: Admissions & Offers (6-11)</option>
            <option value="cas_visa">Phase 3: CAS & Visa (12-16)</option>
            <option value="travel_enrollment">Phase 4: Travel & Campus (17-22)</option>
          </select>

          <select
            value={counselorFilter}
            onChange={(e) => setCounselorFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs px-3 py-2 outline-none focus:border-[#253775] bg-white text-slate-700"
          >
            <option value="all">All Counselors</option>
            {counselors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidates Journey Table */}
      <AdminCard
        title="Candidate Milestone Progress Table"
        subtitle={`Monitoring ${filteredCandidates.length} students across 22 sequential stages`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Counselor Desk</th>
                <th className="py-3 px-4">Current Active Stage</th>
                <th className="py-3 px-4">Milestone Progress</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No student candidates match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((item) => (
                  <tr key={item.student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/admin/students/${item.student.id}`}
                        className="font-bold text-slate-900 hover:text-[#253775]"
                      >
                        {item.student.name}
                      </Link>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {item.student.studentId}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.counselor ? (
                        <div>
                          <span className="font-semibold text-slate-800">
                            {item.counselor.name}
                          </span>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {item.counselor.employeeId}
                          </div>
                        </div>
                      ) : (
                        <span className="text-amber-600 font-semibold italic">Unassigned Desk</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">
                        Stage {item.activeStage?.stageNumber || 1}: {item.activeStage?.stageName}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">
                        {item.activeStage?.description}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 min-w-[160px]">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-semibold text-slate-700">
                          {item.completedCount} / 22 Stages
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {item.progressPercent}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#253775] to-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${item.progressPercent}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.blockedStage ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-50 text-red-700 border border-red-200 flex items-center gap-1 w-fit">
                          <AlertCircle className="w-3 h-3" /> On Hold
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                          In Progress
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() =>
                            handleOpenModal(
                              item.student.id,
                              item.activeStage?.stageNumber || 1
                            )
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-[#253775] hover:text-white text-slate-700 rounded text-xs font-semibold transition-colors"
                        >
                          Advance Stage
                        </button>
                        <Link
                          href={`/admin/students/${item.student.id}`}
                          className="p-1 text-slate-400 hover:text-[#253775]"
                          title="View Full Profile"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {/* ADVANCE STAGE MODAL */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Admin Journey Milestone Override"
        description="Update or advance milestone progress for this candidate on the 22-stage roadmap."
      >
        <form onSubmit={handleSaveStage} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Stage to Update
            </label>
            <select
              value={stageNumber}
              onChange={(e) => setStageNumber(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white text-slate-800"
            >
              {Array.from({ length: 22 }, (_, i) => i + 1).map((num) => {
                const dummyJourney = selectedStudentId
                  ? dataStore.getStudentJourney(selectedStudentId)
                  : [];
                const stage = dummyJourney.find((j) => j.stageNumber === num);
                return (
                  <option key={num} value={num}>
                    Stage {num}: {stage?.stageName || `Milestone ${num}`} (
                    {stage?.status || "not_started"})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Milestone Status
            </label>
            <select
              value={stageStatus}
              onChange={(e) => setStageStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white text-slate-800"
            >
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed (Unlock next stage)</option>
              <option value="on_hold">On Hold (Requires Action)</option>
              <option value="waiting_student">Waiting for Student</option>
              <option value="not_started">Reset to Not Started</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Administrative Remarks / Milestone Notes
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Verified official university unconditional offer letter received and deposit cleared..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#253775] text-white rounded-lg text-xs font-semibold hover:bg-[#1c2a5e]"
            >
              Confirm & Save Progress
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
