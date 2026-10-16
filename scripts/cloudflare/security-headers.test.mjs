import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../../deploy/worker.mjs';
import { contentSecurityPolicy } from '../../deploy/security-headers.mjs';

const env = { SITE_DOMAIN: '3dyanimda.com', RELEASE_MODE: 'approved', ASSETS: { fetch: async request => new URL(request.url).pathname === '/redirect-manifest.json' ? new Response('', { status: 404 }) : new Response('<html></html>', { headers: { 'Content-Type': 'text/html' } }) } };
test('CSP blocks inline script handlers, plugin content and framing', () => {
  assert.match(contentSecurityPolicy, /script-src-attr 'none'/);
  assert.match(contentSecurityPolicy, /frame-ancestors 'none'/);
  assert.match(contentSecurityPolicy, /object-src 'none'/);
  const script = contentSecurityPolicy.split('; ').find(s => s.startsWith('script-src '));
  assert.doesNotMatch(script, /unsafe-inline|unsafe-eval|\*/);
});
test('public, admin, redirects and preview robots all get security headers', async () => {
  for (const url of ['https://3dyanimda.com/', 'https://3dyanimda.com/admin/reset-password', 'http://3dyanimda.com/', 'https://brand.workers.dev/robots.txt']) {
    const r = await worker.fetch(new Request(url), env);
    assert.equal(r.headers.get('X-Frame-Options'), 'DENY');
    assert.equal(r.headers.get('Content-Security-Policy'), contentSecurityPolicy);
    assert.match(r.headers.get('Strict-Transport-Security'), /max-age=/);
    if (url.includes('/admin/')) { assert.equal(r.headers.get('Referrer-Policy'), 'no-referrer'); assert.equal(r.headers.get('Cache-Control'), 'no-store'); }
  }
});
