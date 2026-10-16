import { describe, it, expect } from "vitest";
import { computeEstimate } from "./quote-engine";
const m = {
  id: "pla",
  name: "PLA",
  density: 1.24,
  pricePerGram: 6,
  setupFee: 35,
  minPrice: 90,
};
const p = { marginPct: 30, vatPct: 20, laborPerHour: 150, minOrder: 150 };
describe("source quote engine", () => {
  it("retains volume, labor, quantity discount, setup, margin and VAT calculation", () => {
    const one = computeEstimate(100, m, 1, 20, 1, p)!;
    expect(one.grams).toBeCloseTo(49.6);
    expect(one.hours).toBeCloseTo(5.2);
    expect(one.total).toBeCloseTo((49.6 * 6 + 5.2 * 150 + 35) * 1.3 * 1.2);
    const ten = computeEstimate(100, m, 1, 20, 10, p)!;
    expect(ten.total).toBeCloseTo(
      ((49.6 * 6 + 5.2 * 150) * 10 * 0.85 + 35) * 1.3 * 1.2,
    );
  });
  it("uses configured minimums for a zero-volume open surface only when explicitly allowed",()=>{
    expect(computeEstimate(0,m,1,20,1,p,{allowZeroVolume:true})?.total).toBe(150);
    expect(computeEstimate(-1,m,1,20,1,p,{allowZeroVolume:true})).toBeNull();
  });
  it("does not estimate a material without a configured price", () => {
    expect(computeEstimate(100, { ...m, pricePerGram: 0 }, 1, 20, 1, p)).toBeNull();
  });
  it("rejects invalid geometry, settings and quantities", () => {
    for (const volume of [NaN, Infinity, 0, -1])
      expect(computeEstimate(volume, m, 1, 20, 1, p)).toBeNull();
    expect(computeEstimate(100, m, 1, 20, 1001, p)).toBeNull();
    expect(computeEstimate(100, m, 1, 20, 1, { ...p, vatPct: NaN })).toBeNull();
  });
});
