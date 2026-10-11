import {describe,it,expect} from 'vitest';
import {socialImage} from './social-meta';
describe('public social image contract',()=>{
  it('provides a versioned raster and exact size for every brand',()=>{
    for(const slug of ['3dyanimda','3dsanayi','maketyanimda','parcayanimda']) expect(socialImage('https://'+slug+'.com',slug)).toMatchObject({url:`https://${slug}.com/brand/social/${slug}-v1.png`,width:1200,height:630});
  });
  it('rejects SVG, credentials, expiring URLs and non-HTTPS assets',()=>{
    const base='https://3dyanimda.com';
    for(const value of ['/logo.svg','https://user:secret@host.com/p.png','https://host.com/p.png?token=1','http://host.com/p.jpg','javascript:alert(1)']) expect(socialImage(base,'3dyanimda',value).width).toBe(1200);
    expect(socialImage(base,'3dyanimda','/public-photo.jpg').url).toBe(base+'/public-photo.jpg');
  });
});
