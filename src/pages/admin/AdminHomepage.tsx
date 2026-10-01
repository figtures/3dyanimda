import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSiteSettings, setSiteSetting, refreshSiteSettings } from "@/hooks/useSiteSettings";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { toast } from "@/hooks/use-toast";
import { Image as ImageIcon, Save, Loader2 } from "lucide-react";
import { resolveMediaUrl } from "@/lib/media";

type Section = {
  key: string;
  title: string;
  fields: { name: string; label: string; type: "text" | "textarea"; bilingual?: boolean }[];
  imageField?: string;
  imageCategory?: string;
};

const SECTIONS: Section[] = [
  {
    key: "hero_content",
    title: "Hero (Ana sayfa üst bölüm)",
    fields: [
      { name: "eyebrow", label: "Üst etiket", type: "text", bilingual: true },
      { name: "title", label: "Başlık", type: "textarea", bilingual: true },
      { name: "lead", label: "Açıklama", type: "textarea", bilingual: true },
      { name: "cta_primary", label: "Ana buton metni", type: "text", bilingual: true },
      { name: "cta_secondary", label: "İkinci buton metni", type: "text", bilingual: true },
    ],
    imageField: "image_url",
    imageCategory: "hero",
  },
  {
    key: "autofocus_content",
    title: "Markanın Uzmanlık Alanı",
    fields: [
      { name: "eyebrow", label: "Üst etiket", type: "text", bilingual: true },
      { name: "title", label: "Başlık", type: "textarea", bilingual: true },
      { name: "lead", label: "Açıklama", type: "textarea", bilingual: true },
      { name: "cta", label: "Buton metni", type: "text", bilingual: true },
    ],
    imageField: "image_url",
    imageCategory: "portfolio",
  },
  {
    key: "cta_content",
    title: "Alt CTA Bandı",
    fields: [
      { name: "eyebrow", label: "Üst etiket", type: "text", bilingual: true },
      { name: "title", label: "Başlık", type: "textarea", bilingual: true },
      { name: "lead", label: "Açıklama", type: "textarea", bilingual: true },
      { name: "btn_quote", label: "Teklif butonu", type: "text", bilingual: true },
      { name: "btn_talk", label: "İletişim butonu", type: "text", bilingual: true },
    ],
  },
];

const AdminHomepage = () => {
  const settings = useSiteSettings();
  const [drafts, setDrafts] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [picker, setPicker] = useState<{ section: Section } | null>(null);

  useEffect(() => { refreshSiteSettings(); }, []);
  useEffect(() => {
    const d: Record<string, any> = {};
    for (const s of SECTIONS) d[s.key] = settings[s.key] || {};
    setDrafts(d);
  }, [settings]);

  const setField = (sk: string, field: string, val: string) => {
    setDrafts((d) => ({ ...d, [sk]: { ...(d[sk] || {}), [field]: val } }));
  };

  const save = async (sk: string) => {
    setSaving(sk);
    try {
      await setSiteSetting(sk, drafts[sk] || {});
      toast({ title: "Kaydedildi" });
    } catch (e: any) {
      toast({ title: "Hata", description: e.message, variant: "destructive" });
    } finally { setSaving(null); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Ana Sayfa Bölümleri</h1>
        <p className="text-sm text-muted-foreground mt-1">Bu alanlar yalnızca seçili markanın sitesini günceller. Boş alanlarda markanın başlangıç metinleri kullanılır.</p>
      </div>

      {SECTIONS.map((section) => {
        const draft = drafts[section.key] || {};
        return (
          <Card key={section.key} className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">{section.title}</h2>
              <Button size="sm" onClick={() => save(section.key)} disabled={saving === section.key}>
                {saving === section.key ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Kaydet
              </Button>
            </div>

            {section.imageField && (
              <div className="space-y-2">
                <Label>Görsel</Label>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-20 rounded border border-border bg-muted/40 overflow-hidden grid place-items-center">
                    {draft[section.imageField] ? (
                      <img src={resolveMediaUrl(draft[section.imageField])} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setPicker({ section })}>Görsel seç</Button>
                  {draft[section.imageField] && (
                    <Button size="sm" variant="ghost" onClick={() => setField(section.key, section.imageField!, "")}>Kaldır</Button>
                  )}
                </div>
              </div>
            )}

            <Tabs defaultValue="tr">
              <TabsList>
                <TabsTrigger value="tr">Türkçe</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
              </TabsList>
              {(["tr", "en"] as const).map((lng) => (
                <TabsContent key={lng} value={lng} className="space-y-3 pt-2">
                  {section.fields.map((f) => {
                    const name = f.bilingual ? `${f.name}_${lng}` : f.name;
                    return (
                      <div key={name} className="space-y-1">
                        <Label className="text-xs">{f.label}</Label>
                        {f.type === "textarea" ? (
                          <Textarea value={draft[name] || ""} onChange={(e) => setField(section.key, name, e.target.value)} rows={2} />
                        ) : (
                          <Input value={draft[name] || ""} onChange={(e) => setField(section.key, name, e.target.value)} />
                        )}
                      </div>
                    );
                  })}
                </TabsContent>
              ))}
            </Tabs>
          </Card>
        );
      })}

      {picker && (
        <MediaPicker
          open
          onOpenChange={(v) => !v && setPicker(null)}
          category={picker.section.imageCategory}
          onSelect={(m) => { setField(picker.section.key, picker.section.imageField!, m.public_url); setPicker(null); }}
        />
      )}
    </div>
  );
};

export default AdminHomepage;