import type { FeatureGridData } from "@/lib/cms/blocks";
import { CheckCircle2 } from "lucide-react";

export function FeatureGridBlock({ data }: { data: FeatureGridData }) {
  const items = data.items || [];
  if (!items.length) return null;
  const cols = data.columns || 3;
  const colClass = cols === 2 ? "md:grid-cols-2" : cols === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3";
  return (
    <section className="py-16 bg-background">
      <div className="container-page">
        <div className={`grid ${colClass} gap-6`}>
          {items.map((it, i) => (
            <div key={i} className="rounded-2xl border border-border p-6 bg-card shadow-soft">
              <CheckCircle2 className="h-5 w-5 text-accent-blue mb-3" />
              <h3 className="font-display text-lg font-semibold mb-2">{it.title}</h3>
              {it.description && <p className="text-sm text-foreground/75 leading-relaxed">{it.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}