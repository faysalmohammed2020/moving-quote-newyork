"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  Suspense,
  useEffect,
  useTransition,
  useRef,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";

/** Lazy-loaded components (for faster initial load) */
const BlogPostForm = dynamic(() => import("@/components/BlogPostForm"), {
  suspense: true,
});

/** Types */
interface Blog {
  id: number;
  post_title: string;
  post_content: string;
  post_category: string;
  post_tags: string;
  createdAt: any;
  imageUrl?: string | null;
  excerpt?: string;
  readTime?: number;
  _searchTitle?: string;
}

interface BlogResponse {
  data: any[];
  items?: any[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** ✅ normalize any kind of relative image path safely for next/image */
const normalizeImageUrl = (src?: string | null) => {
  const fallback = "/placeholder-blog.svg";
  if (!src) return fallback;

  let s = String(src).trim();

  if (s.startsWith("http://") || s.startsWith("https://")) return s;

  s = s.replace(/^(\.\.\/)+/g, "/");
  s = s.replace(/^(\.\/)+/g, "/");
  if (!s.startsWith("/")) s = "/" + s;
  s = s.replace(/^\/public\//, "/");

  if (s === "/" || s.length < 2) return fallback;
  return s;
};

/** ✅ pull first image from html content */
const extractFirstImage = (html: string) => {
  if (!html) return null;
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m?.[1] || null;
};

/** ✅ strip html -> first non-empty line (excerpt) */
const getFirstLine = (html: string) => {
  const text = html.replace(/<[^>]*>/g, " ");
  const line =
    text
      .split("\n")
      .map((s) => s.trim())
      .find(Boolean) || "";
  return line;
};

/* ✅ Skeleton Card (cleaner) */
const SkeletonCard: React.FC = React.memo(() => (
  <article className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
    <div className="h-48 bg-gray-200" />
    <div className="p-5 space-y-3">
      <div className="h-3 w-24 bg-gray-200 rounded" />
      <div className="h-6 w-4/5 bg-gray-200 rounded" />
      <div className="h-3 w-full bg-gray-200 rounded" />
      <div className="h-3 w-5/6 bg-gray-200 rounded" />
      <div className="h-3 w-2/3 bg-gray-200 rounded" />
      <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between">
        <div className="h-3 w-16 bg-gray-200 rounded" />
        <div className="h-8 w-20 bg-gray-200 rounded-full" />
      </div>
    </div>
  </article>
));
SkeletonCard.displayName = "SkeletonCard";

/** ✅ Admin card view (premium like earlier) */
const AdminBlogCard: React.FC<{
  post: Blog;
  onEdit: (b: Blog) => void;
  onDelete: (id: number) => void;
}> = React.memo(({ post, onEdit, onDelete }) => {
  const safeImg = normalizeImageUrl(post.imageUrl);

  const postDate = useMemo(
    () =>
      post.createdAt
        ? new Date(post.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "—",
    [post.createdAt]
  );

  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Image */}
      <Link href={`/blog/${post.id}`} className="relative block">
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={safeImg}
            alt={post.post_title}
            fill
            loading="lazy"
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-70" />
          <div className="absolute left-3 top-3">
            <span className="text-xs font-semibold uppercase tracking-wider bg-white/90 text-indigo-700 px-3 py-1 rounded-full shadow-sm">
              {post.post_category || "Uncategorized"}
            </span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 leading-tight mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {post.post_title}
        </h2>

        <p className="text-gray-600 text-sm md:text-base line-clamp-3 flex-1 leading-relaxed">
          {post.excerpt || "—"}
        </p>

        {/* Meta */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs md:text-sm text-gray-500">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {postDate}
          </span>
          <span>{post.readTime || 1} min read</span>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onEdit(post)}
            className="flex-1 px-3 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="flex-1 px-3 py-2 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
});
AdminBlogCard.displayName = "AdminBlogCard";

const BlogManagementClient: React.FC<{
  initialBlogs: any[];
  initialMeta: NonNullable<BlogResponse["meta"]>;
  itemsPerPage: number; // 9
}> = ({ initialBlogs, initialMeta, itemsPerPage }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editBlogData, setEditBlogData] = useState<Blog | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  /** ✅ server-side pagination states */
  const [currentPage, setCurrentPage] = useState(initialMeta.page || 1);
  const [totalPages, setTotalPages] = useState(initialMeta.totalPages || 1);
  const [totalBlogs, setTotalBlogs] = useState(initialMeta.total || 0);

  const [blogs, setBlogs] = useState<Blog[]>(() => {
    const list = initialBlogs || [];
    return list.map(mapApiToBlog);
  });

  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  /** ✅ force reload token */
  const [reloadTick, setReloadTick] = useState(0);
  const forceReload = useCallback(() => setReloadTick((t) => t + 1), []);

  /** ✅ only skip fetch on VERY first mount */
  const didSkipInitial = useRef(false);

  /** ✅ Fetch one page from server */
  useEffect(() => {
    if (!didSkipInitial.current && currentPage === initialMeta.page) {
      didSkipInitial.current = true;
      return;
    }

    const controller = new AbortController();

    const fetchPageBlogs = async () => {
      setError(null);
      setPageLoading(true);

      try {
        const res = await fetch(
          `/api/blogs?page=${currentPage}&limit=${itemsPerPage}`,
          { signal: controller.signal, cache: "no-store" }
        );
        if (!res.ok) throw new Error("Failed to fetch blogs");

        const json: BlogResponse | any = await res.json();

        const list: any[] = Array.isArray(json)
          ? json
          : json.data || json.items || [];

        const meta = Array.isArray(json)
          ? {
              page: currentPage,
              limit: itemsPerPage,
              total: list.length,
              totalPages: Math.max(1, Math.ceil(list.length / itemsPerPage)),
            }
          : json.meta || {
              page: currentPage,
              limit: itemsPerPage,
              total: list.length,
              totalPages: 1,
            };

        const mapped: Blog[] = list.map(mapApiToBlog);

        startTransition(() => {
          setBlogs(mapped);
          setTotalPages(meta.totalPages || 1);
          setTotalBlogs(meta.total || mapped.length);
        });

        if (currentPage < (meta.totalPages || 1)) {
          fetch(`/api/blogs?page=${currentPage + 1}&limit=${itemsPerPage}`, {
            cache: "no-store",
          }).catch(() => {});
        }
      } catch (e: any) {
        if (e.name !== "AbortError") {
          console.error(e);
          setError("Failed to fetch blogs. Please try again later.");
        }
      } finally {
        setPageLoading(false);
      }
    };

    fetchPageBlogs();
    return () => controller.abort();
  }, [currentPage, itemsPerPage, reloadTick, initialMeta.page]);

  /** ✅ Search filter (current page) */
  const filteredPosts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return blogs;
    return blogs.filter((b) => (b._searchTitle || "").includes(q));
  }, [blogs, searchQuery]);

