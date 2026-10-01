import { ComponentType } from "react";
import { FilePlus2, Inbox, Briefcase, Quote, HelpCircle, Image as ImageIcon, Palette, Languages, ExternalLink, Megaphone } from "lucide-react";

export type AdminAction = {
  id: string;
  label: string;
  description?: string;
  icon: ComponentType<{ className?: string }>;
  to?: string;
  external?: boolean;
  keywords?: string;
};

export const ADMIN_ACTIONS: AdminAction[] = [
  { id: "new-blog", label: "Yeni blog yazısı", icon: FilePlus2, to: "/admin/blog/new", keywords: "yazi makale post create" },
  { id: "new-portfolio", label: "Yeni portfolyo projesi", icon: Briefcase, to: "/admin/portfolio?new=1", keywords: "proje case" },
  { id: "new-testimonial", label: "Yeni referans", icon: Quote, to: "/admin/testimonials?new=1", keywords: "yorum musteri" },
  { id: "new-faq", label: "Yeni SSS sorusu", icon: HelpCircle, to: "/admin/faq?new=1", keywords: "soru cevap" },
  { id: "new-job", label: "Yeni iş ilanı", icon: Briefcase, to: "/admin/jobs?new=1", keywords: "kariyer pozisyon" },
  { id: "new-announcement", label: "Yeni duyuru", icon: Megaphone, to: "/admin/announcements?new=1", keywords: "banner" },
  { id: "upload-media", label: "Görsel yükle", icon: ImageIcon, to: "/admin/media?upload=1", keywords: "resim foto medya" },
  { id: "go-requests", label: "Teklif kutusunu aç", icon: Inbox, to: "/admin/requests", keywords: "inbox" },
  { id: "go-theme", label: "Tema ayarlarını aç", icon: Palette, to: "/admin/theme", keywords: "renk font" },
  { id: "go-translations", label: "Çevirileri aç", icon: Languages, to: "/admin/translations", keywords: "tr en dil" },
  { id: "open-site", label: "Siteyi yeni sekmede aç", icon: ExternalLink, to: "/", external: true, keywords: "preview public" },
];