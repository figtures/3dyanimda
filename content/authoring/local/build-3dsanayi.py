"""Build scoped, unpublished industrial editorial records from authored decision guides."""
import json,runpy
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
HERE=Path(__file__).resolve().parent
namespace=runpy.run_path(str(HERE/'3dsanayi-source.py'))
def add(place,text):
    rows=[line.strip().split('|') for line in text.strip().splitlines() if line.strip()]
    assert len(rows)==(3 if place=='istanbul' else 4),(place,len(rows))
    assert all(len(row)==7 for row in rows),(place,[len(r) for r in rows])
    assert place not in namespace['DATA'],place
    namespace['DATA'][place]=rows
extra=HERE/'3dsanayi-final-cases.py'
if extra.exists():exec(compile(extra.read_text(),str(extra),'exec'),{'add':add})
data=namespace['DATA']
source=json.loads((ROOT/'src/content/pages.json').read_text())
geo=json.loads((ROOT/'content/authoring/localities-evidence.json').read_text())
sources={s['id']:s for s in geo['sources']}
service_order=['','3d-baski','3d-tarama','3d-modelleme']
labels={'':'3D üretim talebi','3d-baski':'3D baskı','3d-tarama':'3D tarama','3d-modelleme':'3D modelleme'}
logistics={
'':'Fiziksel referans için kargo, kurye veya elden teslim planlanabilir; diğer şehirlere kargo gönderimi bulunur. Atölye görüşmesi Örnek Mahallesi, Ataşehir’de randevuyla yapılır.',
'3d-baski':'Baskı numunesi kargo, kurye ya da elden teslim edilebilir; İstanbul dışına da kargo vardır. Örnek Mahallesi’ndeki Ataşehir atölyesine teslim almaya gelmeden randevu gerekir.',
'3d-tarama':'Yerinde 3D tarama hizmeti mevcuttur. Taşınabilir referans için kurye, kargo ve elden teslim seçenekleri vardır; atölye ziyareti Örnek Mahallesi, Ataşehir’de önceden randevuyla gerçekleşir.',
'3d-modelleme':'Modellemeye esas fiziksel örnek kargo, kurye veya randevulu elden teslimle iletilebilir. Çalışma noktası Ataşehir, Örnek Mahallesi’dir; şehirler arası kargo seçeneği de bulunur.'}
answers={
'':'Ön değerlendirme, {focus} için gerekli üretim adımlarını ayırır.',
'3d-baski':'İlk teslim hedefi, {focus} için tanımlanmış koşullarda denenecek fiziksel numunedir.',
'3d-tarama':'{focus}: dijital teslimin kapsamı, kaydedilecek yüzeyler ve referanslarla tanımlanır.',
'3d-modelleme':'{focus}: CAD teslimi, arayüzlerin ve esas alınan sürümün açıkça tanımlanmasını gerektirir.'}
related={
'':['/cozumler/montaj-konumlandirma','/rehber/teknik-teklif-dosyasi','/3d-baski','/3d-tarama','/3d-modelleme'],
'3d-baski':['/3d-baski','/rehber/numune-kabul-plani','/rehber/malzeme-secim-sorulari'],
'3d-tarama':['/3d-tarama','/rehber/tarama-verisinden-cad','/rehber/teknik-teklif-dosyasi'],
'3d-modelleme':['/3d-modelleme','/cozumler/montaj-konumlandirma','/rehber/numune-ve-revizyon']}
summary_tail={
'':'İş parçasını, operasyon sırasını ve denemede verilecek kararı aynı teknik talebe bağlayın.',
'3d-baski':'Fiziksel numune için temas yüzeylerini, gerçek kullanım koşulunu ve kabul kontrolünü birlikte hazırlayın.',
'3d-tarama':'Referans geometrinin kaydını erişim durumu, kullanım amacı ve teslim edilecek veriyle birlikte planlayın.',
'3d-modelleme':'Dijital tasarım talebini montaj ilişkisi, değişebilir ölçüler ve kontrol edilecek hareketle somutlaştırın.'}
records=[]
for original in source:
    if not(original.get('brand')=='3dsanayi' and original.get('kind')=='location' and original.get('status')=='draft'):continue
    key=original.get('neighborhood') or original.get('district') or 'istanbul'
    if key not in data:continue
    service=original['service']
    index=service_order.index(service)-(1 if key=='istanbul' else 0)
    topic,intake,decision,acceptance,limitation,packing,coordination=data[key][index]
    place=geo['places'][key]; name=place['name']
    geo_fact=place['facts'][0]
    # Factual administrative context is kept separate from the conditional industrial example.
    context_fact='Adalar ile ana kara arasındaki bağlantı deniz ulaşımına dayanır.' if key=='adalar' else geo_fact['text']
    context=context_fact+' '+coordination
    if len(context)<200:raise ValueError(('short_context',key,service,len(context)))
    source_ids=list(dict.fromkeys(sid for fact in place['facts'] for sid in fact['sourceIds']))
    page_sources=[{'title':sources[s]['title'],'url':sources[s]['url']} for s in source_ids if sources[s].get('url')]
    if service in ['3d-tarama','3d-modelleme']:
        page_sources.append({'title':'Autodesk Fusion — Mesh düzenleme ve dönüştürme araçları','url':'https://help.autodesk.com/cloudhelp/ENU/Fusion-Mesh/files/MESH-MODIFY-TOOLS.htm'})
    else:
        page_sources.append({'title':'NIST — Eklemeli imalatta ölçüm bilimi programı','url':'https://www.nist.gov/programs-projects/measurement-science-additive-manufacturing-program'})
    p=dict(original)
    p.update({
        'title':f'{name} {labels[service]}: {({'İ':'i','I':'ı'}.get(topic[0],topic[0].lower()))+topic[1:]}',
        'summary':f'{topic} — {name}. '+summary_tail[service],
        'sections':[
            {'title':'İşlem için gereken başlangıç verisi','body':intake},
            {'title':'Teknik kapsamı belirleyen karar','body':decision},
        ],
        'faq':[
            {'q':f'{topic} için kabulde neye bakılmalı?','a':acceptance},
            {'q':'Bu çalışmanın sonucu hangi konuda onay sayılmaz?','a':limitation},
        ],
        'local_context':context,
        'logistics':packing+' '+logistics[service],
        'evidence':original['evidence']+'\nCoğrafi bağlam doğrulaması — 8 Ekim 2026: '+geo_fact['text']+' Kaynak: '+', '.join(sources[s]['url'] for s in source_ids if sources[s].get('url'))+'. Teknik örnekler koşullu talep hazırlığıdır; ilgili ilçede tamamlanmış iş veya müşteri kaydı iddiası içermez.',
        'reviewed_at':'2026-10-07T20:48:02+03:00',
        'updated_at':'2026-10-08',
        'editorial':{
            'answer':answers[service].format(focus=(topic if service in ['3d-tarama','3d-modelleme'] else ({'İ':'i','I':'ı'}.get(topic[0],topic[0].lower()))+topic[1:])),
            'takeaways':[
                f'İşlem odağı: {({'İ':'i','I':'ı'}.get(topic[0],topic[0].lower()))+topic[1:]}',
                'Referans parçayı ve geçerli sürümü belirtin.',
                'Kabulü kullanım koşuluyla birlikte kaydedin.',
            ],
            'relatedPaths':related[service],
            'sources':page_sources,
        },
    })
    if key=='istanbul' and service=='3d-baski':
        p['editorial']['answer']='İstanbul’daki farklı istasyonlara gidecek baskıları revizyon, alıcı adresi ve deneme kaydıyla eşleştirin; her kullanım noktasının onayını ayrı izleyin.'
    assert p['status']=='draft' and p['image']==''
    assert len(p['summary'])>=60 and len(p['logistics'])>=120
    records.append(p)
out=HERE/'3dsanayi.json'
if len(records)!=163:out=Path('/tmp/3dsanayi-partial.json')
out.write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'records':len(records),'path':str(out),'cases':len(data)},ensure_ascii=False))
