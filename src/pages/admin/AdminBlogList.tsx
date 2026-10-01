import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { resolveMediaUrl } from "@/lib/media";

type Post = {
  id: string;
  slug: string;
  title: string;
  cover_image_url: string | null;
  published: boolean;
  published_at: string | null;
  updated_at: string;
};

const AdminBlogList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, slug, title, cover_image_url, published, published_at, updated_at")
      .order("updated_at", { ascending: false });
    if (error) toast.error(error.message);
    setPosts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const togglePublish = async (p: Post) => {
    const next = !p.published;
    const { error } = await supabase
      .from("blog_posts")
      .update({ published: next, published_at: next ? new Date().toISOString() : null })
      .eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success(next ? "Yayınlandı" : "Yayından kaldırıldı");
    load();
  };

  const remove = async (p: Post) => {
    if (!confirm(`"${p.title}" silinsin mi?`)) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Silindi");
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">Blog Yazıları</h1>
        <Link to="/admin/blog/new">
          <Button><Plus className="h-4 w-4 mr-2" /> Yeni Yazı</Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">Henüz yazı yok. İlk yazını oluştur.</div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 w-20"></th>
                <th className="px-4 py-3">Başlık</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Güncellendi</th>
                <th className="px-4 py-3 w-32"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map(p => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    {p.cover_image_url ? <img src={resolveMediaUrl(p.cover_image_url)} alt="" className="h-10 w-14 object-cover rounded" /> : <div className="h-10 w-14 bg-muted rounded" />}
                  </td>
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.slug}</td>
                  <td className="px-4 py-3">
                    <span className={p.published ? "text-emerald-600" : "text-muted-foreground"}>
                      {p.published ? "Yayında" : "Taslak"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(p.updated_at).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => togglePublish(p)} className="p-2 hover:bg-muted rounded" title={p.published ? "Taslağa al" : "Yayınla"}>
                        {p.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <Link to={`/admin/blog/${p.id}`} className="p-2 hover:bg-muted rounded"><Edit className="h-4 w-4" /></Link>
                      <button onClick={() => remove(p)} className="p-2 hover:bg-destructive/10 text-destructive rounded"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBlogList;