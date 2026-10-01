import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface LogoProps {
  variant?: "dark" | "light";
  className?: string;
}

export const Logo = ({ variant = "dark", className = "" }: LogoProps) => {
  const isLight = variant === "light";
  const settings = useSiteSettings();
  const wordmark = (isLight ? settings.logo_wordmark_light : settings.logo_wordmark) as { url?: string } | undefined;
  const icon = (isLight ? settings.logo_icon_light : settings.logo_icon) as { url?: string } | undefined;
  // Fallback chain: light variant → dark variant if light not set
  const wordmarkUrl = wordmark?.url || (isLight ? (settings.logo_wordmark as any)?.url : undefined);
  const iconUrl = icon?.url || (isLight ? (settings.logo_icon as any)?.url : undefined);

  // If a wordmark image exists, use it as the full logo
  if (wordmarkUrl) {
    return (
      <Link to="/" aria-label="3D Yanında ana sayfa" className={`inline-flex items-center ${className}`}>
        <img src={wordmarkUrl} alt="3D Yanında" className="h-9 w-auto object-contain" />
      </Link>
    );
  }

  return (
    <Link to="/" aria-label="3D Yanında ana sayfa" className={`group inline-flex items-center gap-3 ${className}`}>
      <span
        className={`relative flex h-10 w-10 items-center justify-center rounded-full border ${
          isLight ? "border-cream/30" : "border-primary/20"
        } overflow-hidden`}
      >
        {iconUrl ? (
          <img src={iconUrl} alt="" className="h-full w-full object-contain" />
        ) : (
          <>
            <BarMark light={isLight} />
            <span className={`absolute inset-[3px] rounded-full border ${isLight ? "border-cream/15" : "border-primary/10"}`} />
          </>
        )}
      </span>
      <span className="leading-tight">
        <span
          className={`block font-serif text-[15px] tracking-[0.18em] ${
            isLight ? "text-cream" : "text-primary"
          }`}
        >
          3D YANINDA
        </span>
        <span
          className={`block font-mono text-[9px] uppercase tracking-[0.32em] ${
            isLight ? "text-cream/60" : "text-muted-foreground"
          }`}
        >
          Digital Production
        </span>
      </span>
    </Link>
  );
};

const BarMark = ({ light }: { light: boolean }) => {
  const fill = light ? "hsl(var(--cream))" : "hsl(var(--primary))";
  const heights = [4, 7, 5, 9, 6, 11, 7, 9, 5, 7, 4];
  return (
    <svg viewBox="0 0 28 28" className="h-5 w-5" aria-hidden="true">
      <g>
        {heights.map((h, i) => (
          <rect key={i} x={3 + i * 2} y={14 - h / 2} width="1.2" height={h} fill={fill} />
        ))}
      </g>
    </svg>
  );
};
