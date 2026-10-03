import { describe, expect, it } from "vitest";
import { resolveTheme } from "./config";
describe("public theme precedence", () => {
  it("uses the global theme for all brands without overrides", () => {
    for (const value of ["industrial", "editorial", "studio"])
      expect(resolveTheme(value, "")).toBe(value);
  });
  it("prioritizes the per-brand override and validated development preview", () => {
    expect(resolveTheme("industrial", "editorial")).toBe("editorial");
    expect(resolveTheme("industrial", "editorial", "studio")).toBe("studio");
  });
  it("falls back safely for missing or invalid configuration", () => {
    expect(resolveTheme("invalid", "invalid")).toBe("studio");
    expect(resolveTheme("industrial", "typo", "typo")).toBe("industrial");
  });
});
