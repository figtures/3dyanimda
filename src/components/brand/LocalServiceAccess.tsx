import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays, MapPin, PackageCheck } from "lucide-react";
import type { resolveBusinessProfile } from "@/lib/business-profile";
import "./local-service-access.css";

type Props = {
  profile: ReturnType<typeof resolveBusinessProfile>;
  context: string;
  logistics: string;
  query: string;
};

/** One shared, CMS-owned workshop profile; a service area is not a branch. */
export function LocalServiceAccess({ profile, context, logistics, query }: Props) {
  return (
    <section className="local-service-access" id="hizmet-ve-teslimat" aria-labelledby="local-service-heading">
      <p className="brand-eyebrow">BAŞLAMADAN ÖNCE</p>
      <h2 id="local-service-heading">Hizmete erişim ve teslimat</h2>
      {context && <p>{context}</p>}
      <div className="local-access-grid">
        {(profile.visitNote || profile.addressText) && <div className="local-access-card">
          <CalendarDays size={20} aria-hidden="true" />
          <h3>Atölye ve randevu</h3>
          {profile.visitNote && <p>{profile.visitNote}</p>}
          {profile.addressText && <address><MapPin size={15} aria-hidden="true" />{profile.addressText}</address>}
          {profile.googleBusinessUrl && <a href={profile.googleBusinessUrl} target="_blank" rel="noopener noreferrer">Haritada görüntüle <ArrowUpRight size={15} aria-hidden="true" /></a>}
        </div>}
        {(profile.deliveryNote || logistics) && <div className="local-access-card">
          <PackageCheck size={20} aria-hidden="true" />
          <h3>Numune ve teslimat planı</h3>
          {profile.deliveryNote && <p>{profile.deliveryNote}</p>}
          {logistics && <p>{logistics}</p>}
        </div>}
      </div>
      <Link className="local-access-contact" to={"/iletisim" + query}>Güncel iletişim ve randevu bilgileri <ArrowUpRight size={16} aria-hidden="true" /></Link>
    </section>
  );
}
