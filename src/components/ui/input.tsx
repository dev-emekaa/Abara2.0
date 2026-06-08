import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-12 w-full rounded-[var(--radius-sm)] border border-border-strong bg-paper px-4 text-[0.95rem] text-ink shadow-sm transition-colors",
          "placeholder:text-ink-faint/70",
          "focus-visible:outline-none focus-visible:border-teal-600 focus-visible:ring-2 focus-visible:ring-teal-600/25",
          "aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
