import i18n from "@/lib/i18n";
import { useTranslation } from "react-i18next";

export const LanguageSwitch = ({ variant = "dark" }: { variant?: "dark" | "light" }) => {
  const { i18n: i18nInst } = useTranslation();
  const current = i18nInst.language?.startsWith("en") ? "en" : "tr";
  const set = (lng: "tr" | "en") => i18n.changeLanguage(lng);

  const base = "px-2 py-1 text-[11px] font-mono uppercase tracking-[0.18em] rounded-md transition-colors";
  const activeCls = variant === "light"
    ? "bg-cream text-primary"
    : "bg-primary text-cream";
  const idleCls = variant === "light"
    ? "text-cream/70 hover:text-cream"
    : "text-foreground/60 hover:text-primary";

  return (
    <div className="inline-flex items-center gap-1" aria-label="Language">
      <button onClick={() => set("tr")} className={`${base} ${current === "tr" ? activeCls : idleCls}`} aria-pressed={current === "tr"}>TR</button>
      <span className={variant === "light" ? "text-cream/30 text-xs" : "text-foreground/30 text-xs"}>·</span>
      <button onClick={() => set("en")} className={`${base} ${current === "en" ? activeCls : idleCls}`} aria-pressed={current === "en"}>EN</button>
    </div>
  );
};