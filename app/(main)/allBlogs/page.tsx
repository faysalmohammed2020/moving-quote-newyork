// app/blog/page.tsx
import BlogPageClient from "@/components/BlogPageClient";

export const revalidate = 60;

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
