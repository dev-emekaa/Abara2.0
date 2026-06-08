import { Mail, MapPin, CalendarDays, Bell, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeUp } from "@/components/motion/reveal";
import { LogoutButton } from "@/features/auth/logout-button";
import { requireUser } from "@/server/queries";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const PREFS = [
  { icon: Bell, label: "Care nudges", value: "Email · On" },
  { icon: Mail, label: "Follow-up reminders", value: "On" },
  { icon: ShieldCheck, label: "Companion safety alerts", value: "Always on" },
];

export default async function ProfilePage() {
  const user = await requireUser();
  const initials = user.fullName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <FadeUp>
        <h1 className="font-display text-3xl text-ink md:text-4xl">Profile</h1>
        <p className="mt-1 text-pretty text-ink-soft">
          Your account, and how Abara checks in with you.
        </p>
      </FadeUp>

      <FadeUp delay={0.05}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-700 to-teal-500 font-display text-2xl text-primary-foreground shadow-soft">
                {initials}
              </span>
              <div>
                <h2 className="font-display text-2xl text-ink">
                  {user.fullName}
                </h2>
                <Badge tone="teal" className="mt-1">
                  Active care plan
                </Badge>
              </div>
            </div>

            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-center gap-3 break-all text-ink-soft">
                <Mail className="h-4 w-4 shrink-0 text-ink-faint" />
                {user.email}
              </li>
              <li className="flex items-center gap-3 text-ink-soft">
                <MapPin className="h-4 w-4 shrink-0 text-ink-faint" />
                {user.location}
              </li>
              <li className="flex items-center gap-3 text-ink-soft">
                <CalendarDays className="h-4 w-4 shrink-0 text-ink-faint" />
                Member since {formatDate(user.createdAt.toISOString())}
              </li>
            </ul>
          </CardContent>
        </Card>
      </FadeUp>

      <FadeUp delay={0.1}>
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-display text-lg text-ink">Notifications</h3>
            <ul className="mt-3 divide-y divide-border">
              {PREFS.map((p) => {
                const Icon = p.icon;
                return (
                  <li
                    key={p.label}
                    className="flex items-center justify-between py-3"
                  >
                    <span className="flex items-center gap-3 text-ink-soft">
                      <Icon className="h-4 w-4 text-ink-faint" />
                      {p.label}
                    </span>
                    <span className="text-sm font-medium text-ink">
                      {p.value}
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </FadeUp>

      <FadeUp delay={0.15}>
        <div className="flex items-center justify-between rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-soft">
          <div>
            <p className="font-medium text-ink">Sign out of Abara</p>
            <p className="text-sm text-ink-faint">
              You can always pick up where you left off.
            </p>
          </div>
          <LogoutButton />
        </div>
      </FadeUp>
    </div>
  );
}
