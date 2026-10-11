"""Summarize eight complete Lighthouse reports without dropping low scores.
Usage: python scripts/quality/summarize-mobile.py <summary-directory> <date> <label>
"""
import json,statistics,sys
from pathlib import Path
folder,date,label=Path(sys.argv[1]),sys.argv[2],sys.argv[3]
reports=[json.loads(p.read_text()) for p in sorted(folder.glob('*/summary.json'))]
assert len(reports)==8,'Expected eight brand/device reports'
runs=[r for report in reports for r in report['runs']]
assert len(runs)==240
assert all(r['status']=='MEASURED' and len(r['runs'])==30 and not r['errors'] for r in reports)
assert all(r.get('applicationUnchanged',True) for r in reports)
# An explicitly documented harness-only recheck may complete a partial group.
assert all(r['originMode']=='isolated-canonical-host-with-local-test-certificate' for r in reports)
checks=[c for r in reports for c in r['hydrationChecks']]
assert len(checks)==80 and all(c['mode']=='react-ssg-v1' and c['preserved'] and not c['error'] for c in checks)
interactions=[c for r in reports for c in r['interactionChecks']]
assert len(interactions)==16 and all(c['mobileMenu']=='PASS' for c in interactions)
assert sum(c['quote']=='PASS_WITHOUT_SUBMISSION' for c in interactions)==8
brands=['3dyanimda','3dsanayi','maketyanimda','parcayanimda']
routes=['/','/3d-baski','/3d-tarama','/3d-modelleme','/teklif-al','/iletisim','/cozumler','/malzemeler','/rehber','/bolgeler']
categories=['performance','accessibility','best-practices','seo'];cells=[]
for brand in brands:
 for route in routes:
  for device in ['mobile','desktop']:
   sample=[r for r in runs if (r['brand'],r['route'],r['device'])==(brand,route,device)]
   assert len(sample)==3 and {r['repeat'] for r in sample}=={1,2,3}
   assert all(r['formFactor']==device for r in sample)
   metrics={k:statistics.median(r['metrics'][k] for r in sample) for k in ['largest-contentful-paint','cumulative-layout-shift','total-blocking-time']}
   cells.append(dict(brand=brand,route=route,device=device,medianScores={k:statistics.median(r['scores'][k] for r in sample) for k in categories},minimumScores={k:min(r['scores'][k] for r in sample) for k in categories},medianMetrics=metrics,labVitalsPassed=metrics['largest-contentful-paint']<=2500 and metrics['cumulative-layout-shift']<=.1 and metrics['total-blocking-time']<=200))
summary={b:{d:{'min':min(c['medianScores']['performance'] for c in cells if c['brand']==b and c['device']==d),'max':max(c['medianScores']['performance'] for c in cells if c['brand']==b and c['device']==d),'perfectMedians':sum(c['medianScores']['performance']==100 for c in cells if c['brand']==b and c['device']==d)} for d in ['mobile','desktop']} for b in brands}
source=next(r for r in reports if not r.get('measurementCorrection'))['sourceCommit'];run=next(r for r in reports if not r.get('measurementCorrection'))['workflowRun'];url='https://github.com/figtures/3dyanimda/actions/runs/'+run
result=dict(kind='isolated-canonical-host-candidate-lab-not-production',testedOn=date,sourceCommit=source,workflowRun=run,workflowUrl=url,status='MEASURED',transport=reports[0]['transport'],measurementCorrections=[r['measurementCorrection'] for r in reports if r.get('measurementCorrection')],production=False,fieldData=False,programReleaseApproved=False,expectedRuns=240,runsCompleted=240,brandRoutes=40,deviceRouteCells=80,repeats=3,localTests={'vitest':105,'node':46,'typecheck':'PASS'},summary=summary,cells=cells,categoryMinimums={k:min(r['scores'][k] for r in runs) for k in categories},labVitalsCellsPassed=sum(c['labVitalsPassed'] for c in cells),allPerformanceMedians100=all(c['medianScores']['performance']==100 for c in cells),limitations=reports[0]['limitations']+['Private owner-only Sites preview is a SPA and retains noindex; these are not preview URL scores.','Public domain DNS failed separately; actual public HTML, indexing, search-console data, CrUX and measured GEO visibility remain unverified.','Raw GitHub artifact retention is 30 days; summaries, settings, file hashes and provenance are versioned here.'],reports=reports)
audit=Path('docs/audits')/f'mobile-seo-{date}-{label}.json';audit.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
lines=[f'# Mobil performans, SEO ve JSON-LD — {date}, ikinci tur','',f'Kaynak: `{source}`. [240 örnekli Lighthouse ölçümü]({url}). Dört marka × 10 sayfa × iki cihaz × üç tekrar.','','**Bunlar izole yayın adayı puanlarıdır; canlı alan adı veya özel önizleme puanı değildir.** Önceki ölçüm HTTP/1.1, bu tur HTTP/2 kullanır. Puan farkının tamamı kod iyileştirmesine bağlanamaz.','','Mobil ve masaüstü performans sütunları üç koşunun medyanıdır. Diğer puanlar ilgili sayfanın iki cihazdaki altı koşusunun en düşük değeridir.']
if result['measurementCorrections']:
 lines+=['','3dsanayi mobil grubunda ilk dört sayfanın 12 ölçümü korundu. Teklif sayfasının etkileşim kontrolü tamamlanmadığı için bu sayfanın üç ölçümü kabul edilmedi; teklif ve sonraki beş sayfa ayrı odaklı koşuda ölçüldü. Uygulama kodu değişmedi; test, React seçiminin ekrana yansımasını bekleyecek şekilde düzeltildi. Her grubun kaynak ve koşu bilgisi makine raporunda korunur.']
