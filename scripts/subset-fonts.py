"""Reproducible WOFF2 subsets. Original fonts/licenses remain available as fallbacks.
Requires fonttools and brotli; no glyph design or variable weight axis is changed.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools import subset
import re,json,hashlib
root=Path('public/fonts')
wanted=set(range(0x20,0x100))|set(map(ord,'ÇĞİÖŞÜçğıöşüÂÎÛâîû₺€£¥©®°±×÷'))|set(range(0x2000,0x2070))|set(range(0x2190,0x219A))|{0x2212,0x2215,0xFEFF,0xFFFD}
report=[]
def css_ranges(points):
 points=sorted(points);runs=[]
 for point in points:
  if runs and point==runs[-1][1]+1:runs[-1][1]=point
  else:runs.append([point,point])
 return ','.join('U+%04X'%a+('-%04X'%b if a!=b else '') for a,b in runs)
for family in ['inter','rethink-sans']:
 css=root/(family+'.css');original=css.read_text().split('/* Optimized Latin/Turkish subsets')[0].rstrip();optimized=[]
 for face in re.findall(r'@font-face\s*\{[^}]+\}',original):
  name=re.search(r'/fonts/([^)]*\.woff2)',face).group(1);source=root/name
  font=TTFont(source);existing=set(font.getBestCmap());allowed=set()
  for a,b in re.findall(r'U\+([0-9A-F]+)(?:-([0-9A-F]+))?',re.search(r'unicode-range:([^;]+)',face).group(1),re.I):allowed.update(range(int(a,16),int(b or a,16)+1))
  selected=existing&wanted;coverage=selected&allowed
  options=subset.Options();options.flavor='woff2';worker=subset.Subsetter(options=options);worker.populate(unicodes=selected);worker.subset(font)
  target=root/name.replace('.woff2','-tr-v2.woff2');font.save(target)
  assert set(TTFont(target).getBestCmap())>=selected
  optimized.append(re.sub(r'unicode-range:[^;]+','unicode-range: '+css_ranges(coverage),face.replace(name,target.name)))
  report.append({'source':str(source),'subset':str(target),'originalBytes':source.stat().st_size,'subsetBytes':target.stat().st_size,'coveredCodepoints':len(coverage),'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
 css.write_text(original+'\n\n/* Optimized Latin/Turkish subsets; original faces above cover other characters. */\n'+'\n\n'.join(optimized)+'\n')
Path('docs/audits/font-optimization-2026-10-12.json').write_text(json.dumps({'kind':'lossless glyph subset; original licensed fonts retained','fonts':report,'originalBytes':sum(p['originalBytes'] for p in report),'subsetBytes':sum(p['subsetBytes'] for p in report)},indent=2)+'\n')
print(json.dumps(report))
