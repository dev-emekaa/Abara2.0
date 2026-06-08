import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompanionChat } from "@/features/care-companion/companion-chat";

/**
 * The guardrail must surface in the UI: a red-flag message stops normal triage
 * and shows the "Connect with a doctor" escalation, disabling the composer.
 */
describe("CompanionChat escalation", () => {
  it("renders the proactive opener", () => {
    render(<CompanionChat />);
    expect(screen.getByText(/how are you feeling today/i)).toBeInTheDocument();
  });

  it("escalates on a red-flag quick reply and locks the composer", async () => {
    const user = userEvent.setup();
    render(<CompanionChat />);

    await user.click(
      screen.getByRole("button", { name: /my chest hurts and it's getting worse/i }),
    );

    // Escalation banner appears…
    expect(
      await screen.findByText(/let's get a doctor involved/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /connect with a doctor/i }),
    ).toBeInTheDocument();

    // …and the composer is disabled.
    expect(screen.getByPlaceholderText(/connect with a doctor/i)).toBeDisabled();
  });

  it("does not escalate on an ordinary reply", async () => {
    const user = userEvent.setup();
    render(<CompanionChat />);

    await user.click(
      screen.getByRole("button", { name: /i'm feeling a bit better/i }),
    );

    expect(
      screen.queryByText(/let's get a doctor involved/i),
    ).not.toBeInTheDocument();
  });
});
