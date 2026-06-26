// Donanım (/skills) sayfasının panelden düzenlenebilen içeriği.
// Dilden bağımsız olmayan kısımlar (pageRoute, pageTag, libCount, terminal)
// translations.ts'de statik kalır; yalnızca buradaki alanlar DB'den okunur.

import type { Lang } from './i18n';

export interface Responsibility {
  icon:  string;
  title: string;
  tags:  string[];
}

export interface TechLib {
  name: string;
  sub:  string[];
}

export interface TechCard {
  title: string;
  libs:  TechLib[];
}

export interface SkillsLang {
  pageTitle:        string;
  pageDesc:         string;
  sectionMarquee:   string;
  sectionStack:     string;
  responsibilities: Responsibility[];
  techCards:        TechCard[];
}

export type SkillsContent = Record<Lang, SkillsLang>;

// Koleksiyon boşken aktarılacak başlangıç içeriği — translations.ts'deki
// mevcut değerlerle birebir aynı, böylece ilk açılışta hiçbir şey değişmez.
export const SEED_SKILLS: SkillsContent = {
  tr: {
    pageTitle:      'DONANIM.',
    pageDesc:       'Alanlara göre nasıl çalıştığım. Detay proje notlarında — bunlar kullandığım araçlar, bir puan kartı değil.',
    sectionMarquee: '// ÜSTLENDİKLERİM',
    sectionStack:   '// ALANLARA GÖRE',
    responsibilities: [
      { icon: 'API', title: 'REST API Tasarımı',    tags: ['GET', 'POST', 'PUT', 'DELETE'] },
      { icon: 'DB',  title: 'Veritabanı Mimarisi',  tags: ['SQL Server', 'PostgreSQL', 'EF Core'] },
      { icon: 'RPA', title: 'Süreç Otomasyonu',     tags: ['Selenium', 'Blue Prism', 'Power Automate'] },
      { icon: 'INT', title: 'Sistem Entegrasyonu',  tags: ['SAP RFC', 'SOAP', 'BAPI'] },
      { icon: 'ETL', title: 'Veri İşleme',          tags: ['Pandas', 'NumPy', 'Excel'] },
      { icon: 'OPS', title: 'DevOps & Deployment',  tags: ['Docker', 'Git', 'CI/CD'] },
    ],
    techCards: [
      { title: 'Python', libs: [
        { name: 'Selenium',  sub: ['WebDriver', 'RPA', 'Web Scraping'] },
        { name: 'Pandas',    sub: ['Veri İşleme', 'Excel Otomasyon'] },
        { name: 'Requests',  sub: ['API Entegrasyon', 'SOAP / HTTP'] },
        { name: 'NumPy',     sub: ['Matematiksel İşlemler'] },
      ]},
      { title: 'C# / .NET', libs: [
        { name: 'Entity Framework', sub: ['Database First', 'LINQ', 'Migration'] },
        { name: '.NET Core',        sub: ['Web API', 'Microservices'] },
        { name: 'WPF',              sub: ['Desktop UI', 'MVVM Pattern'] },
        { name: 'LINQ',             sub: ['Veri Filtreleme', 'Projection'] },
      ]},
      { title: 'Veritabanı', libs: [
        { name: 'SQL Server', sub: ['T-SQL', 'Stored Procedures'] },
        { name: 'PostgreSQL', sub: ['Query Optim.', 'Indexing'] },
        { name: 'Oracle',     sub: ['PL/SQL', 'Enterprise DB'] },
        { name: 'Redis',      sub: ['Cache Layer', 'Session'] },
      ]},
      { title: 'DevOps & Diğer', libs: [
        { name: 'Git / GitHub', sub: ['Branching', 'CI/CD Pipeline'] },
        { name: 'Docker',       sub: ['Containerization', 'Compose'] },
        { name: 'SAP',          sub: ['ABAP Temel', 'RFC / BAPI'] },
        { name: 'RPA Tools',    sub: ['Blue Prism', 'Power Automate'] },
      ]},
    ],
  },
  en: {
    pageTitle:      'TOOLKIT.',
    pageDesc:       'How I work, grouped by domain. The detail lives in the project notes — these are the tools, not a scorecard.',
    sectionMarquee: '// WHAT I OWN',
    sectionStack:   '// BY DOMAIN',
    responsibilities: [
      { icon: 'API', title: 'REST API Design',       tags: ['GET', 'POST', 'PUT', 'DELETE'] },
      { icon: 'DB',  title: 'Database Architecture',  tags: ['SQL Server', 'PostgreSQL', 'EF Core'] },
      { icon: 'RPA', title: 'Process Automation',    tags: ['Selenium', 'Blue Prism', 'Power Automate'] },
      { icon: 'INT', title: 'System Integration',    tags: ['SAP RFC', 'SOAP', 'BAPI'] },
      { icon: 'ETL', title: 'Data Processing',       tags: ['Pandas', 'NumPy', 'Excel'] },
      { icon: 'OPS', title: 'DevOps & Deployment',   tags: ['Docker', 'Git', 'CI/CD'] },
    ],
    techCards: [
      { title: 'Python', libs: [
        { name: 'Selenium',  sub: ['WebDriver', 'RPA', 'Web Scraping'] },
        { name: 'Pandas',    sub: ['Data Processing', 'Excel Automation'] },
        { name: 'Requests',  sub: ['API Integration', 'SOAP / HTTP'] },
        { name: 'NumPy',     sub: ['Mathematical Operations'] },
      ]},
      { title: 'C# / .NET', libs: [
        { name: 'Entity Framework', sub: ['Database First', 'LINQ', 'Migration'] },
        { name: '.NET Core',        sub: ['Web API', 'Microservices'] },
        { name: 'WPF',              sub: ['Desktop UI', 'MVVM Pattern'] },
        { name: 'LINQ',             sub: ['Data Filtering', 'Projection'] },
      ]},
      { title: 'Database', libs: [
        { name: 'SQL Server', sub: ['T-SQL', 'Stored Procedures'] },
        { name: 'PostgreSQL', sub: ['Query Optim.', 'Indexing'] },
        { name: 'Oracle',     sub: ['PL/SQL', 'Enterprise DB'] },
        { name: 'Redis',      sub: ['Cache Layer', 'Session'] },
      ]},
      { title: 'DevOps & Other', libs: [
        { name: 'Git / GitHub', sub: ['Branching', 'CI/CD Pipeline'] },
        { name: 'Docker',       sub: ['Containerization', 'Compose'] },
        { name: 'SAP',          sub: ['ABAP Basics', 'RFC / BAPI'] },
        { name: 'RPA Tools',    sub: ['Blue Prism', 'Power Automate'] },
      ]},
    ],
  },
};
