import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  CompanionChat,
  type InitialMessage,
} from "@/features/care-companion/companion-chat";

/**
 * The guardrail must surface in the UI: a red-flag message stops normal triage
 * and shows the "Connect with a doctor" escalation, disabling the composer.
 * Network calls are mocked — the client-side guardrail is deterministic and
 * does not depend on the server round-trip for the escalation UX.
 */

const OPENER: InitialMessage = {
  id: "m1",
  role: "AI",
  content: "Hi Chidinma 👋 how are you feeling today?",
  escalated: false,
};

function renderChat() {
  return render(
    <CompanionChat threadId="t1" initialMessages={[OPENER]} />,
  );
}

beforeAll(() => {
  // No real network in tests; reject so the non-escalation path falls back.
  global.fetch = jest.fn(() =>
    Promise.reject(new Error("no network in test")),
  ) as unknown as typeof fetch;
});

afterEach(() => jest.clearAllMocks());

describe("CompanionChat escalation", () => {
  it("renders the proactive opener", () => {
    renderChat();
    expect(screen.getByText(/how are you feeling today/i)).toBeInTheDocument();
  });

  it("escalates on a red-flag quick reply and locks the composer", async () => {
    const user = userEvent.setup();
    renderChat();

    await user.click(
      screen.getByRole("button", {
        name: /my chest hurts and it's getting worse/i,
      }),
    );

    expect(
      await screen.findByText(/let's get a doctor involved/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /connect with a doctor/i }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/connect with a doctor/i)).toBeDisabled();
  });

  it("does not escalate on an ordinary reply", async () => {
    const user = userEvent.setup();
    renderChat();

    await user.click(
      screen.getByRole("button", { name: /i'm feeling a bit better/i }),
    );

    expect(
      screen.queryByText(/let's get a doctor involved/i),
    ).not.toBeInTheDocument();
  });
});
