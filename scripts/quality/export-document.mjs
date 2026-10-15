import {JSDOM} from 'jsdom';

/** Discovery describes the exact serialized HTML we publish, not the live
 * browser DOM that may differ after React's detached server render. */
export function exportedDocumentData(html, url) {
  const dom = new JSDOM(html, {url});
  try {
    const document = dom.window.document;
    return {
      documentData: {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
        text: document.querySelector('main')?.textContent || '',
        images: [...document.querySelectorAll('main img')].map(image => image.src),
        structuredData: [...document.querySelectorAll('script[type="application/ld+json"]')].map(script => script.textContent),
      },
      semanticDate: document.querySelector('[data-content-modified]')?.getAttribute('datetime') || null,
    };
  } finally {
    dom.window.close();
  }
}
