/** Inline rules that match the exported document; load the complete stylesheet
 * for interactive states, with a real stylesheet fallback when JS is disabled. */
export async function inlineCriticalCss(page) {
 return page.evaluate(()=>{
  const matches=selector=>{
   const normalized=selector.replace(/::[\w-]+(?:\([^)]*\))?/g,'').replace(/:(hover|active|focus-visible|focus-within|focus|visited)\b/g,'');
   try{return !!document.querySelector(normalized);}catch{return true;}
  };
  const select=rules=>Array.from(rules).map(rule=>{
   if(rule.type===CSSRule.STYLE_RULE)return matches(rule.selectorText)?rule.cssText:'';
   if(rule.cssRules && !rule.name){const inner=select(rule.cssRules);return inner?rule.cssText.slice(0,rule.cssText.indexOf('{')+1)+inner+'}':'';}
   return rule.cssText;
  }).join('\n');
  let total=0;
  for(const sheet of Array.from(document.styleSheets)){
   const link=sheet.ownerNode;
   if(!(link instanceof HTMLLinkElement)||!link.href.startsWith(location.origin+'/assets/')||link.rel!=='stylesheet')continue;
   const text=select(sheet.cssRules);const style=document.createElement('style');style.setAttribute('data-static-critical','');style.textContent=text;link.before(style);total+=text.length;
   const fallback=document.createElement('noscript');fallback.textContent=`<link rel="stylesheet" href="${link.getAttribute('href').replaceAll('&','&amp;').replaceAll('"','&quot;')}">`;link.after(fallback);
   link.rel='preload';link.as='style';link.setAttribute('fetchpriority','low');link.removeAttribute('onload');
   link.setAttribute('data-deferred-stylesheet','');
  }
  // Dynamic-import preload hints from the rendering session would otherwise
  // pull the whole application into the next document's initial request burst.
  document.querySelectorAll('link[rel="modulepreload"]').forEach(link=>link.remove());
  const hero=document.querySelector('img.immersive-image');
  if(hero&&!document.querySelector('link[data-hero-preload]')){
   const hint=document.createElement('link');hint.rel='preload';hint.as='image';hint.setAttribute('fetchpriority','high');hint.setAttribute('data-hero-preload','');
   const source=hero.parentElement?.querySelector('source[type="image/avif"]');
   if(source){hint.type='image/avif';hint.setAttribute('imagesrcset',source.getAttribute('srcset'));hint.setAttribute('imagesizes',source.getAttribute('sizes')||'100vw');hint.href=source.getAttribute('srcset').split(',')[0].trim().split(/\s+/)[0];}
   else hint.href=hero.getAttribute('src');
   const viewport=document.querySelector('meta[name=viewport]');
   if(viewport)viewport.after(hint);else document.head.append(hint);
  }
  return total;
 });
}

/** Capture a detached clone: cached preload onload may already have restored the
 * live link to stylesheet while export awaits API snapshot collection. */
export async function serializedPrerender(page) {
 return page.evaluate(async()=>{
  const rendered=await window.__renderPublicPage?.();
  const html=document.documentElement.cloneNode(true);
  if(rendered){
   const root=html.querySelector('#root');root.innerHTML=rendered.html;root.setAttribute('data-hydration','react-ssg-v1');
   const bootstrap=html.querySelector('#public-bootstrap');
   if(bootstrap){const snapshot=JSON.parse(bootstrap.textContent);snapshot.entries=snapshot.entries.filter(entry=>!['landing_pages','tenants','current_tenant_id','site_settings'].includes(new URL(JSON.parse(entry.key)[1],'https://snapshot.invalid').pathname.split('/').at(-1)));bootstrap.textContent=JSON.stringify(snapshot).replace(/</g,'\\u003c');}
   const script=document.createElement('script');script.id='public-render-state';script.type='application/json';script.textContent=JSON.stringify(rendered.state).replace(/</g,'\\u003c');html.querySelector('head').appendChild(script);
  }
  html.querySelectorAll('link[rel="modulepreload"]').forEach(link=>link.remove());
  html.querySelectorAll('link[data-deferred-stylesheet]').forEach(link=>{
   link.setAttribute('rel','preload');link.setAttribute('as','style');
   link.removeAttribute('onload');
  });
  if(html.querySelector('link[data-deferred-stylesheet]') && !html.querySelector('script[src="/deferred-styles.js"]')) {
   const loader=document.createElement('script');loader.src='/deferred-styles.js';loader.defer=true;html.querySelector('head').appendChild(loader);
  }
  return '<!doctype html>\n'+html.outerHTML;
 });
}
