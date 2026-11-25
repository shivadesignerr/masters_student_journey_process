import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gvk-navy focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-gvk-navy text-white shadow-level-1 hover:bg-gvk-navy-hover active:bg-gvk-navy-dark",
        primary:
          "bg-gvk-navy text-white shadow-level-1 hover:bg-gvk-navy-hover active:bg-gvk-navy-dark",
        secondary:
          "bg-gvk-surface-secondary text-gvk-text-primary border border-gvk-border hover:bg-slate-200 active:bg-slate-300",
        outline:
          "border border-gvk-border bg-white text-gvk-text-primary hover:bg-gvk-surface-secondary hover:border-slate-300",
        outlineNavy:
          "border border-gvk-navy text-gvk-navy bg-transparent hover:bg-gvk-navy-50",
        ghost:
          "text-gvk-text-primary hover:bg-gvk-surface-secondary hover:text-gvk-navy",
        ghostRed:
          "text-gvk-red hover:bg-gvk-red-light hover:text-gvk-red-hover",
        destructive:
          "bg-gvk-error text-white shadow-level-1 hover:bg-red-700 active:bg-red-800",
        primaryRed:
          "bg-gvk-red text-white shadow-level-1 hover:bg-gvk-red-hover active:bg-[#d90007]",
        link:
          "text-gvk-navy underline-offset-4 hover:underline p-0 h-auto font-semibold",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-sm",
        default: "h-10 min-h-[44px] px-4 py-2 text-sm rounded-md", // 44px touch target
        md: "h-10 min-h-[44px] px-4 py-2 text-sm rounded-md",
        lg: "h-12 min-h-[48px] px-6 text-base rounded-lg font-bold",
        icon: "h-10 w-10 min-h-[44px] min-w-[44px] p-0 rounded-md",
        iconSm: "h-8 w-8 min-h-[32px] min-w-[32px] p-0 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
