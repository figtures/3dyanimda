import {expect,it} from 'vitest';
import {pageNoindex} from './search';
it('indexes only the exact configured public domain and preserves all exclusion overrides',()=>{
 for(const brand of ['3dyanimda','3dsanayi','maketyanimda','parcayanimda']){
  const domain=brand+'.com';expect(pageNoindex({domain,hostname:domain})).toBe(false);
  for(const hostname of ['localhost','127.0.0.1','preview.chatgpt.site','other.com'])expect(pageNoindex({domain,hostname})).toBe(true);
  for(const override of [{requested:true},{override:true},{development:true}])expect(pageNoindex({domain,hostname:domain,...override})).toBe(true);
 }
 expect(pageNoindex({hostname:'3dyanimda.com'})).toBe(true);
});
