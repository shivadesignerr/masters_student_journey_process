"use client";

import React, { useState, useEffect } from "react";
import { dataStore } from "@/lib/data/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  User,
  GraduationCap,
  Award,
  Globe,
  Phone,
  Mail,
  ShieldCheck,
  Building,
  Calendar,
} from "lucide-react";

export default function StudentProfilePage() {
  const { user } = useCurrentUser();
  const studentId = user?.role === "student" ? user.id : "usr-student-01";

  const [student, setStudent] = useState(() => dataStore.getStudentProfile(studentId));
  const [counselor, setCounselor] = useState(() => dataStore.getAssignedCounselor(studentId));

  useEffect(() => {
    setStudent(dataStore.getStudentProfile(studentId));
    setCounselor(dataStore.getAssignedCounselor(studentId));
    const unsubscribe = dataStore.subscribe(() => {
      setStudent(dataStore.getStudentProfile(studentId));
      setCounselor(dataStore.getAssignedCounselor(studentId));
    });
    return () => unsubscribe();
  }, [studentId]);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gvk-navy text-white flex items-center justify-center font-black text-3xl shrink-0 shadow-md">
            {student?.firstName?.charAt(0) || "S"}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-gvk-navy">
                {student?.firstName} {student?.lastName}
              </h1>
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-gvk-navy-50 text-gvk-navy border border-gvk-navy-200">
                {student?.studentIdCode}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gvk-text-secondary">
              Candidate for {student?.targetDegree} • Intake {student?.targetIntake}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Profile Attributes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal & Contact Vitals */}
        <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-4">
          <h2 className="text-sm font-bold text-gvk-navy flex items-center gap-2">
            <User className="w-4 h-4 text-gvk-navy" />
            <span>Personal & Destination Preferences</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-gvk-text-secondary">Primary Country</span>
              <span className="font-bold text-gvk-navy">{student?.preferredCountry}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-gvk-text-secondary">Target Intake</span>
              <span className="font-bold text-gvk-navy">{student?.targetIntake}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-gvk-text-secondary">Phone Number</span>
              <span className="font-bold text-gvk-navy font-mono">{student?.phone}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-gvk-text-secondary">Assigned Counselor</span>
              <span className="font-bold text-emerald-700">
                {counselor?.firstName} {counselor?.lastName} ({counselor?.employeeIdCode})
              </span>
            </div>
          </div>
        </div>

        {/* Academic Credentials */}
        <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card space-y-4">
          <h2 className="text-sm font-bold text-gvk-navy flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-gvk-navy" />
            <span>Undergraduate & Standardized Scores</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] text-gvk-text-secondary block">Undergraduate University</span>
              <span className="font-bold text-gvk-navy leading-snug">{student?.ugCollege}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-gvk-text-secondary block">UG CGPA</span>
                <span className="font-mono font-bold text-gvk-navy text-sm">{student?.ugCgpa} / 10.0</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-gvk-text-secondary block">Backlogs</span>
                <span className="font-mono font-bold text-gvk-success text-sm">{student?.ugBacklogs}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-gvk-text-secondary block">English Test (IELTS)</span>
                <span className="font-mono font-bold text-gvk-navy text-sm">{student?.englishScore} Band</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-gvk-text-secondary block">GRE Score</span>
                <span className="font-mono font-bold text-gvk-navy text-sm">{student?.greScore || "Waived"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
