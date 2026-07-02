import type { Metadata } from "next";
import { getPostBySlug } from "@/lib/posts-db";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Yazı bulunamadı" };
  }

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: "Ömer Faruk Yıldız", url: "https://omerfarukyildiz.tech" }],
    alternates: { canonical: `/logs/${slug}` },
    openGraph: {
      title: `${post.title} | Ömer Faruk Yıldız`,
      description: post.excerpt,
      url: `https://omerfarukyildiz.tech/logs/${slug}`,
      type: "article",
      publishedTime: post.date,
      authors: ["Ömer Faruk Yıldız"],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

const SITE_URL = "https://omerfarukyildiz.tech";

export default async function FeedPostLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  // Yazı için BlogPosting yapısal verisi — Google'ın zengin sonuçta yazar,
  // tarih ve okuma süresini göstermesi için.
  const jsonLd = post && {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${SITE_URL}/logs/${slug}#article`,
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    keywords: post.tags.join(", "),
    articleSection: post.tags[0],
    timeRequired: `PT${post.readTime}M`,
    inLanguage: "tr-TR",
    url: `${SITE_URL}/logs/${slug}`,
    mainEntityOfPage: `${SITE_URL}/logs/${slug}`,
    ...(post.cover ? { image: `${SITE_URL}${post.cover}` } : {}),
    author: {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Ömer Faruk Yıldız",
      url: SITE_URL,
    },
    publisher: { "@id": `${SITE_URL}/#person` },
  };

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
