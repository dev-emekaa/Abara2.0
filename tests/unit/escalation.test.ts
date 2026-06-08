import {
  detectEscalation,
  ESCALATION_RULES,
} from "@/lib/escalation";

/**
 * The escalation detector is the safety contract. Every red-flag phrase MUST
 * trip it; ordinary recovery talk must NOT. This list mirrors the trigger set
 * and is the single source of truth the runtime guardrail also uses.
 */
describe("detectEscalation — red-flag phrases must escalate", () => {
  const RED_FLAGS: Array<[string, string]> = [
    ["chest-pain", "I have really bad chest pain"],
    ["breathing", "I'm having difficulty breathing"],
    ["breathing", "I can't breathe properly"],
    ["severe-bleeding", "there is severe bleeding from the wound"],
    ["coughing-vomiting-blood", "I started coughing blood this morning"],
    ["coughing-vomiting-blood", "I am vomiting blood"],
    ["fainting", "I fainted earlier today"],
    ["fainting", "I keep passing out"],
    ["seizure", "she had a seizure"],
    ["stiff-neck-fever", "I have a stiff neck and a fever"],
    ["severe-worsening-pain", "the pain is severe pain now"],
    ["getting-worse", "honestly it's getting worse"],
    ["getting-worse", "the fever is not improving at all"],
    ["high-fever", "I have a high fever that won't drop"],
    ["self-harm", "I have been having suicidal thoughts"],
    ["self-harm", "I want to kill myself"],
    ["pregnancy-emergency", "I'm pregnant and there is bleeding"],
    ["stroke-signs", "my face is drooping and my speech is slurred"],
    ["stroke-signs", "I feel weakness on one side"],
  ];

  it.each(RED_FLAGS)("escalates for rule %s: %s", (ruleId, message) => {
    const result = detectEscalation(message);
    expect(result.escalated).toBe(true);
    expect(result.matchedRuleIds).toContain(ruleId);
  });

  it("is case-insensitive", () => {
    expect(detectEscalation("CHEST PAIN").escalated).toBe(true);
  });
});

describe("detectEscalation — ordinary recovery talk must NOT escalate", () => {
  const SAFE: string[] = [
    "I'm feeling a bit better today",
    "About the same, still a little tired",
    "I finished my medication, thanks",
    "Slept well and ate something this morning",
    "Just a mild headache that's already easing",
    "",
  ];

  it.each(SAFE)("does not escalate: %s", (message) => {
    const result = detectEscalation(message);
    expect(result.escalated).toBe(false);
    expect(result.matchedRuleIds).toHaveLength(0);
  });

  it("handles non-string input defensively", () => {
    // @ts-expect-error testing runtime resilience
    expect(detectEscalation(undefined).escalated).toBe(false);
  });
});

describe("ESCALATION_RULES", () => {
  it("has unique rule ids", () => {
    const ids = ESCALATION_RULES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
