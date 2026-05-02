import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "secondary";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
      success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
      warning: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
      danger: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
      info: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
      secondary: "bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
