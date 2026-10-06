"""Global content/asset audit. Nonzero exit blocks a production release; never invents approvals."""
import argparse,collections,hashlib,json,re,unicodedata
from pathlib import Path
from itertools import combinations
import importlib.util
spec=importlib.util.spec_from_file_location("glb_fingerprint",Path(__file__).with_name("fingerprint-glb.py"));glb=importlib.util.module_from_spec(spec);spec.loader.exec_module(glb)
import numpy as np
from PIL import Image,ImageOps
from scipy.fft import dctn
ROOT=Path(__file__).resolve().parents[2]
BRANDS=['3dyanimda','3dsanayi','maketyanimda','parcayanimda']
places=json.loads((ROOT/'src/content/places.json').read_text())
def basic(text):
 text=unicodedata.normalize('NFKD',text.lower().replace('ı','i')).encode('ascii','ignore').decode()
 return re.sub(r'[^a-z0-9]+',' ',text).strip()
entities=[basic(p['name']) for p in places]+[basic(s) for s in BRANDS]+['istanbul','ornek mahallesi','ornek']
def normalized(text):
 s=' '+basic(text)+' '
 for e in sorted(entities,key=len,reverse=True):s=s.replace(' '+e+' ',' ')
 return ' '.join(s.split())
def shingles(text,n=5):
 words=normalized(text).split();return {' '.join(words[i:i+n]) for i in range(len(words)-n+1)}
def phash(image):
 a=np.asarray(ImageOps.grayscale(image).resize((32,32)),dtype=float)
 c=dctn(a,type=2,norm='ortho')[:8,:8].flatten();return c>np.median(c[1:])
def image_signatures(path):
 with Image.open(path) as image:
  image=image.convert('RGB');w,h=image.size
  variants=[image,ImageOps.mirror(image),image.rotate(90,expand=True),image.rotate(180),image.rotate(270,expand=True)]
  for fraction in [.8,.6]:
   x=w*(1-fraction)/2;y=h*(1-fraction)/2;variants.append(image.crop((x,y,w-x,h-y)))
  return [phash(v) for v in variants]
def audit(records):
 issues=[]; docs=[]; paragraphs=collections.defaultdict(list); refs=collections.defaultdict(list)
 for p in records:
  key=p['brand']+p['path'];chunks=[p.get('summary','')]+[s['body'] for s in p.get('sections',[])]+[f['a'] for f in p.get('faq',[])]+[p.get('local_context',''),p.get('logistics','')]
  editorial=p.get('editorial') or {}
  chunks += [editorial.get('answer','')] + editorial.get('takeaways',[]) + [' '.join(row) for row in (editorial.get('comparison') or {}).get('rows',[])]
  for chunk in chunks:
   if len(normalized(chunk).split())>=10:paragraphs[normalized(chunk)].append(key)
  docs.append((key,shingles(' '.join(chunks))))
  if p.get('image'):refs[p['image']].append(key)
  for asset in p.get('models',[]):refs[asset].append(key)
  if p.get('kind')=='location' and (not p.get('evidence') or not p.get('reviewed_at')):issues.append({'type':'missing_local_evidence','pages':[key]})
 for text,keys in paragraphs.items():
  if len(keys)>1:issues.append({'type':'repeated_paragraph','pages':keys,'fingerprint':hashlib.sha256(text.encode()).hexdigest()})
 for (a,x),(b,y) in combinations(docs,2):
  if not x or not y:continue
  score=len(x&y)/min(len(x),len(y))
  if score>=.35:issues.append({'type':'near_duplicate_text','pages':[a,b],'containment':round(score,3)})
 images=[];models=[];hashes={}
 for asset,keys in refs.items():
  if len(keys)>1:issues.append({'type':'reused_asset','asset':asset,'pages':keys})
  path=ROOT/'public'/asset.lstrip('/')
  if not path.is_file():issues.append({'type':'missing_or_unverified_asset','asset':asset});continue
  digest=hashlib.sha256(path.read_bytes()).hexdigest()
  if digest in hashes:issues.append({'type':'renamed_duplicate_asset','assets':[hashes[digest],asset]})
  hashes[digest]=asset
  if path.suffix.lower() in ['.png','.jpg','.jpeg','.webp']:
   try:images.append((asset,image_signatures(path)))
   except Exception:issues.append({'type':'unreadable_asset','asset':asset})
  elif path.suffix.lower()=='.glb':
   try:models.append((asset,glb.signature(path)))
   except Exception:issues.append({'type':'unsupported_model_review','asset':asset})
  else:issues.append({'type':'unsupported_asset_review','asset':asset})
 for (a,x),(b,y) in combinations(images,2):
  distance=min(int(np.count_nonzero(i!=j)) for i in x for j in y)
  if distance<=8:issues.append({'type':'visually_similar_asset','assets':[a,b],'distance':distance})
 for (a,x),(b,y) in combinations(models,2):
  delta=float(np.max(np.abs(np.array(x["shape_vector"])-np.array(y["shape_vector"]))))
  if x["geometry_hash"]==y["geometry_hash"] or delta<.025:issues.append({"type":"same_or_similar_geometry","assets":[a,b],"distance":round(delta,5)})
 return issues
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--all',action='store_true');parser.add_argument('--input',default='src/content/pages.json');parser.add_argument('--output',default='docs/audits/global-originality.json');args=parser.parse_args()
 records=json.loads((ROOT/args.input).read_text())
 if args.input=='src/content/pages.json':
  merged={p['brand']+p['path']:p for p in records}
  for source in ['src/content/editorial-pages.json','src/content/search-pages.json']:
   for p in json.loads((ROOT/source).read_text()):merged[p['brand']+p['path']]=p
  records=list(merged.values())
 records=[p for p in records if args.all or p['status']=='published']
 catalog=json.loads((ROOT/"src/brands/catalog.json").read_text())
 allocation=json.loads((ROOT/"src/themes/model-assignments.json").read_text())
 for b in catalog:records.append({"brand":b["slug"],"path":"/","image":"/brand/industrial/"+b["heroAsset"]+".webp","models":["/models/"+m+".glb" for m in allocation[b["slug"]]]})
 issues=audit(records)
 report={'policy':'global-originality-v1','result':'fail' if issues or not records else 'pass','records':len(records),'issue_counts':dict(collections.Counter(i['type'] for i in issues)),'issues':issues,'scope':'Editorial records and referenced public assets. Full rendered-site and human semantic/provenance review are separately required; this audit alone cannot authorize publication.'}
 target=ROOT/args.output;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='issues'},ensure_ascii=False));raise SystemExit(1 if report['result']=='fail' else 0)
