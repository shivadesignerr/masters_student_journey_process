"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminModal } from "@/components/admin/AdminModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  GraduationCap,
  Building2,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Edit3,
  Video,
  ExternalLink,
  MessageSquare,
  Ban,
  AlertTriangle,
  Trash2,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
} from "lucide-react";

export default function AdminCounselorsPage() {
  const [counselors, setCounselors] = useState(() => dataStore.getAllCounselors());
  const [users, setUsers] = useState(() => dataStore.getAllUsers());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Credentials visibility state
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [revealAll, setRevealAll] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleRevealPassword = (id: string) => {
    setRevealedPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Provision Modal
  const [provisionModalOpen, setProvisionModalOpen] = useState(false);
  const [credentialsModal, setCredentialsModal] = useState<any | null>(null);

  // Delete Counselor Confirmation Modal
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    counselor: any | null;
    reason: string;
  }>({
    isOpen: false,
    counselor: null,
    reason: "",
  });

  const handleConfirmDelete = () => {
    if (!deleteConfirmModal.counselor) return;
    dataStore.deleteCounselor(deleteConfirmModal.counselor.id, deleteConfirmModal.reason);
    setDeleteConfirmModal({ isOpen: false, counselor: null, reason: "" });
    setCounselors(dataStore.getAllCounselors());
    setUsers(dataStore.getAllUsers());
  };

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    employeeIdCode: "",
    specializationCountries: ["United Kingdom", "Ireland", "Australia"],
    password: "GvkCounselor@2026",
  });

  // Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCounselor, setEditingCounselor] = useState<any | null>(null);

  // Check URL query parameters and custom admin action events
  useEffect(() => {
    const checkAction = () => {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("action") === "provision") {
          setProvisionModalOpen(true);
        }
      }
    };
    checkAction();

    const handleCustomAction = (e: any) => {
      if (e.detail?.action === "provision") {
        setProvisionModalOpen(true);
      }
    };
    window.addEventListener("gvk_admin_action", handleCustomAction);
    window.addEventListener("popstate", checkAction);
    return () => {
      window.removeEventListener("gvk_admin_action", handleCustomAction);
      window.removeEventListener("popstate", checkAction);
    };
  }, []);

  useEffect(() => {
    const update = () => {
      setCounselors([...dataStore.getAllCounselors()]);
      setUsers([...dataStore.getAllUsers()]);
    };
    const unsubscribe = dataStore.subscribe(update);
    return () => unsubscribe();
  }, []);

  const filteredCounselors = counselors.filter((c) => {
    const email = users.find((u) => u.id === c.id)?.email || "";
    const matchesSearch =
      c.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.employeeIdCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "active" && !c.isActive) return false;
    if (statusFilter === "inactive" && c.isActive) return false;

    return true;
  });

  const handleProvisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) return;

    const created = dataStore.createCounselor({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone || "+91 98490 55555",
      employeeIdCode: form.employeeIdCode || undefined,
      specializationCountries: form.specializationCountries,
      password: form.password || "GvkCounselor@2026",
    });

    setCredentialsModal({
      name: `${created.firstName} ${created.lastName}`,
      employeeIdCode: created.employeeIdCode,
      email: form.email,
      password: form.password || "GvkCounselor@2026",
    });

    setProvisionModalOpen(false);
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      employeeIdCode: "",
      specializationCountries: ["United Kingdom", "Ireland", "Australia"],
      password: "GvkCounselor@2026",
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCounselor) return;

    dataStore.updateCounselorProfile(editingCounselor.id, {
      firstName: editingCounselor.firstName,
      lastName: editingCounselor.lastName,
      phone: editingCounselor.phone,
      email: editingCounselor.email,
      password: editingCounselor.password,
      status: editingCounselor.status,
      specializationCountries: editingCounselor.specializationCountries,
    });

    setEditModalOpen(false);
    setEditingCounselor(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gvk-border p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Users className="w-5 h-5 text-emerald-700" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gvk-navy tracking-tight">
              <span suppressHydrationWarning>Senior Counselor Desks ({counselors.length})</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gvk-text-secondary">
            Provision advisory employee accounts, monitor assigned candidate loads, and inspect application oversight desks.
          </p>
        </div>

        <Button
          onClick={() => setProvisionModalOpen(true)}
          size="sm"
          className="bg-[#253775] hover:bg-[#1a2754] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Provision Counselor</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gvk-border p-4 shadow-card flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search counselor by name, Employee ID, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-gvk-navy placeholder:text-slate-400 focus:outline-hidden focus:border-[#253775] focus:bg-white transition-all shadow-2xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-gvk-navy focus:outline-hidden"
        >
          <option value="all">All Desk Statuses</option>
          <option value="active">Active Desks</option>
          <option value="inactive">Inactive / Suspended</option>
        </select>

        {/* Show All Passwords Toggle */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setRevealAll(!revealAll)}
          className={`h-9 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
            revealAll
              ? "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
          }`}
        >
          {revealAll ? (
            <>
              <EyeOff className="w-3.5 h-3.5 text-amber-700" />
              <span>Hide Passwords</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-slate-600" />
              <span>Show All Passwords</span>
            </>
          )}
        </Button>
      </div>

      {/* Counselors Table */}
      <div className="bg-white rounded-2xl border border-gvk-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-gvk-border text-gvk-text-secondary font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 sm:px-6">Counselor & Employee ID</th>
                <th className="py-3.5 px-4">Contact & Credentials</th>
                <th className="py-3.5 px-4">Specialization</th>
                <th className="py-3.5 px-4">Assigned Students</th>
                <th className="py-3.5 px-4">Active Applications</th>
                <th className="py-3.5 px-4">Desk Status</th>
                <th className="py-3.5 px-4 text-right">Workspace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gvk-border">
              {filteredCounselors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <Users className="w-10 h-10 opacity-40 mx-auto mb-2 text-[#253775]" />
                    <p className="font-bold text-gvk-navy text-sm">No Counselors Found</p>
                    <p className="text-xs text-gvk-text-secondary mt-1">
                      No senior counselor profiles match your search criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCounselors.map((c) => {
                  const assignedStudents = dataStore.getPrimaryAssignedStudents(c.id);
                  const counselorApps = dataStore.getAllApplications(c.id);
                  const userObj = users.find((u) => u.id === c.id);
                  const email = userObj?.email || `${c.firstName.toLowerCase()}@gvkedutech.com`;
                  const isDeskActive = c.isActive;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & ID */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {c.firstName.charAt(0)}
                          </div>
                          <div>
                            <strong className="text-sm font-bold text-gvk-navy block">
                              {c.firstName} {c.lastName}
                            </strong>
                            <span className="font-mono text-[11px] text-slate-500">
                              {c.employeeIdCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact & Credentials */}
                      <td className="py-4 px-4 text-gvk-text-secondary space-y-1.5">
                        {/* Email with copy */}
                        <div className="flex items-center gap-1.5 group">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-gvk-navy truncate max-w-[170px]" title={email}>
                            {email}
                          </span>
                          {email && (
                            <button
                              type="button"
                              onClick={() => handleCopy(email, `email-${c.id}`)}
                              className="p-1 rounded text-slate-400 hover:text-[#253775] hover:bg-slate-100 transition-colors"
                              title="Copy Official Email"
                            >
                              {copiedId === `email-${c.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>

                        {/* Password with eye toggle & copy */}
                        <div className="flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                            <span className="font-mono text-xs text-gvk-navy font-semibold select-all">
                              {revealAll || revealedPasswords[c.id]
                                ? (c.password || userObj?.passwordHash || "Counselor@123")
                                : "••••••••"}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleRevealPassword(c.id)}
                              className="p-0.5 text-slate-400 hover:text-slate-700 transition-colors ml-1"
                              title={revealedPasswords[c.id] || revealAll ? "Hide Password" : "Show Password"}
                            >
                              {revealAll || revealedPasswords[c.id] ? (
                                <EyeOff className="w-3 h-3" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(
                                  c.password || userObj?.passwordHash || "Counselor@123",
                                  `pwd-${c.id}`
                                )
                              }
                              className="p-0.5 text-slate-400 hover:text-[#253775] transition-colors"
                              title="Copy Password"
                            >
                              {copiedId === `pwd-${c.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>

                        {c.phone && (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="font-mono text-slate-500">{c.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Specialization */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {c.specializationCountries?.map((country, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-blue-50 text-[#253775] text-[10px] font-semibold border border-blue-200"
                            >
                              {country}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Assigned Students */}
                      <td className="py-4 px-4">
                        <strong suppressHydrationWarning className="font-mono text-sm font-bold text-gvk-navy block">
                          {assignedStudents.length} Candidate{assignedStudents.length !== 1 ? "s" : ""}
                        </strong>
                        <span suppressHydrationWarning className="text-[11px] text-slate-400">
                          {assignedStudents.length === 0 ? "Fresh clean desk" : "Active workload"}
                        </span>
                      </td>

                      {/* Applications in pipeline */}
                      <td className="py-4 px-4">
                        <span suppressHydrationWarning className="font-mono font-bold text-gvk-navy text-sm block">
                          {counselorApps.length} Lodged
                        </span>
                        <span suppressHydrationWarning className="text-[10px] text-emerald-700 font-semibold block">
                          {counselorApps.filter((a) => a.currentStatus.includes("offer")).length} Offers
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isDeskActive
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-red-50 text-red-800 border border-red-200"
                          }`}
                        >
                          {isDeskActive ? "Active Desk" : "Suspended"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setDeleteConfirmModal({
                                isOpen: true,
                                counselor: c,
                                reason: "",
                              })
                            }
                            className="h-8 px-2.5 text-[11px] font-bold text-red-700 bg-red-50/70 border-red-200 hover:bg-red-100 hover:text-red-900 flex items-center gap-1 shadow-2xs transition-colors"
                            title="Delete Counselor Account"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                            <span>Delete</span>
                          </Button>

                          <Link
                            href={`/admin/counselors/${c.id}?tab=messages`}
                            className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#253775] transition-colors flex items-center gap-1 px-2.5 text-xs font-semibold"
                            title="Direct Message Counselor (Restricted from Students)"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-[#253775]" />
                            <span className="hidden sm:inline">Message</span>
                          </Link>

                          <button
                            onClick={() => {
                              setEditingCounselor({
                                ...c,
                                email,
                                password: c.password || userObj?.passwordHash || "Counselor@123",
                                status: isDeskActive ? "active" : "suspended",
                              });
                              setEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                            title="Edit Counselor Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <Link
                            href={`/admin/counselors/${c.id}`}
                            className="inline-flex items-center justify-center h-8 px-3 rounded-md font-bold text-xs bg-[#253775] hover:bg-[#1a2754] text-white transition-colors shadow-2xs"
                          >
                            <span>Desk</span>
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Counselor Modal */}
      <AdminModal
        isOpen={provisionModalOpen}
        onClose={() => setProvisionModalOpen(false)}
        title="Provision Senior Admissions Counselor"
        subtitle="Create advisor identity, allocate destination specializations, and issue credentials."
        maxWidth="lg"
      >
        <form onSubmit={handleProvisionSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gvk-navy mb-1">First Name *</label>
              <Input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                placeholder="e.g. Vikram"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-gvk-navy mb-1">Last Name *</label>
              <Input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="e.g. Rao"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gvk-navy mb-1">Official GVK Email *</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="counselor.vikram@gvkedutech.com"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-gvk-navy mb-1">Phone Number</label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98490 55555"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gvk-navy mb-1">Employee ID Code</label>
            <Input
              value={form.employeeIdCode}
              onChange={(e) => setForm({ ...form, employeeIdCode: e.target.value })}
              placeholder="e.g. GVK-EMP-015 (Auto-generated if empty)"
            />
          </div>

          <div>
            <label className="block font-bold text-gvk-navy mb-1">Temporary Initial Password</label>
            <Input
              type="text"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="font-mono"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] leading-relaxed">
            The counselor desk will initialize with <strong>0 candidates (pristine fresh desk)</strong>. As candidates are allocated from the central administration workbench, they will appear in their portfolio.
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setProvisionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-[#253775] hover:bg-[#1a2754] text-white font-bold">
              Provision Counselor Account
            </Button>
          </div>
        </form>
      </AdminModal>

      {/* Edit Counselor Modal */}
      {editingCounselor && (
        <AdminModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditingCounselor(null);
          }}
          title={`Edit Counselor: ${editingCounselor.firstName} ${editingCounselor.lastName}`}
          subtitle={`Employee ID: ${editingCounselor.employeeIdCode}`}
          maxWidth="md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gvk-navy mb-1">First Name</label>
                <Input
                  value={editingCounselor.firstName}
                  onChange={(e) => setEditingCounselor({ ...editingCounselor, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-gvk-navy mb-1">Last Name</label>
                <Input
                  value={editingCounselor.lastName}
                  onChange={(e) => setEditingCounselor({ ...editingCounselor, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gvk-navy mb-1">Email</label>
                <Input
                  type="email"
                  value={editingCounselor.email || ""}
                  onChange={(e) => setEditingCounselor({ ...editingCounselor, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-gvk-navy mb-1">Desk Password</label>
                <Input
                  type="text"
                  value={editingCounselor.password || ""}
                  onChange={(e) => setEditingCounselor({ ...editingCounselor, password: e.target.value })}
                  placeholder="Counselor@123"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block font-bold text-gvk-navy mb-1">Phone</label>
                <Input
                  value={editingCounselor.phone || ""}
                  onChange={(e) => setEditingCounselor({ ...editingCounselor, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gvk-navy mb-1">Desk Status</label>
              <select
                value={editingCounselor.status || "active"}
                onChange={(e) => setEditingCounselor({ ...editingCounselor, status: e.target.value as any })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white"
              >
                <option value="active">Active Desk</option>
                <option value="suspended">Suspended / Inactive</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingCounselor(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#253775] hover:bg-[#1a2754] text-white font-bold">
                Save Counselor Parameters
              </Button>
            </div>
          </form>
        </AdminModal>
      )}

      {/* Provisioned Credentials Modal */}
      {credentialsModal && (
        <AdminModal
          isOpen={true}
          onClose={() => setCredentialsModal(null)}
          title="Counselor Desk Provisioned"
          subtitle="Authorized credentials for the counselor portal."
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Counselor Name:</span>
                <strong className="text-gvk-navy">{credentialsModal.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Employee ID Code:</span>
                <strong className="text-gvk-navy">{credentialsModal.employeeIdCode}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Login Email:</span>
                <strong className="text-gvk-navy">{credentialsModal.email}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Password:</span>
                <strong className="text-gvk-navy">{credentialsModal.password}</strong>
              </div>
            </div>

            <Button
              onClick={() => setCredentialsModal(null)}
              className="w-full bg-[#253775] hover:bg-[#1a2754] text-white font-bold"
            >
              Done & Return to Desks
            </Button>
          </div>
        </AdminModal>
      )}

      {/* Delete Counselor Confirmation Modal */}
      {deleteConfirmModal.isOpen && deleteConfirmModal.counselor && (
        <AdminModal
          isOpen={true}
          onClose={() =>
            setDeleteConfirmModal({ isOpen: false, counselor: null, reason: "" })
          }
          title="Confirm Counselor Deletion"
          subtitle="GVK Enterprise Staff Deprovisioning Protocol"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-red-800">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Are you sure you want to delete this counselor?</span>
              </div>
              <p className="text-xs text-red-700 leading-relaxed font-normal">
                Deleting will permanently revoke portal credentials for <strong className="font-bold text-red-900">{deleteConfirmModal.counselor.firstName} {deleteConfirmModal.counselor.lastName}</strong> ({deleteConfirmModal.counselor.employeeIdCode}), unassign their active candidates back to admissions hold, and purge their counselor desk. This action cannot be undone.
              </p>
            </div>

            {/* Counselor Summary */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Counselor:</span>
                <strong className="text-gvk-navy font-sans">
                  {deleteConfirmModal.counselor.firstName} {deleteConfirmModal.counselor.lastName}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Employee ID:</span>
                <strong className="text-gvk-navy">{deleteConfirmModal.counselor.employeeIdCode}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Specialization:</span>
                <span className="text-slate-700 font-sans">
                  {deleteConfirmModal.counselor.specializationCountries?.join(", ") || "General"}
                </span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-gvk-navy mb-1 text-xs">
                Reason for Deletion (Audit Log)
              </label>
              <Input
                type="text"
                placeholder="e.g. Staff departure, territory reallocation, administrative restructuring"
                value={deleteConfirmModal.reason}
                onChange={(e) =>
                  setDeleteConfirmModal((prev) => ({ ...prev, reason: e.target.value }))
                }
                className="bg-white text-xs"
              />
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setDeleteConfirmModal({ isOpen: false, counselor: null, reason: "" })
                }
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDelete}
                className="bg-[#FF0008] hover:bg-red-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Counselor</span>
              </Button>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
