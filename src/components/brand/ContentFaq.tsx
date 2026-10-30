import type {LandingPage} from '@/content/types';
import {visibleServiceFaq} from '@/content/service-experience.mjs';

export default function ContentFaq({page, brand}: {page: LandingPage; brand: string}) {
  const faq = visibleServiceFaq(page, brand);
  if (!faq.length) return null;
  return <section id="sorular" aria-labelledby="content-faq-heading">
    <h2 id="content-faq-heading">Sık sorulan sorular</h2>
    {faq.map(f => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
  </section>;
}
