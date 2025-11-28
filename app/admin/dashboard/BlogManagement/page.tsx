// app/admin/blog/page.tsx
import BlogManagementClient from "@/components/BlogManagementClient";

export const dynamic = "force-dynamic"; // admin always fresh

async function getBlogs(page: number, limit: number) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/blogs?page=${page}&limit=${limit}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return {
      data: [],
      meta: { page, limit, total: 0, totalPages: 1 },
    };
  }

  return res.json();
}

export default async function BlogManagementPage() {
  const ITEMS_PER_PAGE = 9;

  // ✅ first page fetched on server
  const json = await getBlogs(1, ITEMS_PER_PAGE);

  return (
    <BlogManagementClient
      initialBlogs={json?.data || json?.items || []}
      initialMeta={
        json?.meta || {
          page: 1,
          limit: ITEMS_PER_PAGE,
          total: (json?.data || []).length,
          totalPages: 1,
        }
      }
      itemsPerPage={ITEMS_PER_PAGE}
    />
  );
}
