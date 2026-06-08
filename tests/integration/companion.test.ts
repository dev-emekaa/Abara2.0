import { prisma } from "@/lib/prisma";
import {
  addUserMessage,
  addAiMessage,
  getOrCreateThread,
  createFreshThread,
  closeThread,
} from "@/server/services/companion-service";
import { createTestUser } from "../helpers/db";

describe("companion thread", () => {
  it("creates a thread with a proactive AI opener", async () => {
    const user = await createTestUser();
    const thread = await getOrCreateThread(user.id);

    const messages = await prisma.companionMessage.findMany({
      where: { threadId: thread.id },
    });
    expect(messages).toHaveLength(1);
    expect(messages[0].role).toBe("AI");
    expect(messages[0].content.toLowerCase()).toContain("how are you feeling");
  });

  it("reuses the existing thread instead of creating a new one", async () => {
    const user = await createTestUser();
    const a = await getOrCreateThread(user.id);
    const b = await getOrCreateThread(user.id);
    expect(a.id).toBe(b.id);
  });
});

describe("addUserMessage — guardrail", () => {
  it("persists an ordinary message and does NOT escalate", async () => {
    const user = await createTestUser();
    const res = await addUserMessage(user.id, {
      content: "I'm feeling a bit better today, thanks",
    });

    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.data.plan.escalated).toBe(false);

    const userMsgs = await prisma.companionMessage.findMany({
      where: { threadId: res.data.threadId, role: "USER" },
    });
    expect(userMsgs).toHaveLength(1);
  });

  it("ESCALATES on a red-flag message and the persisted AI reply is flagged", async () => {
    const user = await createTestUser();
    const res = await addUserMessage(user.id, {
      content: "my chest hurts and it's getting worse",
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.data.plan.escalated).toBe(true);
    expect(res.data.plan.text).toBeTruthy();

    // The route persists the escalation reply with escalated = true.
    await addAiMessage(res.data.threadId, res.data.plan.text!, true);
    const escalatedMsgs = await prisma.companionMessage.findMany({
      where: { threadId: res.data.threadId, escalated: true },
    });
    expect(escalatedMsgs).toHaveLength(1);
  });

  it("rejects an empty message", async () => {
    const user = await createTestUser();
    const res = await addUserMessage(user.id, { content: "" });
    expect(res.ok).toBe(false);
  });
});

describe("closeThread (session wrap-up)", () => {
  it("closes the thread and writes a COMPANION event to the timeline", async () => {
    const user = await createTestUser();
    const ingest = await addUserMessage(user.id, {
      content: "feeling better, thanks",
    });
    if (!ingest.ok) throw new Error("setup failed");

    const res = await closeThread(user.id, ingest.data.threadId);
    expect(res.ok).toBe(true);

    const thread = await prisma.companionThread.findUnique({
      where: { id: ingest.data.threadId },
    });
    expect(thread?.status).toBe("CLOSED");
    expect(thread?.summary).toBeTruthy();

    const events = await prisma.timelineEvent.findMany({
      where: { userId: user.id, type: "COMPANION" },
    });
    expect(events).toHaveLength(1);
  });

  it("is idempotent — closing twice doesn't duplicate the timeline event", async () => {
    const user = await createTestUser();
    const ingest = await addUserMessage(user.id, { content: "all good" });
    if (!ingest.ok) throw new Error("setup failed");

    await closeThread(user.id, ingest.data.threadId);
    const second = await closeThread(user.id, ingest.data.threadId);
    expect(second.ok && second.data.alreadyClosed).toBe(true);

    const events = await prisma.timelineEvent.count({
      where: { userId: user.id, type: "COMPANION" },
    });
    expect(events).toBe(1);
  });

  it("records the escalation reason when a flagged thread is closed", async () => {
    const user = await createTestUser();
    const ingest = await addUserMessage(user.id, {
      content: "my chest hurts and it's getting worse",
    });
    if (!ingest.ok) throw new Error("setup failed");
    await addAiMessage(ingest.data.threadId, ingest.data.plan.text!, true);

    const res = await closeThread(user.id, ingest.data.threadId);
    expect(res.ok && res.data.detail.toLowerCase()).toContain("doctor");

    const event = await prisma.timelineEvent.findFirst({
      where: { userId: user.id, type: "COMPANION" },
    });
    expect(event?.title).toMatch(/flagged a concern/i);
  });

  it("createFreshThread starts a new OPEN thread with an opener", async () => {
    const user = await createTestUser();
    const first = await getOrCreateThread(user.id);
    await closeThread(user.id, first.id);

    const fresh = await createFreshThread(user.id);
    expect(fresh.id).not.toBe(first.id);
    expect(fresh.status).toBe("OPEN");

    const messages = await prisma.companionMessage.findMany({
      where: { threadId: fresh.id },
    });
    expect(messages).toHaveLength(1);
    expect(messages[0].role).toBe("AI");
  });
});
