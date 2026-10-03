export type QuoteMaterial = {
  id: string;
  name: string;
  density: number;
  pricePerGram: number;
  setupFee: number;
  minPrice: number;
};
export type PricingConfig = {
  marginPct: number;
  vatPct: number;
  laborPerHour: number;
  minOrder: number;
};
export const qualities = [
  { id: "draft", name: "Taslak · 0,28 mm", multiplier: 0.85 },
  { id: "normal", name: "Standart · 0,20 mm", multiplier: 1 },
  { id: "fine", name: "İnce · 0,12 mm", multiplier: 1.35 },
  { id: "ultra", name: "Çok ince · 0,08 mm", multiplier: 1.7 },
];
// Retains the source engine's estimation formula. This is not a slicer or binding quotation.
export function computeEstimate(
  volumeCm3: number,
  material: QuoteMaterial,
  qualityMul: number,
  infill: number,
  quantity: number,
  pricing: PricingConfig,
) {
  const inputs = [
    volumeCm3,
    material.density,
    material.pricePerGram,
    material.setupFee,
    material.minPrice,
    qualityMul,
    infill,
    quantity,
    ...Object.values(pricing),
  ];
  if (
    inputs.some((v) => !Number.isFinite(v) || v < 0) ||
    volumeCm3 <= 0 ||
    material.density <= 0 ||
    qualityMul <= 0 ||
    infill < 5 ||
    infill > 100 ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 1000
  )
    return null;
  const grams = volumeCm3 * material.density * (0.25 + (infill / 100) * 0.75);
  const hours = ((volumeCm3 * (0.4 + (infill / 100) * 0.6)) / 10) * qualityMul;
  const unit =
    (grams * material.pricePerGram + hours * pricing.laborPerHour) * qualityMul;
  const discount = quantity >= 10 ? 0.85 : quantity >= 5 ? 0.92 : 1;
  const subtotal =
    (unit * quantity * discount + material.setupFee) *
    (1 + pricing.marginPct / 100);
  const total = Math.max(
    pricing.minOrder,
    material.minPrice,
    subtotal * (1 + pricing.vatPct / 100),
  );
  return Number.isFinite(total) ? { grams, hours, total, quantity } : null;
}
export const fmtTRY = (value: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
