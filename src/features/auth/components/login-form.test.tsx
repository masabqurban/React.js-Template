import { screen } from "@testing-library/react";

import { tokenStore } from "@/lib/api";
import { renderWithProviders } from "@/test/utils";

import { sessionStore } from "../session-store";
import { LoginForm } from "./login-form";

describe("LoginForm", () => {
  it("validates fields before calling the API", async () => {
    const onSuccess = vi.fn();
    const { user } = renderWithProviders(<LoginForm onSuccess={onSuccess} />);

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("shows a clear message for wrong credentials", async () => {
    const { user } = renderWithProviders(<LoginForm onSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText("Email"), "demo@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Incorrect email or password.",
    );
    expect(screen.getByLabelText("Password")).toHaveValue("");
  });

  it("signs in and stores the session", async () => {
    const onSuccess = vi.fn();
    const { user } = renderWithProviders(<LoginForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText("Email"), "Demo@Example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await vi.waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });
    expect(sessionStore.get()).toMatchObject({
      email: "demo@example.com",
      role: "admin",
    });
    expect(tokenStore.getAccess()).toMatch(/^mock-access\./);
    await sessionStore.signOut();
  });
});
