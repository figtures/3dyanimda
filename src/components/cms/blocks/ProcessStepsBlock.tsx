import type { ProcessStepsData } from "@/lib/cms/blocks";

export function ProcessStepsBlock({ data }: { data: ProcessStepsData }) {
  const items = data.items || [];
  if (!items.length) return null;
  const n = Math.min(items.length, 5);
  const colCls = n >= 5 ? "md:grid-cols-5" : n === 4 ? "md:grid-cols-4" : n === 3 ? "md:grid-cols-3" : n === 2 ? "md:grid-cols-2" : "";
  return (
    <section className="py-20 bg-background">
      <div className="container-page">
        {data.eyebrow && <p className="eyebrow">{data.eyebrow}</p>}
        {data.title_html && (
          <h2 className="font-display text-3xl mt-3 text-foreground max-w-2xl" dangerouslySetInnerHTML={{ __html: data.title_html }} />
        )}
        <ol className={`mt-10 grid gap-4 ${colCls}`}>
          {items.map((s, i) => (
            <li key={i} className="border border-border rounded-2xl p-5 bg-card">
              <span className="font-mono text-[11px] text-accent-blue">{s.phase || `0${i + 1}`}</span>
              <h3 className="font-display text-base font-semibold mt-2">{s.title}</h3>
              {s.description && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{s.description}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
