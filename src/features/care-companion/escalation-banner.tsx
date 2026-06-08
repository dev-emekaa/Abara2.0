"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldAlert, Phone } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface EscalationBannerProps {
  reasons?: string[];
}

/**
 * The non-negotiable safety surface. When the guardrail flags a red-flag
 * signal, normal triage stops and this clear "Connect with a doctor" CTA
 * appears, routing to the consultation flow with context.
 */
export function EscalationBanner({ reasons }: EscalationBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      role="alert"
      className="rounded-[var(--radius-lg)] border border-danger/40 bg-danger/8 p-5 shadow-soft"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger text-white">
          <ShieldAlert className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-lg text-danger">
            Let&apos;s get a doctor involved
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-ink">
            What you&apos;ve described needs a real doctor&apos;s eyes, not mine.
            I&apos;m not able to assess this safely on my own — please connect
            with a clinician now.
          </p>
          {reasons && reasons.length > 0 && (
            <p className="mt-2 text-xs text-ink-faint">
              Flagged: {reasons.join(", ")}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/app/consult?ref=companion"
              className={buttonVariants({ variant: "danger", size: "sm" })}
            >
              <Phone className="h-4 w-4" />
              Connect with a doctor
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
