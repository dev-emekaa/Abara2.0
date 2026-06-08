"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { MessageBubble, TypingIndicator } from "./message-bubble";
import { EscalationBanner } from "./escalation-banner";
import { Button } from "@/components/ui/button";
import { detectEscalation, ESCALATION_MESSAGE } from "@/lib/escalation";
import { pickFallbackReply } from "@/services/companion";
import type { CompanionRole } from "@/lib/types";

interface ChatMsg {
  id: string;
  role: CompanionRole;
  content: string;
  escalated: boolean;
}

export interface InitialMessage {
  id: string;
  role: CompanionRole;
  content: string;
  escalated: boolean;
}

const QUICK_REPLIES = [
  "I'm feeling a bit better",
  "About the same, still tired",
  "My chest hurts and it's getting worse",
];

let clientId = 0;
const nextId = () => `c_${(clientId += 1)}`;

interface CompanionChatProps {
  threadId: string;
  initialMessages: InitialMessage[];
}

export function CompanionChat({ threadId, initialMessages }: CompanionChatProps) {
  const [messages, setMessages] = useState<ChatMsg[]>(() =>
    initialMessages.map((m) => ({ ...m })),
  );
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [escalated, setEscalated] = useState(() =>
    initialMessages.some((m) => m.escalated),
  );
  const [reasons, setReasons] = useState<string[]>([]);
  const [aiTurns, setAiTurns] = useState(
    () => initialMessages.filter((m) => m.role === "AI").length,
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing, escalated]);

  /** Best-effort persistence; never blocks or crashes the UI. */
  function persist(content: string) {
    try {
      void fetch("/api/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, content }),
      }).catch(() => {});
    } catch {
      /* fetch unavailable (e.g. tests) — ignore */
    }
  }

  /** Stream a normal reply from the SSE endpoint; fall back gracefully. */
  async function streamReply(content: string) {
    const aiId = nextId();
    setMessages((m) => [...m, { id: aiId, role: "AI", content: "", escalated: false }]);

    const fallback = () => {
      const text = pickFallbackReply(aiTurns);
      setMessages((m) =>
        m.map((msg) => (msg.id === aiId ? { ...msg, content: text } : msg)),
      );
    };

    try {
      const resp = await fetch("/api/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, content }),
      });
      if (!resp.ok || !resp.body) throw new Error("stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          const evt = JSON.parse(line.slice(5).trim());
          if (evt.type === "token") {
            setMessages((m) =>
              m.map((msg) =>
                msg.id === aiId
                  ? { ...msg, content: msg.content + evt.value }
                  : msg,
              ),
            );
          } else if (evt.type === "escalate") {
            setReasons(evt.reasons ?? []);
            setEscalated(true);
            setMessages((m) =>
              m.map((msg) =>
                msg.id === aiId ? { ...msg, escalated: true } : msg,
              ),
            );
          }
        }
      }
    } catch {
      fallback();
    } finally {
      setAiTurns((n) => n + 1);
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

    // Client mirror of the server guardrail — instant, deterministic UX.
    // The server enforces and persists the same boundary.
    const verdict = detectEscalation(trimmed);
    if (verdict.escalated) {
      setReasons(verdict.matchedLabels);
      setMessages((m) => [
        ...m,
        { id: nextId(), role: "AI", content: ESCALATION_MESSAGE, escalated: true },
      ]);
      setEscalated(true);
      persist(trimmed); // server records the escalation too
      return;
    }

    setTyping(true);
    await streamReply(trimmed);
    setTyping(false);
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-4 pr-1"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
        </AnimatePresence>
        {typing && <TypingIndicator />}
        {escalated && <EscalationBanner reasons={reasons} />}
      </div>

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
