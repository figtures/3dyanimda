import vocabulary from './schema-vocabulary.json' with {type:'json'};
/** Checks actual Schema.org type/property domains, including nested nodes. */
export function validateVocabulary(document){
 const errors=[];
 const visit=(value,path)=>{
  if(!value||typeof value!=='object')return;
  if(Array.isArray(value)){value.forEach((item,i)=>visit(item,`${path}[${i}]`));return;}
  const types=Array.isArray(value['@type'])?value['@type']:[value['@type']].filter(Boolean);
  const allowed=new Set(types.flatMap(t=>vocabulary.types[t]||[]));
  for(const type of types)if(!Object.hasOwn(vocabulary.types,type))errors.push(`${path}: unsupported type ${type}`);
  for(const [key,item] of Object.entries(value)){
   if(types.length&&!key.startsWith('@')&&!allowed.has(key))errors.push(`${path}: property ${key} is not allowed on ${types.join(',')}`);
   visit(item,path+'.'+key);
  }
 };
 visit(document,'$');return [...new Set(errors)];
}
