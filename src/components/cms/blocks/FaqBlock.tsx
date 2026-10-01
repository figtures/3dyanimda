import { FAQ } from "@/components/site/FAQ";
import type { FaqBlockData } from "@/lib/cms/blocks";

export function FaqBlock({ data }: { data: FaqBlockData }) {
  if (!data.items?.length) return null;
  return <FAQ items={data.items} />;
}