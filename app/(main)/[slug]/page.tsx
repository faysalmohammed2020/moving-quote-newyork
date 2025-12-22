import type { Metadata } from "next";
import BlogPostClient from "@/app/(main)/blogs/[id]/BlogPostClient";

const SITE_URL_RAW =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://movingquotenewyork.com/";
const SITE_URL = SITE_URL_RAW.replace(/\/$/, "");

function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ✅ Next.js: params await fix
export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params; // ✅ must await
  const cleanSlug = decodeURIComponent(slug || "");

  const canonical = `${SITE_URL}/${encodeURIComponent(cleanSlug)}`;

  try {
    const res = await fetch(
      `${SITE_URL}/api/blogs?slug=${encodeURIComponent(cleanSlug)}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      return {
        title: "Moving Quote New York ",
        robots: { index: false, follow: false },
        alternates: { canonical },
      };
    }

    const data = await res.json();

    const titleRaw = data?.post_title ? String(data.post_title) : "";
    const title = titleRaw || "Moving Quote New York ";

    const desc =
      stripHtml(String(data?.post_content ?? "")).slice(0, 160) ||
      "Read this article on Moving Quote New York Blog.";

    return {
      title: `${title} | Moving Quote New York Blog`,
      description: desc,
      alternates: { canonical },
      openGraph: {
        type: "article",
        title,
        description: desc,
        url: canonical,
        siteName: "Moving Quote New York Blog",
      },
      twitter: {
        card: "summary",
        title,
        description: desc,
      },
    };
  } catch {
    return {
      title: "Moving Quote New York ",
      alternates: { canonical },
    };
  }
}

// ✅ Page component: params await fix
export default async function PostSlugPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params; // ✅ must await
  return <BlogPostClient slug={slug} />;
}
