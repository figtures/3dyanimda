export interface CareerRole {
  id: string;
  slug: string;
  title_tr: string;
  department: string;
  location: string;
  employment_type: string;
  level: string;
  summary_tr: string;
  description_tr: string;
  requirements_tr: string;
}

const stories: Record<string, {intro: string; image: string; areas: string[]}> = {
  '3dyanimda': {
    intro: 'Bir prototip, kişisel bir tasarım ya da yeni bir ürün. Fikirlerin somutlaştığı yerde, yeteneğinize alan açın.',
    image: '/brand/industrial/fixture.webp',
    areas: ['3D tasarım', 'Katmanlı üretim', 'Proje iletişimi'],
  },
  '3dsanayi': {
    intro: 'Üretim hattındaki bir ihtiyacı anlayın, doğru geometriyi geliştirin, çözümü sahaya taşıyın. Mühendislik bakışınızı birlikte üretime dönüştürelim.',
    image: '/brand/industrial/fixture.webp',
    areas: ['Üretim mühendisliği', 'Kalite ve ölçüm', 'Teknik projeler'],
  },
  'maketyanimda': {
    intro: 'Çizimden hacme, malzemeden en küçük detaya. Mekânı anlatan modelleri tasarım beceriniz ve el işçiliğinizle birlikte şekillendirelim.',
    image: '/brand/industrial/architecture.webp',
    areas: ['Mimari modelleme', 'Maket üretimi', 'Yüzey ve detay'],
  },
  'parcayanimda': {
    intro: 'Bir parçanın nasıl çalıştığını merak ediyorsanız aynı dili konuşuyoruz. Ölçü, modelleme ve üretimi kullanışlı çözümler için bir araya getirelim.',
    image: '/brand/industrial/parts.webp',
    areas: ['Parça modelleme', '3D tarama', 'Üretim ve kontrol'],
  },
};
export const careerStory = (slug: string) => stories[slug] || stories['3dyanimda'];
