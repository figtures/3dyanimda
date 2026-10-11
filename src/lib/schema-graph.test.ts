import {describe,it,expect} from 'vitest';
import {composeSchemaGraph} from './schema-graph';
import {businessGraph} from './structured-data';
import {pageGraph} from './search';
const origin='https://3dyanimda.com';
describe('one structured dataset',()=>{
  it('merges complementary identity while retaining verified contact',()=>{
    const data=composeSchemaGraph([businessGraph({name:'3dyanımda',origin,email:'info@3dyanimda.com'}),{'@type':'Organization','@id':origin+'/#organization',name:'3dyanımda'}],origin,origin+'/');
    expect(data['@graph'].filter(n=>n['@type']==='Organization')).toEqual([expect.objectContaining({email:'info@3dyanimda.com'})]);
  });
  it('rejects conflicting facts and unregistered types',()=>{
    expect(()=>composeSchemaGraph([{'@type':'Organization',name:'A'},{'@type':'Organization',name:'B'}],origin,origin+'/')).toThrow(/Conflicting/);
    expect(()=>composeSchemaGraph([{'@type':'InventedType'}],origin,origin+'/')).toThrow(/Unregistered/);
    for(const type of ['constructor','toString','__proto__','']) {
      expect(()=>composeSchemaGraph([{'@type':type}],origin,origin+'/')).toThrow(/Unregistered/);
    }
  });
  it('gives each route schema a stable distinct identifier',()=>{
    const docs=[pageGraph({origin,path:'/rehber',title:'Rehber',description:'Üretim rehberi',type:'CollectionPage'}),{'@type':'ItemList',itemListElement:[]},{'@type':'FAQPage',mainEntity:[]}];
    const graph=composeSchemaGraph(docs,origin,origin+'/rehber');
    expect(new Set(graph['@graph'].map(n=>n['@id'])).size).toBe(3);
    expect(composeSchemaGraph([...docs].reverse(),origin,origin+'/rehber')).toEqual(graph);
  });
  it('serializes equivalent merged facts identically despite input/property order',()=>{
    const a={'@type':'Organization',name:'3dyanımda',address:{addressCountry:'TR',addressLocality:'Ataşehir'}};
    const b={email:'info@3dyanimda.com','@type':'Organization'};
    const reordered={address:{addressLocality:'Ataşehir',addressCountry:'TR'},name:'3dyanımda','@type':'Organization'};
    expect(JSON.stringify(composeSchemaGraph([a,b],origin,origin+'/'))).toBe(JSON.stringify(composeSchemaGraph([b,reordered],origin,origin+'/')));
  });
  it('uses the contract graph order while preserving FAQ answer order',()=>{
    const questions=[{name:'Önce',acceptedAnswer:{text:'Bir'}},{name:'Sonra',acceptedAnswer:{text:'İki'}}];
    const docs=[{'@type':'BreadcrumbList',itemListElement:[]},{'@type':'FAQPage',mainEntity:questions},pageGraph({origin,path:'/',title:'Üretim',description:'Açıklama'}),businessGraph({name:'3dyanımda',origin})];
    const graph=composeSchemaGraph(docs,origin,origin+'/')['@graph'];
    expect(graph.map(n=>n['@type'])).toEqual(['WebSite','Organization','WebPage','FAQPage','BreadcrumbList']);
    expect(graph.find(n=>n['@type']==='FAQPage')?.mainEntity).toEqual(questions);
  });
});
