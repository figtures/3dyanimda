import "./index.css";
const element=document.getElementById('root')!;
async function boot() {
  const [{default:App,preparePublicRoute},{mountApp},{publicRenderState}]=await Promise.all([
    import('./App'),import('./lib/mount-app'),import('./lib/public-render-state'),import('./lib/i18n'),
  ]);
  if(element.dataset.hydration==='react-ssg-v1'&&publicRenderState())await preparePublicRoute(location.pathname);
  mountApp(element,<App />,!!publicRenderState());
}
// Paint the exported document before fetching the interactive application.
// Plain SPA entries (including the private demo) boot immediately.
if(element.dataset.prerendered==='true'){
  const hero=element.querySelector<HTMLImageElement>('.immersive-image');
  const visibleImage=hero?.decode().catch(()=>{}) || Promise.resolve();
  void visibleImage.then(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>void boot())));
}
else void boot();
