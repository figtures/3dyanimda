import {useEffect,useRef,useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card} from '@/components/ui/card';
import {supabase} from '@/lib/supabase';
import {getTenantId} from '@/lib/tenant';
import {useBrand} from '@/brands/config';
import {useAuth} from '@/hooks/useAuth';
import {setSiteSetting,refreshSiteSettings} from '@/hooks/useSiteSettings';
import {brandAsset,type BrandAssetKey} from '@/lib/brand-assets';
import {prepareBrandUpload} from '@/lib/brand-upload';
import {toast} from '@/hooks/use-toast';
import {Upload,RotateCcw,Download} from 'lucide-react';
const slots:{key:BrandAssetKey;label:string;note:string}[]=[
 {key:'logo_wordmark',label:'Yatay logo',note:'Açık zeminli üst menü. Sembol ve marka yazısı birlikte.'},
 {key:'logo_wordmark_light',label:'Yatay logo · koyu zemin',note:'Koyu tema ve alt alan için açık renkli sürüm.'},
 {key:'logo_icon',label:'Sembol',note:'Kare tuval üzerinde yalnızca amblem.'},
 {key:'logo_icon_light',label:'Sembol · koyu zemin',note:'Kare tuval üzerinde açık renkli amblem.'},
 {key:'logo_text',label:'Marka yazısı',note:'Yalnızca yazı; SVG metinleri eğrilere dönüştürülmüş olmalı.'},
 {key:'logo_text_light',label:'Marka yazısı · koyu zemin',note:'Açık renkli, yalnızca yazı sürümü.'},
 {key:'favicon',label:'Favicon',note:'Tarayıcı sekmesi ve arama sonuçları. Kare PNG, en az 96 × 96 px.'},
 {key:'apple_touch_icon',label:'Apple dokunma simgesi',note:'Ana ekrana eklenen site simgesi. Kare PNG, en az 180 × 180 px.'},
 {key:'og_image',label:'Varsayılan paylaşım görseli',note:'Tam 1200 × 630 px PNG/JPEG. Sayfaya özel SEO görseli varsa öncelik ondadır.'},
 {key:'organization_logo',label:'Arama motoru kuruluş logosu',note:'JSON-LD için açık zeminde kare PNG; önerilen 512 × 512 px, en az 112 px.'},
];
export default function AdminSettings(){
 const brand=useBrand(),{hasPermission}=useAuth();
 const [busy,setBusy]=useState<string|null>(null),inputs=useRef<Record<string,HTMLInputElement|null>>({});
 const canUpload=hasPermission('settings.edit')&&hasPermission('media.upload');
 useEffect(()=>{refreshSiteSettings().catch(()=>toast({title:'Ayarlar yüklenemedi',variant:'destructive'}));},[brand.slug]);
 async function upload(key:BrandAssetKey,file:File){
  const tenantId=getTenantId();if(!tenantId||busy||!canUpload)return;
  setBusy(key);let uploadedPath:string|undefined;
  try{
   const asset=await prepareBrandUpload(file,key);
   if(getTenantId()!==tenantId)throw new Error('Marka değişti. Lütfen tekrar deneyin.');
   const path=`${tenantId}/branding/${key}-${crypto.randomUUID()}.${asset.extension}`;
   const {error}=await supabase.storage.from('site-assets').upload(path,asset.blob,{upsert:false,contentType:asset.mime,cacheControl:'31536000'});if(error)throw error;uploadedPath=path;
   const {data}=supabase.storage.from('site-assets').getPublicUrl(path);
   await setSiteSetting(key,{url:data.publicUrl,path,width:asset.width,height:asset.height,mime:asset.mime,alt:brand.name,updated_at:new Date().toISOString()},tenantId);
   uploadedPath=undefined;toast({title:'Görsel kaydedildi'});
  }catch(error){if(uploadedPath)await supabase.storage.from('site-assets').remove([uploadedPath]);toast({title:'Görsel kaydedilemedi',description:error instanceof Error?error.message:String(error),variant:'destructive'});}
  finally{setBusy(null);}
 }
 async function reset(key:BrandAssetKey){
  if(busy)return;setBusy(key);
  try{await setSiteSetting(key,{});toast({title:'Varsayılan görsel kullanılıyor'});}catch(error){toast({title:'Kaydedilemedi',description:error instanceof Error?error.message:String(error),variant:'destructive'});}finally{setBusy(null);}
 }
 return <div className="space-y-6"><div><h1 className="font-display text-2xl font-semibold">Marka görselleri</h1><p className="text-sm text-muted-foreground mt-2">{brand.name} · Logo, favicon ve paylaşım görsellerini buradan yönetin. SVG dosyaları kırpılmadan vektör olarak korunur. En fazla 2 MB.</p><p className="text-sm text-muted-foreground mt-2">Görseller önizlemede kaydedilince güncellenir. Canlı sitenin arama motoru ve sosyal paylaşım önizlemeleri için site yeniden yayınlanmalıdır; platform önbellekleri daha geç yenilenebilir.</p>{brand.slug==='3dsanayi'&&<p className="text-sm mt-2">Varsayılan 3S logosu, tasarım sohbetindeki en son çalışmadır; son seçim henüz doğrulanmadı.</p>}</div>
 <div className="grid md:grid-cols-2 gap-4">{slots.map(slot=>{const asset=brandAsset(brand.slug,slot.key,brand.settings),dark=slot.key.endsWith('_light');return <Card key={slot.key} className="p-5 space-y-3"><div><h2 className="font-medium">{slot.label}</h2><p className="text-xs text-muted-foreground mt-1">{slot.note}</p></div><div className={`rounded-lg border border-border p-4 grid place-items-center min-h-[150px] ${dark?'bg-slate-900':'bg-white'}`}><img src={asset.url} alt={`${brand.name} ${slot.label}`} className="max-h-32 max-w-full object-contain"/></div><p className="text-xs text-muted-foreground">{asset.width&&asset.height?`${Math.round(asset.width)} × ${Math.round(asset.height)} · `:''}{asset.mime||'Görsel'}</p><input ref={el=>{inputs.current[slot.key]=el;}} type="file" hidden accept={slot.key.startsWith('logo_')?'.svg,.png,.jpg,.jpeg,.webp':'.png,.jpg,.jpeg'} onChange={event=>{const file=event.target.files?.[0];if(file)void upload(slot.key,file);event.target.value='';}}/><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={Boolean(busy)||!canUpload} onClick={()=>inputs.current[slot.key]?.click()}><Upload className="h-4 w-4 mr-2"/>{busy===slot.key?'Kaydediliyor…':'Görsel yükle'}</Button><Button size="sm" variant="ghost" disabled={Boolean(busy)||!hasPermission('settings.edit')} onClick={()=>void reset(slot.key)}><RotateCcw className="h-4 w-4 mr-2"/>Varsayılana dön</Button><Button size="sm" variant="ghost" asChild><a href={asset.url} download target="_blank" rel="noopener noreferrer" aria-label={`${slot.label} dosyasını aç`}><Download className="h-4 w-4 mr-2"/>Dosyayı aç</a></Button></div></Card>;})}</div></div>;
}
