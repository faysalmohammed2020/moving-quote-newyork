import type { MetadataRoute } from "next";

type Blog = { id: number; createdAt?: string; updatedAt?: string };
type BlogResponse = {
  data: Blog[];
  meta?: { page?: number; limit?: number; total?: number; totalPages?: number };
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    "https://movingquotenewyork.com/";

  const staticRoutes = [
    "/",
    "/home",
    "/allTestimonials",
    "/allBlogs",
    "/contact",
    "/services/auto-transport",
    "/services/commercial-moving",
    "/services/long-distance-moving",
    "/services/small-moves",
    "/services/specialized-moving",
    "/services/storage-solutions",
  ];

  // ✅ সব blog post id fetch
  const posts = await fetchAllBlogPosts(siteUrl);

  const now = new Date();

  return [
    ...staticRoutes.map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.8,
    })),

    ...posts.map((p) => ({
      url: `${siteUrl}/blog/${p.id}`,
      lastModified: new Date(p.updatedAt || p.createdAt || now),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}

async function fetchAllBlogPosts(siteUrl: string): Promise<Blog[]> {
  const limit = 100; // দরকার হলে বাড়ান
  let page = 1;
  const all: Blog[] = [];

  while (true) {
    const res = await fetch(
      `${siteUrl}/api/blogs?page=${page}&limit=${limit}`,
      { cache: "no-store" }
    );

    if (!res.ok) break;

    const json = (await res.json()) as BlogResponse;

    const data = json?.data ?? [];
    const totalPages = json?.meta?.totalPages ?? 1;

    all.push(...data);

    if (page >= totalPages) break;
    page++;
  }

  return all;
}
