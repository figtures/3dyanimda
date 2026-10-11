import { createRoot } from 'react-dom/client';
import type { ReactNode } from 'react';

/** Preserve the readable exported page while its interactive replacement loads.
 * Forms use the normal mount path so an in-progress native input is never lost. */
export function mountApp(element: HTMLElement, app: ReactNode) {
  if (element.dataset.prerendered !== 'true' || !element.querySelector('main h1') || element.querySelector('form')) {
    createRoot(element).render(app);
    return;
  }
  element.id='prerendered-root';
  const interactive=document.createElement('div');
  interactive.id='root';interactive.hidden=true;element.after(interactive);
  let frame=0;
  const ready=()=>{
    if (!interactive.querySelector('.brand-site main h1') || !interactive.querySelector('[data-pending-queries="0"]')) return;
    cancelAnimationFrame(frame);
    frame=requestAnimationFrame(()=>{
      if (!interactive.querySelector('[data-pending-queries="0"]')) return;
      observer.disconnect();element.remove();interactive.hidden=false;
    });
  };
  const observer=new MutationObserver(ready);
  observer.observe(interactive,{childList:true,subtree:true,attributes:true,attributeFilter:['data-pending-queries']});
  createRoot(interactive).render(app);
}
