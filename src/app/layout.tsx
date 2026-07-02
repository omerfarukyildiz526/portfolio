import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ClientShell from "@/components/ClientShell";
import VisitTracker from "@/components/VisitTracker";

// Yandex.Metrika sayaç kimliği
const YM_ID = 110249325;

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://omerfarukyildiz.tech"),
  title: {
    default:
      "Ömer Faruk Yıldız | Backend Developer & Yazılım Uzmanı (Python, C# / .NET, RPA)",
    template: "%s | Ömer Faruk Yıldız — Backend Developer",
  },
  description:
    "İstanbul merkezli backend developer ve yazılım uzmanı Ömer Faruk Yıldız. Python, C# / .NET, REST API ve RPA ile ölçeklenebilir backend servisleri, sistem entegrasyonu ve süreç otomasyonu geliştiriyorum. Proje, freelance ve iş fırsatları için firmalar benimle iletişime geçebilir.",
  keywords: [
    "Ömer Faruk Yıldız",
    "backend developer",
    "backend developer İstanbul",
    "yazılım uzmanı",
    "yazılım geliştirici",
    "freelance backend developer",
    "remote backend developer",
    "Python developer",
    "C# .NET developer",
    ".NET backend",
    "REST API geliştirme",
    "RPA geliştirici",
    "süreç otomasyonu",
    "sistem entegrasyonu",
    "SAP RFC entegrasyonu",
    "Selenium",
    "Playwright",
    "SQL Server",
    "PostgreSQL",
    "Docker",
    "mikroservis",
    "backend developer işe alım",
    "yazılımcı iş ilanı",
    "software engineer Turkey",
    "hire backend developer",
    "portföy",
  ],
  authors: [{ name: "Ömer Faruk Yıldız", url: "https://omerfarukyildiz.tech" }],
  creator: "Ömer Faruk Yıldız",
  publisher: "Ömer Faruk Yıldız",
  category: "technology",
  applicationName: "Ömer Faruk Yıldız — Backend Developer Portfolio",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title:
      "Ömer Faruk Yıldız | Backend Developer & Yazılım Uzmanı (Python, C# / .NET, RPA)",
    description:
      "İstanbul merkezli backend developer. Python, C# / .NET, REST API ve RPA ile backend servisleri, sistem entegrasyonu ve süreç otomasyonu. Proje ve iş fırsatları için firmalar ulaşabilir.",
    url: "https://omerfarukyildiz.tech",
    type: "website",
    locale: "tr_TR",
    alternateLocale: "en_US",
    siteName: "Ömer Faruk Yıldız — Backend Developer",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ömer Faruk Yıldız | Backend Developer & Yazılım Uzmanı",
    description:
      "Python, C# / .NET ve RPA ile backend servisleri, sistem entegrasyonu ve süreç otomasyonu. İstanbul merkezli backend developer — firmalar ulaşabilir.",
  },
};

// AI / cevap motorlarının kişiyi ve siteyi anlaması için yapısal veri (JSON-LD).
// Bu, ChatGPT, Perplexity, Gemini gibi araçların doğru bilgiyle alıntı yapmasını sağlar.
const SITE_URL = "https://omerfarukyildiz.tech";
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Ömer Faruk Yıldız",
      url: SITE_URL,
      jobTitle: "Backend Developer / Yazılım Uzmanı",
      worksFor: { "@type": "Organization", name: "Barsan Global Lojistik" },
      nationality: "Turkish",
      email: "mailto:omerfaruk_yildiz@outlook.com",
      address: {
        "@type": "PostalAddress",
        addressLocality: "İstanbul",
        addressCountry: "TR",
      },
      workLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: "İstanbul",
          addressCountry: "TR",
        },
      },
      description:
        "İstanbul merkezli backend developer ve yazılım uzmanı. Python, C# / .NET, REST API ve RPA ile backend servisleri, sistem entegrasyonu ve süreç otomasyonu geliştiriyor; proje ve iş fırsatları için firmalarla iletişime açık.",
      knowsAbout: [
        "Backend Development", "Python", "C#", ".NET", "REST API", "RPA",
        "Selenium", "Playwright", "SAP RFC", "Sistem Entegrasyonu",
        "Süreç Otomasyonu", "SQL Server", "PostgreSQL", "Docker", "MongoDB",
      ],
      knowsLanguage: ["Turkish", "English"],
      seeks: {
        "@type": "Demand",
        name: "Backend geliştirme projeleri, freelance işbirlikleri ve iş fırsatları",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Recruitment / İş & Proje Teklifleri",
        email: "omerfaruk_yildiz@outlook.com",
        url: `${SITE_URL}/contact`,
        availableLanguage: ["Turkish", "English"],
      },
      sameAs: [
        "https://github.com/OmerFaruk-YILDIZ",
        "https://www.linkedin.com/in/omerfaruk-yildiz/",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Ömer Faruk Yıldız | Backend Developer Portfolio",
      inLanguage: "tr-TR",
      publisher: { "@id": `${SITE_URL}/#person` },
    },
    {
      "@type": "ProfilePage",
      "@id": `${SITE_URL}/#profilepage`,
      url: SITE_URL,
      name: "Ömer Faruk Yıldız | Backend Developer Portfolio",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#person` },
      inLanguage: "tr-TR",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ClientShell>{children}</ClientShell>
        <VisitTracker />

        {/* Yandex.Metrika */}
        <Script id="yandex-metrika" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `
          (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
          })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${YM_ID}', 'ym');
          ym(${YM_ID}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true});
        ` }} />
        <noscript><div><img src={`https://mc.yandex.ru/watch/${YM_ID}`} style={{ position: 'absolute', left: '-9999px' }} alt="" /></div></noscript>
      </body>
    </html>
  );
}
