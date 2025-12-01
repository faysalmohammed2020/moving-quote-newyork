"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useTransition,
  useCallback,
  useRef,
} from "react";
import Link from "next/link";
import Image from "next/image";

interface Blog {
  id: number;
  post_title: string;
  post_category: string;
  post_tags: string;
  createdAt: string;
  imageUrl: string;
  excerpt: string;
  readTime: number;
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

/** ✅ normalize any kind of relative image path safely for next/image */
const normalizeImageUrl = (src?: string) => {
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

const BlogCardSkeleton: React.FC = React.memo(() => (
  <div className="bg-white/70 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl border border-white/20 animate-pulse h-full flex flex-col">
    <div className="relative w-full h-52 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200" />
    <div className="p-7 flex flex-col flex-grow gap-4">
      <div className="h-4 w-24 bg-gray-300 rounded-full" />
      <div className="h-7 w-4/5 bg-gray-300 rounded-lg" />
      <div className="space-y-3 mt-3">
        <div className="h-3 w-full bg-gray-300 rounded-md" />
        <div className="h-3 w-5/6 bg-gray-300 rounded-md" />
        <div className="h-3 w-2/3 bg-gray-300 rounded-md" />
      </div>
      <div className="mt-auto pt-5 border-t border-gray-200/50 flex items-center justify-between">
        <div className="h-3 w-28 bg-gray-300 rounded-full" />
        <div className="h-3 w-20 bg-gray-300 rounded-full" />
      </div>
    </div>
  </div>
));
BlogCardSkeleton.displayName = "BlogCardSkeleton";

const BlogCard: React.FC<{ post: Blog }> = React.memo(({ post }) => {
  const postDate = useMemo(
    () =>
      new Date(post.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    [post.createdAt]
  );

  const safeImg = normalizeImageUrl(post.imageUrl);

  return (
    <Link href={`/blogs/${post.id}`} className="group block h-full">
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 transform group-hover:-translate-y-2 h-full flex flex-col border border-white/20 hover:border-white/40 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

        <div className="relative w-full h-52 overflow-hidden">
          <Image
            src={safeImg}
            alt={post.post_title}
            fill
            loading="lazy"
            style={{ objectFit: "cover" }}
            className="group-hover:scale-110 transition-transform duration-700 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-60" />

          <div className="absolute top-4 left-4 z-20">
            <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
              {post.post_category}
            </span>
          </div>
        </div>

        <div className="p-7 flex flex-col flex-grow relative z-20">
          <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-4 group-hover:text-indigo-800 transition-colors duration-300 line-clamp-2">
            {post.post_title}
          </h2>

          <p className="text-gray-700 line-clamp-3 flex-grow leading-relaxed">
            {post.excerpt}...
          </p>

          <div className="mt-6 pt-5 border-t border-gray-200/50 flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium bg-white/50 px-3 py-1.5 rounded-full">
              {postDate}
            </span>
            <span className="text-gray-600 font-semibold bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full">
              {post.readTime} min read
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
});
BlogCard.displayName = "BlogCard";

export default function BlogPageClient({
  initialBlogs,
  initialMeta,
  postsPerPage,
}: {
  initialBlogs: Blog[];
  initialMeta: BlogResponse["meta"];
  postsPerPage: number;
}) {
  const initialPage = initialMeta.page || 1;

  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialMeta.totalPages || 1);

  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const didMountRef = useRef(false);

  const pageCacheRef = useRef<Map<number, Blog[]>>(new Map());
  pageCacheRef.current.set(initialPage, initialBlogs);

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

        pageCacheRef.current.set(page, json.data || []);

        startTransition(() => {
          setBlogs(json.data || []);
          setTotalPages(json.meta?.totalPages || 1);
        });

        if (page < (json.meta?.totalPages || 1)) {
          fetch(`/api/blogs?page=${page + 1}&limit=${postsPerPage}`, {
            cache: "no-store",
          })
            .then((r) => r.json())
            .then((nextJson: BlogResponse) => {
              pageCacheRef.current.set(page + 1, nextJson.data || []);
            })
            .catch(() => {});
        }
      } catch (e: any) {
        if (e.name !== "AbortError") {
          console.error(e);
          setError("Failed to load articles. Please check your connection.");
        }
      } finally {
        setPageLoading(false);
      }
    },
    [postsPerPage, startTransition]
  );

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    const cached = pageCacheRef.current.get(currentPage);
    if (cached) {
      startTransition(() => setBlogs(cached));
      return;
    }

    const controller = new AbortController();
    fetchPage(currentPage, controller);
    return () => controller.abort();
  }, [currentPage, fetchPage, startTransition]);

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
      <div className="min-h-[70vh] grid place-items-center bg-gradient-to-br from-red-50 via-white to-red-50">
        <div className="text-center p-12 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-red-200/50 max-w-md mx-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-red-800 mb-3">
            Connection Error
          </h3>
          <p className="text-red-600 leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 bg-white/70 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/20 mb-8">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
            <span className="text-indigo-700 font-semibold text-sm uppercase tracking-wider">
              Latest Insights
            </span>
          </div>

          <h1 className="text-6xl font-black text-gray-900 tracking-tight mb-6 bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 bg-clip-text text-transparent">
            Our Blogs
          </h1>

          <div className="max-w-2xl mx-auto">
            <p className="text-xl text-gray-700 leading-relaxed bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/30">
              Explore cutting-edge insights, expert analysis, and transformative
              ideas that shape the future of technology and innovation.
            </p>
          </div>
        </div>

        {(pageLoading || isPending) && (
          <div className="sticky top-4 z-50 mb-12 mx-auto max-w-2xl">
            <div className="bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-white/30 p-2">
              <div className="w-full h-2 bg-gray-200/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-pulse rounded-full transition-all duration-300"
                  style={{ width: "65%" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ✅ Updated Blog Grid with Empty State */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {pageLoading || isPending ? (
            Array.from({ length: postsPerPage }).map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))
          ) : blogs.length === 0 ? (
            <div className="col-span-full">
              <div className="min-h-[40vh] grid place-items-center">
                <div className="text-center p-12 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-indigo-200/50 max-w-lg mx-4">
                  <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-10 h-10 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>

                  <h3 className="text-3xl font-extrabold text-indigo-800 mb-3">
                    No blogs found
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    There are no articles available right now. Please check back
                    later.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            blogs.map((post) => <BlogCard key={post.id} post={post} />)
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center">
            <nav className="flex items-center space-x-2 p-3 bg-white/70 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-white/80 hover:shadow-lg border border-transparent hover:border-white/50"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </button>

              {getPageNumbers().map((page, index) => (
                <div key={index}>
                  {page === "..." ? (
                    <span className="px-4 py-3 text-gray-500 font-medium">
                      ...
                    </span>
                  ) : (
                    <button
                      onClick={() => paginate(Number(page))}
                      className={`px-5 py-3 text-sm font-bold rounded-xl transition-all duration-300 min-w-[3rem] ${
                        currentPage === page
                          ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                          : "text-gray-700 hover:bg-white/80 hover:shadow-lg border border-transparent hover:border-white/50"
                      }`}
                    >
                      {page}
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-white/80 hover:shadow-lg border border-transparent hover:border-white/50"
                }`}
              >
                Next
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
