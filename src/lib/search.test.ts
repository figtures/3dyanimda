import {describe,it,expect,beforeEach} from 'vitest';
import {canonicalPath,pageGraph} from './search';
import {referralChannel,analyticsAllowed,consentKey} from './growth-analytics';
import {editorialSchema} from '@/content/editorial';
describe('search signals and attribution',()=>{
  it('consolidates campaign and index variants without cross-host canonicals',()=>{
    expect(canonicalPath('/3d-baski/?utm_source=chatgpt.com#teklif')).toBe('/3d-baski');
    expect(canonicalPath('/index.html')).toBe('/');
    expect(canonicalPath('//another-brand.example/path')).toBe('/');
    const page=pageGraph({origin:'https://maketyanimda.com',path:'/rehber/test?tenant=3dyanimda',title:'Ölçek',description:'Açıklama'});
    expect(page.url).toBe('https://maketyanimda.com/rehber/test');
    expect(page.publisher['@id']).toBe('https://maketyanimda.com/#organization');
    expect(page).not.toHaveProperty('dateModified');
  });
  it('classifies AI referrals without forwarding arbitrary URLs',()=>{
    expect(referralChannel('https://chatgpt.com/c/private-conversation','')).toBe('chatgpt');
    expect(referralChannel('','?utm_source=chatgpt.com')).toBe('chatgpt');
    expect(referralChannel('https://www.google.com/search?q=private','')).toBe('google');
    expect(referralChannel('https://chatgpt.com.evil.example','')).toBe('referral');
    expect(referralChannel('','')).toBe('direct');
  });
  it('keeps analytics opt-in isolated between brands',()=>{
    localStorage.clear();
    localStorage.setItem(consentKey('3dyanimda'),JSON.stringify({analytics:true}));
    expect(analyticsAllowed('3dyanimda')).toBe(true);
    expect(analyticsAllowed('3dsanayi')).toBe(false);
    localStorage.setItem(consentKey('3dsanayi'),'broken');
    expect(analyticsAllowed('3dsanayi')).toBe(false);
  });
  it('rejects unusable comparison tables and unsafe source links',()=>{
    expect(editorialSchema.safeParse({comparison:{title:'Test',columns:['A','B'],rows:[['Only one']]}}).success).toBe(false);
    expect(editorialSchema.safeParse({sources:[{title:'Invalid',url:'javascript:alert(1)'}]}).success).toBe(false);
    expect(editorialSchema.parse({}).takeaways).toEqual([]);
  });
});
