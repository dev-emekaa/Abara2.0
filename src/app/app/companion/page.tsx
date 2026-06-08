import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";
import { CompanionChat } from "@/features/care-companion/companion-chat";
import { getCompanionData } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function CompanionPage() {
  const { threadId, messages, doctorName } = await getCompanionData();
  const initial = messages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    escalated: m.escalated,
  }));

  return (
    <div className="flex h-[calc(100dvh-9.5rem)] flex-col md:h-[calc(100dvh-6rem)]">
      <header className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl text-ink md:text-3xl">
              Care Companion
            </h1>
            <p className="text-pretty text-sm text-ink-soft">
              Checking in on your recovery with {doctorName}.
            </p>
          </div>
          <Badge tone="teal" className="mt-1 shrink-0">
            <ShieldCheck className="h-3.5 w-3.5" />
            Safe by design
          </Badge>
        </div>
        <p className="mt-2 text-pretty rounded-[var(--radius-sm)] bg-cream-deep/70 px-3 py-2 text-xs leading-relaxed text-ink-faint">
          Your companion listens and keeps watch — it never diagnoses or
          prescribes. If anything sounds serious, it brings in a real doctor
          straight away. (Tap the last quick reply to see that happen.)
        </p>
      </header>
      <div className="min-h-0 flex-1">
        <CompanionChat threadId={threadId} initialMessages={initial} />
      </div>
    </div>
  );
}
