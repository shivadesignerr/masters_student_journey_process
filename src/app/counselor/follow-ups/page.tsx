"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import {
  PhoneCall,
  Clock,
  AlertTriangle,
  User,
  CheckCircle2,
  Calendar,
  MessageSquare,
} from "lucide-react";

export default function CounselorFollowUpsPage() {
  const { user } = useCurrentUser();
  const counselorId = user?.role === "counselor" ? user.id : "usr-counselor-01";

  const [assignedStudents, setAssignedStudents] = useState(() => dataStore.getAssignedStudents(counselorId));
  const [contactedMap, setContactedMap] = useState<Record<string, string>>({});

  useEffect(() => {
    setAssignedStudents(dataStore.getAssignedStudents(counselorId));
    const unsubscribe = dataStore.subscribe(() => {
      setAssignedStudents(dataStore.getAssignedStudents(counselorId));
    });
    return () => unsubscribe();
  }, [counselorId]);

  const followUps = assignedStudents.map((stu) => {
    const journey = dataStore.getStudentJourney(stu.id);
    const activeStage = journey.find((s) => s.status !== "completed") || journey[0];
    const nextAction = dataStore.calculateNextAction(stu.id);
    const contacted = contactedMap[stu.id];

    return {
      id: `fu-${stu.id}`,
      studentId: stu.id,
      studentName: `${stu.firstName} ${stu.lastName}`,
      studentIdCode: stu.studentIdCode,
      relatedApp: activeStage ? `Stage ${String(activeStage.stageNumber).padStart(2, "0")}: ${activeStage.stageName}` : "Onboarding",
      pendingAction: nextAction.title,
      dueDate: nextAction.deadline || "2026-11-20",
      lastContactAttempt: contacted || "Awaiting initial counselor outreach",
      nextFollowUp: "2026-11-20",
      status: contacted ? "contacted" : "scheduled",
    };
  });

  const handleMarkContacted = (studentId: string) => {
    setContactedMap((prev) => ({
      ...prev,
      [studentId]: `Logged today (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-lg bg-gvk-navy-50 text-gvk-navy">
                <PhoneCall className="w-5 h-5 text-gvk-navy" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-gvk-navy tracking-tight">
                Centralized Follow-up Workbench ({followUps.length})
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gvk-text-secondary">
              Track inactive candidates, pending document resubmissions, and urgent intake deadlines.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {followUps.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gvk-border p-14 text-center text-xs shadow-card">
            <PhoneCall className="w-10 h-10 text-gvk-navy opacity-40 mx-auto mb-2" />
            <h3 className="text-base font-bold text-gvk-navy">No Follow-ups Pending</h3>
            <p className="text-gvk-text-secondary mt-1 max-w-md mx-auto">
              Your candidate roster is currently fresh with 0 students assigned. As candidates are allocated to your portfolio by GVK administration, their priority follow-ups will appear here.
            </p>
          </div>
        ) : (
          followUps.map((fu) => (
            <div
              key={fu.id}
              className="p-6 rounded-2xl border border-gvk-border bg-white shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    fu.status === "contacted"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}>
                    {fu.status.replace(/_/g, " ")}
                  </span>
                  <span className="font-mono text-gvk-text-muted">{fu.studentIdCode}</span>
                </div>

                <strong className="text-base font-bold text-gvk-navy block">
                  {fu.studentName} — {fu.relatedApp}
                </strong>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-gvk-text-primary">
                  <strong className="text-gvk-navy font-bold">Pending Action:</strong> {fu.pendingAction}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-gvk-text-secondary pt-1">
                  <span>Due Date: <strong className="text-gvk-text-primary">{fu.dueDate}</strong></span>
                  <span>Last Contact: <strong>{fu.lastContactAttempt}</strong></span>
                  <span>Next Follow-up: <strong className="text-gvk-navy">{fu.nextFollowUp}</strong></span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                <Button
                  onClick={() => handleMarkContacted(fu.studentId)}
                  size="sm"
                  variant="outline"
                  className="text-xs font-bold"
                >
                  Log Contact Attempt
                </Button>
                <Link href={`/counselor/students/${fu.studentId}`}>
                  <Button size="sm" className="font-bold text-xs">
                    Open Profile
                  </Button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
