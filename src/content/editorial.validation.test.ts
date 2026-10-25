import { describe, expect, it } from "vitest";
import { editorialSchema } from "./editorial";

describe("editorial validation with Zod 4", () => {
  it("preserves empty-content defaults and accepts a publication timestamp with an explicit offset", () => {
    expect(editorialSchema.parse({})).toEqual({ answer: "", takeaways: [], relatedPaths: [] });
    const publishedAt = "2026-10-25T12:30:00+03:00";
    expect(editorialSchema.parse({ publishedAt }).publishedAt).toBe(publishedAt);
    expect(editorialSchema.safeParse({ publishedAt: "not-a-date" }).success).toBe(false);
  });

  it("rejects an oversized constrained collection without accumulating an issue for every element", () => {
    const result = editorialSchema.safeParse({ takeaways: Array(100).fill(null) });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues).toEqual([
      expect.objectContaining({ code: "too_big", path: ["takeaways"] }),
    ]);
  });
});
