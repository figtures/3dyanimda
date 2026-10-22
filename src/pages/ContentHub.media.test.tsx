import {cleanup,render,screen} from '@testing-library/react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {MemoryRouter} from 'react-router-dom';
import type {LandingPage} from '@/content/types';
import ContentHub from './ContentHub';
const state=vi.hoisted(()=>({pages:[] as LandingPage[]}));
vi.mock('@/content/useContent',()=>({useContent:()=>({data:state.pages,isLoading:false,isError:false})}));
vi.mock('@/brands/config',()=>({useBrand:()=>({slug:'3dyanimda',name:'3D Yanımda',focus:'3D üretim'})}));
vi.mock('@/lib/tenant',()=>({previewSearch:()=>'',getTenantIdentity:()=>({origin:'https://3dyanimda.com'})}));
vi.mock('@/components/site/Seo',()=>({Seo:()=>null}));
const show=()=>render(<MemoryRouter initialEntries={['/rehber']}><ContentHub/></MemoryRouter>);
beforeEach(()=>{state.pages=[{path:'/rehber/ornek',title:'Örnek rehber',summary:'Dosya kontrol rehberi.',kind:'guide',image:'/media/cms-image.png',editorial:{answer:'',takeaways:[],relatedPaths:[],media:{alt:'İçerik kaydındaki özgün açıklama',width:960,height:640}}} as LandingPage];});
afterEach(cleanup);
it('renders the exact CMS image dimensions and alt rather than a route default',()=>{
 show();const image=screen.getByRole('img');
 expect(image).toHaveAttribute('src','/media/cms-image.png');
 expect(image).toHaveAttribute('width','960');expect(image).toHaveAttribute('height','640');
 expect(image).toHaveAttribute('alt','İçerik kaydındaki özgün açıklama');
 expect(image).toHaveAttribute('loading','lazy');expect(image).toHaveAttribute('decoding','async');
});
it('does not guess dimensions when the CMS has not recorded them',()=>{
 state.pages[0].editorial=undefined;show();const image=screen.getByRole('img');
 expect(image).not.toHaveAttribute('width');expect(image).not.toHaveAttribute('height');
 expect(image).toHaveAttribute('alt','Örnek rehber temsili görseli');
});
