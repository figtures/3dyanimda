import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings, setSiteSetting, refreshSiteSettings } from "@/hooks/useSiteSettings";
import { getTenantId } from "@/lib/tenant";
import { type ContactInfo, type BusinessHours, WEEKDAYS, validateContactInfo, formatPostalAddress, resolveBusinessProfile } from "@/lib/business-profile";
import { toast } from "@/hooks/use-toast";
import { Save, Loader2, Building2, MapPin, Share2, Image } from "lucide-react";

const addressKeys = ["address_street", "address_district", "address_city", "address_postal_code", "address_country"] as const;
type FieldKey = keyof ContactInfo;
type Errors = Partial<Record<FieldKey, string>>;

function editableValues(settings: Record<string, unknown>, name: string, origin: string): ContactInfo {
  const stored = (settings.contact_info || {}) as ContactInfo;
  const profile = resolveBusinessProfile(settings, { name, origin });
  const data: ContactInfo = { ...stored };
  const defaults: ContactInfo = {
    business_name: profile.name,
    business_alternate_names: profile.alternateNames.join('\n'),
    business_description: profile.description,
    visit_note: profile.visitNote,
    delivery_note: profile.deliveryNote,
    onsite_note: profile.onsiteNote,
    email: profile.email,
    phone: profile.phone,
    phone_display: profile.phoneDisplay,
    address_tr: profile.addressText,
    google_business_url: profile.googleBusinessUrl,
    ...Object.fromEntries(profile.socialLinks.map((link) => [link.key, link.url])),
    address_street: profile.address?.streetAddress,
    address_district: profile.address?.addressLocality,
    address_city: profile.address?.addressRegion,
    address_postal_code: profile.address?.postalCode,
    address_country: profile.address?.addressCountry,
    geo_latitude: profile.geo ? String(profile.geo.latitude) : undefined,
    geo_longitude: profile.geo ? String(profile.geo.longitude) : undefined,
    opening_hours: profile.openingHours,
    contact_languages: profile.availableLanguages.join('\n'),
    service_areas: profile.serviceAreas.join('\n'),
    delivery_areas: profile.deliveryAreas.join('\n'),
  };
  for (const [key, value] of Object.entries(defaults)) {
    if (!Object.prototype.hasOwnProperty.call(stored, key) && value != null) Object.assign(data, { [key]: value });
  }
  return data;
}

