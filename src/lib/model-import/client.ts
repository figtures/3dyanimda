import { MAX_FILE_BYTES, modelExtension, type ImportedModel } from './types';
/** Each import owns a disposable worker, including CAD/WASM memory and cancellation. */
export function importModel(file:File,signal:AbortSignal):Promise<ImportedModel> {
  modelExtension(file.name);
  if(!file.size||file.size>MAX_FILE_BYTES)return Promise.reject(new Error('Dosya boş veya 20 MB sınırını aşıyor.'));
  return new Promise((resolve,reject)=>{
    if(signal.aborted){reject(new DOMException('İptal edildi','AbortError'));return;}
    const worker=new Worker(new URL('./model-import.worker.ts',import.meta.url),{type:'module'});
    let settled=false;
    const finish=(error?:Error,model?:ImportedModel)=>{if(settled)return;settled=true;clearTimeout(timer);signal.removeEventListener('abort',abort);worker.terminate();error?reject(error):resolve(model!);};
    const abort=()=>finish(new DOMException('İptal edildi','AbortError'));
    const timer=setTimeout(()=>finish(new Error('Model 45 saniye içinde açılamadı. Daha sade bir dosya deneyin veya teknik incelemeye gönderin.')),45000);
    signal.addEventListener('abort',abort,{once:true});
    worker.onerror=()=>finish(new Error('3D okuyucusu çalıştırılamadı. Sayfayı yenileyip yeniden deneyin.'));
    worker.onmessage=(event)=>event.data.ok?finish(undefined,event.data.model):finish(new Error(event.data.error));
    file.arrayBuffer().then(buffer=>{if(!settled)worker.postMessage({name:file.name,buffer},[buffer]);}).catch(()=>finish(new Error('Dosya okunamadı.')));
  });
}
