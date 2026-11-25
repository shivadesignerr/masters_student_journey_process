import React from "react";

interface AdminCardProps {
  title?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function AdminCard({
  title,
  subtitle,
  badge,
  headerAction,
  children,
  className = "",
  bodyClassName = "",
}: AdminCardProps) {
  return (
    <div className={`bg-white rounded-2xl border border-gvk-border shadow-card overflow-hidden ${className}`}>
      {(title || subtitle || headerAction || badge) && (
        <div className="p-4 sm:p-5 border-b border-gvk-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              {title && (
                <h2 className="text-sm sm:text-base font-bold text-gvk-navy tracking-tight truncate">
                  {title}
                </h2>
              )}
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs text-gvk-text-secondary leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && (
            <div className="shrink-0 flex items-center gap-2 self-start sm:self-auto">
              {headerAction}
            </div>
          )}
        </div>
      )}
      <div className={`p-4 sm:p-5 ${bodyClassName}`}>{children}</div>
    </div>
  );
}