const AdminContactInfo = () => {
  const settings = useSiteSettings();
  const { tenant } = useTenant();
  const { hasPermission } = useAuth();
  const canEdit = hasPermission("settings.edit");
  const brandName = tenant?.name || "Seçili marka";
  const domain = tenant?.custom_domain || tenant?.domain;
  const origin = domain ? `https://${domain}` : window.location.origin;
  const [data, setData] = useState<ContactInfo>({});
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loadStatus, setLoadStatus] = useState<"loading" | "ready" | "error">("loading");
  const [reloadAttempt, setReloadAttempt] = useState(0);
  const freshSnapshot = useRef<{ tenantId: string; settings: Record<string, unknown> }>();
  const dirty = useRef(new Set<FieldKey>());
  const dataTenant = useRef<string | undefined>();

  useEffect(() => {
    let active = true;
    const tenantId = tenant?.id;
    freshSnapshot.current = undefined;
    setLoadStatus("loading");
    if (!tenantId) return () => { active = false; };
    refreshSiteSettings(tenantId).then((loaded) => {
      if (!active || getTenantId() !== tenantId) return;
      freshSnapshot.current = { tenantId, settings: loaded };
      dirty.current.clear();
      setData(editableValues(loaded, brandName, origin));
      setLoadStatus("ready");
    }).catch(() => {
      if (!active) return;
      setLoadStatus("error");
      toast({ title: "İşletme bilgileri yüklenemedi", description: "Mevcut bilgileri korumak için kaydetme kapatıldı. Yeniden deneyin.", variant: "destructive" });
    });
    return () => { active = false; };
  }, [tenant?.id, brandName, origin, reloadAttempt]);

  useEffect(() => {
    const changedTenant = dataTenant.current !== tenant?.id;
    if (changedTenant) {
      dirty.current.clear();
      setErrors({});
      dataTenant.current = tenant?.id;
    }
    if (changedTenant || dirty.current.size === 0) setData(editableValues(settings, brandName, origin));
  }, [settings, tenant?.id, brandName, origin]);

  const set = (key: FieldKey, value: ContactInfo[FieldKey]) => {
    dirty.current.add(key);
    setErrors((current) => ({ ...current, [key]: undefined }));
    setData((current) => {
      const next = { ...current, [key]: value };
      if (addressKeys.includes(key as typeof addressKeys[number])) {
        next.geo_latitude = '';
        next.geo_longitude = '';
        dirty.current.add('geo_latitude');
        dirty.current.add('geo_longitude');
        for (const addressKey of addressKeys) dirty.current.add(addressKey);
        const text = formatPostalAddress({
          streetAddress: String(next.address_street || ""),
          addressLocality: String(next.address_district || ""),
          addressRegion: String(next.address_city || ""),
          postalCode: String(next.address_postal_code || ""),
          addressCountry: String(next.address_country || ""),
        });
        next.address_tr = text;
        next.address_en = text;
        dirty.current.add("address_tr");
        dirty.current.add("address_en");
      } else if (key === "address_tr") {
        next.geo_latitude = '';
        next.geo_longitude = '';
        dirty.current.add('geo_latitude');
        dirty.current.add('geo_longitude');
        // A manually replaced address must not retain the old structured address.
        for (const addressKey of addressKeys) {
          next[addressKey] = "";
          dirty.current.add(addressKey);
        }
      }
      return next;
    });
  };

  const updateHours = (day: BusinessHours['dayOfWeek'], part: 'opens' | 'closes', value: string) => {
    const current = data.opening_hours || [];
    const existing = current.find(row => row.dayOfWeek === day);
    const next = { ...(existing || { dayOfWeek: day, opens: '', closes: '' }), [part]: value };
    set('opening_hours', [...current.filter(row => row.dayOfWeek !== day), next]);
  };

  const freshReady = loadStatus === "ready" && freshSnapshot.current?.tenantId === tenant?.id;

  const save = async () => {
    if (saving || !canEdit || !freshReady || !freshSnapshot.current) return;
    const tenantId = dataTenant.current;
    if (!tenantId || tenantId !== tenant?.id || tenantId !== getTenantId()) {
      toast({ title: "Kaydedilemedi", description: "Marka değişti. Lütfen bilgileri yeniden açın.", variant: "destructive" });
      return;
    }
    // Merge only edited fields: keep unknown settings and explicit blank values.
    const next: ContactInfo = { ...((freshSnapshot.current.settings.contact_info || {}) as ContactInfo) };
    for (const key of dirty.current) Object.assign(next, { [key]: typeof data[key] === "string" ? String(data[key]).trim() : data[key] });
    const nextErrors = validateContactInfo(next);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      toast({ title: "Bilgileri kontrol edin", description: "İşaretli alanları düzelttikten sonra kaydedebilirsiniz.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await setSiteSetting("contact_info", next, tenantId);
      if (getTenantId() !== tenantId || freshSnapshot.current?.tenantId !== tenantId) return;
      freshSnapshot.current = { tenantId, settings: { ...freshSnapshot.current.settings, contact_info: next } };
      dirty.current.clear();
      toast({ title: "İşletme bilgileri kaydedildi", description: "Canlı siteye yansıması için bu markanın sitesini yeniden yayınlayın." });
    } catch (error) {
      toast({ title: "Kaydedilemedi", description: error instanceof Error ? error.message : String(error), variant: "destructive" });
    } finally { setSaving(false); }
  };

  const field = (key: FieldKey, label: string, options: { placeholder?: string; hint?: string; multiline?: boolean; rows?: number; type?: string } = {}) => {
    const id = `business-${String(key)}`;
    return <div className="space-y-1.5" key={String(key)}>
      <Label htmlFor={id} className="text-sm">{label}</Label>
      {options.multiline ? <Textarea id={id} rows={options.rows || 3} value={String(data[key] ?? "")} onChange={(event) => set(key, event.target.value)} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${id}-error` : options.hint ? `${id}-hint` : undefined} />
        : <Input id={id} type={options.type || "text"} value={String(data[key] ?? "")} placeholder={options.placeholder} onChange={(event) => set(key, event.target.value)} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${id}-error` : options.hint ? `${id}-hint` : undefined} />}
      {options.hint && <p id={`${id}-hint`} className="text-xs text-muted-foreground">{options.hint}</p>}
      {errors[key] && <p id={`${id}-error`} className="text-xs text-destructive" role="alert">{errors[key]}</p>}
    </div>;
  };

  return <form className="space-y-6" noValidate onSubmit={(event) => { event.preventDefault(); void save(); }}>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold">İşletme Kimliği ve İletişim</h1>
        <p className="text-sm text-muted-foreground mt-2"><strong className="text-foreground">{brandName}</strong>{domain ? ` · ${domain}` : ""}</p>
        <p className="text-sm text-muted-foreground mt-1">Bu bilgiler yalnızca seçili markanın iletişim, hakkımızda ve alt bilgi alanlarında kullanılır.</p>
      </div>
      <Button size="sm" type="submit" disabled={saving || !canEdit || !freshReady || !tenant?.id} className="self-start shrink-0">
        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} {saving ? "Kaydediliyor…" : "Kaydet"}
      </Button>
    </div>
    <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
      Kaydetme bu sitenin ayarlarını günceller. Canlı sitenin ve arama motorlarına sunulan bilgilerin güncellenmesi için site yeniden yayınlanmalıdır. Google İşletme Profili üzerindeki bilgiler ayrıca Google panelinden düzenlenir.
    </div>
    {!canEdit && <p role="status" className="text-sm text-muted-foreground">Bu markanın ayarlarını düzenleme yetkiniz bulunmuyor.</p>}
    {loadStatus === "loading" && <p role="status" className="text-sm text-muted-foreground">Güncel işletme bilgileri yükleniyor…</p>}
    {loadStatus === "error" && <div role="alert" className="rounded-xl border border-destructive/30 p-4 space-y-3">
      <p className="text-sm">Güncel bilgiler yüklenemedi. Mevcut bilgilerin üzerine eksik veri yazılmaması için kaydetme kapatıldı.</p>
      <Button type="button" variant="outline" size="sm" onClick={() => setReloadAttempt((value) => value + 1)}>Yeniden dene</Button>
    </div>}

    <fieldset disabled={saving || !canEdit || !freshReady} className="space-y-6 min-w-0">
      <Card className="p-5 space-y-4">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" aria-hidden="true" /> Marka kimliği</h2>
        {field("business_name", "İşletme / marka adı", { placeholder: brandName, hint: "Müşterilerinizin bildiği gerçek marka adını kullanın. Anahtar kelime veya ilçe listesi eklemeyin." })}
        {field("business_alternate_names", "Kullanılan diğer marka yazımları", { multiline: true, rows: 2, hint: "Her satıra bu işletmenin gerçekten kullandığı bir ad veya kendi alan adını yazın. Başka işletmelerin adlarını eklemeyin." })}
        {field("business_description", "Kısa işletme açıklaması", { multiline: true, hint: "Gerçek hizmetlerinizi ve üretim yaklaşımınızı kısaca anlatın." })}
      </Card>

      <Card className="p-5 space-y-4">
        <h2 className="font-display text-lg font-semibold">İletişim</h2>
        <p className="text-xs text-muted-foreground">Kayıtlı iletişim bilgileri ve mevcut doğrulanmış bilgiler gösterilir. Bir alanı temizleyip kaydetmeniz o iletişim bilgisini sitede gizler.</p>
        <div className="grid md:grid-cols-2 gap-4">
          {field("email", "E-posta", { type: "email" })}
          {field("phone", "Telefon (uluslararası format)", { type: "tel", hint: "Ülke koduyla başlayın: +90 …" })}
          {field("phone_display", "Telefon (gösterim)", { hint: "Telefonun sayfalarda okunabilir biçimi. Boşsa telefon numarası kullanılır." })}
          {field("whatsapp", "WhatsApp numarası", { hint: "Ülke koduyla, yalnızca rakamlar. Türkiye için 90 ile başlar." })}
        </div>
        {field("contact_languages", "İletişim dilleri", { multiline: true, rows: 2, hint: "Gerçekten desteklediğiniz dilleri her satıra bir dil olacak şekilde yazın." })}
      </Card>

      <Card className="p-5 space-y-4">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" aria-hidden="true" /> Konum ve Google İşletme Profili</h2>
        {field("google_business_url", "Google İşletme Profili / Haritalar paylaşım bağlantısı", { type: "url", hint: "Kendi işletmenizi Google Haritalar'da açıp Paylaş → Bağlantıyı kopyala seçeneğini kullanın. Bu bağlantı müşterilere gösterilir; gömme kodu değildir." })}
        {field("address_street", "Mahalle, sokak ve kapı numarası")}
        <div className="grid md:grid-cols-2 gap-4">
          {field("address_district", "İlçe")}
          {field("address_city", "İl")}
          {field("address_postal_code", "Posta kodu")}
          {field("address_country", "Ülke kodu", { placeholder: "TR" })}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {field("geo_latitude", "Atölye enlemi", { hint: "Google Haritalar'dan doğruladığınız konum. Örnek biçim: 40.12345. Adres değiştiğinde koordinatlar temizlenir." })}
          {field("geo_longitude", "Atölye boylamı", { hint: "Enlemle birlikte girin. Örnek biçim: 29.12345. Konumu bilmiyorsanız iki alanı da boş bırakın." })}
        </div>
        <p className="text-xs text-muted-foreground">Adres bileşenlerini değiştirdiğinizde aşağıdaki adres metinleri aynı bilgilerle güncellenir. Yalnızca müşterilerle paylaşmak istediğiniz gerçek adresi girin.</p>
        <div className="grid md:grid-cols-2 gap-4">
          {field("address_tr", "Adres metni (TR)", { multiline: true, rows: 2, hint: "Bu metni elle değiştirirseniz eski adresin kullanılmaması için yukarıdaki adres bileşenleri temizlenir." })}
          {field("address_en", "Adres metni (EN)", { multiline: true, rows: 2 })}
          {field("location_tr", "Alt bilgi konum metni (TR)")}
          {field("location_en", "Alt bilgi konum metni (EN)")}
        </div>
        {field("map_url", "Harita yerleştirme bağlantısı", { type: "url", hint: "Google Haritalar → Paylaş → Haritayı yerleştir alanındaki src bağlantısı. Yalnızca https:// ile başlayan URL girin; iframe kodu yapıştırmayın." })}
        <div className="grid lg:grid-cols-3 gap-4">
          {field("visit_note", "Ziyaret / randevu bilgisi", { multiline: true })}
          {field("delivery_note", "Teslimat / kargo bilgisi", { multiline: true })}
          {field("onsite_note", "Yerinde hizmet bilgisi", { multiline: true })}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {field("service_areas", "Yerinde hizmet bölgeleri", { multiline: true, rows: 3, hint: "Gerçekte yerinde hizmet sunduğunuz bölgeleri her satıra bir bölge olarak yazın. Kargo kapsamını ayrı alana girin." })}
          {field("delivery_areas", "Kargo / teslimat bölgeleri", { multiline: true, rows: 3, hint: "Örneğin Türkiye. Bu alan yerinde hizmet kapsamından ayrı gösterilir." })}
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h2 className="font-display text-lg font-semibold">Çalışma saatleri</h2>
        <p className="text-xs text-muted-foreground">Yalnızca doğrulanmış düzenli çalışma saatlerini girin. Randevuyla ziyaret açıklaması ayrıca gösterilir. Boş bırakılan günler için saat yayınlanmaz.</p>
        <div className="space-y-3">
          {WEEKDAYS.map(day => {
            const hours = data.opening_hours?.find(row => row.dayOfWeek === day.key);
            return <div key={day.key} className="grid grid-cols-2 sm:grid-cols-[9rem_1fr_1fr_auto] gap-3 items-center">
              <span className="text-sm">{day.label}</span>
              <div><Label className="sr-only" htmlFor={`hours-${day.key}-opens`}>{day.label} açılış</Label><Input id={`hours-${day.key}-opens`} type="time" value={hours?.opens || ''} onChange={event => updateHours(day.key, 'opens', event.target.value)} /></div>
              <div><Label className="sr-only" htmlFor={`hours-${day.key}-closes`}>{day.label} kapanış</Label><Input id={`hours-${day.key}-closes`} type="time" value={hours?.closes || ''} onChange={event => updateHours(day.key, 'closes', event.target.value)} /></div>
              <Button type="button" variant="ghost" size="sm" aria-label={`${day.label} saatlerini temizle`} disabled={!hours} onClick={() => set('opening_hours', (data.opening_hours || []).filter(row => row.dayOfWeek !== day.key))}>Temizle</Button>
            </div>;
          })}
        </div>
        {errors.opening_hours && <p className="text-xs text-destructive" role="alert">{errors.opening_hours}</p>}
      </Card>

      <Card className="p-5 space-y-4">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2"><Share2 className="h-5 w-5 text-primary" aria-hidden="true" /> Sosyal medya hesapları</h2>
        <p className="text-xs text-muted-foreground">Yalnızca bu markaya ait hesapları ekleyin. Bağlantıyı temizleyip kaydettiğinizde ilgili ikon ve işletme bağlantısı gizlenir.</p>
        <div className="grid md:grid-cols-2 gap-4">
          {field("instagram", "Instagram profil bağlantısı", { type: "url" })}
          {field("facebook", "Facebook sayfa bağlantısı", { type: "url" })}
          {field("linkedin", "LinkedIn sayfa bağlantısı", { type: "url" })}
          {field("youtube", "YouTube kanal bağlantısı", { type: "url" })}
          {field("twitter", "X / Twitter profil bağlantısı", { type: "url" })}
          {field("tiktok", "TikTok profil bağlantısı", { type: "url" })}
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2"><Image className="h-5 w-5 text-primary" aria-hidden="true" /> Hakkımızda</h2>
        {field("about_title", "Hakkımızda başlığı")}
        {field("about_text", "İşletme hikâyesi ve çalışma yaklaşımı", { multiline: true, rows: 6, hint: "Ekibinizi, gerçek üretim yöntemlerinizi ve müşterilerin sizinle nasıl çalışabileceğini anlatın." })}
        {field("about_image_url", "Atölye / ekip fotoğrafı bağlantısı", { type: "url", hint: "Medya kütüphanesine yüklediğiniz gerçek bir fotoğrafın HTTPS bağlantısını kullanın." })}
        {field("about_image_alt", "Fotoğraf açıklaması", { hint: "Fotoğrafta ne olduğunu kısa ve anlaşılır biçimde açıklayın." })}
      </Card>

      <Card className="p-5 space-y-4">
        <h2 className="font-display text-lg font-semibold">Yüzen iletişim butonları</h2>
        <p className="text-xs text-muted-foreground">Sitenin sağ alt köşesindeki butonlar. İlgili numara boşsa buton gösterilmez.</p>
        {([
          ["floating_enabled", "Yüzen butonları göster", data.floating_enabled !== false],
          ["floating_whatsapp", "WhatsApp butonu", data.floating_whatsapp !== false],
          ["floating_phone", "Telefon butonu", data.floating_phone === true],
        ] as const).map(([key, label, checked]) => <div className="flex items-center justify-between gap-3" key={key}>
          <Label htmlFor={`business-${key}`} className="text-sm">{label}</Label>
          <Switch id={`business-${key}`} checked={checked} onCheckedChange={(value) => set(key, value)} />
        </div>)}
      </Card>
    </fieldset>
  </form>;
};

export default AdminContactInfo;
