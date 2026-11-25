import React from "react";
import Link from "next/link";
import { GvkLogo } from "@/components/shared/GvkLogo";
import { Compass, ShieldCheck, ArrowRight, Home, LogIn } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gvk-bg flex flex-col justify-between">
      {/* Header */}
      <header className="p-6 md:px-12 flex items-center justify-between border-b border-gvk-border bg-white shadow-2xs">
        <GvkLogo />
        <div className="flex items-center gap-2 text-xs font-semibold text-gvk-text-secondary">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>GVK Enterprise Platform</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-gvk-border shadow-elevated p-8 text-center space-y-5 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-[#253775] shadow-xs">
            <Compass className="w-8 h-8 animate-spin-slow" />
          </div>

          <div className="space-y-1.5">
            <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider">
              404 • Destination Not Found
            </span>
            <h1 className="text-2xl font-black text-gvk-navy tracking-tight pt-1">
              Page Doesn&apos;t Exist
            </h1>
            <p className="text-xs text-gvk-text-secondary leading-relaxed max-w-md mx-auto">
              The requested address could not be located in the GVK Edutech Masters Management Portal. Please use the authorized portals below to continue.
            </p>
          </div>

          {/* Direct Navigation Links */}
          <div className="grid grid-cols-1 gap-2 pt-2 text-left">
            <Link
              href="/auth/login"
              className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#253775] text-white flex items-center justify-center shrink-0">
                  <LogIn className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gvk-navy group-hover:text-[#253775]">
                    Unified Sign In Gateway
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Sign in as Student, Counselor, or Central Admin
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/admin/dashboard"
              className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gvk-navy group-hover:text-emerald-700">
                    Admissions Administration Portal
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Central governance & candidate directories
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="pt-2">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-xl font-bold text-xs bg-[#253775] hover:bg-[#1a2754] text-white transition-colors shadow-sm"
            >
              <Home className="w-4 h-4" />
              <span>Return to Login Screen</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-gvk-text-secondary border-t border-gvk-border bg-white">
        GVK Edutech Masters Student & Counselor Management Platform • Protected by RBAC.
      </footer>
    </div>
  );
}
