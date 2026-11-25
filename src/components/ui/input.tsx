import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  inputSize?: "sm" | "default" | "lg";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, helperText, icon, inputSize = "default", disabled, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-8 px-2.5 text-xs rounded-sm",
      default: "h-10 min-h-[44px] px-3.5 py-2 text-sm rounded-md",
      lg: "h-12 min-h-[48px] px-4 py-2.5 text-base rounded-lg",
    };

    return (
      <div className="relative w-full space-y-1">
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gvk-text-muted">
              {icon}
            </div>
          )}
          <input
            type={type}
            disabled={disabled}
            className={cn(
              "flex w-full border border-gvk-border-input bg-white text-gvk-text-primary placeholder:text-gvk-text-muted transition-colors duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gvk-navy focus-visible:border-transparent disabled:cursor-not-allowed disabled:bg-gvk-surface-secondary disabled:text-gvk-text-muted",
              sizeClasses[inputSize],
              icon && "pl-10",
              error && "border-gvk-error focus-visible:ring-gvk-error text-gvk-error",
              className
            )}
            ref={ref}
            {...props}
          />
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
Input.displayName = "Input";

export { Input };
