import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

// This is a completeness/rendering check, not a publication or originality certificate.
// It never changes statuses, contacts Supabase, or invokes a production export.
const brands = ['3dyanimda', '3dsanayi', 'maketyanimda', 'parcayanimda'];
const themes = ['industrial', 'editorial', 'studio'];
const widths = [1440, 390];
const staticOnly = process.argv.includes('--static');
const mergedOnly = process.argv.includes('--merged');
const read = path => JSON.parse(readFileSync(path, 'utf8'));
const key = p => `${p.brand}${p.path}`;
const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const places = read('src/content/places.json');
assert.equal(places.length, 39, 'The district inventory must contain all 39 Istanbul districts.');
const services = ['3d-baski', '3d-tarama', '3d-modelleme'];
const routeContexts = new Map();
for (const service of services) routeContexts.set(`/bolgeler/istanbul/${service}`, { district: '', neighborhood: '', service });
for (const place of [...places.map(p => ({ district: p.slug, neighborhood: '', path: p.slug })), { district: 'atasehir', neighborhood: 'ornek', path: 'atasehir/ornek' }]) {
  for (const service of ['', ...services]) routeContexts.set(`/bolgeler/istanbul/${place.path}${service ? '/' + service : ''}`, { district: place.district, neighborhood: place.neighborhood, service });
}
assert.equal(routeContexts.size, 163);
const expected = new Set(brands.flatMap(brand => [...routeContexts.keys()].map(path => brand + path)));
const merged = new Map();
for (const file of ['pages.json', 'editorial-pages.json', 'search-pages.json']) {
  for (const p of read('src/content/' + file)) merged.set(key(p), p);
}
const authoringFiles = brands.map(brand => `content/authoring/local/${brand}.json`);
const useAuthoring = staticOnly && !mergedOnly && authoringFiles.every(existsSync);
const records = useAuthoring ? authoringFiles.flatMap(read) : [...merged.values()].filter(p => expected.has(key(p)));
assert.equal(records.length, 652, 'All 652 local records are required.');
assert.deepEqual(new Set(records.map(key)), expected, 'Brand and route coverage must match all 652 existing locations.');
const utilities = new Set(['/', '/hizmetler', '/sektorler', '/cozumler', '/malzemeler', '/rehber', '/bolgeler', '/hakkimizda', '/iletisim', '/teklif-al', '/araclar', '/araclar/stl-onizle', '/araclar/kesit-analizi', '/araclar/tarama-goruntuleyici', '/sss']);
const nonblank = (value, name, record, minimum = 1) => assert.ok(typeof value === 'string' && value.trim().length >= minimum, `${key(record)}: ${name} needs at least ${minimum} characters`);
const staticIssues = [];
for (const p of records) {
  try {
    assert.equal(p.status, 'draft', `${key(p)} must remain unpublished`);
    assert.equal(p.kind, 'location');
    assert.equal(p.city, 'istanbul');
    const context = routeContexts.get(p.path);
    for (const field of ['district', 'neighborhood', 'service']) assert.equal(p[field], context[field], `${key(p)}: ${field} mismatch`);
    nonblank(p.title, 'title', p, 3);
    nonblank(p.summary, 'summary', p, 60);
    nonblank(p.local_context, 'local_context', p, 200);
    nonblank(p.logistics, 'logistics', p, 120);
    nonblank(p.evidence, 'evidence', p, 20);
    assert.ok(p.reviewed_at && Number.isFinite(Date.parse(p.reviewed_at)), `${key(p)}: business/source confirmation date missing`);
    assert.ok(Array.isArray(p.sections) && p.sections.length >= 2, `${key(p)}: at least two sections`);
    for (const section of p.sections) { nonblank(section.title, 'section title', p, 3); nonblank(section.body, 'section body', p, 40); }
    assert.ok(Array.isArray(p.faq) && p.faq.length >= 2, `${key(p)}: at least two FAQs`);
    for (const f of p.faq) { nonblank(f.q, 'FAQ question', p, 10); nonblank(f.a, 'FAQ answer', p, 20); }
    assert.equal(new Set(p.faq.map(f => f.q.trim())).size, p.faq.length, `${key(p)}: duplicate FAQ question`);
    assert.equal(p.image, '', `${key(p)}: local pages must not introduce unreviewed or arbitrary imagery`);
    nonblank(p.editorial?.answer, 'direct answer', p);
    assert.ok(p.editorial.answer.length <= 1600);
    assert.ok(Array.isArray(p.editorial.takeaways) && p.editorial.takeaways.length > 0 && p.editorial.takeaways.length <= 8, `${key(p)}: takeaways missing or excessive`);
    for (const takeaway of p.editorial.takeaways) { nonblank(takeaway, 'takeaway', p); assert.ok(takeaway.length <= 500); }
    assert.ok(Array.isArray(p.editorial.relatedPaths) && p.editorial.relatedPaths.length > 0 && p.editorial.relatedPaths.length <= 12, `${key(p)}: related paths missing or excessive`);
    for (const path of p.editorial.relatedPaths) {
      assert.match(path, /^\/(?!\/)[a-z0-9/-]*$/);
      assert.ok(merged.has(p.brand + path) || expected.has(p.brand + path) || utilities.has(path), `${key(p)}: broken related path ${path}`);
    }
    assert.ok(Array.isArray(p.editorial.sources) && p.editorial.sources.length > 0 && p.editorial.sources.length <= 10, `${key(p)}: supporting sources missing or excessive`);
    for (const source of p.editorial.sources) { nonblank(source.title, 'source title', p); assert.equal(new URL(source.url).protocol, 'https:'); }
    if (p.editorial.comparison) {
      const { title, columns, rows } = p.editorial.comparison;
      nonblank(title, 'comparison title', p);
      assert.ok(columns.length >= 2 && columns.length <= 5 && rows.length <= 20);
      for (const row of rows) assert.equal(row.length, columns.length, `${key(p)}: comparison column mismatch`);
    }
    assert.doesNotMatch(JSON.stringify(p), /\b(?:TODO|TBD|Lorem ipsum)\b/i, `${key(p)}: placeholder text`);
  } catch (error) { staticIssues.push({ brand: p.brand, path: p.path, message: error.message }); }
}
mkdirSync('docs/audits', { recursive: true });
// Diagnose the existing cross-brand publication rule with its exact PostgreSQL
// token function. Never relax the .80 threshold or treat this as human review.
const { PGlite } = await import('@electric-sql/pglite');
const db = new PGlite();
let localSimilarityDiagnostic;
try {
  const migration = readFileSync('supabase/migrations/20261002120000_content_platform.sql', 'utf8');
  await db.exec(migration.slice(migration.indexOf('CREATE FUNCTION public.local_content_tokens'), migration.indexOf('CREATE FUNCTION public.validate_landing_publication')));
  const peers = new Map([...merged.values()].filter(p => p.kind === 'location').map(p => [key(p), p]));
  for (const p of records) peers.set(key(p), p);
  const { rows } = await db.query('SELECT p.rowkey, public.local_content_tokens(p.content) AS tokens FROM jsonb_to_recordset($1::jsonb) AS p(rowkey text, content text)', [JSON.stringify([...peers.values()].map(p => ({ rowkey: key(p), content: p.local_context }))) ]);
  const tokenized = rows.map(row => ({ key: row.rowkey, tokens: new Set(row.tokens) }));
  const conflicts = [];
  for (let i = 0; i < tokenized.length; i++) for (let j = i + 1; j < tokenized.length; j++) {
    const a = tokenized[i], b = tokenized[j];
    const intersection = [...a.tokens].filter(token => b.tokens.has(token)).length;
    const score = intersection / Math.max(1, a.tokens.size + b.tokens.size - intersection);
    if (score >= .80) conflicts.push({ a: a.key, b: b.key, similarity: Number(score.toFixed(4)) });
  }
  conflicts.sort((a, b) => b.similarity - a.similarity);
  localSimilarityDiagnostic = { threshold: .80, comparedRoutes: peers.size, conflictingPairs: conflicts.length, condition: 'Prospective publication of all location pages; existing DB trigger compares local_context against published location peers across every brand.', tokenFunction: 'Exact local_content_tokens SQL loaded from existing migration into isolated PGlite', samples: conflicts.slice(0, 50) };
} finally { await db.close(); }
const staticReport = {
  result: staticIssues.length ? 'fail' : 'pass', testedAt: new Date().toISOString(), input: useAuthoring ? 'authoring/local' : 'merged source',
  routes: records.length, perBrand: Object.fromEntries(brands.map(brand => [brand, records.filter(p => p.brand === brand).length])),
  inventoryHash: hash(records), publicationStatus: 'unchanged; all 652 draft',
  scope: 'Automatic field completeness, route coverage, links and source URL shape only. Not an originality or human publication approval.',
  checks: ['all 652 existing routes', 'location identity preserved', 'draft status preserved', 'required content fields', 'direct answers and FAQs', 'related route resolution', 'HTTPS source references', 'no unreviewed local images'],
  issues: staticIssues, localSimilarityDiagnostic,
};
writeFileSync('docs/audits/local-content-completeness.json', JSON.stringify(staticReport, null, 2) + '\n');
assert.deepEqual(staticIssues, [], `${staticIssues.length} local completeness failures; see docs/audits/local-content-completeness.json`);
console.log(`PASS ${records.length} local records complete; input ${staticReport.input}; all remain draft.`);
if (!staticOnly) {
  const { createServer } = await import('vite');
  const { chromium } = await import('@playwright/test');
  const port = Number(process.env.LOCAL_CONTENT_QA_PORT || 8092);
  const origin = `http://127.0.0.1:${port}`;
  const server = await createServer({ server: { host: '127.0.0.1', port, strictPort: true } });
  await server.listen();
  let browser;
  const evidence = [], failures = [];
  let cases = 0;
  try {
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--no-zygote', '--single-process', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    mkdirSync('/tmp/brand-local-previews', { recursive: true });
    await Promise.all(brands.map(async brand => {
      const page = await browser.newPage();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      page.on('pageerror', error => failures.push({ brand, message: error.message }));
      const brandRecords = records.filter(p => p.brand === brand);
      await page.goto(`${origin}${brandRecords[0].path}?tenant=${brand}`);
      await page.locator('h1').waitFor();
      assert.equal(await page.locator('.answer-card').count(), 0, `${brand}: authored draft is hidden without explicit local preview`);
      assert.notEqual(await page.locator('h1').innerText(), brandRecords[0].title, `${brand}: draft title is hidden without explicit local preview`);
      for (const theme of themes) {
        for (const p of brandRecords) {
          await page.setViewportSize({ width: widths[0], height: 960 });
          await page.goto(`${origin}${p.path}?tenant=${brand}&theme=${theme}&previewDrafts=1`);
          await page.locator('.answer-card').waitFor();
          assert.deepEqual(await page.locator('h1').allTextContents(), [p.title], `${key(p)}: one correct h1`);
          assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), origin + p.path);
          assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/);
          assert.equal(await page.locator('meta[name="description"]').getAttribute('content').then(value => value.endsWith(p.summary)), true);
          const quote = new URL(await page.locator('.content-hero a.brand-button').getAttribute('href'), origin);
          assert.equal(quote.pathname, '/teklif-al');
          assert.equal(quote.searchParams.get('application'), p.title);
          assert.equal(quote.searchParams.get('region'), [p.neighborhood === 'ornek' ? 'Örnek Mahallesi' : '', places.find(place => place.slug === p.district)?.name, 'İstanbul'].filter(Boolean).join(', '));
          if (p.service) assert.equal(quote.searchParams.get('service'), p.service, `${key(p)}: quote service context`);
          const visible = await page.locator('.content-article').innerText();
          for (const text of [p.local_context, p.logistics, p.editorial.answer, ...p.editorial.takeaways, ...p.sections.flatMap(section => [section.title, section.body])]) assert.ok(visible.includes(text), `${key(p)}: visible content mismatch`);
          const faqs = await page.locator('.content-article details').allTextContents();
          for (const faq of p.faq) assert.ok(faqs.some(text => text.includes(faq.q) && text.includes(faq.a)), `${key(p)}: FAQ missing from rendered DOM`);
          const docs = await page.locator('script[type="application/ld+json"]').evaluateAll(elements => elements.map(el => JSON.parse(el.textContent)));
          const faqDoc = docs.find(doc => doc['@type'] === 'FAQPage');
          assert.deepEqual(faqDoc?.mainEntity, p.faq.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })), `${key(p)}: FAQ JSON-LD parity`);
          assert.ok(!JSON.stringify(docs).includes('https://3dyaninda.com'), `${key(p)}: inherited source-brand schema`);
          const links = await page.locator('.article-sources a').evaluateAll(elements => elements.map(el => ({ title: el.textContent, url: el.href })));
          assert.deepEqual(links, p.editorial.sources.map(source => ({ title: source.title, url: new URL(source.url).href })), `${key(p)}: visible source links`);
          const badImages = await page.locator('main img').evaluateAll(async images => { await Promise.all(images.map(img => img.decode().catch(() => {}))); return images.filter(img => !img.naturalWidth).map(img => img.getAttribute('src')); });
          assert.deepEqual(badImages, [], `${key(p)}: image load`);
          for (const width of widths) {
            await page.setViewportSize({ width, height: 960 });
            await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `${key(p)}/${theme}/${width}: horizontal overflow`);
            cases++;
            if (theme === 'industrial' && p.path === '/bolgeler/istanbul/atasehir/ornek') await page.screenshot({ path: `/tmp/brand-local-previews/${brand}-ornek-${width}.png`, fullPage: true });
          }
          if (theme === themes[0]) evidence.push({ brand, path: p.path, title: p.title, contentHash: hash(visible), sections: p.sections.length, faqs: p.faq.length, sources: p.editorial.sources.length });
        }
        console.log(`PASS ${brand}/${theme}: ${brandRecords.length} draft routes, ${widths.length} widths`);
      }
      await page.close();
    }));
    assert.deepEqual(failures, [], 'Browser runtime errors');
    assert.equal(cases, 652 * 3 * 2);
    writeFileSync('docs/audits/rendered-local.json', JSON.stringify({ result: 'pass', testedAt: new Date().toISOString(), routes: records.length, themes, viewports: widths, cases, inventoryHash: hash(records), publicationStatus: 'unchanged; draft routes visible only in loopback development preview', scope: 'Automated local rendering; not human originality or publication approval.', checks: ['draft hidden without explicit local preview', 'full authored local content', 'FAQ JSON-LD parity', 'source links', 'single h1', 'clean canonical', 'noindex', 'no horizontal overflow', 'image loads', 'no runtime errors'], records: evidence }, null, 2) + '\n');
    console.log(`PASS ${cases} private local rendered cases across ${records.length} draft routes.`);
  } finally {
    if (browser) await browser.close();
    await server.close();
  }
}
