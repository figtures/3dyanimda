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
import { Plus, Trash2, Save, Loader2, ArrowUp, ArrowDown, Image as ImageIcon } from "lucide-react";
import { resolveMediaUrl } from "@/lib/media";

type ServiceCard = {
  id: string;
  no?: string;
  title_tr?: string;
  title_en?: string;
  desc_tr?: string;
  desc_en?: string;
  image_url?: string;
  link?: string;
};

const DEFAULTS: ServiceCard[] = [
 {id:"s1",title_tr:"3D baskı & prototip",desc_tr:"İhtiyaca göre fiziksel prototip ve ürün geliştirme.",link:"/teklif-al"},
 {id:"s2",title_tr:"Tasarım & modelleme",desc_tr:"Ölçü, örnek veya eskizden üretime yönelik modelleme.",link:"/teklif-al"},
 {id:"s3",title_tr:"Maket & sunum",desc_tr:"Ölçekli modeller ve fiziksel sunum çözümleri.",link:"/teklif-al"},
 {id:"s4",title_tr:"Özel parça & küçük seri",desc_tr:"Projenize özel parça ve az adetli üretim.",link:"/teklif-al"},
];

const AdminServicesCards = () => {
  const settings = useSiteSettings();
  const [cards, setCards] = useState<ServiceCard[]>([]);
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState<string | null>(null);

  useEffect(() => { refreshSiteSettings(); }, []);
  useEffect(() => {
    const stored = settings["services_cards"];
    if (Array.isArray(stored) && stored.length) setCards(stored as ServiceCard[]);
    else setCards(DEFAULTS);
  }, [settings]);

  const update = (id: string, patch: Partial<ServiceCard>) =>
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...cards];
    const t = idx + dir;
    if (t < 0 || t >= next.length) return;
    [next[idx], next[t]] = [next[t], next[idx]];
    setCards(next);
  };

  const add = () => setCards((cs) => [...cs, { id: crypto.randomUUID(), no: `S/0${cs.length + 1}`, link: "/hizmetler" }]);
  const remove = (id: string) => setCards((cs) => cs.filter((c) => c.id !== id));

  const save = async () => {
    setSaving(true);
    try {
      await setSiteSetting("services_cards", cards);
      toast({ title: "Kaydedildi" });
    } catch (e: any) {
      toast({ title: "Hata", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Hizmet Kartları</h1>
          <p className="text-sm text-muted-foreground mt-1">Ana sayfadaki hizmet kartlarını yönetin.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={add}><Plus className="h-4 w-4 mr-2" /> Kart ekle</Button>
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Kaydet
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {cards.map((card, idx) => (
          <Card key={card.id} className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground">#{idx + 1}</span>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => move(idx, -1)} disabled={idx === 0}><ArrowUp className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => move(idx, 1)} disabled={idx === cards.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => remove(card.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Numara (örn. S/01)</Label>
                <Input value={card.no || ""} onChange={(e) => update(card.id, { no: e.target.value })} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label className="text-xs">Bağlantı URL</Label>
                <Input value={card.link || ""} onChange={(e) => update(card.id, { link: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Görsel</Label>
              <div className="flex items-center gap-3">
                <div className="w-32 h-20 rounded border border-border bg-muted/40 overflow-hidden grid place-items-center">
                  {card.image_url ? <img src={resolveMediaUrl(card.image_url)} className="w-full h-full object-cover" alt="" /> : <ImageIcon className="h-5 w-5 text-muted-foreground" />}
                </div>
                <Button size="sm" variant="outline" onClick={() => setPicker(card.id)}>Görsel seç</Button>
                {card.image_url && <Button size="sm" variant="ghost" onClick={() => update(card.id, { image_url: "" })}>Kaldır</Button>}
              </div>
            </div>
            <Tabs defaultValue="tr">
              <TabsList>
                <TabsTrigger value="tr">Türkçe</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
              </TabsList>
              <TabsContent value="tr" className="space-y-2 pt-2">
                <div className="space-y-1"><Label className="text-xs">Başlık</Label><Input value={card.title_tr || ""} onChange={(e) => update(card.id, { title_tr: e.target.value })} /></div>
                <div className="space-y-1"><Label className="text-xs">Açıklama</Label><Textarea rows={2} value={card.desc_tr || ""} onChange={(e) => update(card.id, { desc_tr: e.target.value })} /></div>
              </TabsContent>
              <TabsContent value="en" className="space-y-2 pt-2">
                <div className="space-y-1"><Label className="text-xs">Title</Label><Input value={card.title_en || ""} onChange={(e) => update(card.id, { title_en: e.target.value })} /></div>
                <div className="space-y-1"><Label className="text-xs">Description</Label><Textarea rows={2} value={card.desc_en || ""} onChange={(e) => update(card.id, { desc_en: e.target.value })} /></div>
              </TabsContent>
            </Tabs>
          </Card>
        ))}
      </div>

      {picker && (
        <MediaPicker
          open
          onOpenChange={(v) => !v && setPicker(null)}
          category="services"
          onSelect={(m) => { update(picker, { image_url: m.public_url }); setPicker(null); }}
        />
      )}
    </div>
  );
};

export default AdminServicesCards;