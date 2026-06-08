"use client";

import { motion } from "framer-motion";
import { Sprout } from "lucide-react";
import type { CompanionMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Pick<CompanionMessage, "role" | "content">;
}

/**
 * A single companion message. AI/user bubbles enter gently (the third
 * high-impact motion moment). System messages render as quiet centered notes.
 */
export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "USER";
  const isSystem = message.role === "SYSTEM";

  if (isSystem) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto max-w-sm text-center text-xs italic text-ink-faint"
      >
        {message.content}
      </motion.p>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className={cn(
        "flex items-end gap-2.5",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      {!isUser && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-700 text-primary-foreground shadow-soft">
          <Sprout className="h-4 w-4" strokeWidth={2.2} />
        </span>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-[var(--radius-md)] px-4 py-2.5 text-[0.95rem] leading-relaxed shadow-soft",
          isUser
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md border border-border bg-paper text-ink",
        )}
      >
        {message.content}
      </div>
    </motion.div>
  );
}

/** Animated "typing" dots while the companion is composing a reply. */
export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-700 text-primary-foreground shadow-soft">
        <Sprout className="h-4 w-4" strokeWidth={2.2} />
      </span>
      <div className="flex items-center gap-1 rounded-[var(--radius-md)] rounded-bl-md border border-border bg-paper px-4 py-3.5 shadow-soft">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-ink-faint"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    </div>
  );
}
