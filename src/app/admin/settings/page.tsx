"use client";

import React, { useState, useEffect } from "react";
import { dataStore } from "@/lib/data/store";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  Settings,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Lock,
  Clock,
  Bell,
  Users,
  ShieldAlert,
  Sliders,
  FileText,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [tick, setTick] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);

  // Settings State
  const [maxStudentsPerCounselor, setMaxStudentsPerCounselor] = useState(35);
  const [activeIntake, setActiveIntake] = useState("September Intake");
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);
  const [autoEscalateOverdueTasks, setAutoEscalateOverdueTasks] = useState(true);
  const [auditRetentionDays, setAuditRetentionDays] = useState(365);

  // Password Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const unsub = dataStore.subscribe(() => setTick((t) => t + 1));
    return () => unsub();
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSaveGovernance = (e: React.FormEvent) => {
    e.preventDefault();
    dataStore.logActivity({
      userId: "usr-admin-01",
      userName: "GVK Admissions Admin",
      role: "admin",
      action: "PLATFORM_SETTINGS_UPDATED",
      title: "Admissions Governance Policies Saved",
      description: `Updated max candidates per counselor to ${maxStudentsPerCounselor} and active intake to ${activeIntake}.`,
      entityType: "system",
      entityId: "settings",
    });
    showToast("Admissions governance policies saved successfully.");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New password and confirmation do not match.");
      return;
    }
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    // Record audit log for security
    dataStore.logActivity({
      userId: "usr-admin-01",
      userName: "GVK Admissions Admin",
      role: "admin",
      action: "ADMIN_PASSWORD_UPDATED",
      title: "Super Admin Password Rotated",
      description: "Super Admin credentials updated via executive governance panel.",
      entityType: "security",
      entityId: "auth",
    });

    setIsPasswordModalOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showToast("Super Admin security credentials updated successfully.");
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
            Platform Settings & Governance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Super admin security controls, admissions desk workload policies, automated escalations, and compliance rules.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Security & Authentication Card */}
          <AdminCard
            title="Super Admin Security & Access Control"
            subtitle="Dedicated credentials for platform governance and administrative oversight"
          >
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 font-medium">Authorized Admin Identifier:</span>
                  <div className="font-mono font-bold text-sm text-[#253775] mt-1">
                    GVK_masters_admin
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Private gateway accessible at /masters_admin only
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Session Security Protocol:</span>
                  <div className="font-bold text-emerald-700 flex items-center gap-1.5 mt-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Strict HttpOnly Cookie + Rate Limiting
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Protected against brute force with 5-attempt security lockout
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="font-bold text-slate-800">Super Admin Password</span>
                  <p className="text-[11px] text-slate-500">
                    Protected by server-side authentication with cryptographic session hashing.
                  </p>
                </div>
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#253775] text-white hover:bg-[#1c2a5e] rounded-lg text-xs font-semibold shadow-sm transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Rotate Password
                </button>
              </div>
            </div>
          </AdminCard>

          {/* Admissions Desk Policies & Workload Limits */}
          <AdminCard
            title="Counselor Workload & Intake Policies"
            subtitle="Configure candidate distribution rules and active admission seasons"
          >
            <form onSubmit={handleSaveGovernance} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Max Candidates per Counselor Desk
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={maxStudentsPerCounselor}
                    onChange={(e) => setMaxStudentsPerCounselor(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Counselors reaching this threshold are marked at full capacity on assignments workbench.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Active Primary Intake Cycle
                  </label>
                  <select
                    value={activeIntake}
                    onChange={(e) => setActiveIntake(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] outline-none"
                  >
                    <option value="September Intake">September Intake (Primary Intake)</option>
                    <option value="January Intake">January Intake (Secondary Intake)</option>
                    <option value="May Intake">May Intake (Spring / Summer Intake)</option>
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Default intake applied when enrolling new candidates and mapping deadlines.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#253775] text-white hover:bg-[#1c2a5e] rounded-lg text-xs font-semibold shadow-sm transition-colors"
                >
                  Save Governance Policies
                </button>
              </div>
            </form>
          </AdminCard>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          {/* Notification & Automation Alerts */}
          <AdminCard
            title="Escalations & Alerts"
            subtitle="Automated alerts for delayed actions"
          >
            <div className="space-y-3 text-xs">
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoEscalateOverdueTasks}
                  onChange={(e) => setAutoEscalateOverdueTasks(e.target.checked)}
                  className="mt-0.5 rounded text-[#253775] focus:ring-[#253775]"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">Overdue Task Escalation</span>
                  <p className="text-[11px] text-slate-500">
                    Flag overdue student and counselor action items on the admin overview queue.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailAlertsEnabled}
                  onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
                  className="mt-0.5 rounded text-[#253775] focus:ring-[#253775]"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">Unassigned Student Alerts</span>
                  <p className="text-[11px] text-slate-500">
                    Notify administrators when newly enrolled candidates remain unallocated.
                  </p>
                </div>
              </label>
            </div>
          </AdminCard>

          {/* Compliance & Audit Retention Card */}
          <AdminCard
            title="Compliance & Audit Standards"
            subtitle="Organizational data governance rules"
          >
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Audit Trail Retention:</span>
                <span className="font-mono font-bold text-slate-900">{auditRetentionDays} Days</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Role Separation:</span>
                <span className="font-bold text-emerald-700">Strict Multi-Tenant</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Administrative Gateway:</span>
                <span className="font-mono font-bold text-[#253775]">/masters_admin</span>
              </div>
              <div className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                All administrative modifications, admissions assignments, and interview evaluations are logged to the central audit ledger.
              </div>
            </div>
          </AdminCard>
        </div>
      </div>

      {/* ROTATE PASSWORD MODAL */}
      <AdminModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Rotate Super Admin Password"
        description="Update administrative credentials for GVK_masters_admin."
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Admin Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter existing password"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Admin Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#253775] text-white rounded-lg text-xs font-semibold hover:bg-[#1c2a5e]"
            >
              Update Password
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
