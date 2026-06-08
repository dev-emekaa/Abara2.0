"use client";

import { motion, type Variants } from "framer-motion";
import * as React from "react";

/**
 * Shared motion primitives for the few high-impact moments in Abara:
 * staggered list/timeline reveals on load and gentle entrances. Restrained on
 * purpose — `prefers-reduced-motion` is honored globally in CSS.
 */

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};

export const riseItem: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 260, damping: 26 },
  },
};

interface StaggerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/** Container that staggers its `<Rise>` children in on mount. */
export function Stagger({ children, className, ...props }: StaggerProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className={className}
      {...(props as React.ComponentProps<typeof motion.div>)}
    >
      {children}
    </motion.div>
  );
}

/** A single staggered child. Use inside <Stagger>. */
export function Rise({ children, className, ...props }: StaggerProps) {
  return (
    <motion.div
      variants={riseItem}
      className={className}
      {...(props as React.ComponentProps<typeof motion.div>)}
    >
      {children}
    </motion.div>
  );
}

/** Standalone gentle fade-up for one-off elements (no parent container). */
export function FadeUp({
  children,
  className,
  delay = 0,
  ...props
}: StaggerProps & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...(props as React.ComponentProps<typeof motion.div>)}
    >
      {children}
    </motion.div>
  );
}
