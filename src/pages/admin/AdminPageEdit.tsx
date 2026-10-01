import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, ArrowUp, ArrowDown, Trash2, Plus, ArrowLeft, ExternalLink, Eye } from "lucide-react";
import { BLOCK_LABELS, defaultBlockData, type BlockType, type CmsPage, type PageBlock } from "@/lib/cms/blocks";
import { BlockEditor } from "@/components/admin/cms/BlockEditor";

const AdminPageEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState<CmsPage | null>(null);
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addType, setAddType] = useState<BlockType>("richtext");

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const { data: p } = await supabase.from("pages").select("*").eq("id", id).maybeSingle();
    const { data: bs } = await supabase.from("page_blocks").select("*").eq("page_id", id).order("position");
    setPage(p as any);
    setBlocks((bs as any) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [id]);

  const savePage = async () => {
    if (!page) return;
    setSaving(true);
    const { error } = await supabase
      .from("pages")
      .update({ slug: page.slug, title: page.title, status: page.status, template: page.template, meta: page.meta })
      .eq("id", page.id);
    setSaving(false);
    if (error) return toast({ title: "Sayfa kaydedilemedi", description: error.message, variant: "destructive" });
    toast({ title: "Sayfa kaydedildi" });
  };

  const saveBlock = async (b: PageBlock) => {
    const { error } = await supabase
      .from("page_blocks")
      .update({ data: b.data as any, is_visible: b.is_visible, type: b.type })
      .eq("id", b.id);
    if (error) return toast({ title: "Blok kaydedilemedi", description: error.message, variant: "destructive" });
    toast({ title: "Blok kaydedildi" });
  };

  const addBlock = async () => {
    if (!page) return;
    const maxPos = blocks.length ? Math.max(...blocks.map((b) => b.position)) : 0;
    const { data, error } = await supabase
      .from("page_blocks")
      .insert({ page_id: page.id, position: maxPos + 10, type: addType, data: defaultBlockData(addType) as any, is_visible: true })
      .select()
      .single();
    if (error) return toast({ title: "Eklenemedi", description: error.message, variant: "destructive" });
    setBlocks((p) => [...p, data as any]);
  };

  const deleteBlock = async (bid: string) => {
    if (!confirm("Blok silinsin mi?")) return;
    await supabase.from("page_blocks").delete().eq("id", bid);
    setBlocks((p) => p.filter((b) => b.id !== bid));
  };

  const move = async (bid: string, dir: -1 | 1) => {
    const idx = blocks.findIndex((b) => b.id === bid);
    const swap = idx + dir;
    if (swap < 0 || swap >= blocks.length) return;
    const a = blocks[idx], b = blocks[swap];
    await supabase.from("page_blocks").update({ position: b.position }).eq("id", a.id);
    await supabase.from("page_blocks").update({ position: a.position }).eq("id", b.id);
    await load();
  };

  const updateBlockLocal = (bid: string, patch: Partial<PageBlock>) =>
    setBlocks((p) => p.map((b) => (b.id === bid ? ({ ...b, ...patch } as PageBlock) : b)));

  if (loading) return <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!page) return <div className="text-sm text-muted-foreground">Sayfa bulunamadı.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/pages" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Sayfalar
        </Link>
      </div>

      <Card className="p-5 space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">URL (slug)</label>
            <Input value={page.slug} onChange={(e) => setPage({ ...page, slug: e.target.value })} className="font-mono text-sm" />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Başlık (panel için)</label>
              <Input value={page.title || ""} onChange={(e) => setPage({ ...page, title: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Template</label>
              <Input value={page.template} onChange={(e) => setPage({ ...page, template: e.target.value })} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">SEO Title</label>
              <Input value={page.meta?.title || ""} onChange={(e) => setPage({ ...page, meta: { ...page.meta, title: e.target.value } })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">OG Image URL</label>
              <Input value={page.meta?.og_image || ""} onChange={(e) => setPage({ ...page, meta: { ...page.meta, og_image: e.target.value } })} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">SEO Description</label>
            <Textarea rows={2} value={page.meta?.description || ""} onChange={(e) => setPage({ ...page, meta: { ...page.meta, description: e.target.value } })} />
          </div>
          <div className="flex items-center gap-4">
            <label className="text-xs text-muted-foreground flex items-center gap-2">
              <Switch checked={page.status === "published"} onCheckedChange={(v) => setPage({ ...page, status: v ? "published" : "draft" })} />
              <span>Yayında</span>
              <Badge variant={page.status === "published" ? "default" : "secondary"}>{page.status}</Badge>
            </label>
            <label className="text-xs text-muted-foreground flex items-center gap-2">
              <Switch checked={!!page.meta?.no_index} onCheckedChange={(v) => setPage({ ...page, meta: { ...page.meta, no_index: v } })} />
              <span>noindex</span>
            </label>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <a href={`${page.slug}?preview=1`} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm"><Eye className="h-3 w-3 mr-1" /> Önizle</Button>
          </a>
          <a href={page.slug} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm"><ExternalLink className="h-3 w-3 mr-1" /> Canlıyı aç</Button>
          </a>
          <Button onClick={savePage} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Sayfayı kaydet
          </Button>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">İçerik blokları</h2>
        <div className="flex gap-2 items-center">
          <select value={addType} onChange={(e) => setAddType(e.target.value as BlockType)} className="border rounded-md h-9 px-2 text-sm bg-background">
            {Object.entries(BLOCK_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <Button size="sm" onClick={addBlock}><Plus className="h-4 w-4 mr-1" /> Blok ekle</Button>
        </div>
      </div>

      <div className="space-y-4">
        {blocks.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground text-sm">Henüz blok eklenmedi.</Card>
        ) : blocks.map((b, i) => (
          <Card key={b.id} className="p-5 space-y-3">
            <div className="flex items-center justify-between gap-2 border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">#{b.position}</span>
                <Badge variant="outline">{BLOCK_LABELS[b.type as BlockType] || b.type}</Badge>
                <Button size="sm" variant="ghost" onClick={() => move(b.id, -1)} disabled={i === 0}><ArrowUp className="h-3 w-3" /></Button>
                <Button size="sm" variant="ghost" onClick={() => move(b.id, 1)} disabled={i === blocks.length - 1}><ArrowDown className="h-3 w-3" /></Button>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs text-muted-foreground flex items-center gap-2">
                  <Switch checked={b.is_visible} onCheckedChange={(v) => updateBlockLocal(b.id, { is_visible: v })} />
                  Görünür
                </label>
                <Button size="sm" onClick={() => saveBlock(b)}><Save className="h-3 w-3 mr-1" /> Kaydet</Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteBlock(b.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
            <BlockEditor
              type={b.type as BlockType}
              data={b.data as any}
              onChange={(d) => updateBlockLocal(b.id, { data: d as any })}
            />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminPageEdit;