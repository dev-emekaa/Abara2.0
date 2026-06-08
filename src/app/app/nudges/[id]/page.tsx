import Link from "next/link";
import { NudgeDetail } from "@/features/nudges/nudge-detail";
import { buttonVariants } from "@/components/ui/button";
import { getNudge, requireUser } from "@/server/queries";
import type { Nudge } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NudgeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, record] = await Promise.all([requireUser(), getNudge(id)]);

  if (!record) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-border-strong bg-card/50 p-10 text-center">
        <p className="font-medium text-ink">Nudge not found</p>
        <p className="mt-1 text-sm text-ink-faint">
          It may have been cleared already.
        </p>
        <Link
          href="/app/nudges"
          className={buttonVariants({ variant: "outline", size: "sm", className: "mt-4" })}
        >
          Back to nudges
        </Link>
      </div>
    );
  }

  const nudge: Nudge = {
    id: record.id,
    userId: record.userId,
    kind: record.kind,
    title: record.title,
    body: record.body,
    deepLink: record.deepLink,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
  };

  return (
    <NudgeDetail nudge={nudge} userName={user.fullName} userEmail={user.email} />
  );
}
