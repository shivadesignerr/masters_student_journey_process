import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, helperText, disabled, ...props }, ref) => {
    return (
      <div className="relative w-full space-y-1">
        <textarea
          disabled={disabled}
          className={cn(
            "flex min-h-[90px] w-full rounded-md border border-gvk-border-input bg-white px-3.5 py-2.5 text-sm text-gvk-text-primary placeholder:text-gvk-text-muted transition-colors duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gvk-navy focus-visible:border-transparent disabled:cursor-not-allowed disabled:bg-gvk-surface-secondary disabled:text-gvk-text-muted",
            error && "border-gvk-error focus-visible:ring-gvk-error text-gvk-error",
            className
          )}
          ref={ref}
          {...props}
        />
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
Textarea.displayName = "Textarea";

export { Textarea };
