import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  helperText?: string;
  selectSize?: "sm" | "default" | "lg";
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, helperText, selectSize = "default", disabled, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-8 px-2.5 text-xs rounded-sm",
      default: "h-10 min-h-[44px] px-3.5 py-2 text-sm rounded-md",
      lg: "h-12 min-h-[48px] px-4 py-2.5 text-base rounded-lg",
    };

    return (
      <div className="relative w-full space-y-1">
        <div className="relative">
          <select
            disabled={disabled}
            className={cn(
              "flex w-full appearance-none border border-gvk-border-input bg-white pr-9 text-gvk-text-primary transition-colors duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gvk-navy focus-visible:border-transparent disabled:cursor-not-allowed disabled:bg-gvk-surface-secondary disabled:text-gvk-text-muted",
              sizeClasses[selectSize],
              error && "border-gvk-error focus-visible:ring-gvk-error text-gvk-error",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gvk-text-muted" />
        </div>
        {error && (
          <p className="text-xs text-gvk-error font-medium flex items-center gap-1">
            <span>•</span> {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-xs text-gvk-text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
