import {readFileSync,writeFileSync} from 'node:fs';
const register=JSON.parse(readFileSync('content/authoring/source-register.json','utf8'));
const source=id=>{const s=register.sources.find(s=>s.id===id);if(!s?.url)throw Error('Source missing: '+id);return {id,title:s.publisher+' — '+s.title,url:s.url};};
// A dated editorial revision, deliberately not the build time. Do not refresh without changing/reviewing the note.
const revisedAt='2026-10-11T00:10:00.000Z';
const notes={};
const add=(paths,text,scope,ids)=>{for(const path of paths)notes[path]={revisedAt,text,scope,sources:ids.map(source)};};
add(['/malzemeler/pla'],'PLA, biçim ve sunum prototipleri için değerlendirilebilir. Prototipte geometrinin uygun görünmesi, son parçanın ısıl veya mekanik kullanım onayı değildir.','Genel malzeme bilgisi; kullanılacak ürünün teknik verileri ayrıca değerlendirilir.',['prusa-pla']);
add(['/malzemeler/petg'],'PETG seçiminde yalnızca malzeme adı yeterli değildir; parçanın geometrisi, üretim düzeni ve kullanım koşulları birlikte değerlendirilir.','Üretici rehberi genel başvuru içindir; belirli bir parça için performans garantisi oluşturmaz.',['prusa-petg']);
add(['/malzemeler/abs'],'ABS baskı planında çarpılma ve büzülme dikkate alınmalıdır. Montaj ilişkileri numune üzerinden kontrol edilmelidir.','Genel baskı davranışı; bu kaynak atölyenin ekipmanını veya parça toleransını belgelemez.',['prusa-abs']);
add(['/malzemeler/asa'],'ASA dış ortam uygulamaları için bir malzeme adayıdır. Belirli kullanım ömrü ve montaj performansı, gerçek ürün verisi ve uygulama testleriyle değerlendirilir.','Genel malzeme seçimi; süre veya dayanım taahhüdü değildir.',['prusa-asa']);
add(['/malzemeler/tpu'],'Esnek filamentlerde sertlik sınıfı ve parçanın baskı yapısı birlikte ele alınmalıdır. Esneklik tek başına sızdırmazlık veya basınca uygunluk göstermez.','Genel esnek filament bilgisi; belirli TPU sınıfı ve uygulama ayrıca doğrulanır.',['prusa-flex']);
add(['/malzemeler/muhendislik-polimerleri'],'Poliamid değerlendirmesinde nem koşulları ve malzemenin hazırlanması önemlidir. Farklı mühendislik polimerlerinin özellikleri birbirinin yerine kullanılamaz.','Bu kaynak yalnızca poliamid hakkındaki genel bilgiyi destekler; stok veya üretim kapasitesi beyanı değildir.',['prusa-pa']);
add(['/rehber/stl-dosya-hazirlama','/rehber/teklif-icin-dosya-hazirlama'],'STL biçimi kendi başına ölçü birimi taşımaz. Dışa aktarımda birimi ve ağ inceliğini seçin; teslimde hedef birimi ayrıca belirtin ve bilinen bir ölçüyü kontrol edin.','Autodesk Fusion dışa aktarım belgelerine dayanan dosya hazırlama bilgisi.',['autodesk-stl-export']);
add(['/3d-tarama','/rehber/tarama-verisinden-cad','/rehber/tarama-ve-tersine-muhendislik','/rehber/kirik-parca-yeniden-uretim'],'Taramadan elde edilen yüzey ağı ile düzenlenebilir CAD modelinin hazırlanması ayrı iş adımlarıdır. Teslim beklentisi, yüzey verisi ve yeniden modelleme kapsamı olarak açıkça belirtilmelidir.','Genel iş akışı açıklaması; ölçüm doğruluğu veya otomatik dönüşüm garantisi değildir.',['artec-reverse-engineering','autodesk-mesh-tools']);
writeFileSync('src/content/source-notes.json',JSON.stringify(notes,null,2)+'\n');
console.log('Reviewed, scoped technical notes for '+Object.keys(notes).length+' route patterns.');
