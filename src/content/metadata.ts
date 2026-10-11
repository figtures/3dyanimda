import type {LandingPage} from './types';
/** Keep the full authored H1; local search titles retain the exact place and service. */
export function contentMetaTitle(page: Pick<LandingPage,'title'|'kind'>) {
  return page.title.split(':')[0].trim();
}
export function contentMetaDescription(summary: string, brand: string) {
  const text=summary.replace(/\s+/g,' ').trim();
  // A generic first sentence can erase the only route-specific information.
  // Preserve the authored summary; search engines choose their own snippet length.
  return `${brand}: ${text}`;
}
