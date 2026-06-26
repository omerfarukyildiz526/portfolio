import type { Post, ContentBlock } from './posts';
import type { SkillsContent, SkillsLang } from './skills-content';
import type {
  PageKey, HomeLang, ExperienceLang, ContactLang, ProjectsLang,
} from './site-content';

const BLOCK_TYPES = ['p', 'h2', 'h3', 'code', 'list', 'note', 'quote', 'image', 'divider'] as const;

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function strList(v: unknown): string[] {
  return Array.isArray(v) ? v.map(str).filter(Boolean) : [];
}

// Tek bir dilin donanım içeriğini temizler. Eksik/bozuk alanlar güvenli
// varsayılanlara düşer; boş başlıklı kart ve madde elenir.
function parseSkillsLang(input: unknown): SkillsLang {
  const o = (typeof input === 'object' && input !== null ? input : {}) as Record<string, unknown>;

  const responsibilities = (Array.isArray(o.responsibilities) ? o.responsibilities : [])
    .map((r) => {
      const x = (typeof r === 'object' && r !== null ? r : {}) as Record<string, unknown>;
      return { icon: str(x.icon), title: str(x.title), tags: strList(x.tags) };
    })
    .filter((r) => r.title);

  const techCards = (Array.isArray(o.techCards) ? o.techCards : [])
    .map((c) => {
      const x = (typeof c === 'object' && c !== null ? c : {}) as Record<string, unknown>;
      const libs = (Array.isArray(x.libs) ? x.libs : [])
        .map((l) => {
          const y = (typeof l === 'object' && l !== null ? l : {}) as Record<string, unknown>;
          return { name: str(y.name), sub: strList(y.sub) };
        })
        .filter((l) => l.name);
      return { title: str(x.title), libs };
    })
    .filter((c) => c.title);

  return {
    pageTitle:      str(o.pageTitle),
    pageDesc:       str(o.pageDesc),
    sectionMarquee: str(o.sectionMarquee),
    sectionStack:   str(o.sectionStack),
    responsibilities,
    techCards,
  };
}

// ── Sayfa içerikleri (home / experience / contact / projects) ──

function obj(v: unknown): Record<string, unknown> {
  return (typeof v === 'object' && v !== null ? v : {}) as Record<string, unknown>;
}

function parseHomeLang(input: unknown): HomeLang {
  const o = obj(input);
  const e = obj(o.endpoints);
  return {
    role:           str(o.role),
    status:         str(o.status),
    subtitle:       str(o.subtitle),
    subtitleAccent: str(o.subtitleAccent),
    sectionRoutes:  str(o.sectionRoutes),
    tags:           strList(o.tags),
    endpoints: {
      experience: str(e.experience),
      skills:     str(e.skills),
      projects:   str(e.projects),
      feed:       str(e.feed),
      contact:    str(e.contact),
    },
  };
}

function parseExperienceLang(input: unknown): ExperienceLang {
  const o = obj(input);
  const experience = (Array.isArray(o.experience) ? o.experience : []).map(j => {
    const x = obj(j);
    return {
      company: str(x.company), role: str(x.role), period: str(x.period),
      location: str(x.location), desc: str(x.desc), type: str(x.type),
      highlights: strList(x.highlights),
    };
  }).filter(j => j.company || j.role);
  const education = (Array.isArray(o.education) ? o.education : []).map(ed => {
    const x = obj(ed);
    const topics = (Array.isArray(x.topics) ? x.topics : []).map(tp => {
      const y = obj(tp);
      return { label: str(y.label), items: strList(y.items) };
    }).filter(t => t.label);
    return { school: str(x.school), dept: str(x.dept), degree: str(x.degree), period: str(x.period), topics, diploma: str(x.diploma), logo: str(x.logo) };
  }).filter(e => e.school);
  const references = (Array.isArray(o.references) ? o.references : []).map(r => {
    const x = obj(r);
    return { name: str(x.name), title: str(x.title), company: str(x.company), relation: str(x.relation), contact: str(x.contact), linkedin: str(x.linkedin) };
  }).filter(r => r.name);
  const certifications = (Array.isArray(o.certifications) ? o.certifications : []).map(cz => {
    const x = obj(cz);
    return { name: str(x.name), issuer: str(x.issuer), date: str(x.date), url: str(x.url), image: str(x.image) };
  }).filter(c => c.name);
  return {
    pageTitle: str(o.pageTitle), pageDesc: str(o.pageDesc),
    sectionWork: str(o.sectionWork), sectionEdu: str(o.sectionEdu), sectionRef: str(o.sectionRef), sectionCert: str(o.sectionCert),
    experience, education, references, certifications,
  };
}

function parseContactLang(input: unknown): ContactLang {
  const o = obj(input);
  const links = (Array.isArray(o.links) ? o.links : []).map(l => {
    const x = obj(l);
    return { label: str(x.label), handle: str(x.handle), href: str(x.href) };
  }).filter(l => l.label);
  return {
    pageTitle: str(o.pageTitle), pageDesc: str(o.pageDesc),
    formName: str(o.formName), formNamePh: str(o.formNamePh),
    formEmail: str(o.formEmail), formEmailPh: str(o.formEmailPh),
    formMessage: str(o.formMessage), formMessagePh: str(o.formMessagePh),
    formReply: str(o.formReply), formSend: str(o.formSend), formSending: str(o.formSending),
    directLabel: str(o.directLabel), successTitle: str(o.successTitle), successAnother: str(o.successAnother),
    links,
  };
}

