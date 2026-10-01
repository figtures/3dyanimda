import { Prose } from "@/components/site/Prose";
import { CheckCircle2 } from "lucide-react";
import type { ServiceBodyData } from "@/lib/cms/blocks";

export function ServiceBodyBlock({ data }: { data: ServiceBodyData }) {
  const highlights = data.highlights || [];
  const hasAside = !!(data.image_url || highlights.length);
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container-page grid lg:grid-cols-12 gap-12 items-start">
        <div className={hasAside ? "lg:col-span-7" : "lg:col-span-12"}>
          <Prose>
            <div dangerouslySetInnerHTML={{ __html: data.body_html || "" }} />
          </Prose>
        </div>
        {hasAside && (
          <aside className="lg:col-span-5 lg:sticky lg:top-28 space-y-4">
            {data.image_url && (
              <img
                src={data.image_url}
                alt={data.image_alt || ""}
                className="w-full h-auto rounded-2xl shadow-deep aspect-[4/3] object-cover ring-1 ring-border"
                loading="lazy"
              />
            )}
            {highlights.length > 0 && (
              <div className="border border-border rounded-2xl p-6 bg-card shadow-soft">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-blue mb-3">
                  {data.aside_label || "Özet"}
                </p>
                <ul className="space-y-3">
                  {highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-accent-blue mt-0.5 shrink-0" />
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{h.k}</p>
                        <p className="text-foreground font-medium">{h.v}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        )}
      </div>
    </section>
  );
}