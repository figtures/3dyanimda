import {engineeringSoftware,engineeringTeam,materialSelection,printerBrands,workshopMaterials,illustrativePrice,researchedSources} from '@/content/business-operations.mjs';

export function MaterialCapabilities() {
 return <section className="article-sources" data-workshop-materials>
  <h2>Kullandığımız filamentler ve malzeme seçimi</h2>
  <p>{materialSelection}</p><p>{workshopMaterials.join(', ')} seçenekleriyle çalışıyoruz.</p>
  <p>ABS FR, HT PETG ve Hyper PETG gibi ürünlerde özellikler üreticiye ve ürün koduna bağlıdır. Malzeme adı tek başına belirli bir yanmazlık sınıfı veya sıcaklık dayanımı garantisi değildir.</p>
  <p><a href={researchedSources[0].url} target="_blank" rel="noopener noreferrer">Malzeme seçimi için teknik başvuru: Prusa Research</a></p>
 </section>;
}
export function WorkshopCapabilities({mapsUrl}:{mapsUrl?:string}) {
 return <>
  <section className="article-sources" data-engineering-team><h2>Mühendislik ekibi ve teknik içerik</h2><p>{engineeringTeam}</p></section>
  <section className="article-sources"><h2>Üretim ve tasarım araçlarımız</h2><p>Üretim altyapımızda {printerBrands.join(', ')} markalarıyla çalışıyoruz.</p><p>Tasarım, modelleme, üretim hazırlığı ve dilimleme iş akışlarımızda {engineeringSoftware.join(', ')} kullanıyoruz. Projeye uygun yazılımı ve teslim biçimini işin kapsamına göre belirliyoruz.</p></section>
  <MaterialCapabilities/>
  {mapsUrl&&<section className="article-sources"><h2>Atölyemizi ve üretimlerimizi görün</h2><p>Atölye, cihaz ve basılmış ürün fotoğraflarımızı Google Haritalar profilimizde inceleyebilirsiniz.</p><a href={mapsUrl} target="_blank" rel="noopener noreferrer">Google Haritalar’da fotoğrafları inceleyin →</a></section>}
 </>;
}
export function IllustrativePriceExample() {
 const total=illustrativePrice.rows.reduce((sum,row)=>sum+row.amount,0);
 return <section id="temsili-fiyat-hesabi" data-illustrative-price>
  <h2>{illustrativePrice.title}</h2><p>{illustrativePrice.description}</p>
  <div className="comparison-scroll" tabIndex={0} role="region" aria-label={illustrativePrice.title}><table>
   <caption>Varsayımsal hesaplama — gerçek teklif değildir</caption>
   <thead><tr><th scope="col">Kalem</th><th scope="col">Hesap</th><th scope="col">Tutar</th></tr></thead>
   <tbody>{illustrativePrice.rows.map(row=><tr key={row.name}><th scope="row">{row.name}</th><td>{row.calculation}</td><td>{row.amount.toLocaleString('tr-TR')} TL</td></tr>)}</tbody>
   <tfoot><tr><th scope="row" colSpan={2}>KDV ve kargo hariç örnek ara toplam</th><td>{total.toLocaleString('tr-TR')} TL</td></tr></tfoot>
  </table></div><p>{illustrativePrice.scope}</p>
 </section>;
}