function parseProjectsLang(input: unknown): ProjectsLang {
  const o = obj(input);
  // "kullanıcı/repo" biçimine indir; geçersiz/boş satırları ele.
  const repos = strList(o.repos).map(r => r.replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '').replace(/^\/+|\/+$/g, ''))
    .filter(r => /^[^/\s]+\/[^/\s]+$/.test(r));
  return { pageTitle: str(o.pageTitle), pageDesc: str(o.pageDesc), repos };
}

const PAGE_PARSERS = {
  home:       parseHomeLang,
  experience: parseExperienceLang,
  contact:    parseContactLang,
  projects:   parseProjectsLang,
} as const;

/** Bir sayfanın iki dilli içeriğini temizler. */
export function parsePageContent(page: PageKey, input: unknown):
  { ok: true; tr: unknown; en: unknown } | { ok: false; error: string } {
  const parser = PAGE_PARSERS[page];
  if (!parser) return { ok: false, error: 'Geçersiz sayfa.' };
  if (typeof input !== 'object' || input === null) return { ok: false, error: 'Geçersiz veri.' };
  const o = input as Record<string, unknown>;
  const tr = parser(o.tr);
  const en = parser(o.en);
  if (page !== 'home' && !(tr as { pageTitle?: string }).pageTitle) {
    return { ok: false, error: 'TR başlık zorunlu.' };
  }
  return { ok: true, tr, en };
}

/** Gelen JSON'ı temiz bir donanım içeriğine (tr/en) dönüştürür. */
export function parseSkills(input: unknown): { ok: true; content: SkillsContent } | { ok: false; error: string } {
  if (typeof input !== 'object' || input === null) return { ok: false, error: 'Geçersiz veri.' };
  const o = input as Record<string, unknown>;
  const tr = parseSkillsLang(o.tr);
  const en = parseSkillsLang(o.en);
  if (!tr.pageTitle || !en.pageTitle) return { ok: false, error: 'Her iki dil için de başlık zorunlu.' };
  return { ok: true, content: { tr, en } };
}

/** Gelen JSON'ı temiz bir Post objesine dönüştürür; geçersizse hata mesajı verir. */
export function parsePost(input: unknown): { ok: true; post: Post } | { ok: false; error: string } {
  if (typeof input !== 'object' || input === null) return { ok: false, error: 'Geçersiz veri.' };
  const o = input as Record<string, unknown>;

  const title = str(o.title);
  if (!title) return { ok: false, error: 'Başlık zorunlu.' };

  let slug = str(o.slug);
  if (!slug) {
    // Başlıktan otomatik slug üret
    slug = title.toLowerCase()
      .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
      .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { ok: false, error: 'Slug yalnızca küçük harf, rakam ve tire içerebilir.' };
  }

  const grad = o.gradient;
  const gradient: [string, string] = Array.isArray(grad) && grad.length === 2
    ? [str(grad[0]) || '#1a2a6c', str(grad[1]) || '#0d1433']
    : ['#0d1433', '#1a2a6c'];

  const tags = Array.isArray(o.tags)
    ? o.tags.map(str).filter(Boolean)
    : [];

  const rawContent = Array.isArray(o.content) ? o.content : [];
  const content: ContentBlock[] = [];
  for (const raw of rawContent) {
    if (typeof raw !== 'object' || raw === null) continue;
    const b = raw as Record<string, unknown>;
    const type = b.type as ContentBlock['type'];
    if (!BLOCK_TYPES.includes(type)) continue;

    if (type === 'divider') {
      content.push({ type });
    } else if (type === 'list') {
      const items = Array.isArray(b.items) ? b.items.map(str).filter(Boolean) : [];
      if (items.length) content.push({ type, items });
    } else if (type === 'code') {
      const text = typeof b.text === 'string' ? b.text : '';
      if (text.trim()) content.push({ type, text, lang: str(b.lang) || 'code' });
    } else if (type === 'image') {
      const url = str(b.url);
      if (url) content.push({ type, url, text: str(b.text) || undefined });
    } else {
      const text = str(b.text);
      if (text) content.push({ type, text });
    }
  }
  if (content.length === 0) return { ok: false, error: 'En az bir içerik bloğu ekle.' };

  const dateRaw = str(o.date);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(dateRaw) ? dateRaw : new Date().toISOString().slice(0, 10);

  const readTime = Number(o.readTime);

  const post: Post = {
    slug,
    title,
    excerpt: str(o.excerpt) || title,
    gradient,
    symbol: str(o.symbol) || '📝',
    tags,
    date,
    readTime: Number.isFinite(readTime) && readTime > 0 ? Math.round(readTime) : 5,
    content,
    published: typeof o.published === 'boolean' ? o.published : true,
    cover: str(o.cover) || undefined,
  };
  return { ok: true, post };
}
