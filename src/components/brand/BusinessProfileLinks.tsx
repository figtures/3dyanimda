import { ArrowUpRight, MapPin } from "lucide-react";
import type { resolveBusinessProfile } from "@/lib/business-profile";

type Profile = ReturnType<typeof resolveBusinessProfile>;

/** Public account links use the same validated values as the business schema. */
export function BusinessProfileLinks({ profile, includeMap = true }: { profile: Profile; includeMap?: boolean }) {
  const links = [
    ...(includeMap && profile.googleBusinessUrl ? [{ key: "google", label: "Google Haritalar", url: profile.googleBusinessUrl }] : []),
    ...profile.socialLinks,
  ];
  if (!links.length) return null;
  return (
    <nav className="business-profile-links" aria-label={`${profile.name} işletme ve sosyal medya profilleri`}>
      <ul>
        {links.map(link => (
          <li key={link.key}>
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.key === "google" && <MapPin size={16} aria-hidden="true" />}
              {link.label}<ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
