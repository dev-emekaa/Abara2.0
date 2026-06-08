import Link from "next/link";
import {
  CalendarClock,
  BellRing,
  Stethoscope,
  ArrowRight,
  Sprout,
} from "lucide-react";
import { StreakCard } from "@/features/timeline/streak-card";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { FadeUp, Stagger, Rise } from "@/components/motion/reveal";
import { getDashboardData } from "@/server/queries";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

function quickLinks(pendingNudges: number) {
  return [
    {
      href: "/app/timeline",
      label: "Health timeline",
      desc: "Your full story",
      icon: CalendarClock,
    },
    {
      href: "/app/nudges",
      label: "Your nudges",
      desc: pendingNudges > 0 ? `${pendingNudges} waiting` : "All caught up",
      icon: BellRing,
    },
    {
      href: "/app/consult",
      label: "Book a consult",
      desc: "Demo flow",
      icon: Stethoscope,
    },
  ];
}

export default async function DashboardPage() {
  const {
    user,
    streakCount,
    latestConsult,
    companionMessage,
    pendingNudges,
    nextNudge,
  } = await getDashboardData();

  const firstName = user.fullName.split(" ")[0];
  const links = quickLinks(pendingNudges);
  const opener =
    companionMessage ??
    "Your companion is ready whenever you are — say hello and tell it how you're feeling.";

  return (
    <div className="space-y-6">
      <FadeUp>
        <p className="text-sm text-ink-faint">
          {formatDate(new Date().toISOString())}
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink md:text-4xl">
          Hello, {firstName}.
        </h1>
        <p className="mt-1 text-pretty text-ink-soft">
          Here&apos;s where your recovery stands today — and the small next step
          that keeps it on track.
        </p>
      </FadeUp>

      <FadeUp delay={0.05}>
        <StreakCard count={streakCount} />
      </FadeUp>

      <FadeUp delay={0.1}>
        <Card className="overflow-hidden border-teal-300/50">
          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-700 text-primary-foreground shadow-soft">
              <Sprout className="h-6 w-6" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                Your companion checked in
              </p>
              <p className="mt-1 line-clamp-2 text-[0.98rem] leading-relaxed text-ink">
                {opener}
              </p>
            </div>
            <Link
              href="/app/companion"
              className={buttonVariants({
                size: "md",
                className: "w-full shrink-0 sm:w-auto",
              })}
            >
              Reply <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>
      </FadeUp>

      <FadeUp delay={0.15}>
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-cream-deep text-coral">
              <CalendarClock className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                {nextNudge ? "Next for you" : "Next follow-up"}
              </p>
              <p className="mt-1 font-medium text-ink">
                {nextNudge
                  ? nextNudge.title
                  : latestConsult
                    ? `Recovery check with ${latestConsult.doctorName}`
                    : "Nothing scheduled — you're all caught up"}
              </p>
              <p className="mt-0.5 text-pretty text-sm text-ink-soft">
                {nextNudge
                  ? nextNudge.body
                  : "A quick check-in keeps your recovery on track."}
              </p>
            </div>
          </div>
        </Card>
      </FadeUp>

      <div>
        <h2 className="mb-3 font-display text-xl text-ink">Quick links</h2>
        <Stagger className="grid gap-3 sm:grid-cols-3">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Rise key={link.href}>
                <Link
                  href={link.href}
                  className="group flex h-full items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-teal-100 text-teal-700">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{link.label}</p>
                    <p className="text-xs text-ink-faint">{link.desc}</p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 text-ink-faint transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Rise>
            );
          })}
        </Stagger>
      </div>
    </div>
  );
}
