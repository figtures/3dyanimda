import {afterEach,describe,expect,it,vi} from 'vitest';
import {contentPublished} from './publication-date';

afterEach(()=>vi.useRealTimers());
describe('explicit content publication timestamps',()=>{
 it('keeps a real source timestamp without substituting a review or current date',()=>{
  expect(contentPublished(undefined)).toBeUndefined();
  expect(contentPublished('2024-02-29T12:30:00+03:00')).toBe('2024-02-29T12:30:00+03:00');
  expect(contentPublished('2024-02-29T09:30:00.000Z')).toBe('2024-02-29T09:30:00.000Z');
 });
 it('rejects incomplete, non-calendar and future dates',()=>{
  vi.useFakeTimers();vi.setSystemTime(new Date('2026-10-23T00:00:00Z'));
  for(const value of ['', 'not-a-date','2026-10-22','2026-02-29T10:00:00Z','2024-02-30T10:00:00Z','2024-01-00T10:00:00Z','2024-01-01T24:00:00Z','2024-01-01T10:00:00','2026-10-23T00:00:01Z'])expect(contentPublished(value),value).toBeUndefined();
 });
});
