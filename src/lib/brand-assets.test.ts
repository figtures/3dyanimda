import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {brandAsset,brandAssetKeys,publicAssetUrl} from './brand-assets';
import {validateBrandSvg,validateBrandDimensions} from './brand-upload';
import {socialImage} from './social-meta';
const brands=['3dyanimda','3dsanayi','maketyanimda','parcayanimda'];
describe('brand identity selection',()=>{
 it.each(brands)('%s has its own complete defaults, including valid vector assets',slug=>{
  for(const key of brandAssetKeys){const a=brandAsset(slug,key);expect(a.url).toContain(`/identity/${slug}/`);expect(a.width).toBeGreaterThan(0);const bytes=readFileSync('public'+a.url);expect(bytes.length).toBeGreaterThan(0);if(a.mime==='image/svg+xml'){const parsed=validateBrandSvg(bytes.toString());validateBrandDimensions(key,parsed.width,parsed.height);}}
 });
 it('uses a valid CMS replacement and falls back after reset or invalid input',()=>{
  const value={url:'https://cdn.example.com/new.svg',width:600,height:100};
  expect(brandAsset('3dsanayi','logo_wordmark',{logo_wordmark:value}).url).toBe(value.url);
  for(const invalid of [{},{url:'javascript:alert(1)'},{url:'//evil.example/logo.svg'},{url:'https://user:pass@cdn.example/a.svg'},{url:'/x.svg?token=secret'}])expect(brandAsset('3dsanayi','logo_wordmark',{logo_wordmark:invalid}).url).toContain('/3dsanayi/');
 });
 it('keeps page OG priority; invalid page falls back to CMS and then brand default',()=>{
  const settings={og_image:{url:'/new-share.png',width:1200,height:630}};
  expect(socialImage('https://3dsanayi.com','3dsanayi','/page.jpg',settings).url).toBe('https://3dsanayi.com/page.jpg');
  expect(socialImage('https://3dsanayi.com','3dsanayi','/page.svg',settings)).toMatchObject({url:'https://3dsanayi.com/new-share.png',width:1200,height:630});
  expect(socialImage('https://3dsanayi.com','3dsanayi',undefined,{og_image:{url:'/bad.svg'}}).url).toContain('/identity/3dsanayi/');
 });
 it('rejects non-public and expiring asset URLs',()=>{
  for(const value of ['javascript:alert(1)','data:image/png,x','http://cdn.example/a.png','https://cdn.example/a.png?token=x','https://cdn.example/a.png#x','https://u:p@cdn.example/a.png'])expect(publicAssetUrl(value,'https://3dsanayi.com')).toBeUndefined();
 });
});
describe('upload validation',()=>{
 it.each(['<script>alert(1)</script>','<foreignObject/>','<image href="https://evil.example/x"/>','<path onload="alert(1)"/>','<path style="fill:red"/>','<path fill="url(https://evil.example/x)"/>'])('rejects active or external SVG: %s',content=>{
  expect(()=>validateBrandSvg(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">${content}</svg>`)).toThrow();
 });
 it('rejects entity declarations and stylesheet processing instructions',()=>{
  expect(()=>validateBrandSvg('<!DOCTYPE svg><svg/>')).toThrow();
  expect(()=>validateBrandSvg('<?xml-stylesheet href="https://evil.example/x"?><svg/>')).toThrow();
 });
 it('accepts outlined SVG and local paint references',()=>{
  expect(validateBrandSvg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="g"><stop offset="0" stop-color="#fff"/></linearGradient></defs><path fill="url(#g)" d="M0 0H512V512H0Z"/></svg>').width).toBe(512);
 });
 it('enforces favicon, Apple, OG and JSON-LD geometry',()=>{
  for(const [key,w,h] of [['favicon',48,48],['apple_touch_icon',180,120],['og_image',1200,600],['organization_logo',64,64],['logo_icon',400,200]] as const)expect(()=>validateBrandDimensions(key,w,h)).toThrow();
  for(const [key,w,h] of [['favicon',96,96],['apple_touch_icon',180,180],['og_image',1200,630],['organization_logo',512,512]] as const)expect(()=>validateBrandDimensions(key,w,h)).not.toThrow();
 });
});
