import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { getOrCreateThread } from "@/server/services/companion-service";

/**
 * RSC data-access helpers. Middleware already gates /app, but each loader also
 * resolves the user defensively and redirects to /login if the session is gone.
 */

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function getDashboardData() {
  const user = await requireUser();
  const [streak, latestConsult, latestThread, pendingNudges, nextNudge] =
    await Promise.all([
      prisma.streak.findUnique({ where: { userId: user.id } }),
      prisma.consultation.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.companionThread.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      }),
      prisma.nudge.count({ where: { userId: user.id, status: "PENDING" } }),
      prisma.nudge.findFirst({
        where: { userId: user.id, status: "PENDING" },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  return {
    user,
    streakCount: streak?.count ?? 0,
    latestConsult,
    companionMessage: latestThread?.messages[0]?.content ?? null,
    pendingNudges,
    nextNudge,
  };
}

export async function getTimelineData() {
  const user = await requireUser();
  const [events, streak] = await Promise.all([
    prisma.timelineEvent.findMany({
      where: { userId: user.id },
      orderBy: { occurredAt: "desc" },
    }),
    prisma.streak.findUnique({ where: { userId: user.id } }),
  ]);
  return { events, streakCount: streak?.count ?? 0 };
}

export async function getNudges() {
  const user = await requireUser();
  return prisma.nudge.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function getNudge(id: string) {
  const user = await requireUser();
  return prisma.nudge.findFirst({ where: { id, userId: user.id } });
}

export async function getCompanionData() {
  const user = await requireUser();
  const thread = await getOrCreateThread(user.id);
  const [messages, consult] = await Promise.all([
    prisma.companionMessage.findMany({
      where: { threadId: thread.id, role: { in: ["USER", "AI"] } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.consultation.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return {
    threadId: thread.id,
    status: thread.status,
    summary: thread.summary,
    messages,
    doctorName: consult?.doctorName ?? "your doctor",
    specialty: consult?.specialty ?? "General Practice",
  };
}

export async function getConsultations() {
  const user = await requireUser();
  return prisma.consultation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}
