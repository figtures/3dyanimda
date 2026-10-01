import { Link } from "react-router-dom";
import { Seo } from "@/components/site/Seo";
import { PageHero } from "@/components/site/PageHero";
import { FileText, Cookie, Shield, ScrollText, FileSignature } from "lucide-react";

const items = [
  { to: "/kvkk-aydinlatma-metni", icon: Shield, title: "KVKK Aydınlatma Metni", desc: "6698 sayılı kanun kapsamında veri sahibi haklarınız." },
  { to: "/gizlilik-politikasi", icon: FileText, title: "Gizlilik Politikası", desc: "Kişisel verilerinizin işlenme usul ve esasları." },
  { to: "/cerez-politikasi", icon: Cookie, title: "Çerez Politikası", desc: "Sitemizde kullanılan çerezler ve tercih yönetimi." },
  { to: "/kullanim-kosullari", icon: ScrollText, title: "Kullanım Koşulları", desc: "Site ve hizmet kullanım şartları." },
  { to: "/basvuru-acik-riza-metni", icon: FileSignature, title: "Açık Rıza Metni — Başvurular", desc: "İş başvurusu ve makine işletim formları için açık rıza." },
];

export default function LegalIndex() {
  return (
    <>
      <Seo title="Yasal Bilgiler" description="3D Yanında — KVKK, gizlilik, çerez politikası ve kullanım koşulları." path="/yasal" />
      <PageHero
        eyebrow="Yasal"
        title={<>Yasal <em className="text-accent-blue not-italic">Bilgiler</em></>}
        lead="6698 sayılı KVKK ve yürürlükteki Türk mevzuatı kapsamında hazırlanmış tüm yasal metinlerimiz."
        breadcrumbs={[{ label: "Anasayfa", to: "/" }, { label: "Yasal" }]}
      />
      <section className="bg-background py-20">
        <div className="container-page max-w-4xl mx-auto grid sm:grid-cols-2 gap-4">
          {items.map((it) => (
            <Link key={it.to} to={it.to} className="group rounded-2xl border border-border bg-card p-6 hover:border-accent-blue hover:shadow-md transition-all">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-blue-soft mb-4">
                <it.icon className="h-5 w-5 text-accent-blue" />
              </span>
              <h3 className="font-display text-lg font-semibold text-primary mb-1.5 group-hover:text-accent-blue transition-colors">{it.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{it.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
