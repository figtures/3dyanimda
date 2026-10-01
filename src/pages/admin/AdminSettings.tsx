import { getTenantId } from "@/lib/tenant";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { ImageCropper } from "@/components/admin/ImageCropper";
import { useSiteSettings, setSiteSetting, refreshSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "@/hooks/use-toast";
import { Upload, Trash2 } from "lucide-react";

type Slot = {
  key: string;
  label: string;
  aspect: number;
  w: number;
  h: number;
  note: string;
};

const SLOTS: Slot[] = [
  { key: "logo_icon", label: "İkon logo (1:1)", aspect: 1, w: 512, h: 512, note: "Header'da metnin yanında dairesel rozet olarak kullanılır." },
  { key: "logo_wordmark", label: "Yatay logo (4:1)", aspect: 4, w: 800, h: 200, note: "İsteğe bağlı. Verildiğinde header'da ikon+yazı yerine tek görsel olarak kullanılır." },
  { key: "logo_icon_light", label: "İkon logo - koyu zemin (1:1)", aspect: 1, w: 512, h: 512, note: "Footer/CTA gibi koyu zeminlerde kullanılır." },
  { key: "logo_wordmark_light", label: "Yatay logo - koyu zemin (4:1)", aspect: 4, w: 800, h: 200, note: "Koyu zeminli yatay logo varyantı." },
];

const AdminSettings = () => {
  const settings = useSiteSettings();
  const [cropping, setCropping] = useState<{ slot: Slot; src: string } | null>(null);
  const inputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => { refreshSiteSettings(); }, []);

  const onFile = (slot: Slot, file: File) => {
    const reader = new FileReader();
    reader.onload = () => setCropping({ slot, src: reader.result as string });
    reader.readAsDataURL(file);
  };

  const handleCropped = async (blob: Blob) => {
    if (!cropping) return;
    const path = `${getTenantId()}/${cropping.slot.key}-${Date.now()}.png`;
    const { error } = await supabase.storage.from("site-assets").upload(path, blob, { upsert: true, contentType: "image/png" });
    if (error) { toast({ title: "Yükleme başarısız", description: error.message, variant: "destructive" }); return; }
    const { data: pub } = supabase.storage.from("site-assets").getPublicUrl(path);
    try {
      await setSiteSetting(cropping.slot.key, { url: pub.publicUrl, path });
      toast({ title: "Logo güncellendi" });
      setCropping(null);
    } catch (e: any) {
      toast({ title: "Kaydedilemedi", description: e.message, variant: "destructive" });
    }
  };

  const handleRemove = async (slot: Slot) => {
    const cur = settings[slot.key] as any;
    if (cur?.path) await supabase.storage.from("site-assets").remove([cur.path]);
    await setSiteSetting(slot.key, {});
    toast({ title: "Logo kaldırıldı (varsayılan kullanılıyor)" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Site Ayarları</h1>
        <p className="text-sm text-muted-foreground mt-1">Logoları yükleyin. Boş bırakılırsa kod ile çizilen varsayılan logo kullanılır.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {SLOTS.map((slot) => {
          const cur = settings[slot.key] as any;
          const dark = slot.key.endsWith("light");
          return (
            <Card key={slot.key} className="p-5 space-y-3">
              <div>
                <h3 className="font-medium">{slot.label}</h3>
                <p className="text-xs text-muted-foreground mt-1">{slot.note}</p>
              </div>
              <div className={`relative rounded-lg border border-border p-4 grid place-items-center min-h-[140px] ${dark ? "bg-primary" : "bg-muted/40"}`}>
                {cur?.url ? (
                  <img src={cur.url} alt={slot.label} className="max-h-24 max-w-full object-contain" />
                ) : (
                  <span className={`text-xs ${dark ? "text-cream/60" : "text-muted-foreground"}`}>Yüklenmedi · varsayılan</span>
                )}
              </div>
              <input
                ref={(el) => (inputsRef.current[slot.key] = el)}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(slot, f); e.target.value = ""; }}
              />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => inputsRef.current[slot.key]?.click()}>
                  <Upload className="h-4 w-4 mr-2" /> Yükle ve kırp
                </Button>
                {cur?.url && (
                  <Button size="sm" variant="ghost" onClick={() => handleRemove(slot)} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" /> Kaldır
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {cropping && (
        <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4">
          <div className="bg-card rounded-xl p-6 max-w-2xl w-full">
            <h3 className="font-display text-lg font-semibold mb-4">{cropping.slot.label}</h3>
            <ImageCropper
              src={cropping.src}
              aspect={cropping.slot.aspect}
              outputWidth={cropping.slot.w}
              outputHeight={cropping.slot.h}
              onCancel={() => setCropping(null)}
              onCropped={handleCropped}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;