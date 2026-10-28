import { describe, expect, it } from "vitest";
import { schema } from "./quote-schema";

const request = () => ({
  full_name: "  Ada Üretim  ", email: "ada+teklif@example.com", phone: "", company: "",
  quantity: "7", part_description: "  Montaj denemesi için prototip parça.  ",
  department: "", reference: "", target_date: "", environment: "", material_pref: "",
});

describe("quote validation with Zod 4", () => {
  it("preserves optional empty fields and normalizes the submitted name, description and quantity", () => {
    expect(schema.parse(request())).toEqual({
      ...request(), full_name: "Ada Üretim", quantity: 7,
      part_description: "Montaj denemesi için prototip parça.",
    });
  });

  it("rejects invalid email and non-orderable quantities through the public issues interface", () => {
    for (const [field, value] of [["email", "not-an-email"], ["quantity", "0"], ["quantity", "1.5"], ["quantity", "1001"]] as const) {
      const result = schema.safeParse({ ...request(), [field]: value });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues.some(issue => issue.path[0] === field)).toBe(true);
    }
  });
});
