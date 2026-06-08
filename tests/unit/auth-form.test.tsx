import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthForm } from "@/features/auth/auth-form";

const push = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("AuthForm (login)", () => {
  beforeEach(() => push.mockClear());

  it("shows validation errors when submitting an empty form", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="login" />);

    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("rejects an invalid email", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="login" />);

    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.type(screen.getByLabelText(/password/i), "something");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(
      await screen.findByText(/valid email address/i),
    ).toBeInTheDocument();
  });

  it("navigates into the app on a valid submit", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="login" />);

    await user.type(screen.getByLabelText(/email/i), "demo@abara.health");
    await user.type(screen.getByLabelText(/password/i), "demo1234");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await screen.findByText(/signing you in/i);
    // mock submit resolves then pushes to /app
    await new Promise((r) => setTimeout(r, 800));
    expect(push).toHaveBeenCalledWith("/app");
  });
});

describe("AuthForm (signup)", () => {
  it("validates required fields", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="signup" />);

    await user.click(
      screen.getByRole("button", { name: /create my account/i }),
    );

    expect(await screen.findByText(/tell us your name/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/use at least 8 characters/i),
    ).toBeInTheDocument();
  });
});
