"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { MessageBubble, TypingIndicator } from "./message-bubble";
import { EscalationBanner } from "./escalation-banner";
import { Button } from "@/components/ui/button";
import { detectEscalation, ESCALATION_MESSAGE } from "@/lib/escalation";
import { demoThread } from "@/lib/mock-data";
import type { CompanionRole } from "@/lib/types";

interface ChatMsg {
  id: string;
  role: CompanionRole;
  content: string;
  escalated: boolean;
}

/** Safe, non-diagnostic canned replies for the Phase 1 demo. */
const SAFE_REPLIES = [
  "Thank you for telling me — that really helps. A bit of lingering tiredness after malaria is common as your body rebuilds. Are you managing to eat and drink normally?",
  "Good to hear. Keep finishing your full course even as you feel better — that's what stops it coming back. Want me to log this as a check-in on your timeline?",
  "I'm glad you're resting. I'll check in again in a couple of days. If anything changes — especially if you feel worse — tell me straight away and I'll get a doctor involved.",
];

const QUICK_REPLIES = [
  "I'm feeling a bit better",
  "About the same, still tired",
  "My chest hurts and it's getting worse",
];

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `m_${idCounter}`;
}

export function CompanionChat() {
  const [messages, setMessages] = useState<ChatMsg[]>(() =>
    demoThread.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      escalated: m.escalated,
    })),
  );
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [reasons, setReasons] = useState<string[]>([]);
  const [replyIndex, setReplyIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing, escalated]);

  /** Reveal a canned reply word-by-word to mimic the Phase 3 SSE stream. */
  async function streamReply(text: string) {
    const id = nextId();
    setMessages((m) => [...m, { id, role: "AI", content: "", escalated: false }]);
    const words = text.split(" ");
    let acc = "";
    for (const word of words) {
      acc = acc ? `${acc} ${word}` : word;
      const snapshot = acc;
      await new Promise((r) => setTimeout(r, 38));
      setMessages((m) =>
        m.map((msg) => (msg.id === id ? { ...msg, content: snapshot } : msg)),
      );
    }
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || typing || escalated) return;

    setInput("");
    setMessages((m) => [
      ...m,
      { id: nextId(), role: "USER", content: trimmed, escalated: false },
    ]);

    // GUARDRAIL: deterministic check runs before any AI reply (same module the
    // Phase 3 server-side guardrail uses).
    const verdict = detectEscalation(trimmed);
    if (verdict.escalated) {
      setReasons(verdict.matchedLabels);
      setMessages((m) => [
        ...m,
        { id: nextId(), role: "AI", content: ESCALATION_MESSAGE, escalated: true },
      ]);
      setEscalated(true);
      return;
    }

    setTyping(true);
    await new Promise((r) => setTimeout(r, 600));
    setTyping(false);
    await streamReply(SAFE_REPLIES[Math.min(replyIndex, SAFE_REPLIES.length - 1)]);
    setReplyIndex((i) => i + 1);
  }

  return (
    <div className="flex h-[calc(100dvh-9rem)] flex-col md:h-[calc(100dvh-7rem)]">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto pb-4 pr-1">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
        </AnimatePresence>
        {typing && <TypingIndicator />}
        {escalated && (
          <EscalationBanner
            reasons={reasons}
            onConnect={() => {
              /* Phase 3: open a real escalation to a clinician. */
            }}
          />
        )}
      </div>

      {/* Quick replies */}
      {!escalated && (
        <div className="flex flex-wrap gap-2 py-3">
          {QUICK_REPLIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              disabled={typing}
              className="rounded-full border border-border-strong bg-paper px-3.5 py-1.5 text-sm text-ink-soft transition-colors hover:border-teal-600 hover:text-ink disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-border pt-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={escalated}
          placeholder={
            escalated ? "Please connect with a doctor" : "Type how you're feeling…"
          }
          className="h-12 flex-1 rounded-full border border-border-strong bg-paper px-5 text-[0.95rem] text-ink placeholder:text-ink-faint/70 focus-visible:border-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/25 disabled:opacity-60"
        />
        <Button type="submit" size="icon" disabled={escalated || typing}>
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
