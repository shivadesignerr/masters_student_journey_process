"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  Banknote,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Building,
  TrendingUp,
  FileCheck2,
  Edit,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

const LOAN_STAGES = [
  { id: "not_started", label: "Not Started", step: 0 },
  { id: "bank_selected", label: "1. Bank Selected", step: 1 },
  { id: "info_submitted", label: "2. Info Submitted", step: 2 },
  { id: "bank_file_login", label: "3. Bank File Login", step: 3 },
  { id: "credit_call", label: "4. Credit Call", step: 4 },
  { id: "doc_verification", label: "5. Doc Verification", step: 5 },
  { id: "physical_verification", label: "6. Physical Verification", step: 6 },
  { id: "sanction_approved", label: "7. Sanction Approved", step: 7 },
  { id: "sanction_letter", label: "8. Sanction Letter", step: 8 },
  { id: "disbursement_pending", label: "9. Disbursement Pending", step: 9 },
  { id: "disbursed", label: "10. Disbursed", step: 10 },
];

export default function LoanManagementPage() {
  const [tick, setTick] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [lenderFilter, setLenderFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");

  // Modals
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    studentId: "",
    lenderName: "HDFC Credila",
    stage: "bank_file_login",
    amountRequested: 4000000,
    sanctionAmount: 4000000,
    counselorNotes: "Application logged with branch. Telephonic credit verification in progress.",
    studentNextStep: "Answer credit manager verification call and confirm parent co-borrower ITR details.",
  });

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const unsub = dataStore.subscribe(() => setTick((t) => t + 1));
    return () => unsub();
  }, []);

  const loanCases = dataStore.getAllLoanCases();
  const students = dataStore.getAllStudents();

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const lenders = useMemo(() => {
    const set = new Set(loanCases.map((l) => l.lenderName));
    return Array.from(set).sort();
  }, [loanCases]);

  const filteredLoans = useMemo(() => {
    return loanCases.filter((loan) => {
      const matchSearch =
        loan.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.studentIdCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.lenderName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchLender = lenderFilter === "all" || loan.lenderName === lenderFilter;
      const matchStage = stageFilter === "all" || loan.stage === stageFilter;

      return matchSearch && matchLender && matchStage;
    });
  }, [loanCases, searchQuery, lenderFilter, stageFilter]);

  // KPI Calculations
  const kpiStats = useMemo(() => {
    const total = loanCases.length;
    const sanctioned = loanCases.filter((l) =>
      ["sanction_approved", "sanction_letter", "disbursement_pending", "disbursed"].includes(
        l.stage
      )
    ).length;
    const totalSanctionedValue = loanCases.reduce(
      (acc, l) => acc + (l.sanctionAmount || 0),
      0
    );
    const avgRate =
      loanCases.length > 0
        ? (
            loanCases.reduce((acc, l) => acc + (l.interestRate || 10.25), 0) /
            loanCases.length
          ).toFixed(2)
        : "10.25";

    return { total, sanctioned, totalSanctionedValue, avgRate };
  }, [loanCases]);

  const handleOpenUpdate = (loan?: any) => {
    if (loan) {
      setSelectedLoan(loan);
      setFormData({
        studentId: loan.studentId,
        lenderName: loan.lenderName || "HDFC Credila",
        stage: loan.stage || "bank_file_login",
        amountRequested: loan.amountRequested || 4000000,
        sanctionAmount: loan.sanctionAmount || 4000000,
        counselorNotes: loan.counselorNotes || "",
        studentNextStep: loan.studentNextStep || "",
      });
    } else {
      setSelectedLoan(null);
      setFormData({
        studentId: students[0]?.id || "",
        lenderName: "HDFC Credila",
        stage: "bank_selected",
        amountRequested: 3500000,
        sanctionAmount: 3500000,
        counselorNotes: "Initial loan file initiated.",
        studentNextStep: "Upload KYC documents and 3 years parent ITR.",
      });
    }
    setIsUpdateOpen(true);
  };

  const handleSaveLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) return;

    dataStore.updateLoanCase(
      formData.studentId,
      formData.stage,
      formData.lenderName,
      Number(formData.amountRequested),
      formData.sanctionAmount ? Number(formData.sanctionAmount) : undefined,
      formData.counselorNotes,
      formData.studentNextStep,
      "usr-admin-01"
    );

    setIsUpdateOpen(false);
    const stu = students.find((s) => s.id === formData.studentId);
    showToast(`Loan record updated for ${stu?.name || "Student"}.`);
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
            Education Loan Management Desk
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Overseas education loan pipeline, bank sanction letters, credit appraisal calls, and tuition fee disbursements.
          </p>
        </div>
        <button
          onClick={() => handleOpenUpdate()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#253775] text-white rounded-lg text-xs font-semibold hover:bg-[#1c2a5e] shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Initiate Loan File
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Active Loan Files
            </span>
            <Banknote className="w-4 h-4 text-[#253775]" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{kpiStats.total}</div>
          <p className="text-[11px] text-slate-400 mt-1">Candidate financing cases</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase">
              Sanctions Approved
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{kpiStats.sanctioned}</div>
          <p className="text-[11px] text-emerald-600 mt-1">Sanction letters generated</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 uppercase">
              Sanctioned Value
            </span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-2">
            ₹{(kpiStats.totalSanctionedValue / 100000).toFixed(1)} Lakhs
          </div>
          <p className="text-[11px] text-blue-600 mt-1">Total approved credit line</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Avg. Indicative Rate
            </span>
            <Building className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{kpiStats.avgRate}%</div>
          <p className="text-[11px] text-slate-400 mt-1">Annual percentage rate</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, ID, or lender bank..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#253775]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={lenderFilter}
            onChange={(e) => setLenderFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs px-3 py-2 outline-none focus:border-[#253775] bg-white text-slate-700"
          >
            <option value="all">All Lenders</option>
            {lenders.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs px-3 py-2 outline-none focus:border-[#253775] bg-white text-slate-700"
          >
            <option value="all">All 10 Loan Stages</option>
            {LOAN_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Loan Cases Table */}
      <AdminCard
        title="Student Education Loan Files"
        subtitle={`Monitoring ${filteredLoans.length} of ${loanCases.length} financing files`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Lender Institution</th>
                <th className="py-3 px-4">Processing Stage</th>
                <th className="py-3 px-4">Requested / Sanctioned</th>
                <th className="py-3 px-4">Indicative Rate</th>
                <th className="py-3 px-4">Student Action Required</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No education loan cases match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => {
                  const currentStageObj =
                    LOAN_STAGES.find((s) => s.id === loan.stage) || LOAN_STAGES[0];
                  return (
                    <tr key={loan.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/students/${loan.studentId}`}
                          className="font-bold text-slate-900 hover:text-[#253775]"
                        >
                          {loan.studentName}
                        </Link>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {loan.studentIdCode}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800">{loan.lenderName}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                          {currentStageObj.label}
                        </span>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${(currentStageObj.step / 10) * 100}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          ₹{(loan.amountRequested / 100000).toFixed(1)}L Requested
                        </div>
                        {loan.sanctionAmount ? (
                          <div className="text-[11px] text-emerald-600 font-bold">
                            ₹{(loan.sanctionAmount / 100000).toFixed(1)}L Sanctioned
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 italic">
                            Sanction pending
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {loan.interestRate || "10.25"}% p.a.
                      </td>
                      <td className="py-3.5 px-4 max-w-xs text-slate-600">
                        <p className="line-clamp-2 text-[11px]">
                          {loan.studentNextStep || "No student action required currently."}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenUpdate(loan)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-[#253775] hover:text-white text-slate-700 rounded text-xs font-semibold transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                            Update
                          </button>
                          <Link
                            href={`/admin/students/${loan.studentId}`}
                            className="p-1 text-slate-400 hover:text-[#253775]"
                            title="Open Student Profile"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
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
      </AdminCard>

      {/* UPDATE LOAN CASE MODAL */}
      <AdminModal
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
        title={selectedLoan ? `Update Loan File: ${selectedLoan.studentName}` : "Initiate Student Loan File"}
        description="Configure lending bank, 10-stage processing milestone, sanction amount, and action items."
      >
        <form onSubmit={handleSaveLoan} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Candidate Student
            </label>
            <select
              required
              disabled={!!selectedLoan}
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white text-slate-800 disabled:bg-slate-100"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.studentId})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lender Institution
              </label>
              <select
                required
                value={formData.lenderName}
                onChange={(e) => setFormData({ ...formData, lenderName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white text-slate-800"
              >
                <option value="HDFC Credila">HDFC Credila</option>
                <option value="SBI Global Ed-vantage">SBI Global Ed-vantage</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="Avanse Financial Services">Avanse Financial Services</option>
                <option value="Auxilo Finserve">Auxilo Finserve</option>
                <option value="InCred Education Loans">InCred Education Loans</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                10-Stage Milestone
              </label>
              <select
                required
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white text-slate-800"
              >
                {LOAN_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount Requested (₹)
              </label>
              <input
                type="number"
                required
                value={formData.amountRequested}
                onChange={(e) =>
                  setFormData({ ...formData, amountRequested: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sanction Amount (₹) (if approved)
              </label>
              <input
                type="number"
                value={formData.sanctionAmount}
                onChange={(e) =>
                  setFormData({ ...formData, sanctionAmount: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Action Required from Student (Banner Prompt)
            </label>
            <input
              type="text"
              value={formData.studentNextStep}
              onChange={(e) => setFormData({ ...formData, studentNextStep: e.target.value })}
              placeholder="e.g. Answer credit manager verification call and confirm parent co-borrower ITR details."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Counselor / Internal Desk Notes
            </label>
            <textarea
              rows={2}
              value={formData.counselorNotes}
              onChange={(e) => setFormData({ ...formData, counselorNotes: e.target.value })}
              placeholder="e.g. Application logged with branch. Field investigation visit completed successfully."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsUpdateOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#253775] text-white rounded-lg text-xs font-semibold hover:bg-[#1c2a5e]"
            >
              Save Loan File
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
