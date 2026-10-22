import {test} from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {inlineCriticalCss, serializedPrerender} from './critical-css.mjs';

async function exportFixture(css) {
 const dom=new JSDOM(`<html><head><link rel="stylesheet" href="/assets/main.css"><style>${css}</style><link rel="modulepreload" href="/assets/admin.js"></head><body><h1 id="hero" class="used">Hello</h1></body></html>`,{url:'https://export.test',runScripts:'outside-only'});
 // JSDOM parses modern layer CSS but does not populate CSSStyleSheet.ownerNode.
 // Attach the same owner that the browser provides; run the production callback.
 Object.defineProperty(dom.window.document.styleSheets[0],'ownerNode',{value:dom.window.document.querySelector('link')});
 const page={evaluate:callback=>dom.window.eval(`(${callback.toString()})()`)};
 await inlineCriticalCss(page);
 return {dom,page,critical:dom.window.document.querySelector('style[data-static-critical]').textContent};
}

test('critical CSS filters nested named layers without losing cascade order or keyframes',async()=>{
 const {dom,critical}=await exportFixture(`
  @layer reset, utilities, overrides;
  @layer reset { .absent-reset {color:red} }
  @layer utilities {
   .used {color:blue;animation:pulse 1s}
   .unused {color:red}
   @media (max-width:600px) { .used {width:200px} .unused-mobile {width:900px} }
   @supports (display:grid) { @layer nested { .used {display:grid} .unused-nested {display:none} } }
  }
  @layer overrides { #hero {color:green} }
  @keyframes pulse { from {opacity:0.5} to {opacity:1} }
  @font-face { font-family:Fixture;src:url(/fixture.woff2) }
 `);
 try {
  assert.match(critical,/@layer reset, utilities, overrides;/);
  assert.match(critical,/@layer reset\s*\{\s*\}/);
  assert.match(critical,/@layer utilities\s*\{/);
  assert.match(critical,/@layer nested\s*\{/);
  assert.match(critical,/@media\s*\(max-width:600px\)/);
  assert.match(critical,/@supports\s*\(display:grid\)/);
  assert.match(critical,/@keyframes pulse/);
  assert.match(critical,/opacity:\s*0\.5/);
  assert.match(critical,/opacity:\s*1/);
  assert.match(critical,/@font-face/);
  assert.doesNotMatch(critical,/\.unused|\.absent-reset/);
  const layerNames=Array.from(dom.window.document.querySelector('style[data-static-critical]').sheet.cssRules).filter(rule=>rule.name).map(rule=>rule.name);
  assert.deepEqual(layerNames,['reset','utilities','overrides','pulse']);
 } finally {dom.window.close();}
});

test('export retains deferred complete CSS, no-JS fallback and interactive selectors',async()=>{
 const {dom,page,critical}=await exportFixture('.used:hover::before{color:red}.inserted-menu{color:blue}@media(min-width:900px){.absent{color:red}}');
 try {
  assert.match(critical,/\.used:hover::before/);
  assert.doesNotMatch(critical,/inserted-menu|@media/);
  const html=await serializedPrerender(page);
  assert.match(html,/<link rel="preload" href="\/assets\/main.css"[^>]*data-deferred-stylesheet/);
  // JSDOM outside-only serializes noscript as an inert element, unlike a
  // scripting-enabled browser. Assert its exact payload; browser test covers
  // parsing the resulting no-JS fallback in the real export.
  assert.equal(dom.window.document.querySelector('noscript').textContent,'<link rel="stylesheet" href="/assets/main.css">');
  assert.match(html,/<noscript>/);
  assert.match(html,/src="\/deferred-styles.js" defer/);
  assert.doesNotMatch(html,/modulepreload|onload=/);
 } finally {dom.window.close();}
});

test('a large utility layer contributes only matching rules to the initial payload',async t=>{
 const css=`@layer utilities{.used{padding:12px}${Array.from({length:256},(_,i)=>`.unused-utility-${i}{padding:${i}px}`).join('')}}`;
 const {dom,critical}=await exportFixture(css);
 try {
  const before=Buffer.byteLength(dom.window.document.querySelector('style:not([data-static-critical])').sheet.cssRules[0].cssText);
  const after=Buffer.byteLength(critical);
  assert.match(critical,/\.used\s*\{/);
  assert.doesNotMatch(critical,/unused-utility/);
  assert.ok(after < before * 0.1,`Expected removal of unused utility layer, got ${after}/${before} bytes`);
  t.diagnostic(`256-unused-utility fixture: ${before} → ${after} UTF-8 bytes`);
 } finally {dom.window.close();}
});
