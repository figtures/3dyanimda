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
   link.rel='preload';link.as='style';link.setAttribute('fetchpriority','low');link.setAttribute('onload',"this.onload=null;this.rel='stylesheet'");
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
   document.head.prepend(hint);
  }
  return total;
 });
}

/** Capture a detached clone: cached preload onload may already have restored the
 * live link to stylesheet while export awaits API snapshot collection. */
export async function serializedPrerender(page) {
 return page.evaluate(()=>{
  const html=document.documentElement.cloneNode(true);
  html.querySelectorAll('link[data-deferred-stylesheet]').forEach(link=>{
   link.setAttribute('rel','preload');link.setAttribute('as','style');
   link.setAttribute('onload',"this.onload=null;this.rel='stylesheet'");
  });
  return '<!doctype html>\n'+html.outerHTML;
 });
}
