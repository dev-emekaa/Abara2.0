import { NudgesInbox } from "@/features/nudges/nudges-inbox";
import { FadeUp } from "@/components/motion/reveal";
import { getNudges } from "@/server/queries";
import type { Nudge } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NudgesPage() {
  const nudges = await getNudges();
  const mapped: Nudge[] = nudges.map((n) => ({
    id: n.id,
    userId: n.userId,
    kind: n.kind,
    title: n.title,
    body: n.body,
    deepLink: n.deepLink,
    status: n.status,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <FadeUp>
        <h1 className="font-display text-3xl text-ink md:text-4xl">
          Your Nudges
        </h1>
        <p className="mt-1 text-pretty text-ink-soft">
          Small, personal reminders — built from your own health history, never
          spam.
        </p>
      </FadeUp>
      <NudgesInbox initialNudges={mapped} />
    </div>
  );
}
