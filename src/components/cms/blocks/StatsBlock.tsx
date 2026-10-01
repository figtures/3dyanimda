import type { StatsData } from "@/lib/cms/blocks";

export function StatsBlock({ data }: { data: StatsData }) {
  const items = data.items || [];
  if (!items.length && !data.title_html) return null;
  const bg = data.variant === "cream" ? "bg-cream-gradient border-y border-border" : "bg-background";
  return (
    <section className={`py-20 ${bg}`}>
      <div className="container-page">
        {data.eyebrow && <p className="eyebrow">{data.eyebrow}</p>}
        {data.title_html && (
          <h2 className="font-display text-3xl mt-3 text-foreground max-w-2xl" dangerouslySetInnerHTML={{ __html: data.title_html }} />
        )}
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {items.map((c, i) => (
            <div key={i} className="border border-border rounded-2xl p-6 bg-card shadow-soft">
              <p className="font-display text-4xl font-semibold text-accent-blue">{c.metric}</p>
              <p className="font-display text-base font-medium mt-2 text-foreground">{c.label}</p>
              {c.note && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{c.note}</p>}
            </div>
          ))}
        </div>
        {data.footnote && <p className="mt-8 text-sm text-muted-foreground">{data.footnote}</p>}
      </div>
    </section>
  );
}
