/** Optional discovery index, not an indexing or ranking signal. */
export const LLMS_MAX_LINKS = 80;
export const LLMS_MAX_BYTES = 50 * 1024;
export const LLMS_MAX_LABEL_CHARACTERS = 120;
const priority = ['/', '/hizmetler', '/3d-baski', '/3d-tarama', '/3d-modelleme', '/teklif-al', '/iletisim', '/hakkimizda', '/cozumler', '/malzemeler', '/rehber', '/sektorler', '/bolgeler'];
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const line = (value, limit) => Array.from(String(value || '').normalize('NFC').replace(/[\r\n\[\]<>\\]/g, ' ').replace(/\s+/g, ' ').trim()).slice(0, limit).join('');

export function llmsDirectory({ brand, records }) {
  const byPath = new Map(records.map(record => [record.path, record]));
  const selected = [];
  const take = record => { if (record && !selected.some(p => p.path === record.path)) selected.push(record); };
  for (const path of priority) take(byPath.get(path));
  // Round-robin categories prevent a large local directory crowding out guides/services.
  const groups = new Map();
  for (const record of [...records].sort((a,b) => compare(a.path,b.path))) {
    if (priority.includes(record.path)) continue;
    const category = record.path.split('/')[1];
    const group = groups.get(category) || [];
    group.push(record); groups.set(category, group);
  }
  const queues = [...groups.keys()].sort(compare).map(key => groups.get(key));
  while (selected.length < LLMS_MAX_LINKS && queues.some(queue => queue.length)) {
    for (const queue of queues) {
      if (selected.length === LLMS_MAX_LINKS) break;
      take(queue.shift());
    }
  }
  // Source content dates only: a rebuild must not pretend that content was reviewed.
  const dates=selected.map(p=>p.lastmod).filter(Boolean).map(value=>new Date(value));
  if(dates.some(date=>!Number.isFinite(+date)))throw new Error('Invalid source content date in llms.txt');
  const latest=dates.length?new Date(Math.max(...dates.map(Number))).toISOString().slice(0,10):null;
  const result = `# ${line(brand, 100)}\n\n> Resmî hizmet ve bilgi sayfalarından seçilmiş dizin. Güncel kapsam ve koşullar bağlantılı sayfalarda açıklanır.\n\n${latest?`Listelenen sayfaların son içerik güncellemesi: ${latest}.\n\n`:''}## Hizmetler ve kaynaklar\n\n` + selected.map(p => `- [${line(p.title || p.path, LLMS_MAX_LABEL_CHARACTERS)}](${p.url}): ${line(p.description, 240)}`).join('\n') + '\n';
  if (Buffer.byteLength(result, 'utf8') > LLMS_MAX_BYTES) throw new Error('llms.txt exceeds the 50 KiB publication budget.');
  return result;
}
