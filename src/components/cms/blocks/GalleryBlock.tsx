import type { GalleryData } from "@/lib/cms/blocks";

export function GalleryBlock({ data }: { data: GalleryData }) {
  const images = data.images || [];
  if (!images.length) return null;
  return (
    <section className="py-16 bg-background">
      <div className="container-page grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img, i) => (
          <figure key={i} className="rounded-2xl overflow-hidden ring-1 ring-border">
            <img src={img.url} alt={img.alt || ""} className="w-full h-auto object-cover aspect-square" loading="lazy" />
            {img.caption && <figcaption className="p-2 text-xs text-muted-foreground">{img.caption}</figcaption>}
          </figure>
        ))}
      </div>
    </section>
  );
}