"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";

interface Blog {
  id: number;
  post_title: string;
  post_content: string;
  imageUrl: string;
  [key: string]: any;
}

// 🔹 Title থেকে slug বানানোর helper
const slugify = (input: string) => {
  return (input || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // diacritics remove
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
};

// Function to extract the first image's src from the post_content (ENV-aware)
const extractFirstImage = (htmlContent: string): string => {
  const placeholderImage = "https://via.placeholder.com/400x200";

  if (typeof window === "undefined") return placeholderImage;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(String(htmlContent || ""), "text/html");
    const imgElement = doc.querySelector("img");
    if (!imgElement) return placeholderImage;

    let src = (imgElement.getAttribute("src") || "").trim();

    const baseURL =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");

    // data URI হলে 그대로 ফেরত
    if (src.startsWith("data:")) return src;

    // protocol-relative URL (//example.com/...) → প্রোটোকল যোগ
    if (src.startsWith("//")) {
      src = `${window.location.protocol}${src}`;
    }

    // /public/... → /...
    if (src.startsWith("/public/")) {
      src = src.replace(/^\/public\//, "/");
    }

    if (src.startsWith("/")) {
      // relative path → env base prepend
      src = `${baseURL}${src}`;
    } else if (src.startsWith("http://") || src.startsWith("https://")) {
      // absolute URL → current domain এ path map করা
      const u = new URL(src);
      const cleanPath = u.pathname.replace(/^\/public\//, "/");
      src = `${baseURL}${cleanPath}${u.search}${u.hash}`;
    } else {
      // অন্য case → baseURL + relative
      src = `${baseURL}/${src.replace(/^\.?\//, "")}`;
    }

    return src || placeholderImage;
  } catch {
    return placeholderImage;
  }
};

/* 🔹 Skeleton Card (loading এ দেখানোর জন্য) */
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

/* 🔹 Single Blog Card (memo-friendly, key হিসেবে id ব্যবহার করবে) */
const BlogCard: React.FC<{ blog: Blog }> = ({ blog }) => {
  const slug = useMemo(() => slugify(blog.post_title || ""), [blog.post_title]);

  return (
    <article className="group bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:transform hover:-translate-y-2 shadow-lg hover:shadow-2xl">
      {/* Image Container */}
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

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-yellow-400 transition-colors duration-200">
          {blog.post_title}
        </h3>

        <div
          className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: String(blog.post_content || "").slice(0, 150) + "...",
          }}
        />

        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <span className="text-yellow-500 text-sm font-medium">Explore</span>
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

const BlogAll = () => {
  const [blogData, setBlogData] = useState<Blog[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const postsPerPage = 6;

  // 🔹 Initial Load + normalize + imageUrl attach + order
  useEffect(() => {
    let isMounted = true;

    const loadBlogs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/blogs", { cache: "no-store" });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const apiData = await res.json();

        const processedData: Blog[] = (apiData || []).map((blog: any) => {
          const content =
            typeof blog.post_content === "object" && blog.post_content?.text
              ? blog.post_content.text
              : String(blog.post_content || "");

          const imageUrl = extractFirstImage(content);

          return {
            ...blog,
            post_content: content,
            imageUrl,
          };
        });

        const hasRealImage = (url: string) =>
          url && !url.includes("via.placeholder.com");

        const withImage = processedData.filter((b) => hasRealImage(b.imageUrl));
        const withoutImage = processedData.filter(
          (b) => !hasRealImage(b.imageUrl)
        );

        const ordered = [...withImage, ...withoutImage];

        if (isMounted) {
          setBlogData(ordered);
          setCurrentPage(1);
        }
      } catch (e: any) {
        if (isMounted) {
          setError(e?.message || "Failed to load blogs.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadBlogs();

    return () => {
      isMounted = false;
    };
  }, []);

  // 🔹 Pagination calculations (memoized)
  const totalPages = useMemo(
    () => (blogData.length ? Math.ceil(blogData.length / postsPerPage) : 1),
    [blogData.length]
  );

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;

  const currentPosts = useMemo(
    () => blogData.slice(indexOfFirstPost, indexOfLastPost),
    [blogData, indexOfFirstPost, indexOfLastPost]
  );

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
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

  // 🔹 Loading + Skeleton
  if (isLoading) {
    return (
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-gray-300 text-lg">Loading blogs…</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-80">
            {Array.from({ length: 6 }).map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 🔹 Error State
  if (error) {
    return (
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-red-400">Error: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-black text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
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
          <div className="mt-3 text-gray-400">
            Total Blogs:{" "}
            <span className="text-white">{blogData.length}</span>
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {currentPosts.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-center space-y-6">
            {/* Page Info */}
            <div className="text-sm text-gray-400">
              Showing{" "}
              <span className="text-white font-semibold">
                {indexOfFirstPost + 1}-
                {Math.min(indexOfLastPost, blogData.length)}
              </span>{" "}
              of{" "}
              <span className="text-white font-semibold">
                {blogData.length}
              </span>{" "}
              articles
            </div>

            {/* Pagination Controls */}
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
                <svg
                  className="w-4 h-4 mr-2"
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
                <svg
                  className="w-4 h-4 ml-2"
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
    </section>
  );
};

export default BlogAll;
