"use client";

import React, { useState, useEffect, useMemo } from "react";
import { dataStore } from "@/lib/data/store";
import { AdminCard } from "@/components/admin/AdminCard";
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Users,
  GraduationCap,
  Building2,
  Calendar,
  Banknote,
  TrendingUp,
  Award,
} from "lucide-react";

export default function ReportsAndAnalyticsPage() {
  const [tick, setTick] = useState(0);
  const [selectedReport, setSelectedReport] = useState<
    "enrolment" | "counselor" | "university" | "intake" | "loan"
  >("enrolment");

  useEffect(() => {
    const unsub = dataStore.subscribe(() => setTick((t) => t + 1));
    return () => unsub();
  }, []);

  const students = dataStore.getAllStudents();
  const counselors = dataStore.getAllCounselors();
  const applications = dataStore.getAllApplications();
  const universities = dataStore.getAllUniversities();
  const loanCases = dataStore.getAllLoanCases();

  // Helper to trigger CSV download
  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. Enrolment & Admissions Pipeline
  const enrolmentReportData = useMemo(() => {
    return students.map((s) => {
      const counselor = dataStore.getAssignedCounselor(s.id);
      const apps = dataStore.getStudentApplications(s.id);
      const journey = dataStore.getStudentJourney(s.id);
      const activeStage = journey.find((j) => j.status === "in_progress") || journey[0];
      const offers = apps.filter(
        (a) =>
          a.currentStatus === "conditional_offer" ||
          a.currentStatus === "unconditional_offer" ||
          a.offerType === "conditional" ||
          a.offerType === "unconditional"
      );

      return {
        id: s.id,
        name: s.name,
        studentId: s.studentId,
        email: s.email,
        counselorName: counselor?.name || "Unassigned",
        targetCountry: s.targetCountry || "United Kingdom",
        targetIntake: s.targetIntake || "September Intake",
        appsCount: apps.length,
        offersCount: offers.length,
        currentStage: `Stage ${activeStage?.stageNumber || 1}: ${activeStage?.stageName}`,
        regDate: new Date(s.createdAt).toLocaleDateString(),
      };
    });
  }, [students, tick]);

  // 2. Counselor Workload Report
  const counselorReportData = useMemo(() => {
    return counselors.map((c) => {
      const assigned = students.filter(
        (s) => dataStore.getAssignedCounselor(s.id)?.id === c.id
      );
      const apps = dataStore.getAllApplications(c.id);
      const pendingDocs = dataStore.getAllPendingReviewDocuments(c.id);
      const tasks = dataStore.getAllCounselorTasks(c.id);
      const overdueTasks = tasks.filter((t) => t.isOverdue);

      return {
        id: c.id,
        name: c.name,
        employeeId: c.employeeId,
        specialization: c.specialization || "General Admissions",
        assignedCount: assigned.length,
        appsCount: apps.length,
        pendingDocsCount: pendingDocs.length,
        overdueTasksCount: overdueTasks.length,
        status: c.isActive !== false ? "Active Desk" : "Deactivated",
      };
    });
  }, [counselors, students, tick]);

  // 3. University Acceptance Rate Report
  const universityReportData = useMemo(() => {
    return universities.map((u) => {
      const apps = applications.filter(
        (a) => a.universityName.toLowerCase() === u.name.toLowerCase()
      );
      const cond = apps.filter(
        (a) => a.currentStatus === "conditional_offer" || a.offerType === "conditional"
      ).length;
      const uncond = apps.filter(
        (a) => a.currentStatus === "unconditional_offer" || a.offerType === "unconditional"
      ).length;
      const rejections = apps.filter((a) => a.currentStatus === "rejected").length;
      const totalOffers = cond + uncond;
      const rate = apps.length > 0 ? Math.round((totalOffers / apps.length) * 100) : 0;

      return {
        id: u.id,
        name: u.name,
        country: u.country,
        ranking: u.ranking || 100,
        appsCount: apps.length,
        condOffers: cond,
        uncondOffers: uncond,
        rejections,
        acceptanceRate: rate,
      };
    });
  }, [universities, applications, tick]);

  // 4. Intake Readiness Report
  const intakeReportData = useMemo(() => {
    const intakeMap: Record<string, { total: number; stage1_5: number; stage6_11: number; stage12_16: number; stage17_22: number }> = {};

    students.forEach((s) => {
      const intake = s.targetIntake || "September Intake";
      if (!intakeMap[intake]) {
        intakeMap[intake] = { total: 0, stage1_5: 0, stage6_11: 0, stage12_16: 0, stage17_22: 0 };
      }
      intakeMap[intake].total += 1;
      const journey = dataStore.getStudentJourney(s.id);
      const activeStage = journey.find((j) => j.status === "in_progress") || journey[0];
      const num = activeStage?.stageNumber || 1;
      if (num <= 5) intakeMap[intake].stage1_5 += 1;
      else if (num <= 11) intakeMap[intake].stage6_11 += 1;
      else if (num <= 16) intakeMap[intake].stage12_16 += 1;
      else intakeMap[intake].stage17_22 += 1;
    });

    return Object.entries(intakeMap).map(([intake, stats]) => ({
      intake,
      total: stats.total,
      preSub: stats.stage1_5,
      offers: stats.stage6_11,
      casVisa: stats.stage12_16,
      travel: stats.stage17_22,
    }));
  }, [students, tick]);

  // 5. Loan Sanctions Report
  const loanReportData = useMemo(() => {
    return loanCases.map((l) => ({
      id: l.id,
      studentName: l.studentName,
      studentId: l.studentIdCode,
      lenderName: l.lenderName,
      stage: l.stage.replace(/_/g, " ").toUpperCase(),
      amountRequested: l.amountRequested,
      sanctionAmount: l.sanctionAmount || 0,
      interestRate: l.interestRate || 10.25,
    }));
  }, [loanCases, tick]);

  const handleExportCSV = () => {
    if (selectedReport === "enrolment") {
      downloadCSV(
        "GVK_Enrolment_Pipeline_Report",
        ["Student ID", "Candidate Name", "Email", "Assigned Counselor", "Destination", "Target Intake", "Applications", "Offers", "Active Stage", "Registered On"],
        enrolmentReportData.map((e) => [
          e.studentId,
          e.name,
          e.email,
          e.counselorName,
          e.targetCountry,
          e.targetIntake,
          e.appsCount,
          e.offersCount,
          e.currentStage,
          e.regDate,
        ])
      );
    } else if (selectedReport === "counselor") {
      downloadCSV(
        "GVK_Counselor_Workload_Report",
        ["Employee ID", "Counselor Name", "Specialization", "Assigned Students", "Active Applications", "Pending Docs Review", "Overdue Tasks", "Desk Status"],
        counselorReportData.map((c) => [
          c.employeeId,
          c.name,
          c.specialization,
          c.assignedCount,
          c.appsCount,
          c.pendingDocsCount,
          c.overdueTasksCount,
          c.status,
        ])
      );
    } else if (selectedReport === "university") {
      downloadCSV(
        "GVK_University_Outcomes_Report",
        ["University Name", "Country", "QS Rank", "Total Apps", "Conditional Offers", "Unconditional Offers", "Rejections", "Acceptance Rate %"],
        universityReportData.map((u) => [
          u.name,
          u.country,
          u.ranking,
          u.appsCount,
          u.condOffers,
          u.uncondOffers,
          u.rejections,
          `${u.acceptanceRate}%`,
        ])
      );
    } else if (selectedReport === "intake") {
      downloadCSV(
        "GVK_Intake_Readiness_Report",
        ["Target Intake", "Total Students", "Phase 1: Pre-Submission (1-5)", "Phase 2: Admissions & Offers (6-11)", "Phase 3: CAS & Visa (12-16)", "Phase 4: Travel & Campus (17-22)"],
        intakeReportData.map((i) => [
          i.intake,
          i.total,
          i.preSub,
          i.offers,
          i.casVisa,
          i.travel,
        ])
      );
    } else if (selectedReport === "loan") {
      downloadCSV(
        "GVK_Education_Loan_Report",
        ["Candidate", "Student ID", "Lender Bank", "Current Milestone", "Requested (INR)", "Sanctioned (INR)", "Interest Rate %"],
        loanReportData.map((l) => [
          l.studentName,
          l.studentId,
          l.lenderName,
          l.stage,
          l.amountRequested,
          l.sanctionAmount,
          `${l.interestRate}%`,
        ])
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Executive Reports & Analytics Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Institutional performance metrics, admissions conversion analytics, and audited 1-click CSV datasets.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#253775] text-white rounded-lg text-xs font-semibold hover:bg-[#1c2a5e] shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV Report
        </button>
      </div>

      {/* Report Selector Pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "enrolment", label: "1. Enrolment & Admissions Pipeline", icon: GraduationCap },
          { id: "counselor", label: "2. Counselor Workload & Capacity", icon: Users },
          { id: "university", label: "3. University Acceptance Rates", icon: Building2 },
          { id: "intake", label: "4. Seasonal Intake Readiness", icon: Calendar },
          { id: "loan", label: "5. Education Loan Sanctions", icon: Banknote },
        ].map((rep) => {
          const Icon = rep.icon;
          const isSelected = selectedReport === rep.id;
          return (
            <button
              key={rep.id}
              onClick={() => setSelectedReport(rep.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors border ${
                isSelected
                  ? "bg-[#253775] text-white border-[#253775] shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {rep.label}
            </button>
          );
        })}
      </div>

      {/* REPORT 1: ENROLMENT PIPELINE */}
      {selectedReport === "enrolment" && (
        <AdminCard
          title="Candidate Enrolment & Admissions Pipeline"
          subtitle={`Dataset of all ${enrolmentReportData.length} students with current stage and offer counts`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Counselor</th>
                  <th className="py-3 px-4">Destination & Intake</th>
                  <th className="py-3 px-4">Applications</th>
                  <th className="py-3 px-4">Offers</th>
                  <th className="py-3 px-4">Current Milestone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrolmentReportData.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{e.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{e.studentId}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{e.counselorName}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{e.targetCountry}</div>
                      <div className="text-[11px] text-slate-400">{e.targetIntake}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-blue-700">
                      {e.appsCount} apps
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-700">
                      {e.offersCount} offers
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{e.currentStage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}

      {/* REPORT 2: COUNSELOR WORKLOAD */}
      {selectedReport === "counselor" && (
        <AdminCard
          title="Counselor Workload & Capacity Audit"
          subtitle={`Capacity balancing report across ${counselorReportData.length} counselors`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Counselor</th>
                  <th className="py-3 px-4">Specialization</th>
                  <th className="py-3 px-4">Assigned Students</th>
                  <th className="py-3 px-4">Active Apps</th>
                  <th className="py-3 px-4">Pending Docs Review</th>
                  <th className="py-3 px-4">Overdue Tasks</th>
                  <th className="py-3 px-4">Desk Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {counselorReportData.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{c.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{c.employeeId}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{c.specialization}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{c.assignedCount}</td>
                    <td className="py-3.5 px-4 font-semibold text-blue-700">{c.appsCount}</td>
                    <td className="py-3.5 px-4 font-semibold text-amber-700">
                      {c.pendingDocsCount}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-red-600">
                      {c.overdueTasksCount}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}

      {/* REPORT 3: UNIVERSITY ACCEPTANCE RATES */}
      {selectedReport === "university" && (
        <AdminCard
          title="University Acceptance & Outcomes Analysis"
          subtitle={`Conversion rates across ${universityReportData.length} partner universities`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">University</th>
                  <th className="py-3 px-4">Country</th>
                  <th className="py-3 px-4">QS Rank</th>
                  <th className="py-3 px-4">Total Submissions</th>
                  <th className="py-3 px-4">Conditional Offers</th>
                  <th className="py-3 px-4">Unconditional Offers</th>
                  <th className="py-3 px-4">Acceptance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {universityReportData.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{u.country}</td>
                    <td className="py-3.5 px-4 font-mono">#{u.ranking}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{u.appsCount}</td>
                    <td className="py-3.5 px-4 font-semibold text-amber-700">{u.condOffers}</td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-700">{u.uncondOffers}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">{u.acceptanceRate}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}

      {/* REPORT 4: SEASONAL INTAKE READINESS */}
      {selectedReport === "intake" && (
        <AdminCard
          title="Intake Readiness Breakdown"
          subtitle="Progress distribution of candidates across departure seasons"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Target Intake Season</th>
                  <th className="py-3 px-4">Registered Candidates</th>
                  <th className="py-3 px-4">Phase 1: Pre-Submission</th>
                  <th className="py-3 px-4">Phase 2: Admissions & Offers</th>
                  <th className="py-3 px-4">Phase 3: CAS & Visa</th>
                  <th className="py-3 px-4">Phase 4: Travel & Campus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {intakeReportData.map((i) => (
                  <tr key={i.intake} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{i.intake}</td>
                    <td className="py-3.5 px-4 font-bold text-blue-700">{i.total}</td>
                    <td className="py-3.5 px-4 text-slate-700">{i.preSub}</td>
                    <td className="py-3.5 px-4 text-slate-700">{i.offers}</td>
                    <td className="py-3.5 px-4 text-slate-700">{i.casVisa}</td>
                    <td className="py-3.5 px-4 text-slate-700">{i.travel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}

      {/* REPORT 5: LOAN SANCTIONS */}
      {selectedReport === "loan" && (
        <AdminCard
          title="Education Loan Sanctions Summary"
          subtitle={`Financial pipeline across ${loanReportData.length} candidate loan files`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Lender Bank</th>
                  <th className="py-3 px-4">Current Milestone</th>
                  <th className="py-3 px-4">Requested (₹)</th>
                  <th className="py-3 px-4">Sanctioned (₹)</th>
                  <th className="py-3 px-4">Interest Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loanReportData.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{l.studentName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{l.studentId}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{l.lenderName}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700">
                        {l.stage}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      ₹{l.amountRequested.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      ₹{l.sanctionAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono">{l.interestRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}
    </div>
  );
}
