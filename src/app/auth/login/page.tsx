"use client";

import React, { useState, useTransition, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GvkLogo } from "@/components/shared/GvkLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAction } from "@/app/actions/auth";
import {
  GraduationCap,
  Briefcase,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  Building2,
  CheckCircle2,
} from "lucide-react";

type LoginRole = "student" | "counselor" | "admin";

function LoginForm() {
  const searchParams = useSearchParams();
  const paramRole = searchParams.get("role");

  const getInitialRole = (): LoginRole => {
    if (paramRole === "admin") return "admin";
    if (paramRole === "counselor") return "counselor";
    return "student";
  };

  const [activeTab, setActiveTab] = useState<LoginRole>(getInitialRole);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (paramRole === "admin") {
      setActiveTab("admin");
    } else if (paramRole === "counselor") {
      setActiveTab("counselor");
    } else if (paramRole === "student") {
      setActiveTab("student");
    }
  }, [paramRole]);

  const handleRoleChange = (role: LoginRole) => {
    setActiveTab(role);
    setError(null);
    setIdentifier("");
    setPassword("");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("identifier", identifier);
    formData.append("password", password);
    formData.append("role", activeTab);

    startTransition(async () => {
      const result = await loginAction(null, formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-2xl border border-gvk-border shadow-elevated p-6 sm:p-8">
      {/* Header Title */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gvk-navy-50 border border-gvk-navy-200 text-gvk-navy text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-gvk-navy" />
          <span>GVK Enterprise Access Control</span>
        </div>
        <h1 className="text-2xl font-black text-gvk-navy tracking-tight">
          Sign In to GVK Edutech
        </h1>
        <p className="text-xs text-gvk-text-secondary mt-1">
          Select your authorized role to access your dedicated portal and dashboard.
        </p>
      </div>

      {/* 3-Way Role Switcher Tabs */}
      <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-xl mb-6 gap-1">
        <button
          type="button"
          onClick={() => handleRoleChange("student")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all min-h-[44px] ${
            activeTab === "student"
              ? "bg-white text-gvk-navy shadow-sm"
              : "text-gvk-text-secondary hover:text-gvk-navy"
          }`}
        >
          <GraduationCap className={`w-4 h-4 ${activeTab === "student" ? "text-gvk-navy" : "text-slate-400"}`} />
          <span>Student</span>
        </button>

        <button
          type="button"
          onClick={() => handleRoleChange("counselor")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all min-h-[44px] ${
            activeTab === "counselor"
              ? "bg-white text-emerald-800 shadow-sm"
              : "text-gvk-text-secondary hover:text-gvk-navy"
          }`}
        >
          <Briefcase className={`w-4 h-4 ${activeTab === "counselor" ? "text-emerald-600" : "text-slate-400"}`} />
          <span>Counselor</span>
        </button>

        <button
          type="button"
          onClick={() => handleRoleChange("admin")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all min-h-[44px] ${
            activeTab === "admin"
              ? "bg-white text-indigo-950 shadow-sm"
              : "text-gvk-text-secondary hover:text-gvk-navy"
          }`}
        >
          <Building2 className={`w-4 h-4 ${activeTab === "admin" ? "text-indigo-600" : "text-slate-400"}`} />
          <span>Admin</span>
        </button>
      </div>

      {/* Role Banner Info */}
      <div className={`p-3 rounded-xl mb-5 text-xs border flex items-center gap-2.5 ${
        activeTab === "admin"
          ? "bg-indigo-50/70 border-indigo-200 text-indigo-900"
          : activeTab === "counselor"
          ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
          : "bg-blue-50/70 border-blue-200 text-blue-900"
      }`}>
        <div className={`p-1.5 rounded-lg text-white shrink-0 ${
          activeTab === "admin"
            ? "bg-indigo-700"
            : activeTab === "counselor"
            ? "bg-emerald-600"
            : "bg-gvk-navy"
        }`}>
          {activeTab === "admin" && <Building2 className="w-4 h-4" />}
          {activeTab === "counselor" && <Briefcase className="w-4 h-4" />}
          {activeTab === "student" && <GraduationCap className="w-4 h-4" />}
        </div>
        <div>
          <span className="font-bold block">
            {activeTab === "admin" && "Central Operations & Governance Panel"}
            {activeTab === "counselor" && "Counselor Operations Desk"}
            {activeTab === "student" && "Masters Student Portal"}
          </span>
          <span className="text-[11px] opacity-80">
            {activeTab === "admin" && "Authorized management credentials required (Super Admin access)."}
            {activeTab === "counselor" && "Assigned candidate portfolios, document review, and mock interview desks."}
            {activeTab === "student" && "Track your 25-stage journey, applications, and direct counselor chat."}
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-gvk-error-light border border-gvk-error-border text-gvk-error text-xs flex items-start gap-2.5 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="font-medium leading-relaxed">{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gvk-text-primary mb-1.5">
            {activeTab === "admin"
              ? "Administrator Username or Email"
              : activeTab === "counselor"
              ? "Employee ID or Registered Email"
              : "Student ID or Registered Email"}
          </label>
          <Input
            type="text"
            placeholder={
              activeTab === "admin"
                ? "e.g. GVK_masters_admin or admin@gvkedutech.com"
                : activeTab === "counselor"
                ? "e.g. GVK-EMP-001 or counselor@gmail.com"
                : "e.g. GVK-STU-2026-0042 or rahul@gmail.com"
            }
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
            autoComplete="username"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-gvk-text-primary">
              Password
            </label>
            {activeTab !== "admin" && (
              <Link
                href={`/auth/forgot-password?role=${activeTab}`}
                className="text-xs font-semibold text-gvk-navy hover:text-blue-700 transition-colors"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder={
                activeTab === "admin"
                  ? "Enter administrator password"
                  : activeTab === "counselor"
                  ? "Enter counselor password"
                  : "Enter student password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gvk-text-muted hover:text-gvk-text-primary min-h-[44px]"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="default"
          size="lg"
          className="w-full mt-2 font-bold shadow-md"
          isLoading={isPending}
        >
          {activeTab === "admin" && "Sign In to Admin Panel"}
          {activeTab === "counselor" && "Sign In to Counselor Desk"}
          {activeTab === "student" && "Sign In to Student Portal"}
        </Button>
      </form>

      {/* Activation link for first-time students */}
      {activeTab === "student" && (
        <div className="mt-5 text-center text-xs text-gvk-text-secondary">
          First time logging in?{" "}
          <Link
            href="/auth/activate"
            className="font-bold text-gvk-navy hover:text-blue-700 underline transition-colors"
          >
            Activate your student account
          </Link>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gvk-bg flex flex-col justify-between">
      {/* Header */}
      <header className="p-6 md:px-12 flex items-center justify-between border-b border-gvk-border bg-white shadow-2xs">
        <GvkLogo />
        <div className="flex items-center gap-2 text-xs font-semibold text-gvk-text-secondary">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Unified Enterprise Gateway</span>
        </div>
      </header>

      {/* Main Container with Suspense Boundary */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <Suspense
          fallback={
            <div className="w-full max-w-lg bg-white rounded-2xl border border-gvk-border p-8 text-center text-xs text-gvk-text-secondary animate-pulse">
              Loading GVK Unified Authentication...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-gvk-text-secondary border-t border-gvk-border bg-white">
        Protected by GVK Edutech Role-Based Access Control (RBAC) & Enterprise Security Auditing.
      </footer>
    </div>
  );
}
