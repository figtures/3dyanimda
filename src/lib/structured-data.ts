export type BusinessIdentity = {
 name: string; origin: string; description?: string; logo?: string;
 email?: string; telephone?: string; sameAs?: string[];
 address?: {streetAddress?: string;addressLocality?: string;addressRegion?: string;addressCountry?: string};
 geo?: {latitude: number;longitude: number};
 openingHoursSpecification?: Record<string, unknown>[];
};
/** Only verified business fields are supplied; service-area pages never create fictional branches. */
export function businessGraph(identity: BusinessIdentity) {
 const {origin,name,description,logo,email,telephone,address,geo,sameAs,openingHoursSpecification}=identity;
 const organization = {'@type':'Organization','@id':origin+'/#organization',name,url:origin,description,
  ...(logo?{logo:new URL(logo,origin).href}:{}),...(email?{email}:{}),...(telephone?{telephone}:{}),...(sameAs?.length?{sameAs}:{}),
  ...((email||telephone)?{contactPoint:[{'@type':'ContactPoint',contactType:'customer service',...(email?{email}:{}),...(telephone?{telephone}:{}),availableLanguage:['Turkish']}]}:{})};
 return {'@context':'https://schema.org','@graph':[organization,{'@type':'ProfessionalService','@id':origin+'/#localbusiness',name,url:origin,parentOrganization:{'@id':origin+'/#organization'},
  ...(address?{address:{'@type':'PostalAddress',...address}}:{}),...(geo?{geo:{'@type':'GeoCoordinates',...geo}}:{}),
  ...(openingHoursSpecification?.length?{openingHoursSpecification}:{}),areaServed:{'@type':'City',name:'İstanbul'}}]};
}
export function containsLegacyIdentity(value: unknown): boolean {
 const text=JSON.stringify(value);
 return /https?:\/\/(?:www\.)?3dyaninda\.com(?:[\/"\s]|$)|sales@3dyaninda\.com|"(?:name|legalName)"\s*:\s*"3D Yanında"/i.test(text);
}
