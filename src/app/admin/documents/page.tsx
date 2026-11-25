"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  FolderLock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Clock,
  ExternalLink,
  ShieldCheck,
  Edit,
  Download,
  Eye,
} from "lucide-react";

export default function DocumentManagementPage() {
  const [tick, setTick] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [studentFilter, setStudentFilter] = useState("all");

  // Review Modal
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [reviewDecision, setReviewDecision] = useState<"verified" | "rejected" | "resubmission_required">("verified");
  const [reviewComments, setReviewComments] = useState("");

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const unsub = dataStore.subscribe(() => setTick((t) => t + 1));
    return () => unsub();
  }, []);

  const documents = dataStore.getAllDocuments();
  const students = dataStore.getAllStudents();

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const categories = useMemo(() => {
    const set = new Set(documents.map((d) => d.category));
    return Array.from(set).sort();
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchSearch =
        doc.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.studentIdCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.fileType && doc.fileType.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus =
        statusFilter === "all" ||
        doc.verificationStatus === statusFilter ||
        (statusFilter === "under_review" && doc.verificationStatus === "uploaded");

      const matchCategory = categoryFilter === "all" || doc.category === categoryFilter;
      const matchStudent = studentFilter === "all" || doc.studentId === studentFilter;

      return matchSearch && matchStatus && matchCategory && matchStudent;
    });
  }, [documents, searchQuery, statusFilter, categoryFilter, studentFilter]);

  // KPI Calculations
  const kpiStats = useMemo(() => {
    const total = documents.length;
    const pending = documents.filter(
      (d) => d.verificationStatus === "under_review" || d.verificationStatus === "uploaded"
    ).length;
    const verified = documents.filter((d) => d.verificationStatus === "verified").length;
    const rejected = documents.filter(
      (d) =>
        d.verificationStatus === "rejected" ||
        d.verificationStatus === "resubmission_required"
    ).length;
    return { total, pending, verified, rejected };
  }, [documents]);

  const handleOpenReview = (doc: any) => {
    setSelectedDoc(doc);
    setReviewDecision(doc.verificationStatus === "verified" ? "verified" : "verified");
    setReviewComments(doc.counselorComments || "");
    setIsReviewOpen(true);
  };

  const handleExecuteReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;

    dataStore.reviewDocument(
      selectedDoc.id,
      reviewDecision,
      "usr-admin-01",
      reviewComments
    );

    setIsReviewOpen(false);
    showToast(
      `Document "${selectedDoc.documentName}" marked as ${reviewDecision.replace(/_/g, " ")}.`
    );
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
            Document Verification & Vault Desk
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Central repository of student academic credentials, identity proofs, financial statements, and visa paperwork.
          </p>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Total Documents
            </span>
            <FolderLock className="w-4 h-4 text-[#253775]" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{kpiStats.total}</div>
          <p className="text-[11px] text-slate-400 mt-1">Files deposited in candidate vaults</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase">
              Pending Verification
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">{kpiStats.pending}</div>
          <p className="text-[11px] text-amber-600 mt-1">Awaiting counselor or admin review</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase">
              Verified & Approved
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{kpiStats.verified}</div>
          <p className="text-[11px] text-emerald-600 mt-1">Cleared for university submission</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-700 uppercase">
              Action Required
            </span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-700 mt-2">{kpiStats.rejected}</div>
          <p className="text-[11px] text-red-600 mt-1">Rejected or resubmission requested</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by document name, candidate, or file type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#253775]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs px-3 py-2 outline-none focus:border-[#253775] bg-white text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="under_review">Pending Review ({kpiStats.pending})</option>
            <option value="verified">Verified ({kpiStats.verified})</option>
            <option value="rejected">Rejected</option>
            <option value="resubmission_required">Resubmission Required</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs px-3 py-2 outline-none focus:border-[#253775] bg-white text-slate-700"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.replace(/_/g, " ").toUpperCase()}
              </option>
            ))}
          </select>

          <select
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs px-3 py-2 outline-none focus:border-[#253775] bg-white text-slate-700 max-w-[180px]"
          >
            <option value="all">All Candidates</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Documents Table */}
      <AdminCard
        title="Central Document Repository"
        subtitle={`Showing ${filteredDocuments.length} of ${documents.length} files`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Uploaded Date</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-4">Reviewer Remarks</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No documents match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {doc.documentName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {doc.fileType?.toUpperCase()} • {doc.fileSizeMb || "1.2"} MB
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/admin/students/${doc.studentId}`}
                        className="font-bold text-slate-800 hover:text-[#253775]"
                      >
                        {doc.studentName}
                      </Link>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {doc.studentIdCode}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize font-medium text-slate-700">
                        {doc.category?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td suppressHydrationWarning className="py-3.5 px-4 text-slate-500">
                      {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : "Recent"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          doc.verificationStatus === "verified"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : doc.verificationStatus === "rejected"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : doc.verificationStatus === "resubmission_required"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {doc.verificationStatus?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {doc.counselorComments || (
                        <span className="text-slate-400 italic">No notes provided</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenReview(doc)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#253775] text-white hover:bg-[#1c2a5e] rounded text-xs font-semibold shadow-sm transition-colors"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          Evaluate
                        </button>
                        <Link
                          href={`/admin/students/${doc.studentId}`}
                          className="p-1 text-slate-400 hover:text-[#253775]"
                          title="Open Student Profile"
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

      {/* REVIEW DOCUMENT MODAL */}
      <AdminModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title={`Evaluate Document: ${selectedDoc?.documentName}`}
        description={`Submitted by ${selectedDoc?.studentName} (${selectedDoc?.studentIdCode}) for ${selectedDoc?.category?.replace(/_/g, " ")} verification.`}
      >
        <form onSubmit={handleExecuteReview} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">File Format:</span>
              <span className="font-mono font-bold text-slate-800">
                {selectedDoc?.fileType?.toUpperCase()} ({selectedDoc?.fileSizeMb || "1.2"} MB)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Uploaded On:</span>
              <span className="font-medium text-slate-800">
                {selectedDoc?.uploadedAt && new Date(selectedDoc.uploadedAt).toLocaleString()}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Verification Decision
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setReviewDecision("verified")}
                className={`py-2 px-3 rounded-lg text-xs font-bold border text-center transition-colors ${
                  reviewDecision === "verified"
                    ? "bg-emerald-500 text-white border-emerald-600"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                ✓ Verify & Approve
              </button>

              <button
                type="button"
                onClick={() => setReviewDecision("resubmission_required")}
                className={`py-2 px-3 rounded-lg text-xs font-bold border text-center transition-colors ${
                  reviewDecision === "resubmission_required"
                    ? "bg-amber-500 text-white border-amber-600"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                ⚠ Request Resubmit
              </button>

              <button
                type="button"
                onClick={() => setReviewDecision("rejected")}
                className={`py-2 px-3 rounded-lg text-xs font-bold border text-center transition-colors ${
                  reviewDecision === "rejected"
                    ? "bg-red-500 text-white border-red-600"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                ✕ Reject File
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Auditor / Review Feedback Notes
            </label>
            <textarea
              rows={3}
              required={reviewDecision !== "verified"}
              value={reviewComments}
              onChange={(e) => setReviewComments(e.target.value)}
              placeholder={
                reviewDecision === "verified"
                  ? "e.g. Verified official marksheets match original university transcripts."
                  : "e.g. Please upload clear scan showing full border margins and seal..."
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsReviewOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#253775] text-white rounded-lg text-xs font-semibold hover:bg-[#1c2a5e]"
            >
              Commit Decision
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
