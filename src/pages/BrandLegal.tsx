import {usePublicPage} from "@/content/public-page-query";
import { useLocation } from "react-router-dom";
import { Seo } from "@/components/site/Seo";
export default function BrandLegal() {
  const { pathname } = useLocation();
  const {data}=usePublicPage(pathname);
  const doc=data as {title_tr:string;content_tr:string}|null|undefined;
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
