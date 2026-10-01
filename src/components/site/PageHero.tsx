import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
interface Props {
  eyebrow: string;
  title: React.ReactNode;
  lead?: string;
  breadcrumbs?: { label: string; to?: string }[];
  ctaPrimary?: { label: string; to: string };
  ctaSecondary?: { label: string; to: string };
}
export const PageHero = ({
  eyebrow,
  title,
  lead,
  breadcrumbs,
  ctaPrimary,
  ctaSecondary,
}: Props) => (
  <section className="brand-inner" style={{ minHeight: 0, paddingBottom: 40 }}>
    {breadcrumbs && (
      <nav
        aria-label="İçerik yolu"
        className="mb-8 flex flex-wrap gap-3 text-xs text-muted-foreground"
      >
        {breadcrumbs.map((b, i) => (
          <span key={i}>
            {b.to ? <Link to={b.to}>{b.label}</Link> : b.label}
            {i < breadcrumbs.length - 1 ? " / " : ""}
          </span>
        ))}
      </nav>
    )}
    <p className="brand-eyebrow">{eyebrow}</p>
    <h1>{title}</h1>
    {lead && <p className="section-lead">{lead}</p>}
    <div className="flex gap-6">
      {ctaPrimary && (
        <Link className="brand-button dark" to={ctaPrimary.to}>
          {ctaPrimary.label}
          <ArrowUpRight size={17} />
        </Link>
      )}
      {ctaSecondary && (
        <Link className="text-link" to={ctaSecondary.to}>
          {ctaSecondary.label}
        </Link>
      )}
    </div>
  </section>
);
