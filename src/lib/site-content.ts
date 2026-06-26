// Sayfaların panelden düzenlenebilen metin içeriği (iki dilli).
// translations.ts'deki statik değerlerle birebir seed'lenir; kod seviyesindeki
// içerikler (ana sayfa terminali, deneyim stack rozetleri/sertifikalar, GitHub
// proje kartları) burada YOKTUR — onlar kodda kalır.

import type { Lang } from './i18n';

export type PageKey = 'home' | 'experience' | 'contact' | 'projects';

// ── Ana sayfa ──
export interface HomeLang {
  role:           string;
  status:         string;
  subtitle:       string;
  subtitleAccent: string;
  sectionRoutes:  string;
  tags:           string[];
  endpoints: {
    experience: string;
    skills:     string;
    projects:   string;
    feed:       string;
    contact:    string;
  };
}

// ── Deneyim ──
export interface ExpJob {
  company:    string;
  role:       string;
  period:     string;
  location:   string;
  desc:       string;
  type:       string;
  highlights: string[];
}
export interface EduTopic { label: string; items: string[]; }
export interface EduItem {
  school:  string;
  dept:    string;
  degree:  string;
  period:  string;
  topics:  EduTopic[];
  diploma: string;   // PDF/görsel adresi (boş olabilir)
  logo:    string;   // okul logosu adresi (boş olabilir)
}
export interface RefItem {
  name:     string;
  title:    string;
  company:  string;
  relation: string;
  contact:  string;
  linkedin: string;  // boş olabilir
}
export interface CertItem {
  name:   string;
  issuer: string;
  date:   string;
  url:    string;   // doğrulama linki (boş olabilir)
  image:  string;   // belge görseli (boş olabilir)
}
export interface ExperienceLang {
  pageTitle:    string;
  pageDesc:     string;
  sectionWork:  string;
  sectionEdu:   string;
  sectionRef:   string;
  sectionCert:  string;
  experience:   ExpJob[];
  education:    EduItem[];
  references:   RefItem[];
  certifications: CertItem[];
}

// ── İletişim ──
export interface ContactLink { label: string; handle: string; href: string; }
export interface ContactLang {
  pageTitle:     string;
  pageDesc:      string;
  formName:      string;
  formNamePh:    string;
  formEmail:     string;
  formEmailPh:   string;
  formMessage:   string;
  formMessagePh: string;
  formReply:     string;
  formSend:      string;
  formSending:   string;
  directLabel:   string;
  successTitle:  string;
  successAnother:string;
  links:         ContactLink[];
}

// ── Projeler ──
export interface ProjectsLang {
  pageTitle: string;
  pageDesc:  string;
  repos:     string[];  // "kullanıcı/repo" listesi; boşsa otomatik çekilir
}

export interface SiteContent {
  home:       Record<Lang, HomeLang>;
  experience: Record<Lang, ExperienceLang>;
  contact:    Record<Lang, ContactLang>;
  projects:   Record<Lang, ProjectsLang>;
}

