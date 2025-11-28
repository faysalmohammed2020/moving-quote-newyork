// app/blog/page.tsx
import BlogPageClient from "@/components/BlogPageClient";

export const dynamic = "force-dynamic"; // always fresh

async function getBlogs(page: number, limit: number) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/blogs?page=${page}&limit=${limit}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return { data: [], meta: { page, limit, total: 0, totalPages: 1 } };
  }

  return res.json();
}

export default async function BlogPage() {
  const postsPerPage = 6;

  // ✅ first page fetched on server
  const json = await getBlogs(1, postsPerPage);

  return (
    <BlogPageClient
      initialBlogs={json?.data || []}
      initialMeta={json?.meta || { page: 1, limit: postsPerPage, total: 0, totalPages: 1 }}
      postsPerPage={postsPerPage}
    />
  );
}
