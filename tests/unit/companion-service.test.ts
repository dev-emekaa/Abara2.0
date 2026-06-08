import {
  planCompanionReply,
  pickFallbackReply,
  buildSystemPrompt,
  buildOpenerText,
  FALLBACK_REPLIES,
} from "@/services/companion";

const ctx = {
  firstName: "Chidinma",
  specialty: "General Practice",
  doctorName: "Dr. Ngozi Eze",
  daysSinceConsult: 4,
};

describe("planCompanionReply", () => {
  it("escalates on a red-flag message and supplies the escalation text", () => {
    const plan = planCompanionReply("my chest hurts and it's getting worse");
    expect(plan.escalated).toBe(true);
    expect(plan.text).toBeTruthy();
    expect(plan.reasons.length).toBeGreaterThan(0);
  });

  it("does not escalate on ordinary recovery talk", () => {
    const plan = planCompanionReply("feeling a bit better today, thanks");
    expect(plan.escalated).toBe(false);
    expect(plan.text).toBeUndefined();
  });
});

describe("pickFallbackReply", () => {
  it("always returns a real reply within bounds", () => {
    for (let i = 0; i < 10; i++) {
      expect(FALLBACK_REPLIES).toContain(pickFallbackReply(i));
    }
  });
});

describe("prompts", () => {
  it("system prompt encodes the safety boundary", () => {
    const p = buildSystemPrompt(ctx);
    expect(p).toMatch(/never diagnose/i);
    expect(p).toMatch(/prescribe/i);
  });

  it("opener references the person and the consult", () => {
    const opener = buildOpenerText(ctx);
    expect(opener).toContain("Chidinma");
    expect(opener).toContain("4 days");
  });
});
