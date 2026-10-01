import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";

export type SearchHit = {
  kind: "blog" | "quote" | "message" | "portfolio" | "testimonial" | "faq" | "job" | "media" | "application";
  id: string;
  title: string;
  subtitle?: string;
  to: string;
  badge?: string;
};

export type SearchGroup = {
  key: SearchHit["kind"];
  label: string;
  items: SearchHit[];
};

const LABELS: Record<SearchHit["kind"], string> = {
  blog: "Blog Yazıları",
  quote: "Teklif Talepleri",
  message: "Mesajlar",
  portfolio: "Portfolyo",
  testimonial: "Referanslar",
  faq: "SSS",
  job: "İş İlanları",
  media: "Medya",
  application: "İş Başvuruları",
};

const LIMIT = 5;

export function useGlobalSearch(query: string, open: boolean) {
  const { tenant } = useTenant();
  const [groups, setGroups] = useState<SearchGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open || !tenant?.id) { setGroups([]); return; }
    const q = query.trim();
    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    debounceRef.current = window.setTimeout(async () => {
      setLoading(true);
      const tid = tenant.id;
      const like = `%${q}%`;
      const hasQ = q.length > 0;

      const runs = await Promise.all([
        // blog
        (async () => {
          let qb = supabase.from("blog_posts").select("id, slug, title, published, updated_at").eq("tenant_id", tid).order("updated_at", { ascending: false }).limit(LIMIT);
          if (hasQ) qb = qb.or(`title.ilike.${like},title_en.ilike.${like},slug.ilike.${like}`);
          const { data } = await qb;
          return (data ?? []).map<SearchHit>((r: any) => ({
            kind: "blog", id: r.id, title: r.title, subtitle: `/blog/${r.slug}`,
            to: `/admin/blog/${r.id}`, badge: r.published ? "Yayında" : "Taslak",
          }));
        })(),
        // quotes
        (async () => {
          let qb = supabase.from("quote_requests").select("id, full_name, email, status, created_at").eq("tenant_id", tid).order("created_at", { ascending: false }).limit(LIMIT);
          if (hasQ) qb = qb.or(`full_name.ilike.${like},email.ilike.${like},company.ilike.${like}`);
          const { data } = await qb;
          return (data ?? []).map<SearchHit>((r: any) => ({
            kind: "quote", id: r.id, title: r.full_name ?? r.email ?? "Teklif", subtitle: r.email,
            to: `/admin/requests?focus=${r.id}`, badge: r.status,
          }));
        })(),
        // messages
        (async () => {
          let qb = supabase.from("contact_messages").select("id, full_name, email, subject, status, created_at").eq("tenant_id", tid).order("created_at", { ascending: false }).limit(LIMIT);
          if (hasQ) qb = qb.or(`full_name.ilike.${like},email.ilike.${like},subject.ilike.${like}`);
          const { data } = await qb;
          return (data ?? []).map<SearchHit>((r: any) => ({
            kind: "message", id: r.id, title: r.subject || r.full_name || "Mesaj", subtitle: r.email,
            to: `/admin/messages?focus=${r.id}`, badge: r.status,
          }));
        })(),
        // portfolio
        (async () => {
          let qb = supabase.from("portfolio_projects").select("id, title_tr, title_en, slug, published, updated_at").eq("tenant_id", tid).order("updated_at", { ascending: false }).limit(LIMIT);
          if (hasQ) qb = qb.or(`title_tr.ilike.${like},title_en.ilike.${like},slug.ilike.${like}`);
          const { data } = await qb;
          return (data ?? []).map<SearchHit>((r: any) => ({
            kind: "portfolio", id: r.id, title: r.title_tr ?? r.title_en ?? r.slug, subtitle: r.slug,
            to: `/admin/portfolio?focus=${r.id}`, badge: r.published ? "Yayında" : "Taslak",
          }));
        })(),
        // testimonials
        (async () => {
          let qb = supabase.from("testimonials").select("id, author_name, company, updated_at").eq("tenant_id", tid).order("updated_at", { ascending: false }).limit(LIMIT);
          if (hasQ) qb = qb.or(`author_name.ilike.${like},company.ilike.${like}`);
          const { data } = await qb;
          return (data ?? []).map<SearchHit>((r: any) => ({
            kind: "testimonial", id: r.id, title: r.author_name ?? "Referans", subtitle: r.company,
            to: `/admin/testimonials?focus=${r.id}`,
          }));
        })(),
        // faq
        (async () => {
          let qb = supabase.from("faq_items").select("id, question_tr, question_en").eq("tenant_id", tid).limit(LIMIT);
          if (hasQ) qb = qb.or(`question_tr.ilike.${like},question_en.ilike.${like}`);
          const { data } = await qb;
          return (data ?? []).map<SearchHit>((r: any) => ({
            kind: "faq", id: r.id, title: r.question_tr ?? r.question_en ?? "SSS",
            to: `/admin/faq?focus=${r.id}`,
          }));
        })(),
        // jobs
        (async () => {
          let qb = supabase.from("job_postings").select("id, title_tr, title_en, location, active").eq("tenant_id", tid).limit(LIMIT);
          if (hasQ) qb = qb.or(`title_tr.ilike.${like},title_en.ilike.${like},location.ilike.${like}`);
          const { data } = await qb;
          return (data ?? []).map<SearchHit>((r: any) => ({
            kind: "job", id: r.id, title: r.title_tr ?? r.title_en ?? "İlan", subtitle: r.location,
            to: `/admin/jobs?focus=${r.id}`, badge: r.active ? "Aktif" : "Pasif",
          }));
        })(),
        // media
        (async () => {
          let qb = supabase.from("media_library").select("id, filename, category").eq("tenant_id", tid).order("created_at", { ascending: false }).limit(LIMIT);
          if (hasQ) qb = qb.or(`filename.ilike.${like},alt_tr.ilike.${like},alt_en.ilike.${like}`);
          const { data } = await qb;
          return (data ?? []).map<SearchHit>((r: any) => ({
            kind: "media", id: r.id, title: r.filename, subtitle: r.category,
            to: `/admin/media?focus=${r.id}`,
          }));
        })(),
      ]);

      const kinds: SearchHit["kind"][] = ["blog","quote","message","portfolio","testimonial","faq","job","media"];
      const out: SearchGroup[] = runs
        .map((items, i) => ({ key: kinds[i], label: LABELS[kinds[i]], items }))
        .filter((g) => g.items.length > 0);
      setGroups(out);
      setLoading(false);
    }, 220);

    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  }, [query, open, tenant?.id]);

  return { groups, loading };
}