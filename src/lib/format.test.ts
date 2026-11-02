import {
  capitalize,
  formatCurrency,
  formatPercentChange,
  initials,
} from "./format";

describe("format helpers", () => {
  it("formats currency without cents", () => {
    expect(formatCurrency(48250)).toBe("$48,250");
  });

  it("signs percentage changes", () => {
    expect(formatPercentChange(0.124)).toBe("+12.4%");
    expect(formatPercentChange(-0.013)).toBe("-1.3%");
    expect(formatPercentChange(0)).toBe("0.0%");
  });

  it("builds initials from up to two words", () => {
    expect(initials("Jane Doe")).toBe("JD");
    expect(initials("  ada  lovelace byron ")).toBe("AL");
    expect(initials("")).toBe("");
  });

  it("capitalizes the first letter", () => {
    expect(capitalize("admin")).toBe("Admin");
  });
});
