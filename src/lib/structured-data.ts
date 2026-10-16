import { normalizeGoogleBusinessUrl, normalizePublicUrl, normalizeSocialUrl, SOCIAL_PROFILES } from './business-profile';

export type BusinessIdentity = {
 name: string; origin: string; description?: string; logo?: string;
 email?: string; telephone?: string; sameAs?: string[]; hasMap?: string;
 address?: {streetAddress?: string;addressLocality?: string;addressRegion?: string;addressCountry?: string;postalCode?:string};
 geo?: {latitude: number;longitude: number};
 openingHoursSpecification?: Record<string, unknown>[];
};
const profileUrl=(value:unknown)=>normalizeGoogleBusinessUrl(value)||SOCIAL_PROFILES.map(profile=>normalizeSocialUrl(profile.key,value)).find(Boolean);
/** Only verified business fields are supplied; service-area pages never create fictional branches. */
export function businessGraph(identity: BusinessIdentity) {
 const {origin,name,description,telephone,address,openingHoursSpecification}=identity;
 const logo=normalizePublicUrl(identity.logo,origin);
 const email=typeof identity.email==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity.email)?identity.email:undefined;
 const sameAs=[...new Set((Array.isArray(identity.sameAs)?identity.sameAs:[]).map(profileUrl).filter(Boolean))];
 const hasMap=normalizeGoogleBusinessUrl(identity.hasMap);
 const geo=identity.geo&&Number.isFinite(identity.geo.latitude)&&Number.isFinite(identity.geo.longitude)&&Math.abs(identity.geo.latitude)<=90&&Math.abs(identity.geo.longitude)<=180?identity.geo:undefined;
 const hasAddress=address&&Object.values(address).some(v=>typeof v==='string'&&v.trim());
 const organization = {'@type':'Organization','@id':origin+'/#organization',name,url:origin,description,
  ...(logo?{logo:new URL(logo,origin).href}:{}),...(email?{email}:{}),...(telephone?{telephone}:{}),...(sameAs?.length?{sameAs}:{}),
  ...((email||telephone)?{contactPoint:[{'@type':'ContactPoint',contactType:'customer service',...(email?{email}:{}),...(telephone?{telephone}:{}),availableLanguage:['Turkish']}]}:{})};
 return {'@context':'https://schema.org','@graph':[organization,{'@type':'WebSite','@id':origin+'/#website',url:origin,name,inLanguage:'tr-TR',publisher:{'@id':origin+'/#organization'}},...(hasAddress ? [{'@type':'ProfessionalService','@id':origin+'/#localbusiness',name,url:origin,parentOrganization:{'@id':origin+'/#organization'},
  ...(address?{address:{'@type':'PostalAddress',...address}}:{}),...(geo?{geo:{'@type':'GeoCoordinates',...geo}}:{}),...(hasMap?{hasMap}:{}),
  ...(openingHoursSpecification?.length?{openingHoursSpecification}:{}),areaServed:{'@type':'City',name:'İstanbul'}}] : [])]};
}
export function containsLegacyIdentity(value: unknown): boolean {
 const text=JSON.stringify(value);
 return /https?:\/\/(?:www\.)?3dyaninda\.com(?:[\/"\s]|$)|sales@3dyaninda\.com|"(?:name|legalName)"\s*:\s*"3D Yanında"/i.test(text);
}
