import { Stethoscope, Video, CreditCard, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeUp, Stagger, Rise } from "@/components/motion/reveal";
import { demoConsultations } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";

const DOCTORS = [
  { name: "Dr. Ngozi Eze", specialty: "General Practice", next: "Today, 4:30pm" },
  { name: "Dr. Tunde Bakare", specialty: "General Practice", next: "Tomorrow, 9:00am" },
  { name: "Dr. Amara Nwosu", specialty: "Paediatrics", next: "Wed, 11:15am" },
];

export default function ConsultPage() {
  return (
    <div className="space-y-6">
      <FadeUp>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl text-ink md:text-4xl">
            Book a consultation
          </h1>
          <Badge tone="amber">Demo</Badge>
        </div>
        <p className="mt-1 text-ink-soft">
          This is where Abara&apos;s existing consultation flow lives.
        </p>
      </FadeUp>

      {/* Out-of-scope notice */}
      <FadeUp delay={0.05}>
        <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-amber/40 bg-amber/8 p-5">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#9a6510]" />
          <div className="text-sm leading-relaxed text-ink">
            <p className="font-medium">Visual stub only.</p>
            <p className="mt-1 text-ink-soft">
              Real booking, payments and live video are intentionally out of
              scope for this retention-layer prototype. The buttons below are
              non-functional placeholders showing where the existing flow plugs
              in.
            </p>
          </div>
        </div>
      </FadeUp>

      {/* Doctor cards */}
      <div>
        <h2 className="mb-3 font-display text-xl text-ink">Available doctors</h2>
        <Stagger className="grid gap-4 md:grid-cols-3">
          {DOCTORS.map((d) => (
            <Rise key={d.name}>
              <Card className="flex h-full flex-col p-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                  <Stethoscope className="h-6 w-6" strokeWidth={1.9} />
                </span>
                <h3 className="mt-4 font-medium text-ink">{d.name}</h3>
                <p className="text-sm text-ink-faint">{d.specialty}</p>
                <p className="mt-2 text-sm text-ink-soft">Next: {d.next}</p>
                <div className="mt-4 flex items-center gap-3 text-xs text-ink-faint">
                  <span className="inline-flex items-center gap-1">
                    <Video className="h-3.5 w-3.5" /> Video
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CreditCard className="h-3.5 w-3.5" /> Paystack
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  disabled
                  title="Out of scope in this prototype"
                >
                  Book (demo)
                </Button>
              </Card>
            </Rise>
          ))}
        </Stagger>
      </div>

      {/* Past consults */}
      <div>
        <h2 className="mb-3 font-display text-xl text-ink">
          Your past consultations
        </h2>
        <div className="space-y-3">
          {demoConsultations.map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-ink">{c.doctorName}</p>
                  <p className="text-xs text-ink-faint">
                    {c.specialty} · {formatDate(c.createdAt)}
                  </p>
                </div>
                <Badge tone="teal">{c.status}</Badge>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {c.summary}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