// Dilden bağımsız varsayılanlar (eski component sabitleri).
const SEED_DIPLOMA = '/certificates/Diploma.pdf';
const SEED_SCHOOL_LOGO = 'https://www.istinye.edu.tr/sites/default/files/2025-07/isu_logo_tr-1.svg';
const SEED_REF_LINKEDIN = 'https://www.linkedin.com/in/alperakoguz/';
const SEED_CERTS: CertItem[] = [
  { name: '.NET MVC Fullstack Web Geliştirme Eğitimi', issuer: 'ALT+TAB Kuluçka Merkezi',     date: 'Kas 2025',    url: '',                                                                                                        image: '/certificates/alttab-yaz-kampi.jpg' },
  { name: 'Python 401',                                 issuer: 'Turkcell Geleceği Yazanlar', date: '28 Eki 2025', url: 'https://gelecegiyazanlar.turkcell.com.tr/sertifika/d5d8da13c8c2484aa2efb72058afcc79', image: '' },
  { name: 'Python 301',                                 issuer: 'Turkcell Geleceği Yazanlar', date: '23 Eki 2025', url: 'https://gelecegiyazanlar.turkcell.com.tr/sertifika/435eb150e460417fa48f238aceb37184', image: '' },
  { name: 'Python 201',                                 issuer: 'Turkcell Geleceği Yazanlar', date: '12 Eki 2025', url: 'https://gelecegiyazanlar.turkcell.com.tr/sertifika/2033d1b27e46432da7ad2e86a69a8715', image: '' },
  { name: 'Python 101',                                 issuer: 'Turkcell Geleceği Yazanlar', date: '14 Eyl 2025', url: 'https://gelecegiyazanlar.turkcell.com.tr/sertifika/42e44bf3c3ac4b5888da4b81e23fdb93', image: '' },
  { name: 'A1 Seviye İngilizce',                        issuer: 'BTK Akademi',                date: 'Eyl 2025',    url: 'https://www.btkakademi.gov.tr/portal/certificate/validate?certificateId=jK1hKodg0z', image: '' },
  { name: 'API ve API Testi',                           issuer: 'BTK Akademi',                date: 'Ağu 2025',    url: 'https://www.btkakademi.gov.tr/portal/certificate/validate?certificateId=nKqhnnge1A', image: '' },
  { name: 'Yeni Başlayanlar için Python Programlama',   issuer: 'BTK Akademi',                date: 'Ağu 2025',    url: 'https://www.btkakademi.gov.tr/portal/certificate/validate?certificateId=VP1cggb8p7', image: '' },
  { name: 'Versiyon Kontrolleri: Git ve GitHub',        issuer: 'BTK Akademi',                date: 'Ağu 2025',    url: 'https://www.btkakademi.gov.tr/portal/certificate/validate?certificateId=OKMhqaK7Vq', image: '' },
];

