import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface AdminStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  href?: string;
  delta?: {
    label: string;
    trend: "up" | "down" | "neutral";
  };
}

export function AdminStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-[#253775]",
  iconBg = "bg-blue-50",
  href,
  delta,
}: AdminStatCardProps) {
  const content = (
    <div className="bg-white rounded-2xl border border-gvk-border p-4 sm:p-5 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between group h-full">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[11px] uppercase font-bold tracking-wider text-gvk-text-secondary block">
            {title}
          </span>
          <div suppressHydrationWarning className="text-2xl sm:text-3xl font-black text-gvk-navy tracking-tight font-mono">
            {value}
          </div>
        </div>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${iconBg} ${iconColor}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || delta || href) && (
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span suppressHydrationWarning className="text-gvk-text-muted truncate">
            {delta ? (
              <span
                className={`font-semibold ${
                  delta.trend === "up"
                    ? "text-emerald-600"
                    : delta.trend === "down"
                    ? "text-red-600"
                    : "text-slate-500"
                }`}
              >
                {delta.label}
              </span>
            ) : (
              subtitle
            )}
          </span>

          {href && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#253775] group-hover:text-blue-700 transition-colors shrink-0">
              <span>View</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="block h-full">{content}</Link>;
  }

  return content;
}
