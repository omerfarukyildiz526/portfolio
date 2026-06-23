import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yetenekler & Teknolojiler",
  description:
    "Backend, veri, otomasyon ve sistem entegrasyonu alanlarında çalıştığım teknolojiler: Python, C# / .NET, SQL Server, PostgreSQL, Docker, SAP RFC ve Selenium.",
  alternates: { canonical: "/skills" },
  openGraph: {
    title: "Yetenekler & Teknolojiler | Ömer Faruk Yıldız",
    description:
      "Backend, veri, otomasyon ve sistem entegrasyonu alanlarında kullandığım teknolojiler.",
    url: "https://omerfarukyildiz.tech/skills",
    type: "website",
  },
};

export default function SkillsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
