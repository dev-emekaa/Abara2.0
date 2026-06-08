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
import {
  demoUser,
  demoThread,
  demoConsultations,
  demoNudges,
} from "@/lib/mock-data";
import { formatDate } from "@/lib/format";

const QUICK_LINKS = [
  {
    href: "/app/timeline",
    label: "Health timeline",
    desc: "Your full story",
    icon: CalendarClock,
  },
  {
    href: "/app/nudges",
    label: "Your nudges",
    desc: "3 waiting",
    icon: BellRing,
  },
  {
    href: "/app/consult",
    label: "Book a consult",
    desc: "Demo",
    icon: Stethoscope,
  },
];

export default function DashboardPage() {
  const firstName = demoUser.fullName.split(" ")[0];
  const opener = demoThread.messages[0];
  const lastConsult = demoConsultations[0];
  const pendingNudges = demoNudges.filter((n) => n.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <FadeUp>
        <p className="text-sm text-ink-faint">{formatDate(new Date().toISOString())}</p>
        <h1 className="mt-1 font-display text-3xl text-ink md:text-4xl">
          Hello, {firstName}.
        </h1>
        <p className="mt-1 text-ink-soft">
          Here&apos;s how your recovery is looking today.
        </p>
      </FadeUp>

      {/* Streak */}
      <FadeUp delay={0.05}>
        <StreakCard />
      </FadeUp>

      {/* Companion check-in prompt */}
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
                {opener.content}
              </p>
            </div>
            <Link
              href="/app/companion"
              className={buttonVariants({ size: "md", className: "shrink-0" })}
            >
              Reply <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>
      </FadeUp>

      {/* Next follow-up */}
      <FadeUp delay={0.15}>
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-cream-deep text-coral">
              <CalendarClock className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                Next follow-up
              </p>
              <p className="mt-1 font-medium text-ink">
                Malaria recovery check — Dr. {lastConsult.doctorName.split(" ").slice(-1)}
              </p>
              <p className="mt-0.5 text-sm text-ink-soft">
                Recommended this week if fatigue lingers. {pendingNudges} nudges
                are waiting for you.
              </p>
            </div>
          </div>
        </Card>
      </FadeUp>

      {/* Quick links */}
      <div>
        <h2 className="mb-3 font-display text-xl text-ink">Quick links</h2>
        <Stagger className="grid gap-3 sm:grid-cols-3">
          {QUICK_LINKS.map((link) => {
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
