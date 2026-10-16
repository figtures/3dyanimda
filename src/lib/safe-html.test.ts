import { describe, expect, it } from 'vitest';
import { safeHtml } from './safe-html';

describe('CMS rendering trust boundary', () => {
  it('removes executable markup, handlers, clobbering and unsafe URL schemes', () => {
    const html = safeHtml('<script>alert(1)</script><img src=x onerror="alert(1)"><a href="javascript:alert(1)">link</a><svg onload="alert(1)"></svg><form id=location><input name=href></form><p style="position:fixed">copy</p>');
    expect(html).not.toMatch(/script|onerror|onload|javascript:|<svg|<form|<input|style=|id=|name=/i);
    expect(html).toContain('copy');
  });
  it('preserves formatting, lists, tables, local images and safe links', () => {
    const html = safeHtml('<h2 class="text-primary">Başlık</h2><ul><li><strong>Metin</strong></li></ul><table><tr><td colspan="2">Ölçü</td></tr></table><img src="/brand/logo.png" alt="Logo"><a href="https://example.com" target="_blank">Kaynak</a>');
    expect(html).toContain('class="text-primary"');
    expect(html).toContain('<strong>Metin</strong>');
    expect(html).toContain('colspan="2"');
    expect(html).toContain('src="/brand/logo.png"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
  it('is idempotent and handles missing content', () => {
    expect(safeHtml(null)).toBe('');
    const clean = safeHtml('<p>Hello <em>world</em></p>');
    expect(safeHtml(clean)).toBe(clean);
  });
  it('retains existing embedded raster images while rejecting active data documents', () => {
    expect(safeHtml('<img src="data:image/png;base64,aGVsbG8=">')).toContain('data:image/png;base64,aGVsbG8=');
    expect(safeHtml('<img src="data:image/svg+xml;base64,aGVsbG8=">')).not.toContain('data:');
    expect(safeHtml('<img src="data:text/html;base64,aGVsbG8=">')).not.toContain('data:');
  });
});
