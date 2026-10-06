import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useContent } from "@/content/useContent";
import type { LandingPage } from "@/content/types";
import { publicationIssues } from "@/content/quality";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { editorialSchema } from "@/content/editorial";
export default function AdminContent() {
  const { data: pages = [], isLoading, isError } = useContent(true);
  const { tenant } = useTenant();
  const client = useQueryClient();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [draft, setDraft] = useState<LandingPage | null>(null);
  const [sections, setSections] = useState("[]");
  const [faq, setFaq] = useState("[]");
  const [editorial, setEditorial] = useState("{}");
  const [busy, setBusy] = useState(false);
  const edit = (p: LandingPage) => {
    setDraft({ ...p });
    setSections(JSON.stringify(p.sections, null, 2));
    setFaq(JSON.stringify(p.faq, null, 2));
    setEditorial(JSON.stringify(p.editorial || {}, null, 2));
  };
  const save = async (status: "draft" | "published") => {
    if (!draft || !tenant) return;
    setBusy(true);
    try {
      const parsedSections = JSON.parse(sections),
        parsedFaq = JSON.parse(faq);
      if (
        !Array.isArray(parsedSections) ||
        !parsedSections.every(
          (s) => typeof s.title === "string" && typeof s.body === "string",
        ) ||
        !Array.isArray(parsedFaq) ||
        !parsedFaq.every(
          (f) => typeof f.q === "string" && typeof f.a === "string",
        )
      )
        throw new Error(
          "Bölümler title/body, sorular q/a metinleri içeren diziler olmalı.",
        );
      const p = { ...draft, sections: parsedSections, faq: parsedFaq, editorial: editorialSchema.parse(JSON.parse(editorial)), status };
      const issues = publicationIssues(p, pages);
      if (status === "published" && issues.length)
        throw new Error(issues.join(" "));
      const { brand, id, updated_at, ...payload } = p;
      const result = id
        ? await supabase
            .from("landing_pages")
            .update(payload)
            .eq("id", id)
            .eq("tenant_id", tenant.id)
        : await supabase
            .from("landing_pages")
            .insert({ ...payload, tenant_id: tenant.id });
      if (result.error) throw result.error;
      await client.invalidateQueries({
        queryKey: ["landing-pages", tenant.id],
      });
      toast.success(
        status === "published"
          ? "Yayınlandı. Statik sitenin yeniden oluşturulması gerekir."
          : "Taslak kaydedildi.",
      );
      setDraft(null);
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : String((e as { message?: string }).message || e),
      );
    } finally {
      setBusy(false);
    }
  };
  const filtered = pages.filter(
    (p) =>
      (kind === "all" || p.kind === kind) &&
      (p.title + " " + p.path)
        .toLocaleLowerCase("tr-TR")
        .includes(query.toLocaleLowerCase("tr-TR")),
  );
  if (isLoading) return <p>İçerikler yükleniyor…</p>;
  if (isError)
    return (
      <p role="alert">
        İçerik tablosu yüklenemedi. Migration ve bağlantıyı kontrol edin.
      </p>
    );
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">İçerik & Hizmet Bölgeleri</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {pages.length} kayıt ·{" "}
          {pages.filter((p) => p.status === "published").length} yayında. Yer
          adı değiştirilmiş kopyalar yayın kontrolünden geçmez. Kaynak alanına
          sadece kamuya açık kaynak veya kişisel veri içermeyen işletme teyidi
          yazın.
        </p>
      </div>
      {draft ? (
        <div className="space-y-4">
          <Button variant="outline" onClick={() => setDraft(null)}>
            Listeye dön
          </Button>
          {(
            [
              "path",
              "title",
              "summary",
              "image",
              "city",
              "district",
              "neighborhood",
              "service",
            ] as const
          ).map((k) => (
            <label className="block text-sm" key={k}>
              {
                {
                  path: "URL",
                  title: "Başlık",
                  summary: "Açıklama",
                  image: "Görsel URL",
                  city: "Şehir kodu",
                  district: "İlçe kodu",
                  neighborhood: "Mahalle kodu",
                  service: "Hizmet kodu",
                }[k]
              }
              <Input
                value={draft[k]}
                onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
              />
            </label>
          ))}
          <label className="block">
            Sayfa türü
            <select
              className="border p-2 block"
              value={draft.kind}
              onChange={(e) => setDraft({ ...draft, kind: e.target.value })}
            >
              {[
                "service",
                "solution",
                "material",
                "guide",
                "location",
                "sector",
              ].map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </label>
          <label className="block">
            İçerik bölümleri (JSON: title, body)
            <Textarea
              className="min-h-60 font-mono"
              value={sections}
              onChange={(e) => setSections(e.target.value)}
            />
          </label>
          <label className="block">
            Sorular (JSON: q, a)
            <Textarea
              className="min-h-40 font-mono"
              value={faq}
              onChange={(e) => setFaq(e.target.value)}
            />
          </label>
          {draft.kind === "location" && (
            <>
              {(["local_context", "logistics", "evidence"] as const).map(
                (k) => (
                  <label className="block" key={k}>
                    {
                      {
                        local_context: "Doğrulanmış yerel içerik",
                        logistics: "Numune ve teslimat planı",
                        evidence: "Kamuya açık kaynak / işletme teyidi",
                      }[k]
                    }
                    <Textarea
                      value={draft[k]}
                      onChange={(e) =>
                        setDraft({ ...draft, [k]: e.target.value })
                      }
                    />
                  </label>
                ),
              )}
              <label className="block">
                İçerik kontrol tarihi
                <Input
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  value={draft.reviewed_at?.slice(0, 10) || ""}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      reviewed_at: e.target.value
                        ? e.target.value + "T00:00:00Z"
                        : null,
                    })
                  }
                />
              </label>
              <div className="bg-muted p-4 text-sm">
                {publicationIssues(draft, pages).map((s) => (
                  <p key={s}>• {s}</p>
                ))}
                <p className="mt-2">
                  Benzerlik sınırı editoryal bir korumadır; Google veya GEO
                  başarı puanı değildir. Sunucu diğer markalardaki yayınlarla da
                  karşılaştırır.
                </p>
              </div>
            </>
          )}
          <label className="block">Kısa yanıt, karşılaştırma ve ilişkili içerikler (JSON)
            <Textarea className="min-h-60 font-mono" value={editorial} onChange={e => setEditorial(e.target.value)} />
            <span className="text-sm text-muted-foreground">answer: kısa yanıt · takeaways: özet maddeleri · comparison: tablo · relatedPaths: ilgili sayfalar · sources: kaynaklar</span>
          </label>
          <div className="flex gap-3">
            <Button
              disabled={busy}
              variant="outline"
              onClick={() => save("draft")}
            >
              Taslağı kaydet
            </Button>
            <Button disabled={busy} onClick={() => save("published")}>
              Kontrol et ve yayınla
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-3 flex-wrap">
            <Input
              className="max-w-sm"
              placeholder="Sayfa veya bölge ara"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className="border p-2"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
            >
              <option value="all">Tüm türler</option>
              {[
                "service",
                "solution",
                "material",
                "guide",
                "location",
                "sector",
              ].map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
            <Button
              onClick={() =>
                edit({
                  path: "/bolgeler/",
                  kind: "location",
                  title: "",
                  summary: "",
                  image: "",
                  sections: [],
                  faq: [],
                  status: "draft",
                  city: "",
                  district: "",
                  neighborhood: "",
                  service: "",
                  local_context: "",
                  logistics: "",
                  evidence: "",
                  reviewed_at: null,
                })
              }
            >
              Yeni sayfa
            </Button>
          </div>
          <div className="divide-y border rounded-md">
            {filtered.map((p) => (
              <button
                className="flex justify-between gap-4 p-4 w-full text-left hover:bg-muted"
                key={p.path}
                onClick={() => edit(p)}
              >
                <span>
                  {p.title}
                  <small className="block text-muted-foreground">
                    {p.path}
                  </small>
                </span>
                <span className="text-xs">
                  {p.status === "published" ? "Yayında" : "Taslak"}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
