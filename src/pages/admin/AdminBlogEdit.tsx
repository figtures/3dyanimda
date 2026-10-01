import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Save, Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { resolveMediaUrl } from "@/lib/media";

const slugify = (s: string) =>
  s.toLowerCase().trim()
    .replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u")
    .replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-").replace(/-+/g, "-");

const AdminBlogEdit = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "new";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [excerptEn, setExcerptEn] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data, error } = await supabase
        .from("blog_posts").select("*").eq("id", id).single();
      if (error) { toast.error(error.message); return; }
      setTitle(data.title);
      setSlug(data.slug);
      setExcerpt(data.excerpt ?? "");
      setContent(data.content ?? "");
      setTitleEn((data as any).title_en ?? "");
      setExcerptEn((data as any).excerpt_en ?? "");
      setContentEn((data as any).content_en ?? "");
      setCoverUrl(data.cover_image_url ?? "");
      setTags((data.tags ?? []).join(", "));
      setPublished(data.published);
      setSlugTouched(true);
      setLoading(false);
    })();
  }, [id, isNew]);

  useEffect(() => {
    if (!slugTouched && title) setSlug(slugify(title));
  }, [title, slugTouched]);

  const save = async () => {
    if (!title.trim() || !slug.trim()) {
      toast.error("Başlık ve slug zorunlu");
      return;
    }
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const { getTenantId } = await import("@/lib/tenant");
    const tid = getTenantId();
    if (!tid) { setSaving(false); toast.error("Tenant bulunamadı"); return; }
    const payload = {
      tenant_id: tid,
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || null,
      content,
      title_en: titleEn.trim(),
      excerpt_en: excerptEn.trim(),
      content_en: contentEn,
      cover_image_url: coverUrl || null,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      published,
      published_at: published ? new Date().toISOString() : null,
      author_id: u.user?.id,
    };
    if (isNew) {
      const { data, error } = await supabase.from("blog_posts").insert(payload).select("id").single();
      setSaving(false);
      if (error) return toast.error(error.message);
      toast.success("Oluşturuldu");
      navigate(`/admin/blog/${data.id}`);
    } else {
      const { error } = await supabase.from("blog_posts").update(payload).eq("id", id);
      setSaving(false);
      if (error) return toast.error(error.message);
      toast.success("Kaydedildi");
    }
  };

  if (loading) return <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/admin/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" /> Yazılara dön
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch checked={published} onCheckedChange={setPublished} id="pub" />
            <Label htmlFor="pub" className="text-sm">Yayında</Label>
          </div>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Kaydet
          </Button>
        </div>
      </div>

      <div className="space-y-4 bg-card border border-border rounded-lg p-6">
        <Tabs defaultValue="tr">
          <TabsList>
            <TabsTrigger value="tr">Türkçe</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>
          <TabsContent value="tr" className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label>Başlık (TR)</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Yazı başlığı" />
            </div>
            <div className="space-y-1.5">
              <Label>Özet (TR)</Label>
              <Textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>İçerik (TR)</Label>
              <div className="bg-background rounded border border-border">
                <ReactQuill theme="snow" value={content} onChange={setContent}
                  modules={{ toolbar: [[{ header: [2,3,false] }], ["bold","italic","underline","strike"], [{ list: "ordered"},{ list: "bullet"}], ["blockquote","code-block"], ["link","image"], ["clean"]] }} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="en" className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label>Title (EN)</Label>
              <Input value={titleEn} onChange={e => setTitleEn(e.target.value)} placeholder="Article title" />
            </div>
            <div className="space-y-1.5">
              <Label>Excerpt (EN)</Label>
              <Textarea value={excerptEn} onChange={e => setExcerptEn(e.target.value)} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Content (EN)</Label>
              <div className="bg-background rounded border border-border">
                <ReactQuill theme="snow" value={contentEn} onChange={setContentEn}
                  modules={{ toolbar: [[{ header: [2,3,false] }], ["bold","italic","underline","strike"], [{ list: "ordered"},{ list: "bullet"}], ["blockquote","code-block"], ["link","image"], ["clean"]] }} />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-1.5">
          <Label>Slug (URL)</Label>
          <Input value={slug} onChange={e => { setSlug(e.target.value); setSlugTouched(true); }} className="font-mono text-sm" />
          <p className="text-xs text-muted-foreground">/blog/{slug || "..."}</p>
        </div>
        <div className="space-y-1.5">
          <Label>Etiketler (virgülle ayır)</Label>
          <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="3d-baski, istanbul" />
        </div>
        <div className="space-y-1.5">
          <Label>Kapak Görseli</Label>
          <div className="flex items-center gap-3">
            {coverUrl && <img src={resolveMediaUrl(coverUrl)} alt="Kapak" className="h-16 w-24 object-cover rounded border border-border" />}
            <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
              <ImagePlus className="h-4 w-4 mr-2" /> {coverUrl ? "Değiştir" : "Seç"}
            </Button>
            {coverUrl && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setCoverUrl("")}>Kaldır</Button>
            )}
          </div>
        </div>
      </div>
      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        category="blog"
        onSelect={(m) => setCoverUrl(m.public_url)}
      />
    </div>
  );
};

export default AdminBlogEdit;