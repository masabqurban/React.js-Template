import { screen } from "@testing-library/react";

import { db } from "@/mocks/db";
import { renderWithProviders, signInAsDemo } from "@/test/utils";

import { UserFormDialog } from "./user-form-dialog";

describe("UserFormDialog", () => {
  beforeEach(signInAsDemo);

  it("creates a user and closes", async () => {
    const onOpenChange = vi.fn();
    const { user } = renderWithProviders(
      <UserFormDialog open onOpenChange={onOpenChange} />,
    );

    await user.type(screen.getByLabelText("Full name"), "Grace Hopper");
    await user.type(screen.getByLabelText("Email"), "grace@example.com");
    await user.selectOptions(screen.getByLabelText("Role"), "editor");
    await user.click(screen.getByRole("button", { name: "Add user" }));

    await vi.waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
    expect(db.users[0]).toMatchObject({ name: "Grace Hopper", role: "editor" });
  });

  it("shows a server conflict on the email field", async () => {
    const { user } = renderWithProviders(
      <UserFormDialog open onOpenChange={vi.fn()} />,
    );

    await user.type(screen.getByLabelText("Full name"), "Someone Else");
    await user.type(screen.getByLabelText("Email"), "demo@example.com");
    await user.click(screen.getByRole("button", { name: "Add user" }));

    expect(
      await screen.findByText("Another account already uses this email."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("prefills the form when editing", () => {
    const existing = db.users[1]!;
    renderWithProviders(
      <UserFormDialog
        open
        onOpenChange={vi.fn()}
        user={{ ...existing, lastActiveAt: existing.lastActiveAt }}
      />,
    );

    expect(
      screen.getByRole("dialog", { name: "Edit user" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Full name")).toHaveValue(existing.name);
  });
});
