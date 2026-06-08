/**
 * SAFETY GUARDRAIL — single source of truth.
 *
 * The Care Companion must NEVER diagnose, prescribe, or reassure a real concern
 * away. This module is a deterministic, framework-free detector for red-flag
 * signals in a user's message. It is used by BOTH:
 *   - the Phase 1 companion demo (client preview of the escalation CTA), and
 *   - the Phase 3 server-side guardrail that flips a thread to `escalated`.
 * The escalation e2e tests assert against THIS list, so it is the contract.
 *
 * Pure functions only — no framework imports — so it is trivially unit-testable.
 */

export interface EscalationRule {
  /** Stable id, also used as a test label. */
  id: string;
  /** Human-readable reason surfaced to clinicians/logs. */
  label: string;
  /** Case-insensitive, word-boundary-aware regex. */
  pattern: RegExp;
}

/**
 * Red-flag trigger set. Word-boundary matched and case-insensitive.
 * Extend sensibly — but every entry here is part of the safety contract.
 */
export const ESCALATION_RULES: readonly EscalationRule[] = [
  {
    id: "chest-pain",
    label: "Chest pain",
    pattern: /\bchest\s*(?:pain|tightness|pressure)\b/i,
  },
  {
    id: "breathing",
    label: "Difficulty breathing",
    pattern:
      /\b(?:difficulty\s+breathing|can'?t\s+breathe|cannot\s+breathe|short(?:ness)?\s+of\s+breath|struggling\s+to\s+breathe|gasping)\b/i,
  },
  {
    id: "severe-bleeding",
    label: "Severe bleeding",
    pattern: /\b(?:severe|heavy|won'?t\s+stop|uncontrolled)\s+bleed(?:ing)?\b/i,
  },
  {
    id: "coughing-vomiting-blood",
    label: "Coughing or vomiting blood",
    pattern:
      /\b(?:cough(?:ing)?|vomit(?:ing)?|throwing\s+up|spitting)\s+(?:up\s+)?blood\b/i,
  },
  {
    id: "fainting",
    label: "Fainting / loss of consciousness",
    pattern:
      /\b(?:faint(?:ed|ing)?|pass(?:ed|ing)?\s+out|black(?:ed)?\s+out|loss\s+of\s+consciousness|unconscious|collapsed)\b/i,
  },
  {
    id: "seizure",
    label: "Seizure",
    pattern: /\b(?:seizure|seizing|convuls(?:ion|ing))\b/i,
  },
  {
    id: "stiff-neck-fever",
    label: "Stiff neck with fever",
    pattern: /\bstiff\s+neck\b/i,
  },
  {
    id: "severe-worsening-pain",
    label: "Severe or worsening pain",
    pattern: /\b(?:severe|excruciating|unbearable|worsening)\s+pain\b/i,
  },
  {
    id: "getting-worse",
    label: "Symptoms getting worse / not improving",
    pattern:
      /\b(?:getting\s+worse|got\s+worse|much\s+worse|not\s+improving|no(?:t)?\s+(?:getting\s+)?better|deteriorat(?:ed|ing))\b/i,
  },
  {
    id: "high-fever",
    label: "High fever that won't drop",
    pattern:
      /\b(?:high\s+fever|fever\s+(?:won'?t|will\s+not|wont)\s+(?:drop|go\s+down|break)|very\s+high\s+temperature)\b/i,
  },
  {
    id: "self-harm",
    label: "Suicidal thoughts / self-harm",
    pattern:
      /\b(?:suicid(?:e|al)|kill\s+myself|end\s+(?:my|it)\s+(?:life|all)|self[-\s]?harm|hurt\s+myself|don'?t\s+want\s+to\s+(?:live|be\s+alive))\b/i,
  },
  {
    id: "pregnancy-emergency",
    label: "Pregnancy with bleeding or severe pain",
    pattern:
      /\bpregnan(?:t|cy)\b.*\b(?:bleed(?:ing)?|severe\s+pain|cramp)/i,
  },
  {
    id: "stroke-signs",
    label: "Signs of stroke",
    // Phrased loosely on purpose — order-independent and suffix-tolerant — so
    // "face is drooping" / "speech is slurred" both trip it. Fail toward safety.
    pattern:
      /\bface\s+(?:is\s+|has\s+)?droop|droop\w*\s+(?:on\s+)?(?:the\s+|my\s+)?face|\bslurred\s+speech\b|\bspeech\s+(?:is\s+|sounds\s+)?slurr|\bslurring\b|\bweak(?:ness)?\s+(?:on|down)\s+one\s+side\b|\bnumb\w*\s+(?:on|down)\s+one\s+side\b|\bone\s+side\s+(?:of\s+[\w\s]+?)?(?:is\s+)?(?:weak|numb|droop)/i,
  },
];

export interface EscalationResult {
  escalated: boolean;
  matchedRuleIds: string[];
  matchedLabels: string[];
}

/**
 * Deterministically decide whether a user message requires escalation to a
 * human doctor. This is the guardrail — it does not rely on the model.
 */
export function detectEscalation(message: string): EscalationResult {
  const text = (message ?? "").toString();
  const matched = ESCALATION_RULES.filter((rule) => rule.pattern.test(text));
  return {
    escalated: matched.length > 0,
    matchedRuleIds: matched.map((r) => r.id),
    matchedLabels: matched.map((r) => r.label),
  };
}

/** The standard, non-diagnostic escalation message shown on any red-flag match. */
export const ESCALATION_MESSAGE =
  "What you've described needs a real doctor's eyes, not mine. I'm not able to assess this safely on my own — please connect with a doctor now so a clinician can help you properly.";
