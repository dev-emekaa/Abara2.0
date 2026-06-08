import { generateNudges, type NudgeContext } from "@/services/nudges";

const RAINY = new Date("2026-06-08T09:00:00Z"); // June — rainy season
const DRY = new Date("2026-01-08T09:00:00Z"); // January — dry season

function ctx(over: Partial<NudgeContext> = {}): NudgeContext {
  return {
    location: "Enugu, Nigeria",
    now: RAINY,
    consultations: [],
    timeline: [],
    ...over,
  };
}

const kinds = (ctxIn: NudgeContext) => generateNudges(ctxIn).map((n) => n.kind);

describe("generateNudges", () => {
  it("suggests a follow-up after a recent consult with no check-in since", () => {
    const result = kinds(
      ctx({
        consultations: [
          {
            specialty: "General Practice",
            summary: "malaria",
            createdAt: new Date("2026-06-04T09:00:00Z"),
          },
        ],
      }),
    );
    expect(result).toContain("FOLLOWUP");
  });

  it("does NOT suggest a follow-up if the user already checked in afterwards", () => {
    const result = kinds(
      ctx({
        consultations: [
          {
            specialty: "General Practice",
            summary: "malaria",
            createdAt: new Date("2026-06-04T09:00:00Z"),
          },
        ],
        timeline: [
          { type: "CHECKIN", occurredAt: new Date("2026-06-06T09:00:00Z") },
        ],
      }),
    );
    expect(result).not.toContain("FOLLOWUP");
  });

  it("suggests finishing medication when a course started recently", () => {
    const result = kinds(
      ctx({
        timeline: [
          { type: "MEDICATION", occurredAt: new Date("2026-06-06T09:00:00Z") },
        ],
      }),
    );
    expect(result).toContain("MEDICATION");
  });

  it("suggests a seasonal nudge in a malaria-prone area during rainy season", () => {
    expect(kinds(ctx({ location: "Enugu, Nigeria" }))).toContain("SEASONAL");
  });

  it("does NOT suggest a seasonal nudge in the dry season", () => {
    expect(kinds(ctx({ now: DRY }))).not.toContain("SEASONAL");
  });

  it("returns nothing when there's nothing worth surfacing", () => {
    expect(
      generateNudges(ctx({ location: "Reykjavik", now: DRY })),
    ).toHaveLength(0);
  });
});
