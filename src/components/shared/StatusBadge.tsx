import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  AlertTriangle,
  Calendar,
  Sparkles,
} from "lucide-react";
import {
  ApplicationStatus,
  DocumentVerificationStatus,
  JourneyStageStatus,
  TaskPriority,
  TaskStatus,
} from "@/types/database.types";

interface StatusBadgeProps {
  type: "application" | "document" | "journey" | "priority" | "task" | "interviewOutcome" | "interviewStatus";
  status: string;
  className?: string;
}

export function StatusBadge({ type, status, className }: StatusBadgeProps) {
  if (type === "application") {
    const s = status as ApplicationStatus;
    switch (s) {
      case "unconditional_offer":
      case "completed":
        return (
          <Badge variant="success" icon={<CheckCircle2 className="w-3 h-3 text-emerald-600" />} className={className}>
            Unconditional Offer
          </Badge>
        );
      case "conditional_offer":
        return (
          <Badge variant="default" icon={<FileText className="w-3 h-3 text-gvk-navy" />} className={className}>
            Conditional Offer
          </Badge>
        );
      case "submitted":
      case "under_review":
        return (
          <Badge variant="warning" icon={<Clock className="w-3 h-3 text-amber-600" />} className={className}>
            Under Review
          </Badge>
        );
      case "documents_pending":
      case "additional_info_required":
        return (
          <Badge variant="error" icon={<AlertTriangle className="w-3 h-3 text-rose-600" />} className={className}>
            Action Required
          </Badge>
        );
      case "cas_received":
      case "deposit_paid":
        return (
          <Badge variant="success" icon={<CheckCircle2 className="w-3 h-3 text-emerald-600" />} className={className}>
            {status.replace(/_/g, " ").toUpperCase()}
          </Badge>
        );
      case "rejected":
      case "withdrawn":
        return (
          <Badge variant="error" icon={<XCircle className="w-3 h-3 text-rose-600" />} className={className}>
            {status.toUpperCase()}
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" icon={<Clock className="w-3 h-3 text-slate-500" />} className={className}>
            {status.replace(/_/g, " ")}
          </Badge>
        );
    }
  }

  if (type === "document") {
    const s = status as DocumentVerificationStatus;
    switch (s) {
      case "verified":
        return (
          <Badge variant="success" icon={<CheckCircle2 className="w-3 h-3 text-emerald-600" />} className={className}>
            Verified
          </Badge>
        );
      case "under_review":
      case "uploaded":
        return (
          <Badge variant="warning" icon={<Clock className="w-3 h-3 text-amber-600" />} className={className}>
            Under Review
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="error" icon={<XCircle className="w-3 h-3 text-rose-600" />} className={className}>
            Rejected
          </Badge>
        );
      case "resubmission_required":
        return (
          <Badge variant="error" icon={<AlertCircle className="w-3 h-3 text-rose-600" />} className={className}>
            Resubmission Required
          </Badge>
        );
      case "required":
      case "not_uploaded":
        return (
          <Badge variant="error" icon={<AlertTriangle className="w-3 h-3 text-rose-600" />} className={className}>
            Not Uploaded
          </Badge>
        );
      case "not_applicable":
        return (
          <Badge variant="neutral" className={className}>
            N/A
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" className={className}>
            {status}
          </Badge>
        );
    }
  }

  if (type === "priority") {
    const s = status as TaskPriority;
    switch (s) {
      case "urgent":
        return (
          <Badge variant="red" icon={<AlertCircle className="w-3 h-3 text-gvk-red" />} className={className}>
            Urgent
          </Badge>
        );
      case "high":
        return (
          <Badge variant="warning" icon={<AlertTriangle className="w-3 h-3 text-amber-600" />} className={className}>
            High Priority
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="default" className={className}>
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge variant="neutral" className={className}>
            Low
          </Badge>
        );
    }
  }

  if (type === "task") {
    const s = status as TaskStatus;
    switch (s) {
      case "completed":
        return (
          <Badge variant="success" icon={<CheckCircle2 className="w-3 h-3 text-emerald-600" />} className={className}>
            Completed
          </Badge>
        );
      case "submitted":
      case "under_review":
        return (
          <Badge variant="default" icon={<Clock className="w-3 h-3 text-gvk-navy" />} className={className}>
            Submitted
          </Badge>
        );
      case "overdue":
        return (
          <Badge variant="error" icon={<AlertCircle className="w-3 h-3 text-rose-600" />} className={className}>
            Overdue
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="warning" icon={<Clock className="w-3 h-3 text-amber-600" />} className={className}>
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" icon={<Clock className="w-3 h-3 text-slate-400" />} className={className}>
            Pending
          </Badge>
        );
    }
  }

  if (type === "journey") {
    const s = status as JourneyStageStatus;
    switch (s) {
      case "completed":
        return (
          <Badge variant="success" icon={<CheckCircle2 className="w-3 h-3 text-emerald-600" />} className={className}>
            Completed
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="warning" icon={<Clock className="w-3 h-3 text-amber-600" />} className={className}>
            In Progress
          </Badge>
        );
      case "waiting_student":
        return (
          <Badge variant="default" icon={<FileText className="w-3 h-3 text-gvk-navy" />} className={className}>
            Awaiting Candidate
          </Badge>
        );
      case "on_hold":
        return (
          <Badge variant="error" icon={<AlertTriangle className="w-3 h-3 text-rose-600" />} className={className}>
            On Hold
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" className={className}>
            {status}
          </Badge>
        );
    }
  }

  if (type === "interviewOutcome") {
    if (status === "PASS") {
      return (
        <Badge variant="pass" icon={<CheckCircle2 className="w-3 h-3 text-emerald-700" />} className={className}>
          PASS
        </Badge>
      );
    }
    if (status === "FAIL") {
      return (
        <Badge variant="fail" icon={<XCircle className="w-3 h-3 text-rose-700" />} className={className}>
          FAIL
        </Badge>
      );
    }
    return (
      <Badge variant="neutral" className={className}>
        {status}
      </Badge>
    );
  }

  if (type === "interviewStatus") {
    switch (status) {
      case "completed":
        return (
          <Badge variant="success" icon={<CheckCircle2 className="w-3 h-3 text-emerald-600" />} className={className}>
            Completed
          </Badge>
        );
      case "scheduled":
        return (
          <Badge variant="default" icon={<Calendar className="w-3 h-3 text-gvk-navy" />} className={className}>
            Scheduled
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="error" icon={<XCircle className="w-3 h-3 text-rose-600" />} className={className}>
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" className={className}>
            {status}
          </Badge>
        );
    }
  }

  return (
    <Badge variant="neutral" className={className}>
      {status}
    </Badge>
  );
}
