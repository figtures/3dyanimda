/** Yield expensive hydration until the readable export has actually painted.
 * Input and background tabs boot immediately; the fallback is bounded. */
export function firstContentPaint():Promise<void>{
 if(document.visibilityState==='hidden'||performance.getEntriesByType('paint').some(e=>e.name==='first-contentful-paint')||!globalThis.PerformanceObserver?.supportedEntryTypes?.includes('paint'))return Promise.resolve();
 return new Promise(resolve=>{
  let timer:ReturnType<typeof setTimeout>;
  const done=()=>{observer.disconnect();clearTimeout(timer);window.removeEventListener('pointerdown',done,true);window.removeEventListener('keydown',done,true);resolve();};
  const observer=new PerformanceObserver(list=>{if(list.getEntries().some(e=>e.name==='first-contentful-paint'))done();});
  observer.observe({type:'paint',buffered:true});
  window.addEventListener('pointerdown',done,{once:true,capture:true});window.addEventListener('keydown',done,{once:true,capture:true});timer=setTimeout(done,1000);
 });
}
