import {describe,it,expect} from 'vitest';
import {answerUnitSchema,answerUnitIssues} from './answer-unit';
import {editorialSchema} from './editorial';
const fixture=()=>({contractVersion:'1.0.0',answerUnitId:'au:3dyanimda:tr:service:001',ownerUrl:'https://3dyanimda.com/3d-baski',locale:'tr-TR',intentId:'service-printing',question:'Numune neden incelenir?',directAnswer:'Üretimden önce numune değerlendirilir.',claims:[{claimId:'c1',text:'Numune değerlendirilir.',type:'fact',risk:'low',validFrom:'2026-10-01T00:00:00Z',validThrough:null}],sources:[{sourceId:'s1',url:'https://example.com/process',tier:'primary',publisher:'Fixture publisher',publishedAt:null,accessedAt:'2026-10-01T00:00:00Z',license:'Fixture only',locator:'Sample review'}],claimSourceMap:[{claimId:'c1',sourceIds:['s1']}],evidenceLevel:'supported',author:{id:'fixture-author',name:'Test author',kind:'ai',approvedAt:null},reviewer:null,riskClass:'low',schemaRefs:[],relationships:[],status:'draft',lastReviewedAt:null});
describe('versioned answer-unit contract',()=>{
 it('returns validation errors for malformed URLs without crashing a public reader',()=>{
  expect(answerUnitSchema.safeParse({...fixture(),ownerUrl:'not a URL'}).success).toBe(false);
  expect(editorialSchema.safeParse({sources:[{title:'Invalid',url:'not a URL'}]}).success).toBe(false);
 });
 it('preserves valid draft metadata through the CMS editorial schema without inventing approval',()=>{
  const result=editorialSchema.parse({answer:fixture().directAnswer,answerUnit:fixture()});
  expect(result.answerUnit?.status).toBe('draft');expect(result.answerUnit?.lastReviewedAt).toBeNull();
 });
 it('rejects orphan sources, duplicate claims and reversed validity dates',()=>{
  for(const mutate of [(f:ReturnType<typeof fixture>)=>{f.claimSourceMap[0].sourceIds=['missing'];},(f:ReturnType<typeof fixture>)=>{f.claims.push({...f.claims[0]});},(f:ReturnType<typeof fixture>)=>{f.claims[0].validFrom='invalid';}]){
   const f=fixture();mutate(f);expect(answerUnitSchema.safeParse(f).success).toBe(false);
  }
  expect(answerUnitSchema.safeParse({...fixture(),claims:[{...fixture().claims[0],validThrough:'2020-01-01T00:00:00Z'}]}).success).toBe(false);
 });
 it('requires sources for numeric claims and actual independent human review for high risk approval',()=>{
  expect(answerUnitSchema.safeParse({...fixture(),claimSourceMap:[]}).success).toBe(false);
  expect(answerUnitSchema.safeParse({...fixture(),status:'approved',riskClass:'high'}).success).toBe(false);
  expect(answerUnitSchema.safeParse({...fixture(),status:'approved',riskClass:'high',reviewer:{id:'fixture-author',name:'Same reviewer',kind:'human',approvedAt:'2026-10-02T00:00:00Z'},lastReviewedAt:'2026-10-02T00:00:00Z'}).success).toBe(false);
 });
 it('checks registry ownership, expiry, schema references and relationships against explicit inventories',()=>{
  const unit=answerUnitSchema.parse(fixture());const ctx={now:'2026-10-11T00:00:00Z',indexableUrls:new Set([unit.ownerUrl]),entityIds:new Set<string>(),schemaIds:new Set<string>()};
  expect(answerUnitIssues([unit],ctx)).toEqual([]);
  const bad={...unit,claims:[{...unit.claims[0],validThrough:'2026-10-10T00:00:00Z'}],schemaRefs:['https://3dyanimda.com/#missing'],relationships:[{type:'entity' as const,targetId:'missing'}]};
  expect(answerUnitIssues([bad,bad],{...ctx,indexableUrls:new Set()}).join(' ')).toMatch(/duplicate ID/);
  for(const error of ['expired claim','owner URL','unresolved schema','orphan relationship'])expect(answerUnitIssues([bad],{...ctx,indexableUrls:new Set()}).join(' ')).toContain(error);
 });
});
