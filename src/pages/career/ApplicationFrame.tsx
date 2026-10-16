import { Children, cloneElement, isValidElement, useId, useRef, useState, type FormEvent, type ReactElement, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, CheckCircle2, FileUp, Loader2, X } from 'lucide-react';
import { Seo } from '@/components/site/Seo';
import { useBrand } from '@/brands/config';
import { careerStory } from './career-content';
import './career.css';

export interface ApplicationStep { title: string; description: string; content: ReactNode }
interface Props {
  kind: 'job' | 'machine'; query: string; title: string; intro: string;
  steps: ApplicationStep[]; submitting: boolean; success: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>; onReset: () => void;
  submitLabel: string;
}
export function ApplicationFrame({ kind, query, title, intro, steps, submitting, success, onSubmit, onReset, submitLabel }: Props) {
  const brand = useBrand();
  const [step, setStep] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const path = kind === 'job' ? '/kariyer/is-basvurusu' : '/kariyer/makine-isletim';
  const move = (next: number) => { setStep(next); requestAnimationFrame(() => { heading.current?.focus({preventScroll: true}); heading.current?.scrollIntoView({block: 'start'}); }); };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    if (step < steps.length - 1) { move(step + 1); return; }
    await onSubmit(event);
  };
  return <div className="career-page career-application">
    <Seo title={`${kind === 'job' ? 'İş Başvurusu' : 'Üretim İş Birliği'} | ${brand.name}`} description={intro} path={path} />
    <header className="career-application-heading wrap">
      <Link className="career-back" to={'/kariyer' + query}><ArrowLeft size={16} aria-hidden="true" /> Kariyer ve iş birliği</Link>
      <p className="career-eyebrow">{brand.name} / {kind === 'job' ? 'Ekibe katılın' : 'Birlikte üretelim'}</p>
      <h1>{title}</h1><p>{intro}</p>
    </header>
    <div className="career-application-layout wrap">
      <aside className="career-application-aside">
        <ol className="career-steps" aria-label="Başvuru adımları">{steps.map((item, index) => <li key={item.title} aria-current={!success && step === index ? 'step' : undefined} className={success || index < step ? 'is-complete' : ''}>
          <span className="career-step-number" aria-hidden="true">{success || index < step ? <Check size={16} /> : `0${index + 1}`}</span>
          <div>{index < step && !submitting && !success ? <button type="button" onClick={() => move(index)}>{item.title}</button> : <strong>{item.title}</strong>}<p>{item.description}</p></div>
        </li>)}</ol>
        <figure className="career-aside-art"><img src={careerStory(brand.slug).image} width="1536" height="1024" alt="" loading="lazy" /><figcaption>Fikirden üretime, birlikte.<small>Temsili tasarım</small></figcaption></figure>
      </aside>
      <div className="career-form-panel">
        {success ? <div className="career-success" role="status" tabIndex={-1} ref={element => element?.focus()}>
          <CheckCircle2 size={44} strokeWidth={1.4} aria-hidden="true" /><h2>{kind === 'job' ? 'Başvurunuz bize ulaştı.' : 'Talebiniz bize ulaştı.'}</h2><p>{kind === 'job' ? 'Paylaştığınız bilgileri ekibimizin ihtiyaçları doğrultusunda değerlendireceğiz. İlginiz için teşekkür ederiz.' : 'Ekipmanınızı ve iş birliği beklentinizi değerlendireceğiz. Uygun bir çalışma kapsamı oluştuğunda sizinle iletişime geçeceğiz.'}</p><Link className="brand-button" to={'/kariyer' + query}>Kariyere dön <ArrowUpRight size={18} /></Link><button type="button" className="text-link" onClick={() => { onReset(); move(0); }}>Yeni başvuru</button>
        </div> : <form onSubmit={handleSubmit} className="career-form" aria-busy={submitting}>
          <div className="career-form-heading"><p className="career-eyebrow">Adım {step + 1} / {steps.length}</p><h2 ref={heading} tabIndex={-1}>{steps[step].title}</h2><p>{steps[step].description}</p></div>
          {steps.map((item, index) => <fieldset key={item.title} hidden={index !== step} disabled={index !== step || submitting} className="career-step-fields" aria-label={item.title}>{item.content}</fieldset>)}
          <div className="career-form-actions">{step > 0 && <button type="button" className="career-back" disabled={submitting} onClick={() => move(step - 1)}><ArrowLeft size={17} aria-hidden="true" /> Geri</button>}<button type="submit" className="brand-button" disabled={submitting}>{submitting ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Gönderiliyor…</> : step === steps.length - 1 ? <>{submitLabel} <ArrowUpRight size={18} aria-hidden="true" /></> : <>Devam et <ArrowRight size={18} aria-hidden="true" /></>}</button></div>
          <p className="career-form-note">* işaretli alanlar zorunludur. Bilgileriniz bu başvurunun değerlendirilmesi için kullanılır.</p>
        </form>}
      </div>
    </div>
  </div>;
}

export function Field({label, children, hint}: {label: string; children: ReactElement; hint?: string}) {
  const id = useId();
  return <div className="career-field"><label htmlFor={id}>{label}</label>{isValidElement(children) && cloneElement(Children.only(children) as ReactElement<Record<string, unknown>>, {id, 'aria-describedby': hint ? id + '-hint' : undefined})}{hint && <small id={id + '-hint'}>{hint}</small>}</div>;
}

export function FileUpload({file, onFile, accept, hint}: {file: File | null; onFile: (file: File | null) => void; accept: string; hint: string}) {
  return file ? <div className="career-file-selected"><FileUp size={22} aria-hidden="true" /><div><strong>{file.name}</strong><span>{(file.size / 1024 / 1024).toFixed(2)} MB</span></div><button type="button" aria-label="Dosyayı kaldır" onClick={() => onFile(null)}><X size={20} aria-hidden="true" /></button></div>
    : <label className="career-file-upload"><FileUp size={28} strokeWidth={1.4} aria-hidden="true" /><span>Dosyanızı seçin<small>{hint}</small></span><input type="file" aria-label="Dosya seçin" accept={accept} onChange={e => {onFile(e.target.files?.[0] ?? null); e.target.value = '';}} /></label>;
}

export function Consent({checked, onChange, query, children}: {checked: boolean; onChange: (checked: boolean) => void; query: string; children: ReactNode}) {
  return <label className="career-consent"><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} required /><span><Link to={'/basvuru-acik-riza-metni' + query} target="_blank" rel="noopener">Açık Rıza Metni</Link>'ni okudum; {children} <Link to={'/kvkk-aydinlatma-metni' + query} target="_blank" rel="noopener">KVKK Aydınlatma Metni</Link>'ni inceledim.</span></label>;
}
