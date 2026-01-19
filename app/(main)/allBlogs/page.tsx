// app/blog/page.tsx
import BlogPageClient from "@/components/BlogPageClient";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Moving Quote New York Blog | Get Quotes, Tips & NYC Moving Help",
  description:
    "Planning a move in New York? Get free moving quotes and real-world guidance for NYC apartments, local moves, and long-distance relocations—plus packing, storage, and cost-saving tips to book with confidence.",
  alternates: {
    canonical: "https://movingquotenewyork.com/",
  },
  openGraph: {
    title: "Moving Quote New York Blog | Free Quotes + Moving Advice",
    description:
      "Free New York moving quotes with expert tips. Learn what to expect for NYC moves, packing services, storage options, and long-distance pricing—then connect with trusted movers.",
    url: "https://movingquotenewyork.com/",
    siteName: "Moving Quote New York",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Moving Quotes & New York Moving Tips",
    description:
      "Get free moving quotes in New York and read practical guides for NYC apartments, local movers, long-distance moves, packing, storage, and saving money.",
  },
};


export default async function BlogPage() {
  const postsPerPage = 6;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/blogs?page=1&limit=${postsPerPage}`,
    { cache: "no-store" }
  );

  const json = await res.json();

  return (
    <BlogPageClient
      initialBlogs={json?.data || []}
      initialMeta={json?.meta || { page: 1, limit: postsPerPage, total: 0, totalPages: 1 }}
      postsPerPage={postsPerPage}
    />
  );
}
