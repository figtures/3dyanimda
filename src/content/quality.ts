import type { LandingPage } from "./types";
import places from "./places.json";
const entities = [
  ...places.map((p) => p.name),
  "İstanbul",
  "Örnek Mahallesi",
  "Örnek",
  "3dyanımda",
  "3dsanayi",
  "maketyanımda",
  "parçayanımda",
  "3dyanimda",
  "maketyanimda",
  "parcayanimda",
];
export function normalizeLocal(text: string) {
  let result = text.toLocaleLowerCase("tr-TR");
  for (const name of entities)
    result = result.split(name.toLocaleLowerCase("tr-TR")).join(" ");
  return result.replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}
export function similarity(a: string, b: string) {
  const words = (s: string) =>
    new Set(
      normalizeLocal(s)
        .split(" ")
        .filter((w) => w.length > 2),
    );
  const x = words(a),
    y = words(b);
  const union = new Set([...x, ...y]);
  return union.size ? [...x].filter((w) => y.has(w)).length / union.size : 1;
}
// Editorial aid, not a search-engine ranking score. The DB enforces publication separately.
export function publicationIssues(
  page: LandingPage,
  peers: LandingPage[] = [],
) {
  const issues: string[] = [];
  if (!page.title.trim() || page.summary.trim().length < 60)
    issues.push("Başlık ve açıklamayı tamamlayın.");
  if (page.sections.length < 2)
    issues.push("En az iki yararlı içerik bölümü ekleyin.");
  if (page.kind === "location") {
    if (page.local_context.trim().length < 200)
      issues.push("Bölgeye özgü, doğrulanmış yerel bilgiyi ekleyin.");
    if (page.logistics.trim().length < 120)
      issues.push("Numune alışverişi ve teslimat planını açıklayın.");
    if (page.evidence.trim().length < 20 || !page.reviewed_at)
      issues.push("Kaynak / işletme teyidi ve kontrol tarihi gerekli.");
    if (page.faq.length < 2 || page.faq.some((f) => !f.q.trim() || !f.a.trim()))
      issues.push("Bölgeye özgü en az iki soruyu yanıtlayın.");
    if (
      peers.some(
        (p) =>
          p.path !== page.path &&
          p.kind === "location" &&
          p.status === "published" &&
          similarity(p.local_context, page.local_context) >= 0.8,
      )
    )
      issues.push(
        "Yer adları çıkarıldığında başka bir konum sayfasıyla fazla benzer içerik.",
      );
  }
  return issues;
}
