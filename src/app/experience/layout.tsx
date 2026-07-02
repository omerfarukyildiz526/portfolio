import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deneyim — Backend, Sistem Entegrasyonu & RPA",
  description:
    "Backend developer Ömer Faruk Yıldız'ın iş deneyimi, eğitimi ve sertifikaları. Barsan Global Lojistik'te SAP RFC entegrasyonları, REST API'ler, RPA otomasyonu ve MSSQL/PostgreSQL raporlama. İşe alım yapan firmalar için kanıtlanmış backend deneyimi.",
  keywords: [
    "backend developer deneyim", "yazılım uzmanı deneyim", "SAP RFC entegrasyonu",
    "RPA otomasyon deneyimi", "Blue Prism", "Playwright", "SQL Server", "PostgreSQL",
    "sistem entegrasyonu deneyim", "Ömer Faruk Yıldız CV", "backend developer özgeçmiş",
  ],
  alternates: { canonical: "/experience" },
  openGraph: {
    title: "Deneyim | Ömer Faruk Yıldız — Backend Developer",
    description:
      "İş deneyimi, eğitim ve sertifikalar — backend servisleri, SAP entegrasyonu, RPA ve raporlama.",
    url: "https://omerfarukyildiz.tech/experience",
    type: "profile",
  },
};

export default function ExperienceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
