import {
  planCompanionReply,
  pickFallbackReply,
  buildSystemPrompt,
  buildOpenerText,
  buildSessionSummary,
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

describe("buildSessionSummary", () => {
  it("summarizes a normal check-in without diagnosis or advice", () => {
    const s = buildSessionSummary({
      userMessageCount: 2,
      escalated: false,
      reasons: [],
    });
    expect(s.title).toMatch(/check-in/i);
    expect(s.detail).not.toMatch(/diagnos|prescrib|you have|you should take/i);
  });

  it("records an escalation factually with the flagged reasons", () => {
    const s = buildSessionSummary({
      userMessageCount: 1,
      escalated: true,
      reasons: ["Chest pain"],
    });
    expect(s.title).toMatch(/flagged a concern/i);
    expect(s.detail.toLowerCase()).toContain("chest pain");
    expect(s.detail).toMatch(/doctor|clinician/i);
  });

  it("handles an empty check-in", () => {
    const s = buildSessionSummary({
      userMessageCount: 0,
      escalated: false,
      reasons: [],
    });
    expect(s.title).toMatch(/opened/i);
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
