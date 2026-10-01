import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

type Announcement = {
  id: string;
  message_tr: string;
  message_en: string | null;
  link_url: string | null;
  link_label_tr: string | null;
  link_label_en: string | null;
  variant: string;
  starts_at: string | null;
  ends_at: string | null;
};

const variantClass: Record<string, string> = {
  info: "bg-accent-blue text-white",
  warn: "bg-yellow-500 text-black",
  promo: "bg-gold text-primary",
  danger: "bg-destructive text-destructive-foreground",
};

export const AnnouncementBar = () => {
  const { i18n } = useTranslation();
  const lng = i18n.language || "tr";
  const [item, setItem] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("announcements")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true })
        .limit(5);
      const now = Date.now();
      const active = (data ?? []).find((a: any) => {
        const s = a.starts_at ? new Date(a.starts_at).getTime() : -Infinity;
        const e = a.ends_at ? new Date(a.ends_at).getTime() : Infinity;
        return now >= s && now <= e;
      });
      if (active) {
        const key = `ann_dismiss_${active.id}`;
        if (localStorage.getItem(key) === "1") setDismissed(true);
        setItem(active as Announcement);
      }
    })();
  }, []);

  if (!item || dismissed) return null;
  const msg = (lng.startsWith("en") && item.message_en) ? item.message_en : item.message_tr;
  const label = (lng.startsWith("en") && item.link_label_en) ? item.link_label_en : item.link_label_tr;
  const cls = variantClass[item.variant] || variantClass.info;

  const dismiss = () => {
    localStorage.setItem(`ann_dismiss_${item.id}`, "1");
    setDismissed(true);
  };

  return (
    <div className={`${cls} text-sm`}>
      <div className="container-page flex items-center justify-center gap-3 py-2 text-center">
        <span className="flex-1 truncate">{msg}</span>
        {item.link_url && label && (
          item.link_url.startsWith("http") ? (
            <a href={item.link_url} target="_blank" rel="noopener noreferrer" className="underline font-medium whitespace-nowrap">{label} →</a>
          ) : (
            <Link to={item.link_url} className="underline font-medium whitespace-nowrap">{label} →</Link>
          )
        )}
        <button onClick={dismiss} aria-label="Kapat" className="opacity-70 hover:opacity-100"><X className="h-4 w-4" /></button>
      </div>
    </div>
  );
};