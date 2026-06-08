import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  CompanionChat,
  type InitialMessage,
} from "@/features/care-companion/companion-chat";

/**
 * The guardrail must surface in the UI: a red-flag message stops normal triage,
 * shows the "Connect with a doctor" escalation, removes the composer, and offers
 * a fresh check-in. Network + server actions are mocked.
 */

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

jest.mock("@/server/actions/companion", () => ({
  startSessionAction: jest.fn().mockResolvedValue({ ok: true, data: { threadId: "t2" } }),
  closeSessionAction: jest.fn().mockResolvedValue({ ok: true, data: {} }),
}));

const OPENER: InitialMessage = {
  id: "m1",
  role: "AI",
  content: "Hi Chidinma 👋 how are you feeling today?",
  escalated: false,
};

function renderChat() {
  return render(
    <CompanionChat
      threadId="t1"
      initialMessages={[OPENER]}
      status="OPEN"
      summary={null}
    />,
  );
}

beforeAll(() => {
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

  it("escalates on a red-flag quick reply, hides the composer, offers a new check-in", async () => {
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
    // CTA routes to the consult flow (it's a link now).
    expect(
      screen.getByRole("link", { name: /connect with a doctor/i }),
    ).toBeInTheDocument();
    // Composer is removed once the session is closed…
    expect(
      screen.queryByPlaceholderText(/type how you're feeling/i),
    ).not.toBeInTheDocument();
    // …and a fresh check-in is offered.
    expect(
      screen.getByRole("button", { name: /start a new check-in/i }),
    ).toBeInTheDocument();
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

describe("CompanionChat closed state", () => {
  it("shows the wrap-up summary and a start-new button when closed", () => {
    render(
      <CompanionChat
        threadId="t1"
        initialMessages={[OPENER]}
        status="CLOSED"
        summary="You checked in and talked through your recovery."
      />,
    );
    expect(screen.getByText(/check-in wrapped up/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /start a new check-in/i }),
    ).toBeInTheDocument();
  });
});
