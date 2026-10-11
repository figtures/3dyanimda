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
  });
  it('gives each route schema a stable distinct identifier',()=>{
    const docs=[pageGraph({origin,path:'/rehber',title:'Rehber',description:'Üretim rehberi',type:'CollectionPage'}),{'@type':'ItemList',itemListElement:[]},{'@type':'FAQPage',mainEntity:[]}];
    const graph=composeSchemaGraph(docs,origin,origin+'/rehber');
    expect(new Set(graph['@graph'].map(n=>n['@id'])).size).toBe(3);
    expect(composeSchemaGraph([...docs].reverse(),origin,origin+'/rehber')).toEqual(graph);
  });
});
