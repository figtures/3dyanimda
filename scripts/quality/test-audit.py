import importlib.util,tempfile,unittest
from pathlib import Path
from PIL import Image,ImageDraw
spec=importlib.util.spec_from_file_location('audit',Path(__file__).with_name('audit-content.py'));a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a)
class GateTests(unittest.TestCase):
 def test_place_and_brand_substitution(self):
  self.assertEqual(a.normalized('Ataşehir 3dyanimda numune inceleme dosya gönderimi'),a.normalized('Kadıköy 3dsanayi numune inceleme dosya gönderimi'))
 def test_cross_brand_paragraph(self):
  text='Referans çizimindeki montaj deliklerini fiziksel örnek üzerinde kontrol ederek değişmesi gereken toleransları ayrı bir teknik raporda belirtin.'
  pages=[{'brand':b,'path':'/test','summary':text,'sections':[]} for b in ['3dyanimda','3dsanayi']]
  self.assertIn('repeated_paragraph',[i['type'] for i in a.audit(pages)])
 def test_repeated_paragraph_within_page(self):
  text='Birleştirme sırasında karşılıklı yüzeylerin hizasını belirlemek için vida deliklerini referans alarak kontrol çizelgesini hazırlayın.'
  self.assertIn('repeated_paragraph',[i['type'] for i in a.audit([{'brand':'a','path':'/x','sections':[{'body':text},{'body':text}]}])])
 def test_renamed_resized_image(self):
  with tempfile.TemporaryDirectory() as temp:
   p=Path(temp);im=Image.new('RGB',(240,180),'white');d=ImageDraw.Draw(im);d.rectangle((30,10,170,80),fill='black');d.ellipse((80,90,120,130),fill='blue');im.save(p/'a.png');im.resize((480,360)).save(p/'different-name.jpg')
   x=a.image_signatures(p/'a.png');y=a.image_signatures(p/'different-name.jpg');self.assertLessEqual(min(int(a.np.count_nonzero(i!=j)) for i in x for j in y),8)
 def test_model_transform(self):
  import json,struct
  path=a.ROOT/'public/models/fixture.glb';raw=path.read_bytes();size,_=struct.unpack_from('<II',raw,12);g=json.loads(raw[20:20+size]);tail=raw[20+size:]
  for index in g['scenes'][g.get('scene',0)]['nodes']:g['nodes'][index]['translation']=[200,300,-10];g['nodes'][index]['scale']=[3,3,3]
  data=json.dumps(g,separators=(',',':')).encode();data+=b' '*((-len(data))%4)
  with tempfile.TemporaryDirectory() as temp:
   p=Path(temp)/'renamed.glb';p.write_bytes(struct.pack('<4sII',b'glTF',2,12+8+len(data)+len(tail))+struct.pack('<II',len(data),0x4e4f534a)+data+tail)
   x=a.glb.signature(path);y=a.glb.signature(p);self.assertLess(float(a.np.max(a.np.abs(a.np.array(x['shape_vector'])-a.np.array(y['shape_vector'])))),.001)
if __name__=='__main__':unittest.main()
