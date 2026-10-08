import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {cases} from './parcayanimda-cases.mjs';
import {supplements} from './parcayanimda-supplement-main.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const read = p => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const tail = read('content/authoring/local/parcayanimda-supplement-tail.json');
const localities = read('content/authoring/localities-evidence.json');
const originals = read('src/content/pages.json').filter(p=>p.brand==='parcayanimda' && p.kind==='location' && p.status==='draft');
const serviceKeys = ['','3d-baski','3d-tarama','3d-modelleme'];
const serviceNames = ['Özel parça değerlendirmesi','3D baskı','3D tarama','3D modelleme'];
const serviceSummary = [
  topic=>`Kırık veya eksik parçanız için gereken referansları ve kabul ölçütlerini hazırlayın. ${topic[0].toLocaleUpperCase('tr')+topic.slice(1)} üzerinden örnek bir ihtiyaç değerlendirmesi.`,
  topic=>`${topic[0].toLocaleUpperCase('tr')+topic.slice(1)} örneğinde baskıya geçişi, ilk numunenin montaj kontrolünü ve teslimde kaydedilecek farkları inceleyin.`,
  topic=>`${topic[0].toLocaleUpperCase('tr')+topic.slice(1)} için örnek tarama kapsamı: korunacak yüzeyleri, görünmeyen bağlantıları ve yeniden üretim için gereken ek referansları ayırın.`,
  topic=>`${topic[0].toLocaleUpperCase('tr')+topic.slice(1)} örneğiyle CAD girdilerini, bağlantı referanslarını ve revizyon kabulünü tanımlayın; ölçülen biçimle tasarım kararını ayırın.`,
];
const contextNotes = [
  'Eksik veya kırık referansın hangi cihazda kaldığını kaydetmek, uzaktan ön incelemenin kapsamını belirler.',
  'Kontrolü yapacak kişinin parça koduyla bulguları göndermesi, aynı montajı izlemeyi sağlar.',
  'Nesnenin taşınıp taşınamayacağını ve görünmeyen yüzeylerini ön görüşmede bildirin.',
  'Revizyonun montaj yerindeki karşılığını ölçü krokisiyle tarif ederek dosya sürümlerini eşleştirin.',
];
const logisticsNotes = [
  'Numune kargo veya kurye ile ulaştırılabilir; elden teslim için Örnek Mahallesi atölyesine randevu alın.',
  'Ürün kargo ve kurye ile gönderilebilir. Elden alım randevuyla yapılır; ilk örneğin kontrol kaydı ayrı tutulur.',
  'Tarama için atölyeye randevuyla numune getirebilir veya gönderim seçeneklerini görüşebilirsiniz.',
  'Fiziksel referans kargo, kurye veya randevulu elden teslimle ulaşabilir; dijital onay ve parça dönüşü ayrı takip edilir.',
];
const sectionNames = [
  ['Talebin girdileri ve parçanın görevi','Kararın dayanağı ve kabul sınırı'],
  ['Baskı dosyasında kritik yüzeyler','İlk örnekte kaydedilecek kontrol'],
  ['Tarama referansı ve yüzey kapsamı','Eksik verinin nasıl ele alınacağı'],
  ['CAD referansları ve bağlantı ilişkisi','Revizyonun teslim kontrolü'],
];
const takeawaySets = [
 ['Cihaz varyantını belirtin','Eksik referansları ayırın','Kabul kontrolünü tanımlayın'],
 ['Kritik bağlantıyı işaretleyin','İlk örneği kodlayın','Montaj bulgularını kaydedin'],
 ['Hasarlı yüzeyi ayırın','Görünmeyen alanı belirtin','İstenen veri türünü seçin'],
 ['Ölçü referansını sabitleyin','Varyantları ayrı adlandırın','Revizyon farkını kaydedin'],
];
const sourceLinks = slug => {
  const place=localities.places[slug];
  const ids = new Set(place.facts.flatMap(f=>f.sourceIds));
  return localities.sources.filter(s=>s.url && ids.has(s.id)).map(({title,url})=>({title,url}));
};
const evidence = (original,slug)=>original.evidence+'\nCoğrafi kaynak kontrolü — 8 Ekim 2026: '+sourceLinks(slug).map(s=>`${s.title}: ${s.url}`).join('; ')+'. Teknik örnekler koşullu değerlendirme rehberidir; yerel müşteri, tamamlanmış proje veya yayın onayı kaydı değildir.';
const rows = [];
for (const c of cases) {
  const [slug,topic]=c;
  for (let mode=0;mode<4;mode++) {
    const key=serviceKeys[mode];
    const original=originals.find(p=>(slug==='ornek'?p.neighborhood==='ornek':p.district===slug&&!p.neighborhood)&&p.service===key);
    if(!original) throw new Error(`Missing ${slug} ${key}`);
    const tuple=supplements[slug]?.[mode];
    const extra=tail[slug]?.[key] || {
      summary:serviceSummary[mode](topic),
      faq:[{q:tuple[1],a:tuple[2]},{q:tuple[3],a:tuple[4]}],
      local_context:tuple[5]+' '+contextNotes[mode],
      logistics:tuple[6]+' '+logisticsNotes[mode],
      answer:tuple[0],takeaways:takeawaySets[mode],
    };
    // The Örnek copy already contains complete workshop-specific service instructions.
    if(slug==='ornek') { extra.local_context=tuple[5]; extra.logistics=tuple[6]; }
    const locality=localities.places[slug].name;
    rows.push({
      ...original,
      title:`${locality} ${serviceNames[mode]}: ${topic}`,
      summary:extra.summary,
      sections:sectionNames[mode].map((title,i)=>({title,body:c[2+mode*2+i]})),
      faq:extra.faq,
      local_context:extra.local_context,logistics:extra.logistics,
      evidence:evidence(original,slug),reviewed_at:'2026-10-07T20:48:02+03:00',updated_at:'2026-10-08',
      editorial:{answer:extra.answer,takeaways:extra.takeaways,relatedPaths:serviceKeys.filter(Boolean).map(service=>`/${service}`),sources:sourceLinks(slug)},
    });
  }
}
const city = [
  {
    service:'3d-baski',title:'İstanbul özel plastik parça baskısı: onaylı numuneden çoğaltmaya',
    summary:'Farklı cihazlardan gelen yedek parça isteklerini aynı siparişte karıştırmadan değerlendirin. Üretime esas dosyayı, ilk uyum örneğini ve çoğaltılacak revizyonu ayrı kayıtlarla yönetin.',
    sections:[
      {title:'Siparişi parça ailelerine ayırın',body:'Bir talepte düğme, kör tapa ve tutucu klips bulunması hepsinin aynı üretim şartlarını taşıdığı anlamına gelmez. Her kaleme parça kodu, kullanım görevi, cihaz varyantı ve adet verin. Dosyasız kalemler için modelleme ihtiyacı, hazır dosyalılar için baskıya uygunluk ayrı değerlendirilir. Renk tercihini montaj kabulünün yerine koymadan ilk örneğin hangi cihazda kontrol edileceğini belirleyin.'},
      {title:'Birinci örnek ile seri talebin sınırı',body:'İlk baskıda görülen boşluk veya sürtme, revizyon numarası ve bağlantı fotoğrafıyla kaydedilir. Onaylanan dosya dondurulduktan sonra çoğaltılacak adet görüşülür; süreç içinde değiştirilen model eski numunenin onayını otomatik devralmaz. Aynı görünümlü iki cihazın farklı yuvaları varsa ayrı varyant gerekebilir. Belirtilmemiş dayanım, kullanım ömrü veya sertifikasyon geometrik uyumdan çıkarılmaz.'},
      {title:'Teslim listesini teknik kabulle eşleştirin',body:'Fiziksel teslimde parça kodu, adet ve revizyon kontrol edilir. Elde kalan orijinal numunenin geri dönüşü yeni üretimden ayrı kalem olmalıdır. Montajı kullanıcı yapacaksa hangi cihaz ve bağlantı üzerinde deneneceği yazılır; yalnızca kutunun teslim alınması teknik uyumun kabul edildiği anlamına gelmez. Gevşek metal donanım ya da ayrı montaj parçası gerekiyorsa kapsamı listede görünür tutulur.'},
    ],
    faq:[
      {q:'Farklı ilçelerdeki şubelere aynı parçayı gönderebilir miyim?',a:'Her teslim noktasının adresi ve sorumlusu ayrı kaydedilebilir. Aynı revizyonun gerçekten aynı cihaz varyantında kullanılacağı ölçü referansıyla karşılaştırılmalıdır.'},
      {q:'Dosyamın son sürümünü nasıl ayırt etmeliyim?',a:'Parça kodu ve revizyonu dosya adına ekleyin; eski sürümleri silmeden üretime esas dosyayı açıkça işaretleyin. Değişiklik açıklaması numune onayıyla eşleşmelidir.'},
      {q:'Şehir dışındaki montaj için de gönderim var mı?',a:'Diğer şehirlere kargo gönderimi vardır. Montaj ölçüleri ve deneme geri bildirimi uzaktan paylaşılabilir; varış adresiyle numunenin iade ihtiyacını ayrı yazın.'},
    ],
    local_context:'İstanbul 39 ilçeye ve iki yakaya yayıldığı için yalnızca şehir adı, numunenin nerede kontrol edileceğini açıklamaz. Talepte montaj ilçesi, mahalle ve cihaz varyantı birlikte bulunmalıdır. Baskı örneğini Ataşehir, Örnek Mahallesi atölyesinden alacak kişiyle kullanacak kişi farklıysa kabul bulgularını kimin aktaracağı belirlenir. İlçe sayfaları farklı şube adresleri anlamına gelmez.',
    logistics:'Kargo, kurye ve elden teslim seçenekleri kullanılabilir; atölyeden alım öncesinde randevu alınmalıdır. Birden fazla teslim adresinde kutu kodunu parça revizyonuyla eşleştirin. Eski numunenin iadesi ve yeni ürünün gönderimi ayrı kalemlerdir; adresin iki yakadan birinde olması kesin taşıma süresi veya ücret taahhüdü oluşturmaz.',
    editorial:{answer:'Her baskı kalemini cihaz varyantı ve revizyonla kodlayın; ilk montaj örneği kabul edilmeden değişmiş dosyayı çoğaltma talebine bağlamayın.',takeaways:['Parça ve cihazı eşleştirin','İlk örneğin revizyonunu kaydedin','Teslim ile teknik kabulü ayırın'],relatedPaths:['/3d-baski','/3d-modelleme','/3d-tarama']},
  },
  {
    service:'3d-tarama',title:'İstanbul yedek parça taraması: numune, karşılık ve eksik geometri',
    summary:'Çizimi bulunmayan bir parçanın taranmasında sağlam örnek, kırık yüzey ve cihazda kalan karşılık farklı kanıtlardır. İstenen dijital çıktıyı ve erişilemeyen bölgeleri çalışmaya başlamadan tanımlayın.',
    sections:[
      {title:'Hangi referans gerçeği temsil ediyor?',body:'Aşınmış numunenin ölçüsü ile yeni parçanın hedef ölçüsü aynı olmayabilir. Kırık kenarı, önceden yapıştırılmış bölgeyi ve sonradan açılmış deliği fotoğraflarda işaretleyin. Sağlam eş örnek varsa sağ-sol veya ürün varyantı farkını belirtin. Referanslar çelişiyorsa sessizce birleştirmek yerine hangi geometrinin ölçüldüğü ve hangisinin yeniden tasarlanacağı kapsamda açıklanır.'},
      {title:'Yerinde kayıt ile numune gönderimi arasında karar',body:'Cihaza bağlı parçanın kapalı yüzeyleri dışarıdan görünmeyebilir. Nesnenin boyutu, güvenli sabit duruşu, çevre erişimi ve sökülebilirliği yerinde tarama değerlendirmesinin girdileridir. Küçük çıkarılabilir bir örnekte fiziksel gönderim yeterli olabilir; taşınamayan sistemde yerinde çalışma ele alınır. Her iki durumda da tarama, görünmeyen boşlukları otomatik ölçen bir yöntem gibi sunulmaz.'},
      {title:'Dijital teslimi yeniden üretim hedefiyle tarif edin',body:'Ham yüzey kaydı, düzenlenmiş mesh ve ölçülere bağlı CAD modeli farklı çıktılardır. Yalnızca arşiv hedefleniyorsa hasar izlerini korumak istenebilir; işlevsel yedek parçada bunların yeniden yorumlanması gerekebilir. Teslimde veri türü, birim, parça yönü ve yorumlanan bölgeler belirtilir. Üretim dosyasına geçişte bağlantı ölçülerinin ayrıca kontrol edilmesi gereken alanlar görünür bırakılır.'},
    ],
    faq:[
      {q:'Taramayla parçanın orijinal malzemesini öğrenebilir miyim?',a:'Geometrik sayısallaştırma malzeme analizi değildir. Polimer türü, sertlik veya ısı davranışı için bu hizmetten elde edilmemiş sonuçlar yazılmaz.'},
      {q:'Parça tamamen kayıpsa tarama neyi kullanır?',a:'Sağlam eş, montaj yuvası veya ilişkili yüzeyler referans olabilir. Ortada ölçülebilecek özgün geometri yoksa yeniden tasarım ihtiyacı ayrıca değerlendirilir.'},
      {q:'Tarama dosyası neden üretim dosyasından farklı olabilir?',a:'Yüzey verisindeki eksik bölgeler, hasar ve ölçü ilişkileri düzenleme gerektirebilir. Üretim için hedeflenen biçim bu nedenle ham kayıttan ayrı revizyonla tutulur.'},
    ],
    local_context:'İstanbul genelindeki yerinde tarama talebinde ilçe adından sonra nesnenin gerçek adresi, bulunduğu kat veya çalışma alanı ve erişilemeyen yönleri açıklanmalıdır. Adalar gibi deniz geçişi bulunan konumlarda ekipman ve erişim adımları ayrıca planlanır. Doğrulanan hizmet yerinde 3D taramayı içerir; her adreste koşulsuz çalışma, sabit ulaşım süresi veya belirli ölçüm hassasiyeti beyan edilmemiştir.',
    logistics:'Numune gönderilecekse parça listesi ve korunacak yüzeyler önceden kayda alınır. Kargo ya da kurye kullanılabilir; elden numune bırakmak için Örnek Mahallesi, Ataşehir atölyesine randevu gerekir. Bir cihazın sökülmesi gerekiyorsa bu işlem tarama için kendiliğinden yetkilendirilmiş sayılmaz; güvenli ayrılmış referans ve çalışma kapsamı görüşülür.',
    editorial:{answer:'Ölçülebilen yüzeyle yeniden tasarlanacak eksik kısmı ayırın; tarama teslimini ham veri, mesh veya CAD hedefiyle açıkça adlandırın.',takeaways:['Hasarı referanstan ayırın','Erişim sınırını fotoğraflayın','Veri türünü baştan seçin'],relatedPaths:['/3d-tarama','/3d-modelleme','/3d-baski']},
  },
  {
    service:'3d-modelleme',title:'İstanbul özel parça modelleme: ölçüden montaj kabulüne',
    summary:'Eksik parça çiziminde dış görünüş kadar bağlantı referansı, çalışma hareketi ve değişiklik sınırı önemlidir. Ölçü krokisini, cihaz varyantını ve teslim edilecek model türünü aynı kapsamda tanımlayın.',
    sections:[
      {title:'Ölçü listesini işlevle ilişkilendirin',body:'Delik aralığı, mil kesiti, geçme derinliği ve dış kontur farklı işlevleri belirler. Hangi ölçünün bağlantıyı, hangisinin yalnızca görünüşü yönettiğini açıklayın. Ölçüler farklı kişilerden geliyorsa ortak bir referans düzlemi seçilir; çelişen değerler rastgele ortalanmaz. Bir fotoğrafta görülmeyen yüzey için varsayım yapılacaksa bu, ölçülmüş bilgiyle aynı güven düzeyinde sunulmaz.'},
      {title:'Mevcut parçayı kopyalamak mı, görevini değiştirmek mi?',body:'Kaybolan bir kapağı yeniden çizmekle tutma biçimini vidalı bağlantıya dönüştürmek farklı tasarım işleridir. Yeni delik, metal ek parça veya değişen hareket yönü gerekiyorsa kapsam genişlemesi açıkça yazılır. Eski cihaz üzerinde müdahale gerektiren seçenek kullanıcıyla kararlaştırılmadan onaylanmış tasarım sayılmaz. Güvenlik işlevi olan parçalar yalnızca geometrik benzerlik üzerinden eşdeğer ilan edilmez.'},
      {title:'Revizyonu ölçülebilir sonuçla kapatın',body:'Görsel onay parçanın şekline, montaj denemesi gerçek karşılığına ilişkin bilgi verir. İlk örnekteki sıkışma veya boşluk belirli bir yüzey ve yönle kaydedilir; yeni dosya yalnızca daha iyi adıyla değil revizyon koduyla paylaşılır. Teslim kapsamı düzenlenebilir CAD, baskı geometrisi ve varsa ölçü çizimi olarak ayrı listelenir. Denenmemiş varyantın onayı diğer cihazlara yayılmaz.'},
    ],
    faq:[
      {q:'Fotoğraftan her ölçüyü kesin çıkarabilir misiniz?',a:'Perspektif ve görünmeyen yüzeyler belirsizlik yaratır. Bilinen ölçek referansı, ölçülü kroki veya fiziksel numune gerekebilir; fotoğraf tek başına kesin ölçü belgesi değildir.'},
      {q:'Baskı dosyası düzenlenebilir tasarım dosyasıyla aynı mı?',a:'Dosya türleri farklı düzenleme olanakları sunar. Sonradan hangi ölçülerin değiştirilmesinin beklendiği belirtilerek teslim edilecek CAD ve üretim formatları ayrı seçilir.'},
      {q:'Bir parça onaylandıktan sonra benzerlerine uygulanabilir mi?',a:'Ortak bağlantı ve kullanım koşulları doğrulanmalıdır. Benzer görünüş, farklı cihaz varyantlarına otomatik uyum veya aynı kabul sonucu sağlamaz.'},
    ],
    local_context:'İstanbul’un farklı ilçelerinden gelen ölçü, numune ve onay aynı parça koduna bağlanmalıdır. Çizimi inceleyen kişi başka adreste, montajı deneyen kişi başka ilçedeyse kimin hangi kontrolü yaptığını kayıt altına alın. Ataşehir, Örnek Mahallesi atölyesinde randevulu görüşme yapılabilir; dijital çizim iletişimi için bütün cihazın taşınacağı varsayılmaz.',
    logistics:'Ölçü krokisi ve revizyon notları dijital paylaşılır; fiziksel referans kargo, kurye veya randevulu elden teslimle ulaştırılabilir. Gönderilen özgün numunenin iadesini model tesliminden ayrı isteyin. Başka şehirdeki montaj için kargo seçeneği vardır; çizim onayı, üretim siparişi ve numunenin orada denenmesi farklı adımlar olarak takip edilir.',
    editorial:{answer:'Kritik bağlantı ölçülerini ortak referansta tanımlayın; görsel onayla gerçek cihazdaki montaj kabulünü ayrı revizyon kayıtlarıyla izleyin.',takeaways:['Kritik ölçüyü işlevle eşleştirin','Tasarım değişikliğini açık yazın','Dosya türlerini ayrı teslim alın'],relatedPaths:['/3d-modelleme','/3d-tarama','/3d-baski']},
  },
];
for(const c of city){
  const original=originals.find(p=>!p.district&&p.service===c.service);
  const sources=sourceLinks('istanbul');
  let recordEvidence=evidence(original,'istanbul');
  if(c.service==='3d-tarama') {
    const transport=localities.sources.find(s=>s.id==='adalar-transport');
    sources.push({title:transport.title,url:transport.url});
    recordEvidence+='\nAdalar erişim bağlamı: '+transport.title+': '+transport.url;
  }
  rows.push({...original,...c,evidence:recordEvidence,reviewed_at:'2026-10-07T20:48:02+03:00',updated_at:'2026-10-08',editorial:{...c.editorial,sources}});
}
if(rows.length!==163 || new Set(rows.map(p=>p.path)).size!==163) throw new Error('Expected 163 unique original routes');
for(const p of rows){
  if(p.summary.length<60 || p.local_context.length<200 || p.logistics.length<120 || p.faq.length<2 || p.sections.length<2) throw new Error('Incomplete '+p.path);
  if(p.status!=='draft'||p.image) throw new Error('Unexpected publication or image '+p.path);
}
fs.writeFileSync(path.join(root,'content/authoring/local/parcayanimda.json'),JSON.stringify(rows,null,2)+'\n');
console.log(JSON.stringify({brand:'parcayanimda',records:rows.length,review:'editorial content completed; no publication certificate created',output:'content/authoring/local/parcayanimda.json'}));
