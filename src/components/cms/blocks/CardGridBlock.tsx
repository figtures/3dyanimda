import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import type { CardGridData } from "@/lib/cms/blocks";

export function CardGridBlock({ data }: { data: CardGridData }) {
  const items = data.items || [];
  if (!items.length && !data.title_html && !data.lead) return null;
  const cols = data.columns || 3;
  const colClass = cols === 2 ? "md:grid-cols-2" : cols === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3";
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container-page">
        {(data.eyebrow || data.title_html || data.lead) && (
          <div className="max-w-3xl mb-10">
            {data.eyebrow && <p className="eyebrow">{data.eyebrow}</p>}
            {data.title_html && (
              <h2
                className="font-display text-3xl md:text-4xl font-semibold tracking-tight mt-3"
                dangerouslySetInnerHTML={{ __html: data.title_html }}
              />
            )}
            {data.lead && <p className="text-foreground/75 mt-4 leading-relaxed">{data.lead}</p>}
          </div>
        )}
        <div className={`grid ${colClass} gap-5`}>
          {items.map((it, i) => {
            const Icon = (it.icon && (Icons as any)[it.icon]) || Icons.Sparkles;
            const inner = (
              <>
                {it.primary && (
                  <span className="absolute top-4 right-4 font-mono text-[9px] uppercase tracking-[0.22em] bg-accent-blue text-white px-2 py-1 rounded-full">
                    {it.badge || "Ana uzmanlık"}
                  </span>
                )}
                <div className="rounded-lg bg-accent-blue-soft p-2.5 inline-flex">
                  <Icon className="h-5 w-5 text-accent-blue" />
                </div>
                <h3 className="font-display text-xl font-semibold tracking-tight mt-4 text-foreground">{it.title}</h3>
                {it.description && (
                  <p className="text-foreground/70 mt-2 text-[15px] leading-relaxed">{it.description}</p>
                )}
                {it.to && (
                  <span className="inline-flex items-center gap-1 mt-5 text-sm font-medium text-primary group-hover:text-accent-blue">
                    Detaylar <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </>
            );
            const baseCls = `group relative border rounded-2xl p-7 bg-card shadow-soft transition-all overflow-hidden ${
              it.primary ? "border-accent-blue ring-2 ring-accent-blue/20" : "border-border"
            } ${it.to ? "hover:shadow-deep hover:-translate-y-0.5" : ""}`;
            return it.to ? (
              <Link key={i} to={it.to} className={baseCls}>{inner}</Link>
            ) : (
              <div key={i} className={baseCls}>{inner}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
