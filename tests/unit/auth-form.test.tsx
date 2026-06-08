import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthForm } from "@/features/auth/auth-form";
import { loginAction, signupAction } from "@/server/actions/auth";

const push = jest.fn();
const refresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

jest.mock("@/server/actions/auth", () => ({
  loginAction: jest.fn(),
  signupAction: jest.fn(),
}));

const mockLogin = loginAction as jest.MockedFunction<typeof loginAction>;
const mockSignup = signupAction as jest.MockedFunction<typeof signupAction>;

beforeEach(() => {
  push.mockClear();
  mockLogin.mockReset();
  mockSignup.mockReset();
});

describe("AuthForm (login)", () => {
  it("shows validation errors when submitting an empty form", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="login" />);

    await user.click(screen.getByRole("button", { name: /^log in$/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("rejects an invalid email", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="login" />);

    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.type(screen.getByLabelText(/password/i), "something");
    await user.click(screen.getByRole("button", { name: /^log in$/i }));

    expect(await screen.findByText(/valid email address/i)).toBeInTheDocument();
  });

  it("calls loginAction and navigates into the app on success", async () => {
    mockLogin.mockResolvedValue({ ok: true, data: { userId: "u1" } });
    const user = userEvent.setup();
    render(<AuthForm mode="login" />);

    await user.type(screen.getByLabelText(/email/i), "demo@abara.health");
    await user.type(screen.getByLabelText(/password/i), "demo1234");
    await user.click(screen.getByRole("button", { name: /^log in$/i }));

    await screen.findByText(/signing you in/i);
    expect(mockLogin).toHaveBeenCalled();
    await new Promise((r) => setTimeout(r, 50));
    expect(push).toHaveBeenCalledWith("/app");
  });

  it("surfaces a server error", async () => {
    mockLogin.mockResolvedValue({ ok: false, error: "Email or password is incorrect." });
    const user = userEvent.setup();
    render(<AuthForm mode="login" />);

    await user.type(screen.getByLabelText(/email/i), "demo@abara.health");
    await user.type(screen.getByLabelText(/password/i), "wrongpass");
    await user.click(screen.getByRole("button", { name: /^log in$/i }));

    expect(await screen.findByText(/incorrect/i)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
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
    expect(mockSignup).not.toHaveBeenCalled();
  });
});
