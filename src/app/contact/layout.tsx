import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İletişim — İş, Freelance & Proje Teklifleri",
  description:
    "Backend developer Ömer Faruk Yıldız ile iletişime geçin. İşe alım, freelance işbirliği, danışmanlık ve proje teklifleri için firmalara ve işverenlere açığım — 24 saat içinde yanıt. GitHub, LinkedIn ve e-posta.",
  keywords: [
    "backend developer iletişim", "yazılımcı işe alım", "freelance backend developer",
    "proje teklifi", "iş teklifi yazılımcı", "hire backend developer",
    "Ömer Faruk Yıldız iletişim", "backend developer İstanbul iletişim",
  ],
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "İletişim | Ömer Faruk Yıldız — Backend Developer",
    description:
      "İş, freelance ve proje teklifleri için firmalara açığım. GitHub, LinkedIn, e-posta — 24 saat içinde yanıt.",
    url: "https://omerfarukyildiz.tech/contact",
    type: "website",
  },
};

const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": "https://omerfarukyildiz.tech/contact#contactpage",
  url: "https://omerfarukyildiz.tech/contact",
  name: "İletişim | Ömer Faruk Yıldız — Backend Developer",
  description:
    "Backend developer Ömer Faruk Yıldız ile işe alım, freelance işbirliği ve proje teklifleri için iletişim kanalları.",
  mainEntity: { "@id": "https://omerfarukyildiz.tech/#person" },
  about: { "@id": "https://omerfarukyildiz.tech/#person" },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      {children}
    </>
  );
}
