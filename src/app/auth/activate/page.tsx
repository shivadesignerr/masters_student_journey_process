"use client";

import React, { useState, useEffect, Suspense, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GvkLogo } from "@/components/shared/GvkLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Eye,
  EyeOff,
  UserCheck,
  GraduationCap,
} from "lucide-react";
import { dataStore } from "@/lib/data/store";
import { activateAccountAction } from "@/app/actions/auth";

interface ActivatedStudentInfo {
  name: string;
  studentIdCode: string;
  email: string;
}

function ActivationForm() {
  const searchParams = useSearchParams();
  const initialToken = searchParams.get("token") || searchParams.get("code") || "";

  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activatedStudent, setActivatedStudent] = useState<ActivatedStudentInfo | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (initialToken) {
      setToken(initialToken);
    }
  }, [initialToken]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanToken = token.trim().toUpperCase();
    if (!cleanToken) {
      setError("Please enter your unique activation invitation code provided by GVK Admin.");
      return;
    }
    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter identical passwords.");
      return;
    }

    startTransition(async () => {
      // 1. Client-side store update for instant local state sync
      const clientRes = dataStore.activateStudentAccount(cleanToken, password);

      // 2. Server action update
      const serverRes = await activateAccountAction(cleanToken, password);

      if (!serverRes.success && !clientRes.success) {
        setError(serverRes.error || clientRes.error || "Invalid activation code. Please contact your GVK counselor or admin.");
        return;
      }

      const stuName = serverRes.student?.name || (clientRes.student ? `${clientRes.student.firstName} ${clientRes.student.lastName}` : "Candidate");
      const stuCode = serverRes.student?.studentIdCode || clientRes.studentIdCode || "";
      const stuEmail = serverRes.student?.email || clientRes.email || "";

      setActivatedStudent({
        name: stuName,
        studentIdCode: stuCode,
        email: stuEmail,
      });
    });
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl border border-gvk-border shadow-elevated p-6 sm:p-8">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-900 border border-indigo-100 flex items-center justify-center mx-auto mb-3 shadow-2xs">
          <KeyRound className="w-6 h-6 text-[#253775]" />
        </div>
        <h1 className="text-2xl font-black text-gvk-navy tracking-tight">
          First-Time Account Activation
        </h1>
        <p className="text-xs text-gvk-text-secondary mt-1">
          Set your personal secure password using your unique GVK Admin invitation token.
        </p>
      </div>

      {activatedStudent ? (
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-xl font-black text-gvk-navy mb-1">
            Account Successfully Activated!
          </h2>
          <p className="text-xs text-gvk-text-secondary mb-4 leading-relaxed">
            Welcome to GVK Masters, <strong className="text-gvk-navy">{activatedStudent.name}</strong>. Your account is now active and your personal password has been securely set.
          </p>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2 mb-6 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-sans">Student Name:</span>
              <strong className="text-gvk-navy">{activatedStudent.name}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-sans">Student ID Code:</span>
              <strong className="text-indigo-900 font-bold">{activatedStudent.studentIdCode}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-sans">Registered Email:</span>
              <strong className="text-slate-700">{activatedStudent.email}</strong>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-200">
              <span className="text-slate-500 font-sans">Portal Access:</span>
              <span className="text-emerald-700 font-bold font-sans">● Ready & Unlocked</span>
            </div>
          </div>

          <Link href={`/auth/login?role=student`}>
            <Button size="lg" className="w-full font-bold bg-[#253775] hover:bg-[#1a2754] text-white shadow-md">
              Proceed to Student Sign In
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gvk-text-primary">
                Activation Token / Invitation Code *
              </label>
              <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                Unique per Student
              </span>
            </div>
            <Input
              type="text"
              placeholder="e.g. GVK-ACT-784910-UK"
              value={token}
              onChange={(e) => setToken(e.target.value.toUpperCase())}
              className="font-mono uppercase tracking-wider bg-slate-50/50"
              required
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Enter the unique activation invitation code issued by GVK Overseas Admin.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-gvk-text-primary mb-1.5">
              Create New Password (min 8 chars) *
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gvk-text-primary mb-1.5">
              Confirm Password *
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repeat your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full font-bold shadow-md mt-2 bg-[#253775] hover:bg-[#1a2754] text-white"
            isLoading={isPending}
          >
            Activate Account & Set Password
          </Button>

          <p className="text-[11px] text-center text-slate-500 pt-2">
            Already activated your account?{" "}
            <Link href="/auth/login?role=student" className="font-bold text-[#253775] hover:underline">
              Sign In here
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}

export default function AccountActivationPage() {
  return (
    <div className="min-h-screen bg-gvk-bg flex flex-col justify-between">
      <header className="p-6 md:px-12 flex items-center justify-between border-b border-gvk-border bg-white shadow-2xs">
        <GvkLogo />
        <Link
          href="/auth/login"
          className="text-xs font-semibold text-gvk-text-secondary hover:text-gvk-navy flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <Suspense
          fallback={
            <div className="w-full max-w-md bg-white rounded-2xl border border-gvk-border p-8 text-center text-xs text-gvk-text-secondary animate-pulse">
              Loading GVK Account Activation...
            </div>
          }
        >
          <ActivationForm />
        </Suspense>
      </main>

      <footer className="p-4 text-center text-xs text-gvk-text-secondary border-t border-gvk-border bg-white">
        © {new Date().getFullYear()} GVK Edutech. Overseas Education Management System.
      </footer>
    </div>
  );
}
