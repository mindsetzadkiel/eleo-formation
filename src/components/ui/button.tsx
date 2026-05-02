import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const variants = {
      primary: "bg-cyan-600 hover:bg-cyan-700 text-white border-transparent",
      secondary: "bg-slate-700 hover:bg-slate-600 text-white border-transparent",
      danger: "bg-red-600 hover:bg-red-700 text-white border-transparent",
      ghost: "bg-transparent hover:bg-slate-100 text-slate-700 border-transparent dark:hover:bg-slate-800 dark:text-slate-200",
      outline: "bg-transparent hover:bg-slate-50 text-slate-700 border-slate-300 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-800",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps };
