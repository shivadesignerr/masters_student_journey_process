"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import {
  Banknote,
  CheckCircle2,
  Clock,
  Building2,
  FileCheck,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Info,
  Calendar,
  Lock,
} from "lucide-react";

const loanStagesList = [
  { id: "bank_selected", label: "Bank Selected", desc: "Lender partner shortlisted" },
  { id: "info_submitted", label: "Info Submitted", desc: "KYC & co-borrower data logged" },
  { id: "bank_login", label: "Bank File Login", desc: "Application lodged with lender" },
  { id: "credit_call", label: "Credit Call", desc: "Underwriting verification call" },
  { id: "doc_verification", label: "Doc Verification", desc: "Financial documents authenticated" },
  { id: "physical_verification", label: "Physical Verification", desc: "Residence / office inspection" },
  { id: "approved", label: "Sanction Approved", desc: "Credit committee passed" },
  { id: "sanction_letter", label: "Sanction Letter", desc: "Official sanction letter generated" },
  { id: "disbursement_pending", label: "Disbursement Pending", desc: "Pre-visa solvency certificate" },
  { id: "disbursed", label: "Disbursed", desc: "Tuition fees wire remitted" },
];

export default function StudentLoanPage() {
  const { user } = useCurrentUser();
  const studentId = user?.role === "student" ? user.id : "usr-student-01";

  const [loanCase, setLoanCase] = useState(() => dataStore.getStudentLoanCase(studentId));
  const student = dataStore.getStudentProfile(studentId);
  const counselor = dataStore.getAssignedCounselor(studentId);

  useEffect(() => {
    setLoanCase(dataStore.getStudentLoanCase(studentId));
    const unsubscribe = dataStore.subscribe(() => {
      setLoanCase(dataStore.getStudentLoanCase(studentId));
    });
    return () => unsubscribe();
  }, [studentId]);

  const isLoanStarted = !!loanCase && loanCase.stage !== "not_started";
  const currentStageIndex = isLoanStarted
    ? loanStagesList.findIndex((s) => s.id === loanCase?.stage)
    : -1;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in text-xs">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-900 border border-blue-200">
                <Banknote className="w-5 h-5 text-blue-900" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-gvk-navy tracking-tight">
                Education Loan Tracker
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isLoanStarted
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                {isLoanStarted ? "● File In Progress" : "● Process Not Started"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gvk-text-secondary">
              Track loan file progression from bank selection through credit verification, sanction letter, and tuition disbursement.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="p-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-gvk-navy shrink-0" />
              <div>
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">
                  Lender Partner
                </span>
                <span className="text-xs font-bold text-gvk-navy">
                  {isLoanStarted ? loanCase.lenderName : "Awaiting Counselor Selection"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 10-Stage Horizontal Stepper */}
        <div className="mt-7 pt-6 border-t border-slate-200 overflow-x-auto pb-2">
          <div className="flex items-center justify-between min-w-[760px] relative px-2">
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
            {loanStagesList.map((stg, idx) => {
              const isPast = isLoanStarted && idx < currentStageIndex;
              const isCurrent = isLoanStarted && idx === currentStageIndex;

              return (
                <div key={stg.id} className="flex flex-col items-center relative z-10 text-center px-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-xs transition-all ${
                      isPast
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-gvk-navy text-white ring-gvk-navy/20 font-black scale-110 shadow-md animate-pulse"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] font-bold mt-2 max-w-[72px] leading-tight ${
                      isCurrent
                        ? "text-gvk-navy font-black"
                        : isPast
                        ? "text-emerald-800"
                        : "text-slate-400"
                    }`}
                  >
                    {stg.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.2 rounded bg-gvk-navy text-white mt-1">
                      Active
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. CONDITIONAL BODY: NOT STARTED STATE vs ACTIVE LOAN PROCESS */}
      {!isLoanStarted ? (
        /* ================== PROCESS NOT STARTED INITIALLY ================== */
        <div className="space-y-6">
          {/* Main Informative Guidance Box */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-card space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-5 border-b border-slate-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-center shrink-0 shadow-2xs">
                  <Clock className="w-6 h-6 text-blue-900" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      Counselor-Managed Module
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Stage-Aware Banking Desk</span>
                  </div>
                  <h3 className="text-lg font-black text-gvk-navy mt-1">
                    Education Loan File Has Not Been Initiated Yet
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
                    At GVK Edutech, overseas education loans are managed directly by your assigned senior counselor (<strong>{counselor?.firstName} {counselor?.lastName}</strong>). Your counselor will select the optimal lending partner and lodge your application once your target universities are shortlisted or admission offers are confirmed.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <Link href="/student/counselor">
                  <Button size="sm" className="font-bold text-xs bg-gvk-navy hover:bg-gvk-navy-800 text-white shadow-xs flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message Counselor</span>
                  </Button>
                </Link>
                <Link href="/student/journey">
                  <Button variant="outlineNavy" size="sm" className="font-bold text-xs">
                    <span>View Masters Roadmap →</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* How Counselor Updates Each and Every Step */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-gvk-navy font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>How the Counselor-Managed Loan Desk Works</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                You do not need to apply directly to banks. <strong>Your assigned counselor will update each and every step</strong> on this tracker as your file moves through banking underwriting. Whenever your counselor advances a stage—such as scheduling your telephonic credit call or issuing your official sanction letter—you will receive real-time notifications with clear instructions on your dashboard.
              </p>
            </div>
          </div>

          {/* Partner Banks Grid & Pre-requisite Checklist */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Preferred Partner Lenders Shelf (2 Cols) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gvk-navy flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gvk-navy" />
                    <span>GVK Preferred Banking Partners</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Your counselor shortlists the best rate and loan terms matching your study destination ({student?.preferredCountry || "UK"}).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5 hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-bold text-gvk-navy">HDFC Credila</strong>
                    <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Specialist NBFC</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Loans up to ₹1.5 Cr • Fast 3–5 day approval • Flexible collateral options • Direct fee remittance to UK universities.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5 hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-bold text-gvk-navy">SBI Global Ed-Vantage</strong>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">PSU Bank</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Lowest sovereign interest rates • Up to ₹1.5 Cr with collateral • 0.50% concession for female applicants.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5 hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-bold text-gvk-navy">ICICI Bank Overseas Loan</strong>
                    <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">Private Bank</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Collateral-free up to ₹50 Lakhs for top Russell Group universities • Fast digital sanction letter before visa.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5 hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-bold text-gvk-navy">Prodigy Finance & Avanse</strong>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">International</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    USD/GBP currency loans without Indian co-signer or property collateral • Tailored for STEM Masters.
                  </p>
                </div>
              </div>
            </div>

            {/* Standard Documents Checklist (1 Col) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gvk-navy flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-gvk-navy" />
                  <span>Documents to Prepare</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Prepare these financial documents in advance for when your counselor logs your loan file:
                </p>
              </div>

              <ul className="text-xs text-slate-600 space-y-3 pt-1">
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</div>
                  <div>
                    <strong className="text-slate-800 block">Applicant & Co-Borrower KYC</strong>
                    <span className="text-[11px] text-slate-500">PAN Card, Aadhaar Card, and Passport copies.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                  <div>
                    <strong className="text-slate-800 block">University Offer Letter</strong>
                    <span className="text-[11px] text-slate-500">Conditional or unconditional offer letter with fee schedule.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</div>
                  <div>
                    <strong className="text-slate-800 block">Academic Transcripts</strong>
                    <span className="text-[11px] text-slate-500">10th, 12th, and Undergraduate consolidated marksheet.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">4</div>
                  <div>
                    <strong className="text-slate-800 block">Co-Borrower Income Proof</strong>
                    <span className="text-[11px] text-slate-500">Last 3 years ITR with computation and Form 16.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">5</div>
                  <div>
                    <strong className="text-slate-800 block">6-Month Bank Statements</strong>
                    <span className="text-[11px] text-slate-500">Salary or business operative bank account statements.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* ================== ACTIVE LOAN PROCESS (MANAGED BY COUNSELOR) ================== */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Status & Next Step */}
          <div className="lg:col-span-2 space-y-6">
            {/* Action Required Card */}
            {loanCase?.studentNextStep && (
              <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-white to-amber-50/30 p-6 shadow-card space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-amber-600 text-white flex items-center gap-1.5 w-max">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Action Required From Student
                </span>
                <h3 className="text-base font-bold text-gvk-navy pt-1">
                  {loanCase.studentNextStep}
                </h3>
                <p className="text-xs text-gvk-text-secondary leading-relaxed">
                  Please ensure parents/co-borrowers have their recent ITR and salary slips readily accessible for the credit verification officer.
                </p>
              </div>
            )}

            {/* Loan Financial Parameters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card space-y-4">
              <h3 className="text-base font-bold text-gvk-navy">
                Loan Application Details
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-gvk-text-secondary block">Lender Name</span>
                  <strong className="font-bold text-gvk-navy text-sm mt-0.5 block">{loanCase?.lenderName}</strong>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-gvk-text-secondary block">Amount Requested</span>
                  <strong suppressHydrationWarning className="font-bold text-gvk-navy text-sm font-mono mt-0.5 block">
                    ₹{(loanCase?.amountRequested || 0).toLocaleString()}
                  </strong>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-gvk-text-secondary block">Indicative Rate</span>
                  <strong className="font-bold text-emerald-700 text-sm font-mono mt-0.5 block">
                    {loanCase?.interestRate || 10.25}% p.a.
                  </strong>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-gvk-text-secondary block">Sanctioned Amount</span>
                  <strong suppressHydrationWarning className="font-bold text-emerald-700 text-sm font-mono mt-0.5 block">
                    {loanCase?.sanctionAmount ? `₹${loanCase.sanctionAmount.toLocaleString()}` : "Pending Sanction"}
                  </strong>
                </div>
              </div>

              {loanCase?.counselorNotes && (
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-gvk-navy">
                  <strong className="block font-bold mb-0.5 text-blue-900">Counselor Loan Desk Note:</strong>
                  <p className="leading-relaxed text-blue-800">{loanCase.counselorNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right 1 Col: Standard Loan Checklist */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card space-y-3">
              <h3 className="text-sm font-bold text-gvk-navy flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-gvk-navy" />
                <span>Standard Loan Checklist</span>
              </h3>

              <ul className="text-xs text-gvk-text-secondary space-y-2.5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Applicant KYC (PAN & Aadhar)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>University Conditional Offer Letter</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>10th, 12th & Degree Marksheets</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>Co-borrower 3 Years ITR with Computation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>Co-borrower 6-Month Salary Bank Statements</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
