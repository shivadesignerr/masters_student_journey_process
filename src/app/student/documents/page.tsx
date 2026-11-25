"use client";

import React, { useState, useEffect } from "react";
import { dataStore } from "@/lib/data/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DocumentVaultItem } from "@/types/domain";
import { DocumentCategory } from "@/types/database.types";
import {
  FolderLock,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  X,
  FileCheck,
  Shield,
  Clock,
  Eye,
  RefreshCw,
  Download,
  Lock,
} from "lucide-react";

const categories: { key: "all" | DocumentCategory | "offer_letters"; label: string }[] = [
  { key: "all", label: "All Documents" },
  { key: "offer_letters", label: "🏛️ University Offer Letters" },
  { key: "personal", label: "Personal & Passport" },
  { key: "academic", label: "Academic Records" },
  { key: "english_proficiency", label: "English & Tests" },
  { key: "masters_prep", label: "SOP, LOR & Resume" },
  { key: "financial", label: "Financial Evidence" },
  { key: "visa", label: "Visa & CAS" },
];

export default function StudentDocumentsPage() {
  const { user } = useCurrentUser();
  const studentId = user?.role === "student" ? user.id : "usr-student-01";

  const [documents, setDocuments] = useState<DocumentVaultItem[]>(() =>
    dataStore.getStudentDocuments(studentId)
  );
  const [journey, setJourney] = useState(() => dataStore.getStudentJourney(studentId));

  useEffect(() => {
    setDocuments(dataStore.getStudentDocuments(studentId));
    setJourney(dataStore.getStudentJourney(studentId));
    const unsubscribe = dataStore.subscribe(() => {
      setDocuments(dataStore.getStudentDocuments(studentId));
      setJourney(dataStore.getStudentJourney(studentId));
    });
    return () => unsubscribe();
  }, [studentId]);

  const activeStage = journey.find((s) => s.status !== "completed");
  const activeStageNum = activeStage ? activeStage.stageNumber : journey.length + 1;
  const isDocumentCollectionUnlocked = activeStageNum >= 3;
  const [activeCategory, setActiveCategory] = useState<"all" | DocumentCategory | "offer_letters">("all");
  const [uploadModalDoc, setUploadModalDoc] = useState<DocumentVaultItem | null>(null);
  const [isNewDocModal, setIsNewDocModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>("masters_prep");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const filteredDocs = documents.filter((doc) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "offer_letters") return doc.documentType === "offer_letter" || doc.id.startsWith("doc-offer-");
    return doc.category === activeCategory;
  });

  const verifiedCount = documents.filter((d) => d.verificationStatus === "verified").length;
  const underReviewCount = documents.filter((d) => d.verificationStatus === "under_review").length;
  const resubmitCount = documents.filter(
    (d) => d.verificationStatus === "resubmission_required" || d.verificationStatus === "rejected"
  ).length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!validTypes.includes(file.type)) {
        setUploadError("Invalid format. Please upload PDF, JPG, or PNG files only.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("File size exceeds 10MB limit.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDocumentCollectionUnlocked) {
      setUploadError("Document uploads are locked. Document Collection begins at Stage 03 after your counselor completes Profile Evaluation.");
      return;
    }
    if (!selectedFile) {
      setUploadError("Please select a file to upload.");
      return;
    }

    if (uploadModalDoc) {
      // Re-uploading existing document (new version)
      const updated = dataStore.uploadDocument(
        studentId,
        uploadModalDoc.category,
        uploadModalDoc.documentType,
        uploadModalDoc.title,
        selectedFile.name,
        selectedFile.size
      );
      setDocuments(dataStore.getStudentDocuments(studentId));
      setUploadSuccess(`New version of "${uploadModalDoc.title}" uploaded successfully for counselor review.`);
    } else {
      // New document
      if (!uploadTitle.trim()) {
        setUploadError("Please enter a title for the document.");
        return;
      }
      const newDoc = dataStore.uploadDocument(
        studentId,
        uploadCategory,
        uploadTitle.toLowerCase().replace(/\s+/g, "_"),
        uploadTitle,
        selectedFile.name,
        selectedFile.size
      );
      setDocuments(dataStore.getStudentDocuments(studentId));
      setUploadSuccess(`"${uploadTitle}" uploaded successfully for counselor review.`);
    }

    setSelectedFile(null);
    setTimeout(() => {
      setUploadModalDoc(null);
      setIsNewDocModal(false);
      setUploadSuccess(null);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-lg bg-gvk-navy-50 text-gvk-navy">
                <FolderLock className="w-5 h-5 text-gvk-navy" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-gvk-navy tracking-tight">
                Centralized Document Vault
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gvk-text-secondary">
              Upload, preview, and track verification of academic and financial records. Verified documents are reusable across all university applications.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isDocumentCollectionUnlocked ? (
              <Button
                onClick={() => {
                  setUploadModalDoc(null);
                  setIsNewDocModal(true);
                  setSelectedFile(null);
                  setUploadError(null);
                }}
                variant="default"
                size="sm"
                className="font-bold flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Document</span>
              </Button>
            ) : (
              <button
                disabled
                className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-not-allowed opacity-80"
                title="Document uploads unlock at Stage 03 (Document Collection)"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Upload Locked (Stage 03)</span>
              </button>
            )}
          </div>
        </div>

        {/* Milestone Lock Notice for Stage 01 & Stage 02 */}
        {!isDocumentCollectionUnlocked && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800">
                Document Collection Unlocks at Stage 03
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                Your admissions journey is currently at <strong>Stage {activeStageNum.toString().padStart(2, "0")}: {activeStage?.stageName || "Profile Evaluation"}</strong> (conducted by your assigned counselor). Document uploading is locked during Profile Evaluation and will automatically unlock once your counselor verifies and signs off Stage 02.
              </p>
            </div>
          </div>
        )}

        {/* Verification Status Ribbon */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-gvk-border text-center">
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
              Verified & Reusable
            </span>
            <span className="text-lg font-black text-emerald-700 font-mono">
              {verifiedCount}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
              Under Counselor Review
            </span>
            <span className="text-lg font-black text-amber-700 font-mono">
              {underReviewCount}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 block">
              Resubmission Required
            </span>
            <span className="text-lg font-black text-gvk-red font-mono">
              {resubmitCount}
            </span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 mt-5 pt-4 border-t border-gvk-border">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors min-h-[36px] ${
                activeCategory === cat.key
                  ? "bg-gvk-navy text-white shadow-xs"
                  : "bg-slate-100 text-gvk-text-secondary hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.map((doc) => {
          const isVerified = doc.verificationStatus === "verified";
          const needsResubmission =
            doc.verificationStatus === "resubmission_required" || doc.verificationStatus === "rejected";

          return (
            <div
              key={doc.id}
              className={`rounded-2xl border bg-white p-5 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between ${
                needsResubmission
                  ? "border-gvk-red/40 bg-gradient-to-b from-white to-red-50/20"
                  : "border-gvk-border"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-gvk-navy">
                    <FileText className="w-5 h-5" />
                  </div>
                  <StatusBadge type="document" status={doc.verificationStatus} />
                </div>

                <h3 className="text-sm font-bold text-gvk-navy leading-snug line-clamp-2">
                  {doc.title}
                </h3>
                <p className="text-[11px] text-gvk-text-secondary mt-1">
                  Category: <strong className="capitalize">{doc.category.replace(/_/g, " ")}</strong>
                </p>

                {/* File Details */}
                {doc.fileName ? (
                  <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-gvk-text-secondary space-y-0.5">
                    <p className="font-mono text-gvk-navy font-semibold truncate text-[11px]">
                      📄 {doc.fileName}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-gvk-text-muted">
                      <span>v{doc.latestVersion}</span>
                      <span>{doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : ""}</span>
                      {doc.uploadedAt && <span suppressHydrationWarning>{new Date(doc.uploadedAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-gvk-text-muted">
                    No file uploaded yet
                  </div>
                )}

                {/* Counselor Feedback for rejected / resubmission */}
                {doc.counselorComments && (
                  <div className="mt-3 p-2.5 rounded-lg bg-gvk-red-light border border-gvk-red-border text-xs text-gvk-red">
                    <strong className="block mb-0.5 font-bold">Counselor Feedback:</strong>
                    <p className="leading-relaxed">{doc.counselorComments}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gvk-border mt-4 flex flex-wrap items-center justify-between gap-2">
                {doc.fileName && (
                  <a
                    href={`/api/documents/download?id=${doc.id}&studentId=${studentId}`}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gvk-border bg-slate-50 hover:bg-slate-100 text-gvk-navy font-bold text-xs transition-colors shadow-2xs"
                    title="Download File"
                  >
                    <Download className="w-3.5 h-3.5 text-gvk-navy" />
                    <span>Download</span>
                  </a>
                )}

                <div className="ml-auto">
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-gvk-success font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verified</span>
                    </span>
                  ) : needsResubmission ? (
                    <Button
                      onClick={() => {
                        setUploadModalDoc(doc);
                        setIsNewDocModal(false);
                        setSelectedFile(null);
                        setUploadError(null);
                      }}
                      variant="default"
                      size="sm"
                      className="font-bold flex items-center justify-center gap-1.5 text-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Upload Corrected</span>
                    </Button>
                  ) : !isDocumentCollectionUnlocked ? (
                    <span className="text-[11px] font-medium text-slate-400 italic">
                      Locked until Stage 03
                    </span>
                  ) : (
                    <Button
                      onClick={() => {
                        setUploadModalDoc(doc);
                        setIsNewDocModal(false);
                        setSelectedFile(null);
                        setUploadError(null);
                      }}
                      variant="outline"
                      size="sm"
                      className="text-xs font-semibold"
                    >
                      Replace File
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload & Resubmission Modal */}
      {(uploadModalDoc || isNewDocModal) && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-gvk-border shadow-2xl p-6 sm:p-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gvk-border">
              <div>
                <h3 className="text-lg font-bold text-gvk-navy">
                  {uploadModalDoc ? `Update: ${uploadModalDoc.title}` : "Upload New Document"}
                </h3>
                <p className="text-xs text-gvk-text-secondary">
                  Files are encrypted and stored in GVK private cloud storage with signed access URLs.
                </p>
              </div>
              <button
                onClick={() => {
                  setUploadModalDoc(null);
                  setIsNewDocModal(false);
                }}
                className="p-2 rounded-lg hover:bg-slate-100 text-gvk-text-secondary min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadSuccess ? (
              <div className="py-8 text-center">
                <div className="w-14 h-14 rounded-full bg-gvk-success-light text-gvk-success flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-gvk-navy mb-1">Upload Successful!</h4>
                <p className="text-xs text-gvk-text-secondary">{uploadSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-4 py-4">
                {uploadError && (
                  <div className="p-3 rounded-lg bg-gvk-error-light border border-gvk-error-border text-gvk-error text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* If New Document, specify title & category */}
                {isNewDocModal && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gvk-text-primary mb-1">
                        Document Title
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. Statement of Purpose (Warwick Focus)"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gvk-text-primary mb-1">
                        Category
                      </label>
                      <select
                        value={uploadCategory}
                        onChange={(e) => setUploadCategory(e.target.value as DocumentCategory)}
                        className="w-full h-11 px-3 rounded-lg border border-gvk-border bg-white text-xs font-medium focus:ring-2 focus:ring-gvk-navy"
                      >
                        <option value="masters_prep">SOP, LOR & Resume</option>
                        <option value="academic">Academic Records</option>
                        <option value="english_proficiency">English & Tests</option>
                        <option value="personal">Personal & Passport</option>
                        <option value="financial">Financial Evidence</option>
                        <option value="visa">Visa & CAS</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Drag & Drop Area */}
                <div className="border-2 border-dashed border-gvk-border hover:border-gvk-navy rounded-xl p-6 text-center bg-slate-50 transition-colors">
                  <input
                    type="file"
                    id="docFileInput"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="docFileInput" className="cursor-pointer block">
                    <Upload className="w-8 h-8 text-gvk-navy mx-auto mb-2" />
                    <span className="text-xs font-bold text-gvk-navy block">
                      {selectedFile ? selectedFile.name : "Click to select or drag and drop document"}
                    </span>
                    <span className="text-[11px] text-gvk-text-muted mt-1 block">
                      Accepted: PDF, JPG, PNG (Max 10MB)
                    </span>
                  </label>
                </div>

                {selectedFile && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                    <span className="truncate">Selected: <strong>{selectedFile.name}</strong></span>
                    <span className="shrink-0 font-mono text-[11px]">{Math.round(selectedFile.size / 1024)} KB</span>
                  </div>
                )}

                <div className="pt-3 border-t border-gvk-border flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUploadModalDoc(null);
                      setIsNewDocModal(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="font-bold">
                    Upload & Submit for Verification
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
