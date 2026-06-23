import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "Ömer Faruk Yıldız ile iletişime geçin. Proje teklifleri, işbirliği ve sorularınız için GitHub, LinkedIn ve e-posta.",
  openGraph: {
    title: "İletişim | Ömer Faruk Yıldız",
    description:
      "Proje teklifleri ve işbirliği için iletişime geçin — GitHub, LinkedIn, e-posta.",
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
