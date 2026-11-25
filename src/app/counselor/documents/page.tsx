"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertTriangle,
  X,
  Eye,
  RefreshCw,
  Search,
  Download,
} from "lucide-react";

export default function CounselorDocumentsPage() {
  const { user } = useCurrentUser();
  const counselorId = user?.role === "counselor" ? user.id : "usr-counselor-01";

  const [assignedStudents, setAssignedStudents] = useState(() => dataStore.getAssignedStudents(counselorId));
  const [pendingDocs, setPendingDocs] = useState(() =>
    dataStore.getAllPendingReviewDocuments(counselorId)
  );

  useEffect(() => {
    setAssignedStudents(dataStore.getAssignedStudents(counselorId));
    setPendingDocs(dataStore.getAllPendingReviewDocuments(counselorId));

    const unsubscribe = dataStore.subscribe(() => {
      setAssignedStudents(dataStore.getAssignedStudents(counselorId));
      setPendingDocs(dataStore.getAllPendingReviewDocuments(counselorId));
    });
    return () => unsubscribe();
  }, [counselorId]);
  const [reviewModalDoc, setReviewModalDoc] = useState<any | null>(null);
  const [decision, setDecision] = useState<"verified" | "rejected" | "resubmission_required">("verified");
  const [comments, setComments] = useState("");

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalDoc) return;

    dataStore.reviewDocument(reviewModalDoc.id, decision, counselorId, comments);
    setPendingDocs(dataStore.getAllPendingReviewDocuments(counselorId));
    setReviewModalDoc(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-lg bg-gvk-navy-50 text-gvk-navy">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-gvk-navy tracking-tight">
                Document Verification Inbox ({pendingDocs.length})
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gvk-text-secondary">
              Review, verify, or request revisions on academic and financial documents uploaded by assigned candidates.
            </p>
          </div>
        </div>
      </div>

      {/* Review Queue Table */}
      <div className="bg-white rounded-2xl border border-gvk-border shadow-card overflow-hidden">
        {pendingDocs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-gvk-border text-gvk-text-secondary font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 sm:px-6">Document Title</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">File Name & Version</th>
                  <th className="py-3.5 px-4">Upload Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gvk-border">
                {pendingDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 sm:px-6">
                      <strong className="text-sm font-bold text-gvk-navy block">
                        {doc.title}
                      </strong>
                      <span className="text-gvk-text-secondary text-[11px] capitalize">
                        {doc.category.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <strong className="text-gvk-text-primary block font-semibold">
                        {doc.studentName}
                      </strong>
                      <span className="font-mono text-[11px] text-gvk-text-muted">
                        {doc.studentIdCode}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-mono text-xs text-gvk-navy">
                      📄 {doc.fileName} <span className="text-gvk-text-muted font-normal">(v{doc.latestVersion})</span>
                    </td>

                    <td suppressHydrationWarning className="py-4 px-4 text-gvk-text-secondary font-mono">
                      {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : "Recent"}
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge type="document" status={doc.verificationStatus} />
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/api/documents/download?id=${doc.id}&studentId=${doc.studentId}`}
                          download
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gvk-border bg-slate-50 hover:bg-slate-100 text-gvk-navy font-bold text-xs transition-colors"
                          title="Download Student Document"
                        >
                          <Download className="w-3.5 h-3.5 text-gvk-navy" />
                          <span>Download</span>
                        </a>
                        <Button
                          onClick={() => {
                            setReviewModalDoc(doc);
                            setDecision("verified");
                            setComments("");
                          }}
                          size="sm"
                          className="font-bold text-xs"
                        >
                          Evaluate File
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-gvk-text-secondary">
            {assignedStudents.length === 0 ? (
              <>
                <ShieldCheck className="w-10 h-10 text-gvk-navy opacity-40 mx-auto mb-2" />
                <h3 className="text-base font-bold text-gvk-navy">No Candidates Assigned Yet</h3>
                <p className="mt-1 max-w-sm mx-auto">
                  Your desk is fresh and ready. As soon as candidates are allocated to you and upload documents to their vault, they will appear here for verification.
                </p>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h3 className="text-base font-bold text-gvk-navy">Document Queue Clear!</h3>
                <p className="mt-1">All uploaded candidate records have been evaluated and verified.</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Review & Decision Modal */}
      {reviewModalDoc && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gvk-border shadow-2xl p-6">
            <h3 className="text-lg font-bold text-gvk-navy mb-1">
              Verify Document: {reviewModalDoc.title}
            </h3>
            <p className="text-xs text-gvk-text-secondary mb-4">
              Student: {reviewModalDoc.studentName} ({reviewModalDoc.studentIdCode})
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-mono text-gvk-navy font-bold block truncate">
                    📄 {reviewModalDoc.fileName}
                  </span>
                  <span className="text-[11px] text-gvk-text-muted">
                    Version: v{reviewModalDoc.latestVersion} • Secure signed download ready
                  </span>
                </div>
                <a
                  href={`/api/documents/download?id=${reviewModalDoc.id}&studentId=${reviewModalDoc.studentId}`}
                  download
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gvk-navy text-white text-xs font-bold hover:bg-gvk-navy-800 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
              </div>

              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Verification Decision</label>
                <select
                  value={decision}
                  onChange={(e) => setDecision(e.target.value as any)}
                  className="w-full h-11 px-3 rounded-lg border border-gvk-border bg-white font-medium"
                >
                  <option value="verified">✅ Verified & Approved</option>
                  <option value="resubmission_required">⚠️ Request Resubmission with Corrections</option>
                  <option value="rejected">❌ Reject Document</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gvk-text-primary mb-1">Counselor Feedback to Student</label>
                <textarea
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Provide instructions if requesting resubmission or add verification notes..."
                  className="w-full p-2.5 rounded-lg border border-gvk-border"
                />
              </div>

              <div className="pt-3 border-t border-gvk-border flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setReviewModalDoc(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="font-bold">
                  Save Decision
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
