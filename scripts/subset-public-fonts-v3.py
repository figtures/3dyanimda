"""Public typography uses weights 400–700; retain originals and immutable v1/v2 assets."""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
import json,hashlib,re
root=Path('public/fonts');report=[]
for family in ['inter','rethink-sans']:
 css=root/(family+'.css');text=css.read_text()
 for old in root.glob(family+'-*-tr-v2.woff2'):
  font=TTFont(old);instantiateVariableFont(font,{'wght':(400,700)},inplace=True)
  target=old.with_name(old.name.replace('-v2','-v3'));font.save(target)
  assert set(TTFont(target).getBestCmap())==set(TTFont(old).getBestCmap())
  report.append({'source':str(old),'target':str(target),'beforeBytes':old.stat().st_size,'afterBytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
  text=text.replace(old.name,target.name)
 text=re.sub(r'font-weight: [\d ]+;','font-weight: 400 700;',text);css.write_text(text)
p=Path('index.html');p.write_text(p.read_text().replace('-tr-v2.woff2','-tr-v3.woff2'))
Path('docs/audits/public-fonts-v3-2026-10-12.json').write_text(json.dumps({'kind':'Axis instancing, unchanged glyph coverage','weightRange':[400,700],'fonts':report},indent=2)+'\n')
print(json.dumps({'before':sum(x['beforeBytes'] for x in report),'after':sum(x['afterBytes'] for x in report)}))
