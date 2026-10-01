import { BadgeCheck, Circle } from "lucide-react";
import type { BulletListData } from "@/lib/cms/blocks";

export function BulletListBlock({ data }: { data: BulletListData }) {
  const items = data.items || [];
  if (!items.length) return null;
  const cols = data.columns || 2;
  const colCls = cols === 1 ? "" : cols === 3 ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2";
  const Icon = data.variant === "dot" ? Circle : BadgeCheck;
  return (
    <section className="py-16 bg-cream-gradient border-y border-border">
      <div className="container-page">
        {data.eyebrow && <p className="eyebrow">{data.eyebrow}</p>}
        {data.title_html && (
          <h2 className="font-display text-2xl md:text-3xl mt-3 text-foreground max-w-2xl" dangerouslySetInnerHTML={{ __html: data.title_html }} />
        )}
        <ul className={`mt-8 grid gap-3 ${colCls}`}>
          {items.map((i, k) => (
            <li key={k} className="flex items-start gap-3 text-sm text-foreground">
              <Icon className="h-4 w-4 text-accent-blue mt-0.5 shrink-0" />
              <span>{i}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
