import { parseModel } from './parse';
self.onmessage=async(event:MessageEvent<{name:string;buffer:ArrayBuffer}>)=>{
  try {
    const model=await parseModel(event.data.name,event.data.buffer);
    const transfers:Transferable[]=model.parts.flatMap(part=>[part.positions.buffer,...(part.colors?[part.colors.buffer]:[])]) as Transferable[];
    self.postMessage({ok:true,model},{transfer:transfers});
  } catch(error) {self.postMessage({ok:false,error:error instanceof Error?error.message:'Model okunamadı.'});}
};
