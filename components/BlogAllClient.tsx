"use client";

import Link from "next/link";
import {
  useState,
  useMemo,
  useCallback,
  useTransition,
  useRef,
  useEffect,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Blog {
  id: number;
  post_title: string;
  post_category?: string;
  post_tags?: string;
  imageUrl: string;
  excerpt?: string;
  readTime?: number;
  createdAt?: string;
  post_content?: string; // list view এ না-ও থাকতে পারে, safe
  [key: string]: any;
}

interface BlogResponse {
  data: Blog[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 🔹 slug helper
const slugify = (input: string) =>
  (input || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

/* 🔹 Skeleton Card */
const BlogCardSkeleton: React.FC = () => (
  <article className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 h-72 animate-pulse flex flex-col">
    <div className="h-40 bg-gray-800" />
    <div className="p-6 space-y-3 flex-1 flex flex-col">
      <div className="h-4 w-3/4 bg-gray-800 rounded" />
      <div className="h-3 w-full bg-gray-800 rounded" />
      <div className="h-3 w-5/6 bg-gray-800 rounded" />
      <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-800">
        <div className="h-3 w-16 bg-gray-800 rounded" />
        <div className="h-8 w-24 bg-gray-800 rounded-full" />
      </div>
    </div>
  </article>
);

/* 🔹 Single Blog Card */
const BlogCard: React.FC<{ blog: Blog }> = ({ blog }) => {
  const slug = useMemo(() => slugify(blog.post_title || ""), [blog.post_title]);

  return (
    <article className="group bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:transform hover:-translate-y-2 shadow-lg hover:shadow-2xl">
      <div className="relative overflow-hidden h-48">
        <img
          src={blog.imageUrl}
          alt={blog.post_title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-yellow-400 transition-colors duration-200">
          {blog.post_title}
        </h3>

        <p className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
          {(blog.excerpt || "").slice(0, 150)}...
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <span className="text-yellow-500 text-sm font-medium">
            {blog.readTime ? `${blog.readTime} min read` : "Explore"}
          </span>
          <Link
            href={`/blogs/${blog.id}?slug=${encodeURIComponent(slug)}`}
            className="bg-yellow-500 text-black px-5 py-2 rounded-full font-semibold text-sm hover:bg-yellow-400 transition-all duration-200 transform group-hover:scale-105 shadow-lg hover:shadow-yellow-500/25"
          >
            Read More
          </Link>
        </div>
      </div>
    </article>
  );
};

export default function BlogAllClient({
  initialBlogs,
  initialMeta,
  postsPerPage, // 6
}: {
  initialBlogs: Blog[];
  initialMeta: BlogResponse["meta"];
  postsPerPage: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialPage = initialMeta?.page || 1;
  const initialTotalPages = initialMeta?.totalPages || 1;

  // ✅ pageCache: pageNumber -> blogs (API already paginated)
  const pageCacheRef = useRef<Map<number, Blog[]>>(
    new Map([[initialPage, initialBlogs || []]])
  );

  const [blogData, setBlogData] = useState<Blog[]>(initialBlogs || []);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages);

  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // ✅ URL -> state sync (back/forward fix)
  useEffect(() => {
    const urlPage = Number(searchParams.get("page") || initialPage);
    if (urlPage !== currentPage) {
      setCurrentPage(urlPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ✅ fetch a page (API gives paginated + ordered list already)
  const fetchPage = useCallback(
    async (page: number, controller: AbortController) => {
      setError(null);
      setPageLoading(true);

      try {
        const res = await fetch(
          `/api/blogs?page=${page}&limit=${postsPerPage}`,
          { signal: controller.signal, cache: "no-store" }
        );
        if (!res.ok) throw new Error("Failed to fetch blogs");

        const json: BlogResponse = await res.json();

        const normalized = json.data || [];

        // ✅ cache it
        pageCacheRef.current.set(page, normalized);

        startTransition(() => {
          setBlogData(normalized);
          setTotalPages(json.meta?.totalPages || 1);
        });

        // ✅ prefetch next page if not cached
        const tp = json.meta?.totalPages || 1;
        if (page < tp && !pageCacheRef.current.has(page + 1)) {
          fetch(`/api/blogs?page=${page + 1}&limit=${postsPerPage}`, {
            cache: "no-store",
          })
            .then((r) => r.json())
            .then((j: BlogResponse) => {
              if (j?.data) pageCacheRef.current.set(page + 1, j.data);
            })
            .catch(() => {});
        }
      } catch (e: any) {
        if (e.name !== "AbortError") {
          console.error(e);
          setError("Failed to load blogs.");
        }
      } finally {
        setPageLoading(false);
      }
    },
    [postsPerPage]
  );

  // ✅ when currentPage changes:
  // 1) if cached -> instant show
  // 2) else fetch
  useEffect(() => {
    const cached = pageCacheRef.current.get(currentPage);
    if (cached) {
      setBlogData(cached);
      return;
    }

    const controller = new AbortController();
    fetchPage(currentPage, controller);
    return () => controller.abort();
  }, [currentPage, fetchPage]);

  // ✅ paginate + URL update
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);
    router.push(`?page=${page}`, { scroll: false });

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getPageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
    } else {
      pages.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages
      );
    }
    return pages;
  }, [currentPage, totalPages]);

  if (error) {
    return (
      <section className="py-20 bg-black text-white text-center">
        <p className="text-red-400">Error: {error}</p>
      </section>
    );
  }

  return (
    <section className="py-20 bg-black text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-yellow-500 text-sm font-semibold uppercase tracking-wider bg-yellow-500/10 px-3 py-1 rounded-full">
              Our Blog
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Latest Insights
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Discover expert perspectives on logistics innovation and business
            growth strategies
          </p>
        </div>

        {(pageLoading || isPending) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 opacity-80">
            {Array.from({ length: postsPerPage }).map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!pageLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {blogData.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-center space-y-6">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  currentPage === 1
                    ? "text-gray-600 cursor-not-allowed bg-gray-900"
                    : "text-white hover:bg-gray-800 hover:text-yellow-400 bg-gray-900/80"
                }`}
              >
                Previous
              </button>

              <div className="flex items-center space-x-1 bg-gray-900/80 rounded-xl p-1">
                {getPageNumbers.map((page, index) =>
                  page === "..." ? (
                    <span
                      key={`dots-${index}`}
                      className="px-3 py-2 text-gray-500 text-sm"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page as number}
                      onClick={() => goToPage(Number(page))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium min-w-[44px] transition-all duration-200 ${
                        currentPage === page
                          ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/25"
                          : "text-white hover:bg-gray-800 hover:text-yellow-400"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  currentPage === totalPages
                    ? "text-gray-600 cursor-not-allowed bg-gray-900"
                    : "text-white hover:bg-gray-800 hover:text-yellow-400 bg-gray-900/80"
                }`}
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </section>
  );
}
