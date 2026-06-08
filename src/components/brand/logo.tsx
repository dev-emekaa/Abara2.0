import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Render only the mark (no wordmark). */
  markOnly?: boolean;
}

/**
 * Abara mark — a sprouting leaf inside a soft shield, evoking health, trust and
 * growth. Hand-drawn SVG so it stays crisp and on-brand at any size.
 */
export function Logo({ className, markOnly = false }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width="34"
        height="34"
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M20 3.5 6 8.2v11.4C6 28.6 12.2 34.9 20 37c7.8-2.1 14-8.4 14-17.4V8.2L20 3.5Z"
          fill="var(--teal-700)"
        />
        <path
          d="M20 27.5c0-5 2-9.2 6.5-11.2-1 4.8-3.4 8.6-6.5 11.2Z"
          fill="var(--teal-300)"
        />
        <path
          d="M20 27.5c0-4.2-1.8-8-5.6-9.8.9 4.1 2.9 7.4 5.6 9.8Z"
          fill="var(--coral-soft)"
        />
        <path
          d="M20 28.5V15.5"
          stroke="var(--primary-foreground)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      {!markOnly && (
        <span className="font-display text-2xl tracking-tight text-ink">
          abara
        </span>
      )}
    </span>
  );
}
