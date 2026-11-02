import { safeRedirectPath } from "./safe-redirect";

describe("safeRedirectPath", () => {
  it("allows same-origin paths", () => {
    expect(safeRedirectPath("/users?page=2")).toBe("/users?page=2");
  });

  it.each([
    ["missing", undefined],
    ["absolute URL", "https://evil.example"],
    ["protocol-relative URL", "//evil.example"],
    ["backslash trick", "/\\evil.example"],
    ["relative path", "users"],
  ])("falls back for a %s", (_label, value) => {
    expect(safeRedirectPath(value)).toBe("/");
  });
});
