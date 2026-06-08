import { NudgeDetail } from "@/features/nudges/nudge-detail";

export default async function NudgeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <NudgeDetail id={id} />;
}
