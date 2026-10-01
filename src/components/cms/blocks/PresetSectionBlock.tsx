import { useEffect, useState } from "react";
import type { PresetSectionData } from "@/lib/cms/blocks";
import { supabase } from "@/lib/supabase";
import { Services as ServicesGrid } from "@/components/sections/Services";
import { Process } from "@/components/sections/Process";
import { Capabilities } from "@/components/sections/Capabilities";
import { BlockList } from "@/components/cms/BlockList";

// Shared, CMS-driven generic sections — these read their content from the
// regular admin modules (services cards, homepage, etc.) and are reusable
// across every tenant without being tied to a specific brand.
const SHARED_SECTIONS: Record<string, () => JSX.Element> = {
  services_grid: () => <ServicesGrid />,
  process: () => <Process />,
  capabilities: () => <Capabilities />,
};

function PresetFromCollection({ slug }: { slug: string }) {
  const [blocks, setBlocks] = useState<any[] | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: coll } = await supabase
        .from("collections")
        .select("id")
        .eq("slug", "cms-presets")
        .maybeSingle();
      if (!coll) { if (!cancelled) setMissing(true); return; }
      const { data: item } = await supabase
        .from("collection_items")
        .select("data, status")
        .eq("collection_id", coll.id)
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (cancelled) return;
      const itemBlocks = (item?.data as any)?.blocks;
      if (Array.isArray(itemBlocks) && itemBlocks.length) setBlocks(itemBlocks);
      else setMissing(true);
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (missing || !blocks) return null;
  return <BlockList blocks={blocks as any[]} />;
}

export function PresetSectionBlock({ data }: { data: PresetSectionData }) {
  if (data?.preset_slug) return <PresetFromCollection slug={data.preset_slug} />;
  if (data?.preset && SHARED_SECTIONS[data.preset]) return SHARED_SECTIONS[data.preset]!();
  return null;
}