  const handleCreateNewClick = useCallback(() => {
    setEditBlogData(null);
    setIsFormVisible(true);
  }, []);

  const handleEditClick = useCallback(async (blog: Blog) => {
    if (!blog.post_content) {
      try {
        const res = await fetch(`/api/blogs?id=${blog.id}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const full = await res.json();
          blog = mapApiToBlog(full);
        }
      } catch {}
    }
    setEditBlogData(blog);
    setIsFormVisible(true);
  }, []);

  const handleDeleteClick = useCallback(
    async (id: number) => {
      if (!window.confirm("Are you sure you want to delete this blog post?"))
        return;

      setBlogs((prev) => prev.filter((b) => b.id !== id)); // optimistic

      try {
        const response = await fetch("/api/blogs", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (!response.ok) throw new Error("Failed to delete");

        alert("Blog post deleted successfully!");
        forceReload();
      } catch {
        alert("Failed to delete blog post. Please try again.");
        forceReload();
      }
    },
    [forceReload]
  );

  const handleCloseModal = useCallback(() => {
    setIsFormVisible(false);
    setEditBlogData(null);
  }, []);

  const handleUpdateBlog = useCallback(() => {
    setIsFormVisible(false);
    setEditBlogData(null);

    if (currentPage !== 1) setCurrentPage(1);
    else forceReload();
  }, [currentPage, forceReload]);

  const paginate = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const maxVisiblePages = 3;
    if (totalPages <= 6)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= maxVisiblePages)
      return [1, 2, 3, "...", totalPages];
    if (currentPage > totalPages - maxVisiblePages)
      return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="text-red-500 font-semibold">
          Failed to fetch blogs. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      {/* ✅ Header (premium) */}
      <header className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            Blog Management
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Manage your blog posts easily from here.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-72 pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>

          <button
            onClick={handleCreateNewClick}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-sm"
          >
            + Create New
          </button>
        </div>
      </header>

      {/* ✅ Progress bar */}
      {(pageLoading || isPending) && (
        <div className="w-full h-1.5 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <div className="h-full w-1/3 bg-indigo-600 animate-pulse rounded-full" />
        </div>
      )}

      {/* ✅ Info row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-800">
          Total Blogs:{" "}
          <span className="text-indigo-600">{totalBlogs}</span>
        </h2>
        <div className="text-sm text-gray-500">
          Page <span className="font-semibold">{currentPage}</span> of{" "}
          <span className="font-semibold">{totalPages}</span>
        </div>
      </div>

      {/* ✅ Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {pageLoading && blogs.length === 0 ? (
          Array.from({ length: itemsPerPage }).map((_, i) => (
            <SkeletonCard key={i} />
          ))
        ) : filteredPosts.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-14 bg-white rounded-xl border">
            No posts found.
          </div>
        ) : (
          filteredPosts.map((post) => (
            <AdminBlogCard
              key={post.id}
              post={post}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))
        )}
      </section>

      {/* ✅ Pagination (premium compact) */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-12">
          <nav className="flex flex-wrap items-center gap-1 bg-white border border-gray-100 shadow-md rounded-2xl p-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition
                ${
                  currentPage === 1
                    ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              ← Prev
            </button>

            {getPageNumbers().map((page, index) =>
              page === "..." ? (
                <span
                  key={`dots-${index}`}
                  className="px-3 py-2 text-gray-400 text-sm"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page as number}
                  onClick={() => paginate(Number(page))}
                  className={`min-w-[40px] px-4 py-2 text-sm font-semibold rounded-xl transition
                    ${
                      currentPage === page
                        ? "bg-indigo-600 text-white shadow hover:bg-indigo-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition
                ${
                  currentPage === totalPages
                    ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              Next →
            </button>
          </nav>
        </div>
      )}

      {/* ✅ Modal (same logic, nicer shell) */}
      {isFormVisible && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-4xl shadow-2xl overflow-y-auto max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                {editBlogData ? "Edit Blog" : "Create New Blog"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 text-xl font-bold transition"
              >
                ×
              </button>
            </div>

            <Suspense
              fallback={
                <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
              }
            >
              <BlogPostForm
                initialData={editBlogData}
                onClose={handleCloseModal}
                onUpdate={handleUpdateBlog}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagementClient;

/** ---------- helpers ---------- */
function mapApiToBlog(item: any): Blog {
  const rawContent =
    typeof item.post_content === "object" && item.post_content?.text
      ? item.post_content.text
      : String(item.post_content ?? "");

  const title = String(item.post_title || "");

  const apiImage =
    item.imageUrl ||
    item.image_url ||
    item.thumbnail ||
    item.thumbnailUrl ||
    item.thumbnail_url ||
    item.post_thumbnail ||
    item.post_image ||
    item.featured_image ||
    item.featuredImage ||
    item.cover_image ||
    item.banner ||
    item.image ||
    null;

  const contentImage = extractFirstImage(rawContent);
  const imageUrl = apiImage || contentImage || null;

  const firstLine = getFirstLine(rawContent);
  const excerpt = firstLine.slice(0, 160);

  const wordCount = rawContent.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return {
    id: Number(item.id),
    post_title: title,
    post_content: rawContent,
    post_category: item.post_category || item.category || "",
    post_tags: item.post_tags || item.tags || "",
    createdAt: item.createdAt ?? item.post_date ?? null,
    imageUrl,
    excerpt,
    readTime,
    _searchTitle: title.toLowerCase().trim(),
  };
}
