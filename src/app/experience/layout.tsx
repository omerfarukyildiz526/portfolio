import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deneyim",
  description:
    "Ömer Faruk Yıldız'ın iş deneyimi, eğitimi ve sertifikaları. Barsan Global Lojistik'te backend geliştirme, sistem entegrasyonu ve RPA otomasyonu.",
  alternates: { canonical: "/experience" },
  openGraph: {
    title: "Deneyim | Ömer Faruk Yıldız",
    description:
      "İş deneyimi, eğitim ve sertifikalar — backend, sistem entegrasyonu ve RPA.",
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
