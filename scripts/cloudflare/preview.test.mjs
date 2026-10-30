import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mkdtemp, writeFile, readFile, rm, access} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {previewBuildSettings, cleanPreviewAssets} from './build-preview.mjs';
import {brands} from './config.mjs';
import worker from '../../deploy/worker.mjs';

test('Workers Builds preview selects each connected brand and only public build settings', () => {
  for (const brand of brands) {
    const {options} = previewBuildSettings({WRANGLER_CI_OVERRIDE_NAME: brand, WORKERS_CI_BRANCH: 'seo/flat-local-urls', CLOUDFLARE_API_TOKEN: 'private-token', VITE_PRIVATE_PREVIEW_HOST: 'unrelated.example'});
    assert.equal(options.define['import.meta.env.VITE_TENANT_HOST'], JSON.stringify(brand + '.com'));
    assert.equal(options.define['import.meta.env.VITE_TENANT_SLUG'], JSON.stringify(brand));
    assert.equal(options.define['import.meta.env.VITE_GA4_MEASUREMENT_ID'], '""');
    assert.equal(options.envDir, false);
    assert.equal(JSON.stringify(options).includes('private-token'), false);
    assert.equal(JSON.stringify(options).includes('unrelated.example'), false);
  }
});

test('preview fails closed on production, unknown workers and conflicting brand settings', () => {
  for (const environment of [
    {},
    {WRANGLER_CI_OVERRIDE_NAME: 'unknown'},
    {WRANGLER_CI_OVERRIDE_NAME: '3dyanimda', WORKERS_CI_BRANCH: 'main'},
    {WRANGLER_CI_OVERRIDE_NAME: '3dyanimda', WORKER_NAME: '3dsanayi'},
    {WRANGLER_CI_OVERRIDE_NAME: '3dyanimda', SITE_DOMAIN: '3dsanayi.com'},
  ]) assert.throws(() => previewBuildSettings(environment));
  assert.equal(previewBuildSettings({WORKER_NAME: '3dsanayi'}).brand, '3dsanayi');
});

test('preview removes the rejected Pages catch-all while preserving its SPA entry and headers', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'brand-preview-'));
  try {
    await writeFile(path.join(directory, '_redirects'), '/* /index.html 200\n');
    await writeFile(path.join(directory, 'index.html'), '<html>preview</html>');
    await writeFile(path.join(directory, '_headers'), '/*\n  X-Content-Type-Options: nosniff\n');
    await cleanPreviewAssets(directory);
    await assert.rejects(access(path.join(directory, '_redirects')), {code: 'ENOENT'});
    assert.equal(await readFile(path.join(directory, 'index.html'), 'utf8'), '<html>preview</html>');
    assert.match(await readFile(path.join(directory, '_headers'), 'utf8'), /nosniff/);
    await cleanPreviewAssets(directory);
  } finally {
    await rm(directory, {recursive: true, force: true});
  }
});

test('root preview entry serves client routes without indexing or production redirects', async () => {
  // JSONC here contains only full-line comments; keep the committed config under test.
  const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8').replace(/^\s*\/\/.*$/gm, ''));
  assert.deepEqual(config.previews, {vars: {RELEASE_MODE: 'preview'}});
  assert.equal(config.assets.binding, 'ASSETS');
  assert.equal(config.assets.directory, previewBuildSettings({WORKER_NAME: '3dyanimda'}).options.build.outDir);
  assert.equal(config.routes, undefined);
  assert.equal(config.route, undefined);
  assert.equal(config.name, undefined);
  const requestedPaths = [];
  const env = {...config.previews.vars, ASSETS: {fetch: async request => {
    const pathname = new URL(request.url).pathname;
    requestedPaths.push(pathname);
    return pathname === '/' ? new Response('<html>preview</html>', {headers: {'Content-Type': 'text/html'}}) : new Response('missing', {status: 404});
  }}};
  for (const pathname of ['/', '/istanbul-3d-baski', '/3d-baski', '/admin/settings']) {
    const result = await worker.fetch(new Request('https://branch.tenant.workers.dev' + pathname), env);
    assert.equal(result.status, 200);
    assert.match(result.headers.get('X-Robots-Tag'), /noindex/);
    assert.equal(result.headers.get('Location'), null);
  }
  const robots = await worker.fetch(new Request('https://branch.tenant.workers.dev/robots.txt'), env);
  assert.match(await robots.text(), /Disallow: \//);
  assert.equal(requestedPaths.includes('/redirect-manifest.json'), false);
  const missingAsset = await worker.fetch(new Request('https://branch.tenant.workers.dev/assets/missing.js'), env);
  assert.equal(missingAsset.status, 404);
});
