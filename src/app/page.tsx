import Link from "next/link";
import {
  MessageCircleHeart,
  CalendarHeart,
  BellRing,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeUp, Stagger, Rise } from "@/components/motion/reveal";
import { EnterDemoButton } from "@/features/auth/enter-demo-button";
import { DEMO_CREDENTIALS } from "@/lib/mock-data";

const FEATURES = [
  {
    icon: MessageCircleHeart,
    title: "Care Companion",
    body: "A gentle AI that checks in after your visit, asks how recovery is going — and hands you to a real doctor the moment anything looks off.",
    tone: "text-teal-700",
  },
  {
    icon: CalendarHeart,
    title: "Health Timeline & Streaks",
    body: "Your whole health story as a living timeline, with a care streak that quietly rewards you for showing up for yourself.",
    tone: "text-coral",
  },
  {
    icon: BellRing,
    title: "Smart Health Nudges",
    body: "Timely, personal reminders drawn from your own history — a follow-up due, a dose to finish, malaria season in your area.",
    tone: "text-[#9a6510]",
  },
];

export default function LandingPage() {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-5 md:px-10">
      {/* Top bar */}
      <header className="flex items-center justify-between py-6">
        <Logo />
        <div className="flex items-center gap-2">
          <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Log in
          </Link>
          <Link href="/signup" className={buttonVariants({ size: "sm" })}>
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="grid flex-1 items-center gap-10 py-10 md:grid-cols-[1.05fr_0.95fr] md:py-16">
        <div>
          <FadeUp>
            <Badge tone="teal" className="mb-5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Built for life between visits
            </Badge>
          </FadeUp>
          <FadeUp delay={0.05}>
            <h1 className="text-balance font-display text-[2.6rem] leading-[1.05] text-ink md:text-6xl">
              Your health doesn&apos;t end when the{" "}
              <span className="text-teal-700">consultation</span> does.
            </h1>
          </FadeUp>
          <FadeUp delay={0.12}>
            <p className="mt-5 max-w-xl text-balance text-lg leading-relaxed text-ink-soft">
              Abara turns a one-time visit into an ongoing relationship — a
              caring companion that follows up, a timeline that remembers, and
              nudges that bring you back before a small thing becomes a big one.
            </p>
          </FadeUp>
          <FadeUp delay={0.2}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <EnterDemoButton size="lg" />
              <Link
                href="/signup"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Create your account
              </Link>
            </div>
          </FadeUp>
          <FadeUp delay={0.28}>
            <p className="mt-4 text-sm text-ink-faint">
              Demo login —{" "}
              <span className="font-medium text-ink-soft">
                {DEMO_CREDENTIALS.email}
              </span>{" "}
              / {DEMO_CREDENTIALS.password}
            </p>
          </FadeUp>
        </div>

        {/* Hero visual: an offset, layered preview card */}
        <FadeUp delay={0.18} className="relative hidden md:block">
          <div className="absolute -right-4 -top-6 h-64 w-64 rounded-full bg-coral/15 blur-3xl" />
          <div className="relative rotate-[1.5deg] rounded-[var(--radius-xl)] border border-border bg-gradient-to-br from-teal-900 to-teal-700 p-7 text-primary-foreground shadow-lift">
            <p className="text-sm text-teal-100">It&apos;s been 4 days since</p>
            <p className="font-display text-2xl">your malaria consult.</p>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-teal-50">
              How are you feeling today, Chidinma? No rush — just whatever&apos;s
              true. 🌱
            </p>
            <div className="mt-6 -rotate-[3deg] rounded-[var(--radius-lg)] bg-coral p-4 shadow-glow-coral">
              <p className="text-xs uppercase tracking-wide text-white/80">
                Care streak
              </p>
              <p className="font-display text-3xl text-white">4 days 🔥</p>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* Features */}
      <section className="pb-16 md:pb-24">
        <Stagger className="grid gap-5 md:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Rise key={f.title}>
                <div className="h-full rounded-[var(--radius-lg)] border border-border bg-card p-6 shadow-soft transition-transform hover:-translate-y-1">
                  <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-sm)] bg-cream-deep">
                    <Icon className={`h-6 w-6 ${f.tone}`} strokeWidth={1.9} />
                  </span>
                  <h3 className="mt-4 font-display text-xl text-ink">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">
                    {f.body}
                  </p>
                </div>
              </Rise>
            );
          })}
        </Stagger>
      </section>

      <footer className="flex flex-col items-center gap-2 border-t border-border py-8 text-center text-sm text-ink-faint">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Already with us? Log in <ArrowRight className="inline h-3.5 w-3.5" />
        </Link>
        <p>
          Abara is a retention-layer prototype. It never replaces a doctor; in an
          emergency, seek care immediately.
        </p>
      </footer>
    </div>
  );
}