// İletişim sosyal bağlantılarının varsayılan adresleri (eski component sabitleri).
export const SEED_CONTENT: SiteContent = {
  home: {
    tr: {
      role:           'Yazılım Uzmanı · Barsan Global Lojistik',
      status:         'API_SERVER_ONLINE',
      subtitle:       'Kurumsal lojistik için backend servisleri ve süreç otomasyonu geliştiriyorum.',
      subtitleAccent: 'Önce doğruluk, sonra hız.',
      sectionRoutes:  '// API ROTALARI',
      tags:           ['Backend', 'Python', 'C# / .NET', 'Otomasyon / RPA', 'Sistem entegrasyonu'],
      endpoints: {
        experience: 'roller, kapsam & kararlar',
        skills:     'çalışma alanlarım',
        projects:   'seçilmiş repolar',
        feed:       'programcı notları',
        contact:    'mesaj gönder',
      },
    },
    en: {
      role:           'Software Specialist · Barsan Global Logistics',
      status:         'API_SERVER_ONLINE',
      subtitle:       'I build backend services and process automation for enterprise logistics.',
      subtitleAccent: 'Correctness first, then speed.',
      sectionRoutes:  '// API ROUTES',
      tags:           ['Backend', 'Python', 'C# / .NET', 'Automation / RPA', 'Systems integration'],
      endpoints: {
        experience: 'roles, scope & decisions',
        skills:     'how I work, by domain',
        projects:   'selected repositories',
        feed:       'programmer notes',
        contact:    'send a message',
      },
    },
  },

  experience: {
    tr: {
      pageTitle:   'DENEYİM.',
      pageDesc:    'Nerede çalıştım, neyi üstlendim ve hangi kararları verdim.',
      sectionWork: '// İŞ DENEYİMİ',
      sectionEdu:  '// EĞİTİM',
      sectionRef:  '// REFERANSLAR',
      sectionCert: '// SERTİFİKALAR',
      experience: [
        {
          company: 'Barsan Global Lojistik', role: 'Yazılım Uzmanı', period: 'Eyl 2025 — Günümüz',
          location: 'İstanbul, Türkiye', type: 'Tam Zamanlı',
          desc: 'SAP, iç uygulamalar ve operasyon arasında veriyi taşıyan backend servisleri, entegrasyonlar ve otomasyon.',
          highlights: [
            'Manuel SAP veri girişini RFC/BAPI entegrasyonlarıyla değiştirdim; saatler süren mutabakat artık gece gözetimsiz çalışıyor.',
            'Yeni scraper\'larda kararsız testlerle uğraştıktan sonra Selenium yerine Playwright\'ı seçtim; açık bekleme ve ağ yakalama ile rastgele hatalar belirgin biçimde azaldı.',
            'İç REST servislerini tutarlı hata zarfları ve DTO sınırlarıyla yazdım; entity modeli hiçbir zaman tüketiciye sızmıyor.',
            'Kırılgan, gözetimli Blue Prism akışlarını; kısmi hatadan sonra çift işlem yapmadan tekrar denenebilen idempotent adımlara taşıdım.',
            'Darboğaz olanın sorgular olduğu yerde indeksleme ve N+1 erişimi eleyerek MSSQL/PostgreSQL raporlamasını hızlandırdım.',
          ],
        },
        {
          company: 'Barsan Global Lojistik', role: 'Yazılım Stajyeri', period: 'Tem 2024 — Eyl 2025',
          location: 'İstanbul, Türkiye', type: 'Staj',
          desc: 'Otomasyon ve raporlamayla başladım; önemli bir şeye dokunmadan önce kod tabanını ve işi öğrendim.',
          highlights: [
            'Ekibin sırtındaki tekrarlayan veri girişi işlerini alan ilk otomasyon scriptlerini yazdım.',
            'SQL Server raporlama sorgularını üstlendim; tahmin etmek yerine execution plan okumayı öğrendim.',
            'Küçük .NET servislerini uçtan uca geliştirdim — kod yazmadan önce API sözleşmesi tasarlamayı ilk burada öğrendim.',
          ],
        },
      ],
      education: [
        {
          school: 'İstinye Üniversitesi', dept: 'Bilgisayar Programcılığı', degree: 'Önlisans', period: 'Eki 2023 — Haz 2025',
          topics: [
            { label: 'Programlama',        items: ['Python', 'PHP', 'C', 'JavaScript', 'HTML', 'CSS', 'SQL'] },
            { label: 'Yazılım Geliştirme', items: ['OOP', 'Veri Yapıları', 'Arka Uç Geliştirme', 'Ön Uç Geliştirme'] },
            { label: 'Veritabanı',         items: ['Veritabanı Yönetimi', 'Veritabanı Tasarımı'] },
            { label: 'Sistem & Altyapı',   items: ['Linux', 'Sistem Analizi ve Tasarımı'] },
            { label: 'Yetkinlikler',       items: ['Proje Yönetimi', 'Problem Çözme', 'Analitik Düşünme', 'Girişimcilik', 'Sunum Becerileri'] },
          ],
          diploma: SEED_DIPLOMA, logo: SEED_SCHOOL_LOGO,
        },
      ],
      references: [
        { name: 'Alper Akoğuz', title: 'Öğretim Görevlisi', company: 'İstinye Üniversitesi', relation: 'Akademik Referans', contact: 'akoguz.alper@gmail.com', linkedin: SEED_REF_LINKEDIN },
      ],
      certifications: SEED_CERTS,
    },
    en: {
      pageTitle:   'EXPERIENCE.',
      pageDesc:    'Where I\'ve worked, what I owned, and the calls I made.',
      sectionWork: '// WORK EXPERIENCE',
      sectionEdu:  '// EDUCATION',
      sectionRef:  '// REFERENCES',
      sectionCert: '// CERTIFICATIONS',
      experience: [
        {
          company: 'Barsan Global Logistics', role: 'Software Specialist', period: 'Sep 2025 — Present',
          location: 'Istanbul, Turkey', type: 'Full-time',
          desc: 'Backend services, integrations and automation that move data between SAP, internal apps and operations.',
          highlights: [
            'Replaced manual SAP data entry with RFC/BAPI integrations — a reconciliation that took an operator hours now runs unattended overnight.',
            'Chose Playwright over Selenium for new scrapers after living with flaky tests: explicit waits and network interception cut spurious failures sharply.',
            'Wrote internal REST services with consistent error envelopes and DTO boundaries, so the entity model never leaks to consumers.',
            'Moved fragile, attended Blue Prism flows toward idempotent, retryable steps that survive a partial failure without double-processing.',
            'Sped up the reporting queries that were the actual bottleneck on MSSQL/PostgreSQL — indexing and removing N+1 access, not rewriting everything.',
          ],
        },
        {
          company: 'Barsan Global Logistics', role: 'Software Intern', period: 'Jul 2024 — Sep 2025',
          location: 'Istanbul, Turkey', type: 'Internship',
          desc: 'Started on automation and reporting; learned the codebase and the business before touching anything that mattered.',
          highlights: [
            'Wrote the first automation scripts that took repetitive data-entry work off the team\'s plate.',
            'Owned reporting queries on SQL Server; learned to read execution plans instead of guessing.',
            'Shipped small .NET services end to end — where I first learned to design the API contract before writing code.',
          ],
        },
      ],
      education: [
        {
          school: 'İstinye University', dept: 'Computer Programming', degree: 'Associate\'s Degree', period: 'Oct 2023 — Jun 2025',
          topics: [
            { label: 'Programming',  items: ['Python', 'PHP', 'C', 'JavaScript', 'HTML', 'CSS', 'SQL'] },
            { label: 'Software Dev', items: ['OOP', 'Data Structures', 'Backend Dev', 'Frontend Dev'] },
            { label: 'Database',     items: ['Database Management', 'Database Design'] },
            { label: 'Systems',      items: ['Linux', 'System Analysis & Design'] },
            { label: 'Competencies', items: ['Project Management', 'Problem Solving', 'Analytical Thinking', 'Entrepreneurship', 'Presentation Skills'] },
          ],
          diploma: SEED_DIPLOMA, logo: SEED_SCHOOL_LOGO,
        },
      ],
      references: [
        { name: 'Alper Akoğuz', title: 'Lecturer', company: 'İstinye University', relation: 'Academic Reference', contact: 'akoguz.alper@gmail.com', linkedin: SEED_REF_LINKEDIN },
      ],
      certifications: SEED_CERTS,
    },
  },

  contact: {
    tr: {
      pageTitle: 'BAĞLANTI.',
      pageDesc:  'İletişim için aşağıdaki kanalları kullanabilirsin. İsteği gönder, yanıtı bekle.',
      formName: 'İsim', formNamePh: 'Adınız',
      formEmail: 'E-posta', formEmailPh: 'siz@ornek.com',
      formMessage: 'Mesaj', formMessagePh: 'Aklında ne var?',
      formReply: '24 saat içinde yanıt.',
      formSend: 'Mesaj gönder', formSending: 'Gönderiliyor…',
      directLabel: 'Ya da doğrudan ulaş',
      successTitle: 'Mesaj alındı.', successAnother: 'Yeni mesaj gönder →',
      links: [
        { label: 'GitHub',   handle: 'OmerFaruk-YILDIZ',            href: 'https://github.com/OmerFaruk-YILDIZ' },
        { label: 'LinkedIn', handle: 'omerfaruk-yildiz',            href: 'https://www.linkedin.com/in/omerfaruk-yildiz/' },
        { label: 'Email',    handle: 'omerfaruk_yildiz@outlook.com', href: 'mailto:omerfaruk_yildiz@outlook.com' },
      ],
    },
    en: {
      pageTitle: 'CONTACT.',
      pageDesc:  'Use any of the channels below to reach me. Send the request, await the response.',
      formName: 'Name', formNamePh: 'Your name',
      formEmail: 'Email', formEmailPh: 'you@example.com',
      formMessage: 'Message', formMessagePh: 'What\'s on your mind?',
      formReply: 'Reply within 24 hours.',
      formSend: 'Send message', formSending: 'Sending…',
      directLabel: 'Or reach me directly',
      successTitle: 'Message received.', successAnother: 'Send another message →',
      links: [
        { label: 'GitHub',   handle: 'OmerFaruk-YILDIZ',            href: 'https://github.com/OmerFaruk-YILDIZ' },
        { label: 'LinkedIn', handle: 'omerfaruk-yildiz',            href: 'https://www.linkedin.com/in/omerfaruk-yildiz/' },
        { label: 'Email',    handle: 'omerfaruk_yildiz@outlook.com', href: 'mailto:omerfaruk_yildiz@outlook.com' },
      ],
    },
  },

  projects: {
    tr: {
      pageTitle: 'PROJELER.',
      pageDesc:  'Seçilmiş public repolar. Birini açıp README\'yi yerinde oku — ekran görüntüsü yerine bağlam.',
      repos: [],
    },
    en: {
      pageTitle: 'PROJECTS.',
      pageDesc:  'A few public repositories. Open one to read the README in place — context over screenshots.',
      repos: [],
    },
  },
};
