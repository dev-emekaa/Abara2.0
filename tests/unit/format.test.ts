import { formatDate, formatTime, relativeFrom } from "@/lib/format";

describe("formatDate", () => {
  it("formats an ISO date as 'D Mon YYYY'", () => {
    expect(formatDate("2026-06-02T10:30:00.000Z")).toBe("2 Jun 2026");
  });
});

describe("formatTime", () => {
  it("returns HH:MM", () => {
    expect(formatTime("2026-06-02T10:30:00.000Z")).toMatch(/^\d{2}:\d{2}$/);
  });
});

describe("relativeFrom", () => {
  const now = "2026-06-08T09:00:00.000Z";

  it("says 'today' for the same day", () => {
    expect(relativeFrom("2026-06-08T07:00:00.000Z", now)).toBe("today");
  });

  it("says 'yesterday' for one day prior", () => {
    expect(relativeFrom("2026-06-07T09:00:00.000Z", now)).toBe("yesterday");
  });

  it("counts days within a week", () => {
    expect(relativeFrom("2026-06-04T09:00:00.000Z", now)).toBe("4 days ago");
  });

  it("rolls up to weeks, months and years", () => {
    expect(relativeFrom("2026-05-20T09:00:00.000Z", now)).toBe("3 wk ago");
    expect(relativeFrom("2026-03-08T09:00:00.000Z", now)).toBe("3 mo ago");
    expect(relativeFrom("2024-06-08T09:00:00.000Z", now)).toBe("2 yr ago");
  });
});
