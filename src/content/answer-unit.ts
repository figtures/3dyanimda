import { z } from 'zod';

export const ANSWER_UNIT_CONTRACT_VERSION = '1.0.0';
const text = z.string().trim().min(1);
const date = z.string().datetime({offset:true});
const url = z.string().url().refine(value=>{
  const parsed=new URL(value);
  return parsed.protocol==='https:'&&!parsed.username&&!parsed.password;
},'Kaynak HTTPS kullanmalı; kullanıcı adı veya şifre içermemeli.');
const risk = z.enum(['low','medium','high','regulated']);
const person = z.object({id:text,name:text,kind:z.enum(['human','ai']),approvedAt:date.nullable()}).strict();

/** Drafts may explicitly lack review; approval is never inferred from validation. */
export const answerUnitSchema = z.object({
  contractVersion:z.literal(ANSWER_UNIT_CONTRACT_VERSION),
  answerUnitId:text.regex(/^au:[a-z0-9:-]+$/),
  ownerUrl:url.refine(value=>{const u=new URL(value);return !u.search&&!u.hash&&!/^\/(admin|studio|api|auth)(\/|$)/.test(u.pathname);}),
  locale:z.literal('tr-TR'),
  intentId:text,
  question:text,
  directAnswer:text.refine(value=>value.split(/\s+/u).length<=120),
  context:z.string().optional(),
  claims:z.array(z.object({claimId:text,text:text,type:z.enum(['fact','numeric','estimate','opinion']),risk,validFrom:date,validThrough:date.nullable()}).strict()).min(1),
  sources:z.array(z.object({sourceId:text,url,tier:z.enum(['primary','independent','secondary']),publisher:text,publishedAt:date.nullable(),accessedAt:date,license:text,locator:text}).strict()),
  claimSourceMap:z.array(z.object({claimId:text,sourceIds:z.array(text).min(1)}).strict()),
  evidenceLevel:z.enum(['verified','supported','inferred','unknown']),
  author:person,
  reviewer:person.nullable(),
  riskClass:risk,
  schemaRefs:z.array(url),
  relationships:z.array(z.object({type:z.enum(['entity','parent','variant','related','supersedes']),targetId:text}).strict()),
  status:z.enum(['draft','review','approved','published','stale','deprecated']),
  lastReviewedAt:date.nullable(),
}).strict().superRefine((unit,ctx)=>{
  const fail=(message:string)=>ctx.addIssue({code:z.ZodIssueCode.custom,message});
  const claims=new Set(unit.claims.map(c=>c.claimId));
  const sources=new Set(unit.sources.map(s=>s.sourceId));
  if(claims.size!==unit.claims.length||sources.size!==unit.sources.length)fail('İddia ve kaynak kimlikleri benzersiz olmalı.');
  const mapped=new Set<string>();
  for(const map of unit.claimSourceMap){
    if(!claims.has(map.claimId)||map.sourceIds.some(id=>!sources.has(id))||mapped.has(map.claimId))fail('İddia-kaynak eşlemesi geçersiz veya yinelenmiş.');
    mapped.add(map.claimId);
  }
  for(const claim of unit.claims){
    if(claim.validThrough&&Date.parse(claim.validThrough)<Date.parse(claim.validFrom))fail('İddianın geçerlilik tarihleri ters.');
    if((claim.type==='fact'||claim.type==='numeric'||['high','regulated'].includes(claim.risk))&&!mapped.has(claim.claimId))fail('Doğrulanabilir/kritik iddia için kaynak eşlemesi gerekli.');
  }
  if(['approved','published'].includes(unit.status)){
    if(!unit.reviewer||!unit.reviewer.approvedAt||!unit.lastReviewedAt)fail('Onay durumu gerçek inceleme kaydı gerektirir.');
    if(['high','regulated'].includes(unit.riskClass)&&(!unit.reviewer||unit.reviewer.kind!=='human'||unit.reviewer.id===unit.author.id))fail('Yüksek riskli içerikte bağımsız insan incelemesi gerekli.');
    if(unit.evidenceLevel==='unknown')fail('Kanıtı bilinmeyen birim onaylanamaz.');
  }
});
export type AnswerUnit=z.infer<typeof answerUnitSchema>;

/** Registry checks use explicit time and known IDs; they do not contact or impersonate reviewers. */
export function answerUnitIssues(units:AnswerUnit[],context:{now:string;indexableUrls:Set<string>;entityIds:Set<string>;schemaIds:Set<string>}) {
  const issues:string[]=[];const ids=new Set<string>();
  const allIds=new Set([...context.entityIds,...units.map(unit=>unit.answerUnitId)]);
  const now=Date.parse(context.now);
  if(!Number.isFinite(now))throw new Error('Explicit valid audit time required');
  for(const unit of units){
    const fail=(message:string)=>issues.push(`${unit.answerUnitId}: ${message}`);
    if(ids.has(unit.answerUnitId))fail('duplicate ID');ids.add(unit.answerUnitId);
    if(!context.indexableUrls.has(unit.ownerUrl))fail('owner URL is not in the indexable inventory');
    if(unit.relationships.some(link=>!allIds.has(link.targetId)))fail('orphan relationship');
    if(unit.schemaRefs.some(ref=>!context.schemaIds.has(ref)))fail('unresolved schema reference');
    if(unit.lastReviewedAt&&Date.parse(unit.lastReviewedAt)>now)fail('future review date');
    for(const claim of unit.claims){
      if(Date.parse(claim.validFrom)>now)fail('claim is not yet valid');
      if(claim.validThrough&&Date.parse(claim.validThrough)<=now)fail('expired claim');
    }
  }
  return issues;
}
