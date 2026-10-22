import {cleanup,render,screen} from '@testing-library/react';
import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {MemoryRouter} from 'react-router-dom';
import ContentPage from './ContentPage';
import type {LandingPage} from '@/content/types';

const fixtures=vi.hoisted(()=>({page:null as LandingPage|null,seo:{} as Record<string,unknown>}));
vi.mock('@/content/useContent',()=>({useContentPage:()=>({data:fixtures.page,isLoading:false,isError:false}),useRelatedContent:()=>({data:[]})}));
vi.mock('@/brands/config',()=>({useBrand:()=>({name:'3D Yanımda',focus:'3D baskı'})}));
vi.mock('@/lib/tenant',()=>({getTenantIdentity:()=>({origin:'https://3dyanimda.com'}),previewSearch:()=>''}));
vi.mock('@/components/site/Seo',()=>({Seo:(props:Record<string,unknown>)=>{fixtures.seo=props;return null;}}));
vi.mock('./RegionPlanner',()=>({default:()=>null}));
vi.mock('./NotFound',()=>({default:()=>null}));
vi.mock('@/components/brand/LocalServiceAccess',()=>({LocalServiceAccess:()=>null}));
const show=()=>render(<MemoryRouter initialEntries={['/rehber/test']}><ContentPage/></MemoryRouter>);
beforeEach(()=>{
 fixtures.page={path:'/rehber/test',brand:'3dyanimda',title:'Dosya kontrolü',summary:'Örnek bir modelin aktarım ve birim kontrolünü adım adım inceleme rehberi.',kind:'guide',image:'/images/editorial/3dyanimda/test.png',status:'published',sections:[{title:'Dosyayı açın',body:'Aktarılan dosyayı kontrol edin.'}],faq:[],city:'',district:'',neighborhood:'',service:'',local_context:'',logistics:'',evidence:'',reviewed_at:null,updated_at:'2026-10-01T10:00:00Z',editorial:{answer:'Birim ve ölçüyü kontrol edin.',takeaways:[],relatedPaths:[],media:{alt:'Küpün X, Y ve Z ekseninde ölçüleri',caption:'Yirmi milimetrelik referans küp şeması.',width:1200,height:630},resources:[{title:'Örnek küpü indirin',description:'Milimetre birimiyle kontrol edilecek eğitim dosyası.',path:'/downloads/3dyanimda/referans-kup-20mm.stl'},{title:'STL önizlemeyi açın',path:'/araclar/stl-onizle'}]}};
});
afterEach(cleanup);
describe('content editorial media and practical resources',()=>{
 it('renders the authoritative image, caption and dimensions and forwards them to SEO',()=>{
  show();
  expect(screen.getByRole('img')).toHaveAttribute('alt','Küpün X, Y ve Z ekseninde ölçüleri');
  expect(screen.getByRole('img')).toHaveAttribute('width','1200');
  expect(screen.getByRole('img')).toHaveAttribute('height','630');
  expect(screen.getByText('Yirmi milimetrelik referans küp şeması.')).toBeInTheDocument();
  expect(fixtures.seo).toMatchObject({image:fixtures.page!.image,imageAlt:fixtures.page!.editorial!.media!.alt,imageWidth:1200,imageHeight:630});
  expect(screen.getByRole('link',{name:'Örnek küpü indirin'})).toHaveAttribute('download');
  expect(screen.getByRole('link',{name:'STL önizlemeyi açın'})).not.toHaveAttribute('download');
 });
 it('shows a modification date without pretending it is a first-publication date',()=>{
  show();expect(document.querySelector('[data-content-published]')).toBeNull();
  expect(document.querySelector('[data-content-modified]')).toHaveAttribute('dateTime','2026-10-01T10:00:00Z');
  expect(fixtures.seo.published).toBeUndefined();
 });
 it('renders an explicitly supplied first-publication date in visible copy and metadata',()=>{
  fixtures.page!.editorial!.publishedAt='2026-09-01T09:30:00Z';show();
  expect(document.querySelector('[data-content-published]')).toHaveAttribute('dateTime','2026-09-01T09:30:00Z');
  expect(fixtures.seo.published).toBe('2026-09-01T09:30:00Z');
  expect((fixtures.seo.jsonLd as Record<string,unknown>[]).find(node=>node['@type']==='Article')).toHaveProperty('datePublished','2026-09-01T09:30:00Z');
 });
});
