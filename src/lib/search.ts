/** Canonical paths never carry preview, campaign, session or fragment parameters. */
export function canonicalPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  const pathname = new URL(value, "https://canonical.invalid").pathname;
  return pathname.replace(/\/index\.html$/, "/").replace(/\/+$/, "") || "/";
}

export const indexRobots = "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";

export function pageGraph(input: {
  origin: string; path: string; title: string; description: string;
  image?: string; modified?: string; type?: "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage";
}) {
  const url = input.origin + canonicalPath(input.path);
  return {
    "@context": "https://schema.org",
    "@type": input.type || "WebPage",
    "@id": url + "#webpage",
    url, name: input.title, description: input.description, inLanguage: "tr-TR",
    isPartOf: { "@id": input.origin + "/#website" },
    publisher: { "@id": input.origin + "/#organization" },
    ...(input.modified ? { dateModified: input.modified } : {}),
    ...(input.image ? { primaryImageOfPage: { "@type": "ImageObject", url: new URL(input.image, input.origin).href } } : {}),
  };
}
