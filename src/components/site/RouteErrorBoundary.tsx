import { useRouteError, useRevalidator } from 'react-router-dom';
import { isAssetLoadError } from '@/lib/asset-recovery';
export function RouteErrorBoundary(){
 const error=useRouteError(), revalidator=useRevalidator(), asset=isAssetLoadError(error);
 return <section role="alert" style={{maxWidth:680,margin:'80px auto',padding:24,fontFamily:'system-ui'}}>
  <h1>{asset?'Yeni sürümü açalım.':'Sayfa şu anda açılamadı.'}</h1>
  <p>{asset?'Sayfanın gerekli dosyası yüklenemedi. Sayfayı yenileyerek güncel sürümü açabilirsiniz.':'Bağlantıyı kontrol edip yeniden deneyin.'}</p>
  <button type="button" disabled={revalidator.state==='loading'} onClick={()=>asset?location.reload():revalidator.revalidate()} style={{padding:'12px 20px',borderRadius:8,border:'1px solid currentColor',cursor:'pointer'}}>{asset?'Sayfayı yenile':'Tekrar dene'}</button>
  <a href="/" style={{marginLeft:20}}>Anasayfa</a>
 </section>;
}
