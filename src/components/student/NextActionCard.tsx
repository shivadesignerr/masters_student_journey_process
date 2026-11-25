import React from "react";
import Link from "next/link";
import { NextActionItem } from "@/types/domain";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Clock,
  ArrowRight,
  Upload,
  Calendar,
  CreditCard,
  CheckCircle,
  Hourglass,
  Sparkles,
} from "lucide-react";

interface NextActionCardProps {
  action: NextActionItem;
}

export function NextActionCard({ action }: NextActionCardProps) {
  const isStudentAction = action.responsibleParty === "student";
  const isUrgent = action.priority === "urgent" || action.priority === "high";

  const getActionIcon = () => {
    switch (action.actionType) {
      case "upload_document":
        return <Upload className="w-5 h-5 text-gvk-navy" />;
      case "attend_interview":
        return <Calendar className="w-5 h-5 text-gvk-navy" />;
      case "pay_deposit":
        return <CreditCard className="w-5 h-5 text-amber-600" />;
      case "waiting_counselor":
        return <Hourglass className="w-5 h-5 text-gvk-navy" />;
      case "waiting_university":
        return <Hourglass className="w-5 h-5 text-blue-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-gvk-navy" />;
    }
  };

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-7 shadow-card bg-white transition-all relative overflow-hidden ${
        isUrgent
          ? "border-slate-200 border-l-4 border-l-gvk-red"
          : "border-slate-200 border-l-4 border-l-gvk-navy"
      }`}
    >
      {/* Top Banner Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 ${
              isUrgent
                ? "bg-gvk-red text-white"
                : isStudentAction
                ? "bg-gvk-navy text-white"
                : "bg-slate-700 text-white"
            }`}
          >
            {isStudentAction ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                ACTION REQUIRED FROM YOU
              </>
            ) : action.responsibleParty === "counselor" ? (
              <>
                <Clock className="w-3.5 h-3.5" />
                WAITING ON COUNSELOR ACTION
              </>
            ) : (
              <>
                <Hourglass className="w-3.5 h-3.5" />
                WAITING FOR UNIVERSITY
              </>
            )}
          </span>

          <span className="hidden sm:inline-flex text-xs font-semibold text-gvk-text-secondary">
            • Priority: <strong className="capitalize text-gvk-text-primary ml-1">{action.priority}</strong>
          </span>
        </div>

        {/* Deadline Indicator */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-gvk-navy" />
          <span>Deadline: <strong className="text-gvk-navy">{action.deadline}</strong></span>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-gvk-navy shadow-2xs">
            {getActionIcon()}
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gvk-navy leading-snug">
              {action.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {action.description}
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
          <Link href={action.actionUrl} className="w-full block">
            <Button
              size="lg"
              className="w-full sm:w-auto font-bold bg-gvk-navy hover:bg-gvk-navy-hover text-white shadow-xs flex items-center gap-2 group text-xs sm:text-sm"
            >
              <span>{action.actionButtonLabel}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
