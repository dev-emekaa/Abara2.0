import { TimelineView } from "@/features/timeline/timeline-view";
import { FadeUp } from "@/components/motion/reveal";
import { getTimelineData } from "@/server/queries";
import type { TimelineEvent } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const { events, streakCount } = await getTimelineData();
  const mapped: TimelineEvent[] = events.map((e) => ({
    id: e.id,
    userId: e.userId,
    type: e.type,
    title: e.title,
    detail: e.detail,
    occurredAt: e.occurredAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <FadeUp>
        <h1 className="font-display text-3xl text-ink md:text-4xl">
          Health Timeline
        </h1>
        <p className="mt-1 text-pretty text-ink-soft">
          Everything that&apos;s happened to your health, in one place — and a
          streak that grows each time you check in.
        </p>
      </FadeUp>
      <TimelineView initialEvents={mapped} initialStreak={streakCount} />
    </div>
  );
}
