import { Prose } from "@/components/site/Prose";
import type { RichTextData } from "@/lib/cms/blocks";

export function RichTextBlock({ data }: { data: RichTextData }) {
  return (
    <section className="py-16 bg-background">
      <div className={data.container === "wide" ? "container-page" : "container-page max-w-3xl"}>
        <Prose>
          <div dangerouslySetInnerHTML={{ __html: data.html || "" }} />
        </Prose>
      </div>
    </section>
  );
}