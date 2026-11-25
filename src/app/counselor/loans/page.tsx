"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Banknote,
  Building,
  CheckCircle2,
  Clock,
  PhoneCall,
  User,
  Edit3,
} from "lucide-react";

export default function CounselorLoansPage() {
  const { user } = useCurrentUser();
  const counselorId = user?.role === "counselor" ? user.id : "usr-counselor-01";

  const [assignedStudents, setAssignedStudents] = useState(() => dataStore.getAssignedStudents(counselorId));
  const [loanCases, setLoanCases] = useState(() => dataStore.getAllLoanCases(counselorId));

  useEffect(() => {
    setAssignedStudents(dataStore.getAssignedStudents(counselorId));
    setLoanCases(dataStore.getAllLoanCases(counselorId));

    const unsubscribe = dataStore.subscribe(() => {
      setAssignedStudents(dataStore.getAssignedStudents(counselorId));
      setLoanCases(dataStore.getAllLoanCases(counselorId));
    });
    return () => unsubscribe();
  }, [counselorId]);

  // Edit loan stage modal state
  const [activeModalLoan, setActiveModalLoan] = useState<any | null>(null);
  const [stage, setStage] = useState("bank_selected");
  const [lenderName, setLenderName] = useState("");
  const [amountRequested, setAmountRequested] = useState(0);
  const [sanctionAmount, setSanctionAmount] = useState<number | undefined>(undefined);
  const [counselorNotes, setCounselorNotes] = useState("");
  const [studentNextStep, setStudentNextStep] = useState("");

  const openUpdateModal = (loan: any) => {
    setActiveModalLoan(loan);
    setStage(loan.stage);
    setLenderName(loan.lenderName);
    setAmountRequested(loan.amountRequested);
    setSanctionAmount(loan.sanctionAmount || 0);
    setCounselorNotes(loan.counselorNotes || "");
    setStudentNextStep(loan.studentNextStep || "");
  };

  const handleUpdateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalLoan) return;

    dataStore.updateLoanCase(
      activeModalLoan.studentId,
      stage,
      lenderName,
      Number(amountRequested),
      sanctionAmount ? Number(sanctionAmount) : undefined,
      counselorNotes,
      studentNextStep,
      counselorId
    );

    setLoanCases(dataStore.getAllLoanCases(counselorId));
    setActiveModalLoan(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-lg bg-gvk-navy-50 text-gvk-navy">
                <Banknote className="w-5 h-5 text-gvk-navy" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-gvk-navy tracking-tight">
                Education Loan Cases Pipeline ({loanCases.length})
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gvk-text-secondary">
              Track student financing status across partner banks and NBFCs through sanction and disbursement.
            </p>
          </div>
        </div>
      </div>

      {loanCases.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gvk-border p-14 text-center text-xs shadow-card">
          <Banknote className="w-10 h-10 text-gvk-navy opacity-40 mx-auto mb-2" />
          {assignedStudents.length === 0 ? (
            <>
              <h3 className="text-base font-bold text-gvk-navy">No Candidates Assigned Yet</h3>
              <p className="text-gvk-text-secondary mt-1 max-w-md mx-auto">
                Your loan pipeline is fresh and ready. When candidates are allocated to your desk, education loan files can be tracked and updated here.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-base font-bold text-gvk-navy">No Active Loan Cases</h3>
              <p className="text-gvk-text-secondary mt-1 max-w-md mx-auto">
                Education loan processing has not been initiated for your assigned candidates yet. Counselors can initiate loan files directly from candidate workspaces.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {loanCases.map((loan) => (
          <div
            key={loan.id}
            className="p-6 rounded-2xl border border-gvk-border bg-white shadow-card space-y-4 text-xs"
          >
            <div className="flex items-start justify-between">
              <div>
                <strong className="text-base font-bold text-gvk-navy block">
                  {loan.studentName}
                </strong>
                <span className="font-mono text-gvk-text-muted text-[11px]">
                  {loan.studentIdCode}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                {loan.stage.replace(/_/g, " ")}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[10px] text-gvk-text-secondary block">Lender</span>
                <strong className="text-gvk-navy text-xs">{loan.lenderName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-gvk-text-secondary block">Requested</span>
                <strong className="text-gvk-navy text-xs font-mono">₹{loan.amountRequested.toLocaleString()}</strong>
              </div>
            </div>

            {loan.counselorNotes && (
              <div className="p-3 rounded-xl bg-gvk-navy-50 border border-gvk-navy-100 text-gvk-navy">
                <strong className="block mb-0.5">Counselor Note:</strong>
                <p>{loan.counselorNotes}</p>
              </div>
            )}

            <div className="pt-2 border-t border-gvk-border flex items-center justify-end gap-2">
              <Button
                onClick={() => openUpdateModal(loan)}
                size="sm"
                className="font-bold text-xs flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Update Loan Stage</span>
              </Button>
              <Link href={`/counselor/students/${loan.studentId}?tab=loan`}>
                <Button variant="outline" size="sm" className="font-bold text-xs">
                  Workspace →
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* UPDATE LOAN STAGE MODAL */}
      {activeModalLoan && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-gvk-border shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gvk-navy mb-1">
              Update Education Loan Stage
            </h3>
            <p className="text-xs text-gvk-text-secondary mb-4">
              Student: {activeModalLoan.studentName} ({activeModalLoan.studentIdCode})
            </p>

            <form onSubmit={handleUpdateLoan} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Loan Process Stage (11 Steps)</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-gvk-border bg-white font-medium"
                >
                  <option value="bank_selected">1. Bank Selected (Initial Selection)</option>
                  <option value="info_submitted">2. Info Submitted (Candidate Details Entered)</option>
                  <option value="bank_login">3. Bank File Login (Application Lodged with Lender)</option>
                  <option value="credit_call">4. Credit Call (Lender Verification Call Completed)</option>
                  <option value="doc_verification">5. Doc Verification (Financial Documents Authenticated)</option>
                  <option value="physical_verification">6. Physical Verification (Property / Residence Checked)</option>
                  <option value="approved">7. Sanction Approved (Credit Committee Passed)</option>
                  <option value="sanction_letter">8. Sanction Letter Issued (Official Letter Generated)</option>
                  <option value="disbursement_pending">9. Disbursement Pending (Pre-Disbursement Audit)</option>
                  <option value="disbursed">10. Disbursed (Tuition Transferred to University)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Lender / Partner Bank Name</label>
                <Input
                  type="text"
                  placeholder="e.g. HDFC Credila, Avanse, Auxilo, SBI, InCred"
                  value={lenderName}
                  onChange={(e) => setLenderName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gvk-text-primary mb-1">Requested Amount (₹)</label>
                  <Input
                    type="number"
                    value={amountRequested}
                    onChange={(e) => setAmountRequested(Number(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gvk-text-primary mb-1">Sanctioned Amount (₹)</label>
                  <Input
                    type="number"
                    value={sanctionAmount || 0}
                    onChange={(e) => setSanctionAmount(Number(e.target.value))}
                    placeholder="If approved..."
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Counselor Case Notes (Internal Tracking)</label>
                <textarea
                  rows={2}
                  value={counselorNotes}
                  onChange={(e) => setCounselorNotes(e.target.value)}
                  placeholder="e.g. Branch manager follow-up conducted on Nov 15..."
                  className="w-full p-2.5 rounded-lg border border-gvk-border"
                />
              </div>

              <div>
                <label className="block font-bold text-blue-900 mb-1">Candidate Next Action (Visible in Student Portal)</label>
                <textarea
                  rows={2}
                  value={studentNextStep}
                  onChange={(e) => setStudentNextStep(e.target.value)}
                  placeholder="e.g. Please keep your 3-year ITR and property tax receipts handy for credit officer call."
                  className="w-full p-2.5 rounded-lg border border-blue-200 bg-blue-50/30"
                />
              </div>

              <div className="pt-3 border-t border-gvk-border flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setActiveModalLoan(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="font-bold">
                  Save Stage & Notify Candidate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
