import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

// Original, source-controlled explanatory diagrams. No photographs or project-result claims.
const root = process.cwd();
const directory = path.join(root, 'public/images/editorial/3dyanimda');
// Optional diagram keys regenerate only selected artwork while validating the full inventory.
const selectedKeys = new Set(process.argv.slice(2));
const ink = '#20282b', muted = '#566367', line = '#cfd5d4', orange = '#e86528', paper = '#f3f3ef';
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const txt = (x,y,s,size=22,color=ink,weight=400,anchor='start') => `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}" text-anchor="${anchor}">${esc(s)}</text>`;
const lines = (x,y,a,size=20,color=muted,gap=29,weight=400,anchor='start') => a.map((s,i)=>txt(x,y+i*gap,s,size,color,weight,anchor)).join('');
const rect = (x,y,w,h,fill='white',stroke=line,rx=13) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
const seg = (x,y,x2,y2,color=line,width=3,dash='') => `<path d="M${x} ${y}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
const circle = (x,y,r,fill='none',stroke=ink,w=3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${w}"/>`;
const arrow = (x,y,x2,y2,color=orange) => seg(x,y,x2,y2,color,3)+`<path d="M${x2-10} ${y2-6}L${x2} ${y2}L${x2-10} ${y2+6}" stroke="${color}" stroke-width="3" fill="none"/>`;
const label = (x,y,n,s) => circle(x,y-8,16,orange,orange)+txt(x,y-2,n,16,'white',700,'middle')+txt(x+30,y,s,22,ink,700);
const box = (x,y,w,h,title,body=[]) => rect(x,y,w,h)+txt(x+22,y+37,title,23,ink,700)+lines(x+22,y+75,body,19,muted,27);
const cube = (x,y,s=1,{mesh=false,fill='#dfe4e2',accent=false}={}) => {
 const top=`${x},${y} ${x+80*s},${y-42*s} ${x+160*s},${y} ${x+80*s},${y+42*s}`;
 let g=`<polygon points="${top}" fill="${accent?'#f9c4a7':fill}" stroke="${ink}" stroke-width="3"/><path d="M${x} ${y}v${85*s}l${80*s} ${42*s} ${80*s} -${42*s}V${y}M${x+80*s} ${y+42*s}v${85*s}" fill="none" stroke="${ink}" stroke-width="3"/>`;
 if(mesh) for(let i=1;i<4;i++){g+=seg(x+i*40*s,y+(i<2?i:-i+4)*21*s,x+80*s,y+127*s,line,2);g+=seg(x,y+i*21*s,x+80*s,y+42*s+i*21*s,line,2);g+=seg(x+80*s,y+42*s+i*21*s,x+160*s,y+i*21*s,line,2);}
 return g;
};
const stack = (x,y,w=200,levels=7) => Array.from({length:levels},(_,i)=>rect(x,y-i*13,w,11,i%2?'#f8b18a':'#e86528',orange,3)).join('');
const check = (x,y,color=orange) => `<path d="M${x} ${y}l7 8 17 -20" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
const doc = (x,y,w,title,rows=3) => rect(x,y,w,145)+txt(x+17,y+33,title,20,ink,700)+Array.from({length:rows},(_,i)=>seg(x+18,y+60+i*23,x+w-18,y+60+i*23,line,3)).join('');
const dimension = (x,y,x2,y2,labelText) => seg(x,y,x2,y2,muted,2)+seg(x,y-7,x,y+7,muted,2)+seg(x2,y2-7,x2,y2+7,muted,2)+txt((x+x2)/2,y-13,labelText,18,muted,400,'middle');

const diagrams = {
 print: () => {
  let s=rect(58,218,532,319)+label(88,256,'1','Modelden katmanlara');
  s+=cube(107,350,.8,{accent:true})+arrow(267,374,325,374)+stack(352,412,180,8);
  s+=txt(109,492,'Dijital geometri',20,muted)+txt(354,492,'Baskı yönü',20,muted);
  s+=box(618,218,524,96,'Görünüş',[])+lines(643,288,['Görünecek yüzeyleri ve sunum amacını belirtin.'],19);
  s+=box(618,329,524,96,'Montaj',[])+lines(643,398,['Karşı parçayı ve kritik bağlantıları paylaşın.'],19);
  s+=box(618,440,524,97,'İşlev',[])+lines(643,510,['Yük, sıcaklık ve kabul yöntemini tanımlayın.'],19);
  return s;
 },
 scan: () => {
  let s=rect(58,218,1084,319);
  s+=label(86,256,'1','Fiziksel nesne')+label(460,256,'2','Yüzey verisi')+label(833,256,'3','İstenen çıktı');
  s+=cube(122,355,.75,{accent:true});
  for(let i=0;i<5;i++)s+=seg(86,305+i*14,132,342+i*18,orange,2);
  s+=arrow(306,380,387,380)+cube(467,355,.75,{mesh:true});
  s+=arrow(665,380,746,380)+doc(831,303,225,'Ağ / CAD / rapor',3);
  s+=lines(99,484,['Erişilebilir yüzeyler','ve fiziksel referans'],19)+lines(455,484,['Ölçülen biçim','ve veri temizliği'],19)+lines(817,484,['Kullanım amacı','teslim kapsamını belirler.'],19);
  return s;
 },
 model: () => {
  let s=''; const xs=[58,428,798];
  xs.forEach((x,i)=>s+=rect(x,218,344,319)+label(x+30,258,String(i+1),['Referans','Ölçülü tasarım','Numune kararı'][i]));
  s+=`<path d="M103 401v-69l100-35 100 36v68l-100 34Z M103 332l100 34 100-33 M203 366v69" fill="none" stroke="${ink}" stroke-width="3" stroke-dasharray="7 5"/>`;
  s+=dimension(103,461,303,461,'Temel ölçüler');
  s+=cube(490,346,.85,{accent:true})+dimension(490,476,626,476,'Sabit / değişken');
  s+=rect(845,311,247,127,'#e6ebe8')+circle(968,365,29,'white',ink)+check(960,370)+lines(842,478,['Revizyon kodu + test amacı'],19);
  return s;
 },
 request: () => {
  let s=doc(67,244,260,'MODEL / ESKİZ',4)+doc(393,244,260,'ÖLÇÜ / REFERANS',4)+doc(719,244,260,'KULLANIM AMACI',4);
  s+=arrow(343,314,377,314)+arrow(669,314,703,314);
  s+=rect(67,422,1075,112,ink,ink)+txt(94,463,'Tek bir güncel talep paketi',26,'white',700)+txt(94,504,'Dosya revizyonu  ·  Parça adedi  ·  Açık kararlar  ·  İstenen teslim',23,'#d7dfdc');
  s+=circle(1080,317,40,orange,orange)+`<path d="M1061 316h38M1080 297v38" stroke="white" stroke-width="4"/>`;
  return s;
 },
 price: () => {
  const rows=[['Dosya hazırlığı','İlk sipariş / değişen revizyon'],['Üretim','Geometri, malzeme ve adet'],['Son işlem','Destek temizliği ve yüzey'],['Teslim','Kontrol, ambalaj ve gönderim']];
  let s=rect(58,218,1084,319);s+=txt(84,259,'TEKLİF KALEMİ',18,muted,700)+txt(450,259,'KAPSAMI BELİRLEYEN BİLGİ',18,muted,700);
  rows.forEach((r,i)=>{const y=301+i*61;s+=seg(82,y-23,1117,y-23,line,1)+circle(96,y-4,7,orange,orange)+txt(119,y+3,r[0],23,ink,700)+txt(450,y+3,r[1],23);});
  return s;
 },
 reverse: () => {
  let s=rect(58,218,510,319)+rect(632,218,510,319);
  s+=txt(86,257,'TARAMA',19,orange,700)+txt(660,257,'YENİDEN MODELLEME',19,orange,700);
  s+=cube(122,352,.78,{mesh:true})+`<path d="M152 319l23 14 13-8" fill="none" stroke="${orange}" stroke-width="4"/>`;
  s+=cube(708,352,.78,{accent:true})+dimension(708,471,833,471,'Nominal geometri');
  s+=lines(323,329,['Mevcut biçim','Aşınma izleri','Yüzey ayrıntıları'],20,muted,42);
  s+=lines(911,329,['Tasarım niyeti','Referans ölçü','Değiştirilebilirlik'],20,muted,42);
  s+=txt(85,507,'Ölçülen yüzeyi kaydeder.',22,ink,700)+txt(660,507,'Yeni geometri kararları gerektirir.',22,ink,700);
  s+=arrow(580,374,620,374);return s;
 },
 revision: () => {
  let s=''; const xs=[58,428,798];
  xs.forEach((x,i)=>s+=rect(x,218,344,319)+label(x+30,257,String(i+1),['Gözlem','Değişiklik','Tekrar kontrol'][i]));
  s+=rect(110,306,235,109,'#e5e9e5')+seg(110,329,345,329,ink,3)+circle(305,329,20,'none',orange,4)+lines(84,473,['Sürtünme noktası, fotoğraf','ve ilgili ölçüyü kaydedin.'],19);
  s+=rect(480,306,235,109,'#e5e9e5')+seg(480,339,715,339,orange,3)+dimension(730,317,730,339,'')+lines(454,473,['Hedef düzeltmeyi dosya','revizyonuna bağlayın.'],19);
  s+=rect(850,306,235,109,'#e5e9e5')+check(953,363)+lines(824,473,['Aynı bulguyu yeni numunede','aynı yöntemle kontrol edin.'],19);
  return s;
 },
 stl: () => {
  let s=rect(58,218,668,319,ink,ink)+txt(82,253,'ÜÇGEN AĞI YAKINDAN İNCELEYİN',18,'#d8e0dc',700);
  // A faceted, irregular shell with one deliberately open face, not a generic CAD cube.
  const points=[[118,400],[206,301],[359,279],[520,316],[612,413],[487,485],[280,491],[269,389],[424,383]];
  const faces=[[0,1,7],[1,2,7],[2,8,7],[2,3,8],[3,4,8],[4,5,8],[5,6,8],[6,7,8],[0,7,6]];
  faces.forEach((f,i)=>s+=`<polygon points="${f.map(j=>points[j].join(',')).join(' ')}" fill="${['#435452','#526663','#6b8079'][i%3]}" stroke="#c1d0c8" stroke-width="2"/>`);
  s+=`<polygon points="${[6,7,8].map(j=>points[j].join(',')).join(' ')}" fill="${ink}" stroke="${orange}" stroke-width="4" stroke-dasharray="7 5"/>`;
  s+=seg(382,323,405,273,orange,4)+`<path d="M395 279l10-6 1 12" fill="none" stroke="${orange}" stroke-width="4"/>`+txt(435,286,'Dış normal',18,'#f7c4a6',700);
  s+=seg(352,437,548,509,orange,2)+txt(568,519,'Açık kenar',18,'#f7c4a6',700,'middle');
  s+=txt(82,518,'Şematik hata incelemesi',17,'#c4d0c9');
  const controls=[['Birim ve boyut','Bilinen ölçüyle karşılaştırın.'],['Kapalı yüzey','Açık kenarları onarın.'],['Normal yönü','Dışa yönelimi doğrulayın.'],['Parça ayrımı','Bileşenleri açıkça adlandırın.']];
  controls.forEach(([heading,body],i)=>{const y=252+i*82;s+=txt(761,y,String(i+1).padStart(2,'0'),18,orange,700)+txt(804,y,heading,23,ink,700)+txt(804,y+31,body,19,muted);if(i<3)s+=seg(761,y+49,1142,y+49,line,1);});
  return s;
 },
 cad: () => {
  let s=rect(58,218,510,319)+rect(596,218,546,319);
  s+=txt(85,258,'YÜZEYLERİ AYIRIN',20,orange,700)+cube(125,355,1.05,{mesh:true});
  s+=`<path d="M125 355l84 44v89l-84-44Z" fill="#e8652840" stroke="${orange}" stroke-width="3"/>`+circle(253,369,17,'white',ink,3);
  s+=txt(86,515,'Serbest biçim + ölçülü bağlantılar',22,ink,700);
  s+=box(618,242,502,91,'Serbest yüzey',['Referans biçim ve yüzey devamlılığı']);
  s+=box(618,343,502,91,'İşlevli geometri',['Eksen, delik ve düzlem referansları']);
  s+=box(618,444,502,72,'Teslim: düzenlenecek alanlar açık',[]);
  return s;
 },
 section: () => {
  let s=rect(58,218,1084,319);
  s+=`<path d="M125 296h550v180H125Z M155 327h490v119H155Z" fill="#e1e7e3" fill-rule="evenodd" stroke="${ink}" stroke-width="3"/>`;
  s+=rect(195,378,370,24,'#f5b28c',orange,3)+rect(218,402,25,43,ink,ink,2)+rect(523,402,25,43,ink,ink,2);
  s+=rect(220,331,65,27,'#dce5e0',ink,4)+seg(225,281,225,484,orange,2,'8 5');
  s+=dimension(155,500,645,500,'İç hacim');
  s+=arrow(676,306,773,306)+txt(798,313,'Gövde duvarı',23,ink,700);
  s+=arrow(566,389,773,389)+txt(798,396,'Kart / bileşen',23,ink,700);
  s+=arrow(649,449,773,449)+lines(798,449,['Montaj ve hareket','boşluğu'],22,ink,31,700);
  s+=txt(108,259,'A–A KESİTİ · ŞEMATİK',18,muted,700);
  return s;
 },
 dossier: () => {
  let s=rect(58,218,1084,319)+rect(82,243,1036,52,ink,ink,6);
  ['PARÇA','REVİZYON','ADET','NUMUNE AMACI'].forEach((v,i)=>s+=txt([104,350,558,716][i],277,v,20,'white',700));
  [['Gövde','R02','1','Montaj denemesi'],['Kapak','R03','2','İki alternatifin kıyası']].forEach((r,i)=>{const y=337+i*63;r.forEach((v,j)=>s+=txt([104,350,558,716][j],y,v,23,ink,j===0?700:400));s+=seg(83,y+22,1117,y+22,line,1);});
  s+=txt(85,468,'Fiziksel teslim',20,orange,700)+txt(85,506,'Numune + kontrol kapsamı',22);
  s+=txt(610,468,'Dijital teslim',20,orange,700)+txt(610,506,'Dosya biçimi + düzenlenebilirlik',22);
  return s;
 },
 materials: () => {
  let s=rect(58,218,1084,319); const nodes=[[200,305,'Temas'],[600,276,'Sıcaklık'],[998,305,'Yük'],[338,465,'Görünüş'],[864,465,'Test amacı']];
  for(const [x,y,t] of nodes)s+=seg(600,392,x,y,line,3);
  s+=rect(447,348,306,82,ink,ink,15)+txt(600,384,'KULLANIM',20,'#cfd8d4',700,'middle')+txt(600,414,'KOŞULLARI',25,'white',700,'middle');
  nodes.forEach(([x,y,t],i)=>{s+=rect(x-115,y-30,230,59,'white',line,12)+circle(x-90,y,14,orange,orange)+txt(x-90,y+5,i+1,14,'white',700,'middle')+txt(x+10,y+7,t,22,ink,700,'middle');});
  return s;
 },
 scale: () => {
  let s=rect(58,218,530,319)+rect(616,218,526,319)+txt(86,258,'SUNUM ÖLÇEĞİ',20,orange,700)+txt(644,258,'AYRI DETAY GÖSTERİMİ',20,orange,700);
  s+=cube(109,349,.8)+cube(339,377,.45,{accent:true})+arrow(263,386,316,386)+txt(90,488,'Küçültmede ayrıntı kaybını kontrol edin.',21);
  s+=rect(661,320,151,98,'#dce5df')+circle(779,359,17,'none',orange,4)+seg(796,348,897,301,orange,2)+seg(796,370,897,435,orange,2)+circle(974,365,78,'#fff',ink,3)+rect(922,343,105,45,'#f2b28f',orange,6)+circle(945,365,8,paper,ink,2)+circle(1003,365,8,paper,ink,2);
  s+=txt(646,488,'İşlevli bağlantıyı daha büyük gösterin.',21);
  return s;
 },
 acceptance: () => {
  let s=rect(58,218,1084,319)+txt(84,259,'KONTROL',18,muted,700)+txt(434,259,'YÖNTEM',18,muted,700)+txt(803,259,'KAYIT',18,muted,700);
  const rows=[['Görünüş','Görsel inceleme','Fotoğraf + bulgu'],['Montaj','Karşı parçayla deneme','Dosya revizyonu'],['İşlev','Tanımlı test koşulu','Sonuç + açık maddeler']];
  rows.forEach((r,i)=>{const y=318+i*79; s+=seg(83,y-34,1118,y-34,line,1);r.forEach((v,j)=>s+=txt([85,435,805][j],y,v,j===2?21:23,ink,j===0?700:400));});
  return s;
 },
 cost: () => {
  let s=rect(58,218,344,222)+rect(428,218,344,222)+rect(798,218,344,222);
  s+=label(90,261,'1','Hazırlık')+label(460,261,'2','Üretim')+label(830,261,'3','Tamamlama');
  s+=lines(85,316,['Model düzeltme','Ölçü tamamlama','Revizyon planı'],23,muted,43)+lines(455,316,['Geometri ve yön','Baskı süresi','Malzeme ve adet'],23,muted,43)+lines(825,316,['Destek temizliği','Yüzey işlemi','Kontrol ve teslim'],23,muted,43);
  s+=rect(58,462,1084,74,ink,ink)+txt(600,508,'Aynı gramaj, aynı toplam kapsam anlamına gelmez.',26,'white',700,'middle');
  return s;
 },
 cnc: () => {
  let s=rect(58,218,530,319)+rect(616,218,526,319)+txt(86,258,'3D BASKI',20,orange,700)+txt(644,258,'CNC İŞLEME',20,orange,700);
  s+=stack(116,420,224,9)+`<path d="M215 288v24l15 17 15-17v-24Z" fill="${ink}"/>`+seg(230,329,230,393,orange,3,'5 5');
  s+=rect(681,345,242,78,'#dde3df',ink,4)+rect(772,345,60,44,paper,ink,2)+rect(787,282,30,68,ink,ink,3)+seg(801,277,801,337,orange,3,'6 4');
  s+=lines(366,330,['Katman yönü','Destek erişimi'],20,muted,36)+lines(947,330,['Takım erişimi','Bağlama'],20,muted,36);
  s+=txt(85,493,'Ekleyerek geometri oluşturur.',22,ink,700)+txt(644,493,'Stok malzemeden talaş kaldırır.',22,ink,700);
  return s;
 },
 technologies: () => {
  let s=''; const xs=[58,428,798]; const titles=['FDM','SLA','SLS'];
  xs.forEach((x,i)=>s+=rect(x,218,344,319)+txt(x+26,260,titles[i],27,orange,700));
  s+=stack(101,407,210,7)+`<path d="M187 297v29l19 14 19-14v-29Z" fill="${ink}"/>`+seg(206,340,206,394,orange,3,'6 4');
  s+=rect(472,343,255,86,'#f3c8b2',ink,4)+rect(516,297,166,17,ink,ink,2)+rect(563,314,73,74,'#ddd',ink,2)+seg(516,408,686,408,orange,4)+seg(600,408,600,455,orange,3,'5 4');
  s+=rect(842,343,255,86,'#dadfd8',ink,4);for(let i=0;i<13;i++)s+=circle(855+i*18,406,2,muted,muted,1);
  s+=seg(971,282,921,361,orange,3)+seg(921,361,1014,361,orange,4)+rect(914,364,100,43,'#b6c4bd',ink,2);
  s+=lines(86,477,['Filament ekstrüzyonu','Katman ve destek planı'],20)+lines(456,477,['Reçinenin ışıkla kürlenmesi','Yıkama ve son kür planı'],20)+lines(826,477,['Toz yatağında sinterleme','Toz temizleme planı'],20);
  return s;
 },
 asa: () => {
  let s=rect(58,218,530,319)+rect(616,218,526,319)+txt(86,263,'ASA',31,orange,700)+txt(644,263,'PA-CF',31,orange,700);
  s+=circle(143,343,28,'#f5bc98',orange,3); for(let i=0;i<8;i++){const a=i*Math.PI/4;s+=seg(143+38*Math.cos(a),343+38*Math.sin(a),143+52*Math.cos(a),343+52*Math.sin(a),orange,3);}
  s+=lines(235,319,['Dış ortam ve yüzey','UV / sıcaklık koşulları','Ürün veri sayfası'],22,muted,41);
  s+=rect(675,316,103,81,'#d4dcd6',ink,6);for(let i=0;i<5;i++)s+=seg(680+i*19,319,706+i*14,395,ink,3);
  s+=lines(825,319,['Yük ve rijitlik ihtiyacı','Nem / yön etkileri','Ürün veri sayfası'],22,muted,41);
  s+=lines(85,479,['Malzeme ailesi adı tek başına','uygunluk garantisi vermez.'],21,ink,29,700)+lines(644,479,['Geometri ve üretim koşullarıyla','birlikte değerlendirin.'],21,ink,29,700);
  return s;
 },
 uses: () => {
  let s=rect(58,218,363,319)+txt(85,260,'NESNE + AMAÇ',23,orange,700)+cube(145,351,.83,{accent:true})+txt(90,493,'Beklenen kullanımı açıklayın.',21);
  s+=arrow(435,376,503,376);
  const rows=[['Görsel arşiv','Temizlenmiş yüzey ağı'],['Yeniden tasarım','Referans ağ + CAD kapsamı'],['Geometri karşılaştırma','Referans, hizalama, yöntem']];
  rows.forEach((r,i)=>{const y=218+i*111;s+=rect(523,y,619,97)+txt(546,y+35,r[0],23,ink,700)+txt(546,y+72,r[1],21,muted);});return s;
 },
 qc: () => {
  let s=rect(58,218,579,319)+rect(663,218,479,319);
  s+=txt(86,257,'ORTAK REFERANSTA KARŞILAŞTIRMA',19,muted,700);
  s+=`<path d="M152 428V315H485V428Z" fill="none" stroke="${ink}" stroke-width="4"/><path d="M157 433V320L492 312V433Z" fill="none" stroke="${orange}" stroke-width="3"/>`;
  s+=seg(129,449,129,287,muted,2)+seg(113,433,526,433,muted,2);
  s+=circle(153,433,6,ink,ink)+txt(99,487,'Referans geometri',20,ink)+seg(294,481,326,481,orange,3)+txt(337,487,'Ölçülen yüzey',20,ink);
  s+=label(698,260,'1','Hizalama yöntemi')+label(698,338,'2','Ölçüm belirsizliği')+label(698,416,'3','Kabul sınırları');
  s+=lines(691,479,['Renk haritası tek başına','uygunluk kararı değildir.'],21,ink,29,700);return s;
 },
 replacement: () => {
  let s=txt(68,252,'TALEPTE İŞARETLEYİN',18,orange,700);
  s+=txt(68,301,'Referans yüzey',24,ink,700)+lines(68,332,['Fotoğraf ve ölçüde','aynı yüzeyi kullanın.'],20);
  s+=txt(68,421,'Kullanım koşulu',24,ink,700)+lines(68,452,['Yük, sıcaklık ve temas','bilgisini ekleyin.'],20);
  // Exploded mounting bracket: large L profile, lifted fastener, and functional datums.
  s+=`<path d="M458 297l58-31h95l-58 31Z M553 297l58-31v125l-58 31Z M553 422l58-31h211l-58 31Z" fill="#efa16f" stroke="${ink}" stroke-width="3"/>`;
  s+=`<path d="M458 297h95v125h211v74H458Z" fill="${ink}" stroke="${ink}" stroke-width="3"/><path d="M764 422l58-31v74l-58 31Z" fill="#536562" stroke="${ink}" stroke-width="3"/>`;
  s+=circle(505,350,21,paper,'#a1b1a7',3)+`<ellipse cx="692" cy="413" rx="22" ry="9" fill="${paper}" stroke="${ink}" stroke-width="3"/>`;
  s+=seg(692,320,692,411,orange,2,'7 6');
  s+=rect(682,280,20,52,'#c5d1c9',ink,2)+rect(666,269,52,18,'#f4b18a',ink,3)+seg(689,294,702,294,ink,2)+seg(689,303,702,303,ink,2)+seg(689,312,702,312,ink,2);
  s+=seg(325,319,407,319,muted,2)+seg(407,319,475,343,muted,2)+circle(475,343,4,orange,orange,1);
  s+=seg(325,452,432,452,muted,2)+circle(432,452,4,orange,orange,1);
  s+=txt(861,279,'Karşı parça',23,ink,700)+lines(861,310,['Bağlantı tipini','ve eşini paylaşın.'],20)+seg(836,286,727,286,muted,2);
  s+=txt(861,404,'Kritik ölçü',23,ink,700)+lines(861,435,['Delik, eksen ve','montaj boşluğu'],20)+seg(829,424,846,424,muted,2);
  s+=dimension(458,544,764,544,'Uyum numunesi ile doğrulayın');
  return s;
 },
};

const entries = [
 ['/3d-baski','3D baskıda doğru numune planı','Görünüş, montaj ve işlev aynı kabul ölçütünü kullanmaz.','print','Dijital modelden baskı katmanlarına geçiş; görünüş, montaj ve işlev için farklı kontrol hedefleri.'],
 ['/3d-tarama','3D taramada önce çıktıyı seçin','Fiziksel nesne, yüzey ağı ve düzenlenebilir CAD farklı aşamalardır.','scan','Fiziksel nesneden yüzey ağına ve istenen ağ, CAD veya rapor çıktısına giden üç aşama.'],
 ['/3d-modelleme','Fikirden test edilebilir modele','Referans, sabit ölçüler ve numune onayı birlikte planlanır.','model','Referans eskizden ölçülü CAD modeline ve revizyonlu fiziksel numune kararına geçiş.'],
 ['/rehber/teklif-icin-dosya-hazirlama','Teklif için dosya paketi','Güncel model, ölçü referansı ve kullanım amacını bir araya getirin.','request','Model veya eskiz, ölçü referansı ve kullanım amacı dosyalarının tek güncel talep paketinde birleştirilmesi.'],
 ['/rehber/3d-baski-fiyatlandirma','Baskı teklifini kalem kalem okuyun','Karşılaştırılabilir fiyat için önce teslim kapsamını eşitleyin.','price','Dosya hazırlığı, üretim, son işlem ve teslimat kalemlerini belirleyen bilgilerin karşılaştırma tablosu.'],
 ['/rehber/tarama-ve-tersine-muhendislik','Tarama ve yeniden modelleme','Mevcut şekli kaydetmek ile yeni tasarım kurmak farklı işlerdir.','reverse','Aşınma izlerini içeren taranmış yüzey ile referans ölçülerle yeniden kurulan nominal CAD geometrisinin farkı.'],
 ['/rehber/numune-ve-revizyon','Gözlemden kontrollü revizyona','Bulguyu dosya değişikliğiyle eşleyin; yeni numunede tekrar kontrol edin.','revision','Sürtünme bulgusunun kaydı, hedef model değişikliği ve yeni numunede aynı yöntemle tekrar kontrol.'],
 ['/rehber/stl-dosya-hazirlama','STL göndermeden önce dört kontrol','Birim, yüzey bütünlüğü, normal yönü ve parça ayrımı.','stl','Üçgen yüzey ağında açık kenar ve dış normalin yakın planı; boyut, kapalı yüzey, normal yönü ve parça ayrımı kontrol listesi.'],
 ['/rehber/tarama-verisinden-cad','Tarama ağından düzenlenebilir CAD’e','Serbest yüzeyler ile işlevli bağlantıları ayrı ele alın.','cad','Tarama ağındaki serbest yüzey ve ölçülü bağlantı bölgelerinin ayrılması ve CAD teslim kapsamı.'],
 ['/rehber/kesit-nasil-incelenir','Kesitte duvar ve montaj boşluğu','İncelenecek bağlantının ekseninden geçen bir düzlem seçin.','section','Şematik ürün gövdesi kesitinde duvar, elektronik kart ve montaj hareket boşluğunun işaretlenmesi.'],
 ['/rehber/teknik-teklif-dosyasi','Teknik kapsamı tek tabloda toplayın','Parça kodu, revizyon, adet ve numune amacı birlikte izlenir.','dossier','Örnek gövde ve kapak satırlarında parça, revizyon, adet ve numune amacı; fiziksel ve dijital teslim ayrımı.'],
 ['/rehber/malzeme-secim-sorulari','Malzemeden önce kullanım koşulları','Temas, sıcaklık, yük, görünüş ve test amacı seçim girdileridir.','materials','Kullanım koşulları merkezine bağlanan beş karar girdisi: temas, sıcaklık, yük, görünüş ve test amacı.'],
 ['/rehber/maket-olcek-planlama','Ölçek ve detay planı','Genel görünüşü küçültürken önemli bağlantıları kaybetmeyin.','scale','Küçültülmüş sunum modeli ve ayrı büyütülmüş işlevli bağlantı detayı karşılaştırması.'],
 ['/rehber/numune-kabul-plani','Numune kabulünü gözlenebilir yazın','Kontrol türünü uygun yöntem ve kanıtla eşleştirin.','acceptance','Görünüş, montaj ve işlev kontrollerinin inceleme yöntemi ve kaydedilecek kanıtla eşleştirildiği tablo.'],
 ['/rehber/prototip-maliyetini-ne-belirler','Prototip maliyetinin üç bileşeni','Hazırlık, üretim ve tamamlama işlerini aynı kapsamda değerlendirin.','cost','Hazırlık, üretim ve tamamlama başlıkları altında prototip maliyetini etkileyen dokuz kapsam girdisi.'],
 ['/rehber/3d-baski-mi-cnc-mi','3D baskı mı, CNC mi?','Yöntemi; geometri, malzeme ve prototipin test amacına göre seçin.','cnc','Katman ekleyen 3D baskı ile stok malzemeden talaş kaldıran CNC şemaları; destek ve takım erişimi farkı.'],
 ['/rehber/fdm-sla-sls-karsilastirma','FDM, SLA ve SLS nasıl ayrılır?','Malzeme besleme ve son işlem ihtiyacı teknolojiye göre değişir.','technologies','FDM filament ekstrüzyonu, SLA reçinenin ışıkla kürlenmesi ve SLS toz yatağı sinterleme süreçlerinin şemaları.'],
 ['/rehber/asa-pa-cf-karsilastirma','ASA ve PA-CF seçim soruları','Malzeme ailesi yerine kullanım koşulunu ve ürün veri sayfasını okuyun.','asa','ASA için dış ortam ve UV sıcaklık koşulları; PA-CF için yük, rijitlik, nem ve yön etkisi değerlendirme alanları.'],
 ['/rehber/3d-tarama-kullanim-alanlari','3D taramada amaç ve teslim eşleşmesi','Arşiv, tasarım referansı ve geometri karşılaştırması farklı kapsam ister.','uses','Fiziksel nesnenin dijital arşiv, yeniden tasarım ve geometri karşılaştırması amaçlarına göre teslim seçenekleri.'],
 ['/rehber/3d-tarama-kalite-kontrol','Tarama verisini nasıl karşılaştırırsınız?','Ortak referans, yöntem ve kabul sınırları birlikte tanımlanır.','qc','Aynı referansa hizalanmış nominal ve ölçülen yüzeyler; yöntem, ölçüm belirsizliği ve kabul sınırlarının ayrımı.'],
 ['/cozumler/yedek-parca-uretimi','Yedek parça için talep hazırlığı','Referans parçadan modele ve uyum numunesine kontrollü geçiş.','replacement','Patlatılmış bağlantı parçası şemasında referans yüzey, kullanım koşulu, karşı parça ve kritik montaj ölçüsü çağrıları.'],
];

await fs.mkdir(directory,{recursive:true});
for (const key of selectedKeys) if (!diagrams[key]) throw new Error(`Unknown diagram key: ${key}`);
const logo = await fs.readFile(path.join(root,'public/brand/identity/3dyanimda/logo_wordmark_light.svg'),'utf8');
const innerLogo = logo.replace(/^<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'');
const manifest={}; const report=[];
for(const [route,title,subtitle,key,alt] of entries){
 const slug=route.split('/').filter(Boolean).join('--');
 const illustration = diagrams[key]();
 const caption = key==='dossier' ? 'Teknik kapsam için örnek tablo. Kayıtlar bir müşteri projesini temsil etmez.' : '3D Yanımda açıklayıcı şeması. Geometri ve süreç gösterimleri ölçekli teknik çizim değildir.';
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc"><title id="title">${esc(title)}</title><desc id="desc">${esc(alt)}</desc><g font-family="DejaVu Sans, Arial, sans-serif"><rect width="1200" height="630" fill="${paper}"/><rect width="1200" height="194" fill="#141a1d"/><rect width="7" height="194" fill="${orange}"/><svg x="58" y="26" width="193" height="38" viewBox="0 0 508.78794178794175 100">${innerLogo}</svg>${txt(1142,52,route.startsWith('/rehber')?'TEKNİK REHBER':'HİZMET SÜRECİ',17,'#cdd7d2',600,'end')}${txt(58,116,title,36,'white',700)}${txt(58,160,subtitle,21,'#cdd7d2')}${illustration}${seg(58,565,1142,565,line,1)}${txt(58,602,'3dyanimda.com',20,ink,700)}${txt(1142,602,'Açıklayıcı şema · Ölçekli teknik çizim değildir',17,muted,400,'end')}</g></svg>`;
 const svgPath=path.join(directory,`${slug}.svg`),pngPath=path.join(directory,`${slug}.png`);
 if (!selectedKeys.size || selectedKeys.has(key)) {
  await fs.writeFile(svgPath,svg);
  await sharp(Buffer.from(svg)).png({compressionLevel:9}).toFile(pngPath);
 }
 const buffer=await fs.readFile(pngPath),meta=await sharp(buffer).metadata();
 if(meta.width!==1200||meta.height!==630||meta.format!=='png')throw new Error(`Invalid image ${slug}`);
 await sharp(buffer).raw().toBuffer(); // Decode the full stream; a PNG header alone is not sufficient.
 manifest[route]={url:`/images/editorial/3dyanimda/${slug}.png`,alt,width:1200,height:630,mimeType:'image/png',caption};
 report.push({route,...manifest[route],bytes:buffer.length,sha256:crypto.createHash('sha256').update(buffer).digest('hex')});
}
await fs.writeFile(path.join(root,'src/content/3dy-guide-media.json'),JSON.stringify(manifest,null,2)+'\n');
await fs.writeFile(path.join(root,'docs/audits/3dy-guide-assets-2026-10-23.json'),JSON.stringify({
  brand:'3dyanimda',
  createdAt:new Date().toISOString(),
  method:'Original code-native explanatory SVG diagrams, rasterized with sharp',
  source:'scripts/create-3dy-guide-assets.mjs',
  subject:'Three core services, thirteen existing guides, four additional guides and one replacement-part solution',
  validated:{imageCount:report.length,dimensions:'1200x630',format:'png',completeStreamDecode:true,visualContactSheetReviewed:true},
  totalBytes:report.reduce((a,b)=>a+b.bytes,0),
  limitations:['Illustrations are schematic, not scale drawings, production photographs or evidence of a completed client project.','Publication and live HTTP accessibility are checked separately by the release owner.'],
  images:report,
},null,2)+'\n');
const thumbnails=[];
for (const [i,r] of report.entries()) thumbnails.push({input:await sharp(path.join(root,'public',r.url)).resize(400,210).png().toBuffer(),left:(i%3)*400,top:Math.floor(i/3)*210});
await sharp({create:{width:1200,height:Math.ceil(thumbnails.length/3)*210,channels:3,background:paper}}).composite(thumbnails).jpeg({quality:90}).toFile('/tmp/3dy-guide-media-contact-sheet.jpg');
console.log(JSON.stringify({count:report.length,totalBytes:report.reduce((a,b)=>a+b.bytes,0),contactSheet:'/tmp/3dy-guide-media-contact-sheet.jpg',images:report},null,2));
