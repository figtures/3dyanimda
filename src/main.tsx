import "./index.css";
const element=document.getElementById('root')!;
async function boot() {
  const [{default:App},{mountApp}]=await Promise.all([
    import('./App'),import('./lib/mount-app'),import('./lib/i18n'),
  ]);
  mountApp(element,<App />);
}
// Paint the exported document before fetching the interactive application.
// Plain SPA entries (including the private demo) boot immediately.
if(element.dataset.prerendered==='true'){
  const hero=element.querySelector<HTMLImageElement>('.immersive-image');
  const visibleImage=hero?.decode().catch(()=>{}) || Promise.resolve();
  void visibleImage.then(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>void boot())));
}
else void boot();
