import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium tracking-tight",
  {
    variants: {
      tone: {
        teal: "bg-teal-100 text-teal-800",
        coral: "bg-coral/15 text-coral",
        amber: "bg-amber/15 text-[#9a6510]",
        neutral: "bg-cream-deep text-ink-soft",
        danger: "bg-danger/12 text-danger",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export { Badge, badgeVariants };
