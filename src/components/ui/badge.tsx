import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-gvk-navy-50 text-gvk-navy border border-gvk-navy-200",
        navySolid:
          "bg-gvk-navy text-white",
        red:
          "bg-gvk-red-light text-gvk-red border border-gvk-red-border",
        success:
          "bg-gvk-success-light text-gvk-success border border-gvk-success-border",
        warning:
          "bg-gvk-warning-light text-gvk-warning border border-gvk-warning-border",
        error:
          "bg-gvk-error-light text-gvk-error border border-gvk-error-border",
        info:
          "bg-gvk-info-light text-gvk-info border border-gvk-info-border",
        neutral:
          "bg-gvk-neutral-light text-gvk-text-secondary border border-gvk-border",
        pass:
          "bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold uppercase tracking-wider text-[11px]",
        fail:
          "bg-rose-100 text-rose-800 border border-rose-300 font-bold uppercase tracking-wider text-[11px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

function Badge({ className, variant, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </div>
  );
}

export { Badge, badgeVariants };
