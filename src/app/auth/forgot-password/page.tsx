"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GvkLogo } from "@/components/shared/GvkLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  requestPasswordResetOtpAction,
  verifyPasswordResetOtpAction,
  completePasswordResetAndLoginAction,
} from "@/app/actions/auth";
import {
  Mail,
  Key,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Eye,
  EyeOff,
  AlertCircle,
  GraduationCap,
  Briefcase,
  Lock,
  UserCheck,
  Check,
} from "lucide-react";

type RoleType = "student" | "counselor";

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRoleParam = searchParams.get("role");

  const [role, setRole] = useState<RoleType>(
    initialRoleParam === "counselor" ? "counselor" : "student"
  );

  // Wizard state: 1 = Email/ID, 2 = Enter OTP, 3 = Change or Skip
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form states
  const [identifier, setIdentifier] = useState("");
  const [dispatchedEmail, setDispatchedEmail] = useState("");

  // 6-digit OTP input
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password reset states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verified user data
  const [verifiedUser, setVerifiedUser] = useState<{
    userId: string;
    role: string;
    email: string;
    userName: string;
    identifierCode?: string;
  } | null>(null);

  // Status & Feedback
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Update role if param changes
  useEffect(() => {
    if (initialRoleParam === "counselor") {
      setRole("counselor");
    } else if (initialRoleParam === "student") {
      setRole("student");
    }
  }, [initialRoleParam]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Role change on Step 1
  const handleRoleSwitch = (newRole: RoleType) => {
    setRole(newRole);
    setError(null);
    setIdentifier("");
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!identifier.trim()) {
      setError("Please enter your registered email address or ID code.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await requestPasswordResetOtpAction(identifier, role);
      if (!res.success) {
        setError(res.error || "Unable to find an account matching those details.");
        setIsSubmitting(false);
        return;
      }

      setDispatchedEmail(res.email || identifier);
      setResendCooldown(45);
      setStep(2);
      // Reset OTP digits
      setOtpDigits(["", "", "", "", "", ""]);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Handle OTP input changes
  const handleOtpChange = (index: number, val: string) => {
    setError(null);
    const cleaned = val.replace(/\D/g, "");

    // Handling multi-character paste (e.g. user pasted full 6 digits)
    if (cleaned.length > 1) {
      const digits = cleaned.slice(0, 6).split("");
      const newDigits = [...otpDigits];
      digits.forEach((d, i) => {
        if (i < 6) newDigits[i] = d;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(digits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleaned;
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await verifyPasswordResetOtpAction(dispatchedEmail, fullOtp);
      if (!res.success) {
        setError(res.error || "Incorrect verification code. Please check your email and try again.");
        setIsSubmitting(false);
        return;
      }

      setVerifiedUser({
        userId: res.userId!,
        role: res.role!,
        email: res.email!,
        userName: res.userName || res.email!,
        identifierCode: res.identifierCode,
      });
      setStep(3);
    } catch (err: any) {
      setError(err?.message || "Failed to verify security code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Complete Password Reset & Sign In
  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedUser) return;

    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify both fields.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await completePasswordResetAndLoginAction({
        userId: verifiedUser.userId,
        newPassword,
        skipChange: false,
      });

      if (!res.success) {
        setError(res.error || "Failed to update password.");
        setIsSubmitting(false);
        return;
      }

      const targetUrl = res.redirectUrl || (verifiedUser.role === "student" ? "/student/dashboard" : "/counselor/dashboard");
      router.push(targetUrl);
      window.location.href = targetUrl;
    } catch (err: any) {
      setError(err?.message || "Failed to finalize password reset.");
      setIsSubmitting(false);
    }
  };

  // Step 3: Skip Password Change & Direct Login
  const handleSkipPasswordChange = async () => {
    if (!verifiedUser) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await completePasswordResetAndLoginAction({
        userId: verifiedUser.userId,
        skipChange: true,
      });

      if (!res.success) {
        setError(res.error || "Failed to authenticate session.");
        setIsSubmitting(false);
        return;
      }

      const targetUrl = res.redirectUrl || (verifiedUser.role === "student" ? "/student/dashboard" : "/counselor/dashboard");
      router.push(targetUrl);
      window.location.href = targetUrl;
    } catch (err: any) {
      setError(err?.message || "Failed to initialize workspace session.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Header */}
      <header className="p-4 sm:p-6 md:px-12 flex items-center justify-between border-b border-gvk-border bg-white shadow-2xs">
        <GvkLogo />
        <Link
          href={`/auth/login?role=${role}`}
          className="text-xs font-bold text-gvk-text-secondary hover:text-gvk-navy flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-gvk-border shadow-elevated p-6 sm:p-8 animate-fade-in">
          
          {/* Step Progress Pills */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                step === 1
                  ? "bg-[#253775] text-white"
                  : step > 1
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {step > 1 ? <Check className="w-3 h-3 text-emerald-600" /> : <span>1</span>}
              <span>Identification</span>
            </span>

            <span className="w-4 h-0.5 bg-slate-200" />

            <span
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                step === 2
                  ? "bg-[#253775] text-white"
                  : step > 2
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {step > 2 ? <Check className="w-3 h-3 text-emerald-600" /> : <span>2</span>}
              <span>OTP Verify</span>
            </span>

            <span className="w-4 h-0.5 bg-slate-200" />

            <span
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                step === 3
                  ? "bg-[#253775] text-white"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              <span>3</span>
              <span>Decision & Access</span>
            </span>
          </div>

          {/* Role Switcher Tabs (Only on Step 1) */}
          {step === 1 && (
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6 gap-1">
              <button
                type="button"
                onClick={() => handleRoleSwitch("student")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  role === "student"
                    ? "bg-white text-gvk-navy shadow-xs"
                    : "text-slate-500 hover:text-gvk-navy"
                }`}
              >
                <GraduationCap className={`w-4 h-4 ${role === "student" ? "text-gvk-navy" : "text-slate-400"}`} />
                <span>Masters Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSwitch("counselor")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  role === "counselor"
                    ? "bg-white text-emerald-800 shadow-xs"
                    : "text-slate-500 hover:text-gvk-navy"
                }`}
              >
                <Briefcase className={`w-4 h-4 ${role === "counselor" ? "text-emerald-700" : "text-slate-400"}`} />
                <span>Admissions Counselor</span>
              </button>
            </div>
          )}

          {/* Error Message Alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span className="font-semibold leading-relaxed">{error}</span>
            </div>
          )}

          {/* STEP 1: Identification */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#253775] flex items-center justify-center mx-auto mb-3 shadow-2xs">
                  <Lock className="w-6 h-6 text-[#253775]" />
                </div>
                <h1 className="text-2xl font-black text-gvk-navy tracking-tight">
                  {role === "student" ? "Student Password Recovery" : "Counselor Password Recovery"}
                </h1>
                <p className="text-xs text-gvk-text-secondary mt-1">
                  Enter your registered {role === "student" ? "student" : "employee"} email or ID code to receive a 6-digit verification OTP.
                </p>
              </div>

              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gvk-navy mb-1.5">
                    {role === "student" ? "Student Email or ID Code" : "Counselor Email or Employee ID"}
                  </label>
                  <Input
                    type="text"
                    placeholder={
                      role === "student"
                        ? "e.g. rahul.sharma@gmail.com or GVK-STU-2026-0042"
                        : "e.g. counselor.priya@gvkedutech.com or GVK-EMP-014"
                    }
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    icon={<Mail className="w-4 h-4" />}
                    required
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full bg-[#253775] hover:bg-[#1a2754] text-white font-bold text-xs shadow-md py-2.5 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Security OTP Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* STEP 2: Enter OTP */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#253775] flex items-center justify-center mx-auto mb-3 shadow-2xs">
                  <Mail className="w-6 h-6 text-[#253775]" />
                </div>
                <h1 className="text-2xl font-black text-gvk-navy tracking-tight">
                  Enter 6-Digit OTP
                </h1>
                <p className="text-xs text-gvk-text-secondary mt-1.5 max-w-sm mx-auto leading-relaxed">
                  We have dispatched a 6-digit verification code to{" "}
                  <strong className="text-gvk-navy font-semibold">{dispatchedEmail}</strong>.
                  Please check your email inbox and enter the code below to verify your identity.
                </p>
              </div>

              {/* 6 Digit Input Boxes */}
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label className="block text-center text-xs font-bold text-gvk-navy mb-3">
                    Enter Verification Code
                  </label>
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl sm:text-2xl font-black rounded-xl border transition-all outline-hidden ${
                          digit
                            ? "border-[#253775] bg-blue-50/50 text-[#253775] shadow-xs"
                            : "border-slate-300 bg-slate-50 text-gvk-navy focus:border-[#253775] focus:bg-white"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-center text-slate-400 mt-2">
                    Didn't receive the email? Check your spam folder or click resend below.
                  </p>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting || otpDigits.join("").length !== 6}
                  className="w-full bg-[#253775] hover:bg-[#1a2754] disabled:opacity-50 text-white font-bold text-xs shadow-md py-2.5 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Code & Proceed</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                {/* Resend and Return options */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError(null);
                    }}
                    className="hover:text-gvk-navy font-semibold transition-colors"
                  >
                    ← Change Email
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isSubmitting}
                    onClick={() => handleRequestOtp()}
                    className="font-bold text-[#253775] hover:underline disabled:opacity-50 disabled:no-underline"
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend Security OTP"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: Change Password or Skip This Time */}
          {step === 3 && verifiedUser && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2 shadow-2xs">
                  <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                </div>
                <h1 className="text-2xl font-black text-gvk-navy tracking-tight">
                  Verification Succeeded!
                </h1>
                <p className="text-xs text-gvk-text-secondary mt-1">
                  Your identity has been authenticated. You can choose to update your password now or skip and enter your portal immediately.
                </p>
              </div>

              {/* Verified User Account Badge */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#253775] text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                    {verifiedUser.userName.charAt(0)}
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-gvk-navy block">
                      {verifiedUser.userName}
                    </strong>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>{verifiedUser.email}</span>
                      {verifiedUser.identifierCode && (
                        <>
                          <span>•</span>
                          <span className="font-mono font-bold text-slate-600 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                            {verifiedUser.identifierCode}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase shrink-0">
                  {verifiedUser.role} Portal
                </span>
              </div>

              {/* OPTION 1: Change Password Form */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#253775]" />
                  <strong className="text-xs font-bold text-gvk-navy">
                    Option 1: Set New Password
                  </strong>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Create a new password for future sign-ins to your {verifiedUser.role} workspace.
                </p>

                <form onSubmit={handleSaveNewPassword} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gvk-navy mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password (min. 6 characters)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="pr-10 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        title={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gvk-navy mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="pr-10 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        title={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !newPassword || !confirmPassword}
                    className="w-full bg-[#253775] hover:bg-[#1a2754] text-white font-bold text-xs py-2 shadow-xs flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating Password & Signing In...</span>
                      </>
                    ) : (
                      <>
                        <span>Change Password & Sign In</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* OR Divider */}
              <div className="flex items-center gap-3">
                <span className="flex-1 h-px bg-slate-200" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  OR
                </span>
                <span className="flex-1 h-px bg-slate-200" />
              </div>

              {/* OPTION 2: Skip This Time & Login Directly */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-emerald-800">
                  <UserCheck className="w-4 h-4" />
                  <strong className="text-xs font-bold">
                    Option 2: Skip This Time
                  </strong>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Keep your existing password and proceed directly to your {verifiedUser.role} panel.
                </p>

                <Button
                  type="button"
                  onClick={handleSkipPasswordChange}
                  disabled={isSubmitting}
                  variant="outline"
                  className="w-full border-emerald-600 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900 font-bold text-xs py-2 shadow-2xs flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Signing into Workspace...</span>
                    </>
                  ) : (
                    <>
                      <span>Skip this time & sign in to panel →</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-gvk-text-secondary border-t border-gvk-border bg-white">
        © {new Date().getFullYear()} GVK Edutech Central Access Guard. All rights reserved.
      </footer>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="text-xs font-bold text-gvk-navy flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#253775]" />
            <span>Loading recovery portal...</span>
          </div>
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
