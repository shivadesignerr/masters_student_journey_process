import React from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

interface GvkLogoProps {
  href?: string;
  className?: string;
  variant?: "light" | "navy";
}

export function GvkLogo({ href = "/", className = "", variant = "navy" }: GvkLogoProps) {
  const isLight = variant === "light";

  return (
    <Link href={href} className={`flex items-center gap-3 select-none group ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-gvk-navy flex items-center justify-center shadow-md border border-white/10 group-hover:scale-105 transition-transform">
        <GraduationCap className="w-6 h-6 text-white" />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-black text-xl tracking-tight ${isLight ? "text-white" : "text-gvk-navy"}`}>
            GVK
          </span>
          <span className={`font-extrabold text-xs px-1.5 py-0.5 rounded tracking-wider uppercase ${isLight ? "bg-white/20 text-white" : "bg-gvk-navy text-white"}`}>
            Masters
          </span>
        </div>
        <span className={`text-[10px] font-semibold tracking-wider uppercase -mt-0.5 ${isLight ? "text-slate-300" : "text-gvk-text-secondary"}`}>
          Overseas Education
        </span>
      </div>
    </Link>
  );
}
