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

const FEATURES = [
  {
    icon: MessageCircleHeart,
    title: "A check-in that actually cares",
    body: "Like a nurse who remembers you. A few days after your visit, Abara asks how you're feeling. Healing well? Lovely. Something not right? It doesn't guess — it connects you to a real doctor, fast.",
    tone: "text-teal-700",
  },
  {
    icon: CalendarHeart,
    title: "Everything in one place, finally",
    body: "No more \"which drug did they give me last time?\" Your consultations, medications and recoveries sit in one simple timeline. Log how you feel, and watch your care streak grow.",
    tone: "text-coral",
  },
  {
    icon: BellRing,
    title: "A nudge at the right moment",
    body: "Abara remembers what's easy to forget — the follow-up that's due, the last dose to finish, malaria season creeping into your area. One tap and you know exactly what to do.",
    tone: "text-[#9a6510]",
  },
];

export default function LandingPage() {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-5 md:px-10">
      {/* Top bar */}
      <header className="flex items-center justify-between py-6">
        <Logo />
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/login"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Log in
          </Link>
          <Link href="/signup" className={buttonVariants({ size: "sm" })}>
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="grid flex-1 items-center gap-10 py-8 md:grid-cols-[1.05fr_0.95fr] md:py-16">
        <div className="min-w-0">
          <FadeUp>
            <Badge tone="teal" className="mb-5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Care that keeps going after your visit
            </Badge>
          </FadeUp>
          <FadeUp delay={0.05}>
            <h1 className="text-balance font-display text-[2.05rem] leading-[1.08] text-ink sm:text-5xl md:text-6xl">
              Your health doesn&apos;t end when the{" "}
              <span className="text-teal-700">consultation</span> does.
            </h1>
          </FadeUp>
          <FadeUp delay={0.12}>
            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-ink-soft sm:text-lg">
              You see a doctor, feel a little better, and life moves on. But did
              the malaria really clear? Did you finish the meds? Abara stays with
              you afterwards: a friendly check-in after your visit, your whole
              health story in one place, and a reminder at exactly the right
              moment.
            </p>
          </FadeUp>
          <FadeUp delay={0.2}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <EnterDemoButton size="lg" className="w-full sm:w-auto" />
              <Link
                href="/signup"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "w-full sm:w-auto",
                })}
              >
                Create your account
              </Link>
            </div>
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
        <FadeUp>
          <h2 className="text-balance font-display text-2xl text-ink sm:text-3xl">
            Three simple things that keep you well
          </h2>
          <p className="mt-2 max-w-2xl text-pretty text-ink-soft">
            Not another app to babysit. Just the few things that turn one visit
            into care that actually sticks.
          </p>
        </FadeUp>
        <Stagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
        <p className="max-w-md text-pretty">
          Abara supports your care between visits — it never replaces a doctor.
          In an emergency, seek medical help immediately.
        </p>
      </footer>
    </div>
  );
}