for b in brands:
 lines+=['',f'## {b}','','| Sayfa | Mobil | Masaüstü | Mobil LCP (sn) | Mobil TBT (ms) | Mobil CLS | Erişilebilirlik | İyi uygulamalar | SEO |','| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |']
 for p in routes:
  m=next(c for c in cells if (c['brand'],c['route'],c['device'])==(b,p,'mobile'));d=next(c for c in cells if (c['brand'],c['route'],c['device'])==(b,p,'desktop'));v=m['medianMetrics'];s=[min(c['minimumScores'][k] for c in [m,d]) for k in categories[1:]]
  lines.append(f"| `{p}` | {m['medianScores']['performance']} | {d['medianScores']['performance']} | {v['largest-contentful-paint']/1000:.2f} | {v['total-blocking-time']:.0f} | {v['cumulative-layout-shift']:.3f} | {s[0]} | {s[1]} | {s[2]} |")
lines+=['','## Doğrulanan kapsam','','- 80 sayfa/cihaz hücresinde özgün H1 düğümü korundu; hydration kurtarma hatası yok.','- 16 mobil menü kontrolü ve sekiz teklif formu durum kontrolü geçti; talep/e-posta gönderilmedi.','- Ayrı gezinme testinde dört marka, üç tema ve dört ekran genişliği: 48 kontrol geçti. Mobil ve masaüstü CI ekran görüntüleri incelendi.','- 105 uygulama + 46 Node testi, TypeScript ve üretim derlemesi geçti.','- 796 etkili yerel içerik kaydı ve canlı veritabanındaki 796 yayımlanmış kayıt JSON-LD sözlük, iç referans ve FAQ denetiminden geçti. Canlı kayıtların marka başına sayısı 199. Tekrarlanan marka içi başlık/açıklama yok.',f"- {result['labVitalsCellsPassed']}/80 hücre medyan LCP ≤ 2,5 sn, CLS ≤ 0,1 ve TBT ≤ 200 ms eşiklerini birlikte sağlıyor. TBT, gerçek kullanıcı INP ölçümü değildir.",'','## Yapılan değişiklikler','','İlk açılışta gereksiz veritabanı istemcisi, form doğrulayıcı ve çeviri modülü yüklenmiyor. Hazır HTML teması/SEO verisi tekrar istenmiyor. Menü hafifletildi, kullanılan font ağırlıkları korundu ve dört font dosyasının toplamı 77.248 bayttan 56.612 bayta indi. Ekran dışındaki bölge kartlarının çizimi erteleniyor; içerik DOM içinde kalıyor.','','Dinamik JSON-LD 1.1.0: sayfa ana varlığı, Service/Article, kuruluş, site, FAQ ve breadcrumb ilişkileri bağlandı. Görünür içerikten gelen kaynaklar kullanılıyor; bilinmeyen fiyat, puan, yayın tarihi veya şube uydurulmuyor. Tüm statik dışa aktarımlarda yapı/sözlük doğrulaması zorunlu.','','## Açık kalan gerçek yayın işleri','','Dış GitHub DNS/HTTPS denetiminde dört canonical alan adı da ENOTFOUND döndürdü. Bu gözlem alan adı kayıt/delegasyon/DNS ve yayın yapılandırmasının araştırılmasını gerektirir; tek başına hangi ayarın hatalı olduğunu belirlemez. Çalışan kamuya açık alan adları olmadan canlı HTML, robots, sitemap, TLS/CDN ve indeksleme doğrulanmış sayılamaz.','','Search Console/Bing mülkleri ve gözlemleri, 28 günlük saha verisi, bağımsız içerik/iddia-kaynak incelemesi ve ölçülmüş GEO görünürlüğü açık. 20 Notion kapısı ve 123 kontrol için genel kabul verilmedi; BLOCKED/NO-GO korunuyor. 100 olmayan puanlar tabloda açıkça gösterilir. Lighthouse SEO 100, tüm SEO/GEO işlerinin bittiği anlamına gelmez.','',f'[Makine raporu](../audits/{audit.name}) · [796 kayıt denetimi](../audits/live-schema-2026-10-12.json) · [DNS kanıtı](../audits/public-domains-2026-10-12.json) · [Ek iyi uygulamalar](BEST-PRACTICES-2026-10-12.md) · [Değişiklik/geri dönüş kaydı](RFC-SEARCH-005.md).']
Path(f'docs/search-program/MOBILE-SEO-{date}-{label.upper()}.md').write_text('\n'.join(lines)+'\n')
print(json.dumps({k:result[k] for k in ['summary','categoryMinimums','labVitalsCellsPassed','allPerformanceMedians100']}))
