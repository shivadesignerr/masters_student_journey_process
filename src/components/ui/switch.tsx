import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, id, disabled, checked, ...props }, ref) => {
    const generatedId = React.useId();
    const switchId = id || generatedId;

    return (
      <label
        htmlFor={switchId}
        className={cn(
          "inline-flex items-center justify-between gap-3 cursor-pointer select-none",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        {(label || description) && (
          <div className="text-xs">
            {label && <span className="font-semibold text-gvk-text-primary block">{label}</span>}
            {description && <span className="text-gvk-text-muted block mt-0.5">{description}</span>}
          </div>
        )}
        <div className="relative inline-flex items-center">
          <input
            id={switchId}
            type="checkbox"
            ref={ref}
            disabled={disabled}
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div className="w-10 h-6 bg-slate-200 peer-checked:bg-gvk-navy rounded-full transition-colors duration-standard peer-focus-visible:ring-2 peer-focus-visible:ring-gvk-navy peer-focus-visible:ring-offset-1"></div>
          <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-standard peer-checked:translate-x-4 shadow-sm"></div>
        </div>
      </label>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };
