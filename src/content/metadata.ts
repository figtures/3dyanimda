import type {LandingPage} from './types';
/** Keep the full authored H1; local search titles retain the exact place and service. */
export function contentMetaTitle(page: Pick<LandingPage,'title'|'kind'>) {
  return page.title.split(':')[0].trim();
}
export function contentMetaDescription(summary: string, brand: string) {
  const text=summary.replace(/\s+/g,' ').trim();
  const first=text.match(/^.*?[.!?](?:\s|$)/)?.[0].trim();
  return `${brand}: ${text.length>160 && first ? first : text}`;
}
