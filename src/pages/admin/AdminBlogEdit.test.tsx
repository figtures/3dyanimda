import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminBlogEdit from './AdminBlogEdit';

const fixture=vi.hoisted(()=>({
  post:{id:'post-1',title:'Üretim notu',slug:'uretim',excerpt:'Özet',content:'<p>İçerik</p>',published:true,published_at:'2026-10-01T09:00:00Z' as string|null},
  writes:[] as Record<string,unknown>[],
}));
vi.mock('@/lib/supabase',()=>({supabase:{
  auth:{getUser:async()=>({data:{user:{id:'editor-1'}}})},
  from:()=>({
    select:()=>({eq:()=>({single:async()=>({data:fixture.post,error:null})})}),
    update:(payload:Record<string,unknown>)=>({eq:async()=>{fixture.writes.push(payload);return {error:null};}}),
  }),
}}));
vi.mock('@/lib/tenant',()=>({getTenantId:()=> 'tenant-3dyanimda'}));
vi.mock('@/components/admin/RichTextEditor',()=>({RichTextEditor:()=>null}));
vi.mock('@/components/admin/MediaPicker',()=>({MediaPicker:()=>null}));
vi.mock('sonner',()=>({toast:{success:vi.fn(),error:vi.fn()}}));
const show=()=>render(<MemoryRouter initialEntries={['/admin/blog/post-1']}><Routes><Route path="/admin/blog/:id" element={<AdminBlogEdit/>}/></Routes></MemoryRouter>);
beforeEach(()=>{fixture.writes=[];fixture.post.published=true;fixture.post.published_at='2026-10-01T09:00:00Z';});
afterEach(cleanup);
describe('publication date preservation in the blog editor',()=>{
  it('keeps the first publication date when editing or unpublishing an existing post',async()=>{
    show();
    const save=await screen.findByRole('button',{name:'Kaydet'});
    fireEvent.click(save);
    await waitFor(()=>expect(fixture.writes).toHaveLength(1));
    expect(fixture.writes[0].published_at).toBe('2026-10-01T09:00:00Z');
    fireEvent.click(screen.getByRole('switch',{name:'Yayında'}));
    fireEvent.click(save);
    await waitFor(()=>expect(fixture.writes).toHaveLength(2));
    expect(fixture.writes[1]).toMatchObject({published:false,published_at:'2026-10-01T09:00:00Z'});
  });
  it('assigns a date on first publication and keeps it stable on the next save',async()=>{
    fixture.post.published=false;fixture.post.published_at=null;show();
    const save=await screen.findByRole('button',{name:'Kaydet'});
    fireEvent.click(save);
    await waitFor(()=>expect(fixture.writes).toHaveLength(1));
    expect(fixture.writes[0].published_at).toBeNull();
    fireEvent.click(screen.getByRole('switch',{name:'Yayında'}));
    fireEvent.click(save);
    await waitFor(()=>expect(fixture.writes).toHaveLength(2));
    const first=fixture.writes[1].published_at;
    expect(typeof first).toBe('string');
    expect(Number.isFinite(Date.parse(first as string))).toBe(true);
    fireEvent.click(save);
    await waitFor(()=>expect(fixture.writes).toHaveLength(3));
    expect(fixture.writes[2].published_at).toBe(first);
  });
});
