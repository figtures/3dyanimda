/** Validate tenant-local redirects before building any public artifact. */
export const legacyRedirects = [
  {from_path:'/hizmetler/3d-baski',to_path:'/3d-baski'},
  {from_path:'/hizmetler/3d-tarama',to_path:'/3d-tarama'},
  {from_path:'/hizmetler/3d-modelleme',to_path:'/3d-modelleme'},
  {from_path:'/teklif',to_path:'/teklif-al'},
];
export {compileRedirects} from '../../src/lib/redirects.mjs';
