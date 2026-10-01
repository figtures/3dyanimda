import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTenant } from "@/contexts/TenantContext";
import { supabase } from "@/lib/supabase";
import { Seo } from "@/components/site/Seo";
export default function BrandLegal() {
  const { tenant } = useTenant();
  const { pathname } = useLocation();
  const [doc, setDoc] = useState<{
    title_tr: string;
    content_tr: string;
  } | null>(null);
  useEffect(() => {
    let active = true;
    setDoc(null);
    supabase
      .from("legal_documents")
      .select("title_tr,content_tr")
      .eq("tenant_id", tenant!.id)
      .eq("slug", pathname.slice(1))
      .maybeSingle()
      .then(({ data }) => {
        if (active) setDoc(data);
      });
    return () => {
      active = false;
    };
  }, [tenant?.id, pathname]);
  return (
    <>
      <Seo
        title={doc?.title_tr || "Gizlilik ve yasal bilgiler"}
        description="Markaya ait yasal belgeler."
        path={pathname}
        noindex={!doc}
      />
      <section className="brand-inner">
        <p className="brand-eyebrow">BİLGİLENDİRME</p>
        <h1>{doc?.title_tr || "Gizlilik bilgileri"}</h1>
        {doc ? (
          <div className="legal-prose whitespace-pre-wrap">
            {doc.content_tr}
          </div>
        ) : (
          <p className="section-lead">
            Bu markanın yasal bilgileri henüz yayımlanmadı.
          </p>
        )}
      </section>
    </>
  );
}
