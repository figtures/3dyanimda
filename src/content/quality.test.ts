import { describe, it, expect } from "vitest";
import { similarity, publicationIssues } from "./quality";
import pages from "./pages.json";
import type { LandingPage } from "./types";
describe("local publishing", () => {
  it("recognizes copy even when place and brand change", () => {
    expect(
      similarity(
        "Ataşehir 3dyanımda numune teslim süreci dosya paylaşımı",
        "Kadıköy 3dsanayi numune teslim süreci dosya paylaşımı",
      ),
    ).toBe(1);
  });
  it("keeps all completed local records unpublished until release review", () => {
    const localPages = pages.filter(
      (p) => p.kind === "location" && p.path !== "/bolgeler/istanbul",
    );
    expect(localPages).toHaveLength(652);
    for (const p of localPages) {
      expect(p.status).toBe("draft");
      expect(publicationIssues(p as LandingPage)).toEqual([]);
    }
  });
  it("still rejects a local shell when its required fields are removed", () => {
    const page = pages.find((p) => p.kind === "location") as LandingPage;
    expect(publicationIssues({ ...page, sections: [], faq: [], local_context: "", logistics: "", evidence: "", reviewed_at: null }).length).toBeGreaterThan(0);
  });
  it("has the full content inventory for each brand without URL collisions", () => {
    for (const brand of [
      "3dyanimda",
      "3dsanayi",
      "maketyanimda",
      "parcayanimda",
    ]) {
      const rows = pages.filter((p) => p.brand === brand);
      expect(rows.length).toBeGreaterThanOrEqual(197);
      expect(new Set(rows.map((p) => p.path)).size).toBe(rows.length);
      expect(rows.filter((p) => p.kind === "service")).toHaveLength(3);
    }
  });
});
