import {describe,it,expect} from 'vitest';
import {socialImage} from './social-meta';
describe('public social image contract',()=>{
  it('provides a versioned raster and exact size for every brand',()=>{
    for(const slug of ['3dyanimda','3dsanayi','maketyanimda','parcayanimda']) expect(socialImage('https://'+slug+'.com',slug)).toMatchObject({url:`https://${slug}.com/brand/identity/${slug}/og-image.png`,width:1200,height:630});
  });
  it('rejects SVG, credentials, expiring URLs and non-HTTPS assets',()=>{
    const base='https://3dyanimda.com';
    for(const value of ['/logo.svg','https://user:secret@host.com/p.png','https://host.com/p.png?token=1','http://host.com/p.jpg','javascript:alert(1)']) expect(socialImage(base,'3dyanimda',value).width).toBe(1200);
    expect(socialImage(base,'3dyanimda','/public-photo.jpg').url).toBe(base+'/public-photo.jpg');
  });
  it('uses page-specific image metadata without copying brand dimensions to unknown assets',()=>{
    const base='https://3dyanimda.com';
    expect(socialImage(base,'3dyanimda',{url:'/images/guide.webp',alt:'Ölçü karşılaştırması',width:1200,height:630})).toEqual({url:base+'/images/guide.webp',alt:'Ölçü karşılaştırması',width:1200,height:630,mime:'image/webp'});
    expect(socialImage(base,'3dyanimda','/images/guide.jpg')).toMatchObject({mime:'image/jpeg',width:undefined,height:undefined});
    expect(socialImage(base,'3dyanimda',{url:'/photo.png',width:-1,height:0})).toMatchObject({width:undefined,height:undefined,mime:'image/png'});
  });
  it('honors valid administrator overrides and falls through invalid candidates to the page image',()=>{
    const base='https://3dyanimda.com';
    const page={url:'/page.png',alt:'Sayfa görseli',width:1200,height:630};
    expect(socialImage(base,'3dyanimda',['/override.jpg',page])).toMatchObject({url:base+'/override.jpg',width:undefined,height:undefined});
    expect(socialImage(base,'3dyanimda',['/invalid.svg',page])).toMatchObject({url:base+'/page.png',width:1200,height:630});
    expect(socialImage(base,'3dyanimda','//outside.example/card.png').url).toBe(base+'/brand/identity/3dyanimda/og-image.png');
  });
});
