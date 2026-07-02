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

export default function FeedPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
