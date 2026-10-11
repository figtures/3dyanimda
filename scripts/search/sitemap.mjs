// Sitemap protocol: https://www.sitemaps.org/protocol.html
export const SITEMAP_MAX_BYTES = 52_428_800;
export const SITEMAP_MAX_URLS = 50_000;
export const SITEMAP_MAX_URL_LENGTH = 2048; // loc must be shorter than this.
const header='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
const footer='</urlset>\n';

/** Split serialized entries by both URL count and actual uncompressed UTF-8 bytes. */
export function chunkSitemapEntries(entries,{maxUrls=45_000,maxBytes=SITEMAP_MAX_BYTES}={}) {
 if(!Number.isInteger(maxUrls)||maxUrls<1||maxUrls>SITEMAP_MAX_URLS||!Number.isInteger(maxBytes)||maxBytes<1||maxBytes>SITEMAP_MAX_BYTES) throw new Error('Invalid sitemap limits');
 const overhead=Buffer.byteLength(header+footer,'utf8'),documents=[];
 let rows=[],bytes=overhead;
 const flush=()=>{if(rows.length)documents.push(header+rows.join('')+footer);rows=[];bytes=overhead;};
 for(const entry of entries) {
  const row=entry+'\n',size=Buffer.byteLength(row,'utf8');
  if(overhead+size>maxBytes)throw new Error('One sitemap entry exceeds the byte limit');
  if(rows.length>=maxUrls||bytes+size>maxBytes)flush();
  rows.push(row);bytes+=size;
 }
 flush();return documents;
}

export function validateSitemapIndex(xml,count) {
 if(count<1||count>SITEMAP_MAX_URLS||Buffer.byteLength(xml,'utf8')>SITEMAP_MAX_BYTES) throw new Error('Sitemap index is empty or exceeds protocol limits');
 return xml;
}
