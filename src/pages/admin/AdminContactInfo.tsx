import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSiteSettings, setSiteSetting, refreshSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";

type ContactInfo = {
  email?: string;
  phone?: string;
  phone_display?: string;
  whatsapp?: string;
  address_tr?: string;
  address_en?: string;
  location_tr?: string;
  location_en?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  youtube?: string;
  twitter?: string;
  map_url?: string;
  floating_enabled?: boolean;
  floating_whatsapp?: boolean;
  floating_phone?: boolean;
};

const AdminContactInfo = () => {
  const settings = useSiteSettings();
  const [data, setData] = useState<ContactInfo>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { refreshSiteSettings(); }, []);
  useEffect(() => { setData((settings["contact_info"] as ContactInfo) || {}); }, [settings]);

  const set = (k: keyof ContactInfo, v: string) => setData((d) => ({ ...d, [k]: v }));
  const setBool = (k: keyof ContactInfo, v: boolean) => setData((d) => ({ ...d, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await setSiteSetting("contact_info", data);
      toast({ title: "Kaydedildi" });
    } catch (e: any) {
      toast({ title: "Hata", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const field = (k: keyof ContactInfo, label: string, placeholder?: string) => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input value={(data[k] as string) || ""} placeholder={placeholder} onChange={(e) => set(k, e.target.value)} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">İletişim & Sosyal Medya</h1>
          <p className="text-sm text-muted-foreground mt-1">Footer ve iletişim sayfasında kullanılır. Boş bırakılanlar için varsayılanlar gösterilir.</p>
        </div>
        <Button size="sm" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Kaydet
        </Button>
      </div>

      <Card className="p-5 space-y-3">
        <h2 className="font-display text-lg font-semibold">İletişim</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {field("email", "E-posta", "info@3dyaninda.com")}
          {field("phone", "Telefon (E.164)", "+905551112233")}
          {field("phone_display", "Telefon (gösterim)", "+90 555 111 22 33")}
          {field("whatsapp", "WhatsApp numarası", "905551112233")}
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Adres (TR)</Label>
            <Textarea rows={2} value={data.address_tr || ""} onChange={(e) => set("address_tr", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Adres (EN)</Label>
            <Textarea rows={2} value={data.address_en || ""} onChange={(e) => set("address_en", e.target.value)} />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {field("location_tr", "Footer konum metni (TR)", "İstanbul, Beylikdüzü · Türkiye geneli hizmet")}
          {field("location_en", "Footer konum metni (EN)", "Istanbul, Beylikdüzü · Service across Türkiye")}
        </div>
        {field("map_url", "Google Maps gömme/iframe URL")}
        <p className="text-[11px] text-muted-foreground -mt-1">
          Google Maps'te konumu açın → "Paylaş" → "Haritayı yerleştir" → src bağlantısını kopyalayın.
        </p>
      </Card>

      <Card className="p-5 space-y-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Yüzen İletişim Butonları</h2>
          <p className="text-xs text-muted-foreground mt-1">Sitenizin sağ alt köşesinde sabit WhatsApp ve telefon butonları gösterilir.</p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <Label className="text-sm font-medium">Yüzen butonları göster</Label>
              <p className="text-[11px] text-muted-foreground">Tüm sayfalarda görünür.</p>
            </div>
            <Switch checked={data.floating_enabled !== false} onCheckedChange={(v) => setBool("floating_enabled", v)} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label className="text-sm">WhatsApp butonu</Label>
            <Switch checked={data.floating_whatsapp !== false} onCheckedChange={(v) => setBool("floating_whatsapp", v)} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label className="text-sm">Telefon butonu</Label>
            <Switch checked={data.floating_phone !== false} onCheckedChange={(v) => setBool("floating_phone", v)} />
          </div>
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <h2 className="font-display text-lg font-semibold">Sosyal Medya</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {field("instagram", "Instagram URL", "https://instagram.com/3dyaninda")}
          {field("facebook", "Facebook URL")}
          {field("linkedin", "LinkedIn URL")}
          {field("youtube", "YouTube URL")}
          {field("twitter", "X / Twitter URL")}
        </div>
      </Card>
    </div>
  );
};

export default AdminContactInfo;