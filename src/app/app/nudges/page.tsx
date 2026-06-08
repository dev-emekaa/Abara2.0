import { NudgesInbox } from "@/features/nudges/nudges-inbox";
import { FadeUp } from "@/components/motion/reveal";

export default function NudgesPage() {
  return (
    <div className="space-y-6">
      <FadeUp>
        <h1 className="font-display text-3xl text-ink md:text-4xl">
          Your Nudges
        </h1>
        <p className="mt-1 text-ink-soft">
          Gentle, personal reminders drawn from your own health history.
        </p>
      </FadeUp>
      <NudgesInbox />
    </div>
  );
}
