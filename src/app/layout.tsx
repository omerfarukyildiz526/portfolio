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
    default: "Ömer Faruk Yıldız | Backend Developer Portfolio",
    template: "%s | Ömer Faruk Yıldız",
  },
  description:
    "Python, C# / .NET ve RPA teknolojileriyle geliştirilmiş backend servisleri ve süreç otomasyonu projeleri. Ömer Faruk Yıldız — Barsan Global Lojistik'te yazılım uzmanı.",
  keywords: [
    "Ömer Faruk Yıldız", "backend developer", "yazılım uzmanı", "Python",
    "C#", ".NET", "RPA", "Selenium", "SAP RFC", "otomasyon", "REST API", "portföy",
  ],
  authors: [{ name: "Ömer Faruk Yıldız" }],
  creator: "Ömer Faruk Yıldız",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Ömer Faruk Yıldız | Backend Developer Portfolio",
    description:
      "Python, C# / .NET ve RPA ile backend servisleri ve süreç otomasyonu. Projeler, deneyim ve teknik notlar.",
    url: "https://omerfarukyildiz.tech",
    type: "website",
    locale: "tr_TR",
    siteName: "Ömer Faruk Yıldız",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ömer Faruk Yıldız | Backend Developer Portfolio",
    description:
      "Python, C# / .NET ve RPA ile backend servisleri ve süreç otomasyonu projeleri.",
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
      description:
        "Python, C# / .NET ve RPA teknolojileriyle backend servisleri ve süreç otomasyonu geliştiren yazılım uzmanı.",
      knowsAbout: [
        "Backend Development", "Python", "C#", ".NET", "RPA",
        "Selenium", "SAP RFC", "REST API", "Süreç Otomasyonu", "MongoDB",
      ],
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
