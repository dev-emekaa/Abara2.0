import { TimelineView } from "@/features/timeline/timeline-view";
import { FadeUp } from "@/components/motion/reveal";

export default function TimelinePage() {
  return (
    <div className="space-y-6">
      <FadeUp>
        <h1 className="font-display text-3xl text-ink md:text-4xl">
          Health Timeline
        </h1>
        <p className="mt-1 text-ink-soft">
          Every consult, recovery and check-in — and the streak that grows with
          you.
        </p>
      </FadeUp>
      <TimelineView />
    </div>
  );
}
