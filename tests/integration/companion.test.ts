import { prisma } from "@/lib/prisma";
import {
  addUserMessage,
  addAiMessage,
  getOrCreateThread,
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
