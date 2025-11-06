"use client";
import { postdata } from "@/app/(main)/data/postdata";
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';

// Function to extract the first image's src from the post_content
const extractFirstImage = (htmlContent: string): string => {
  const placeholderImage = "https://via.placeholder.com/400x200";
  if (typeof window !== "undefined") {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const imgElement = doc.querySelector("img");
    return imgElement ? imgElement.getAttribute("src") ?? placeholderImage : placeholderImage;
  }
  return placeholderImage;
};

const BlogAll = () => {
  const [blogData, setBlogData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const postsPerPage = 6;

  useEffect(() => {
    const processedData = postdata.map((blog) => {
      const imageUrl = extractFirstImage(blog.post_content);
      return {
        ...blog,
        imageUrl,
      };
    });

    // ✅ ইমেজওয়ালা আগে, ইমেজ-ছাড়া পরে (গ্লোবাল অর্ডার)
    const hasRealImage = (url: string) =>
      url && !url.includes("via.placeholder.com");

    const withImage = processedData.filter((b) => hasRealImage(b.imageUrl));
    const withoutImage = processedData.filter((b) => !hasRealImage(b.imageUrl));

    const ordered = [...withImage, ...withoutImage];

    setBlogData(ordered);
    setCurrentPage(1); // নতুন ভাবে সাজালে প্রথম পেজে রিসেট
  }, []);

  // Pagination গণনা
  const totalPages = useMemo(
    () => Math.ceil(blogData.length / postsPerPage),
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
    // স্ক্রল আপ (ঐচ্ছিক)
    // window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // পেজ নাম্বার জেনারেটর (ছোট, সহজ)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    // লম্বা হলে ... সহ
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return pages;
  };

  return (
    <section className="py-16 bg-black text-white">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-white mb-10 text-center">All Blogs</h2>

        <p className="text-gray-300 mb-10 text-center">
          Explore how our innovative logistics solutions meet your business needs.
        </p>

        <div className="text-2xl p-2 text-white text-center">
          Total Blogs: {postdata.length}
        </div>

        {/* Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {currentPosts.map((blogs, index) => (
            <div
              key={index}
              className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={blogs.imageUrl}
                alt={blogs.post_title}
                className="w-full h-36 object-cover rounded-md mb-4"
              />
              <h3 className="text-xl font-bold text-yellow-400 mb-4">
                {blogs.post_title}
              </h3>
              <div
                className="text-white text-lg"
                dangerouslySetInnerHTML={{
                  __html: blogs.post_content.slice(0, 200) + '...',
                }}
              ></div>
              <button className="mt-5 bg-yellow-500 text-black px-4 py-2 rounded-full hover:bg-yellow-600 transition-colors">
                <Link href={`/blogs/${blogs.ID}`}>Read More</Link>
              </button>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <nav className="flex items-center space-x-1 bg-gray-800/60 border border-gray-700 rounded-xl p-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg text-sm ${
                  currentPage === 1
                    ? "text-gray-500 cursor-not-allowed"
                    : "text-white hover:bg-gray-700"
                }`}
              >
                ← Prev
              </button>

              {getPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={i} className="px-3 py-2 text-gray-400">
                    ...
                  </span>
                ) : (
                  <button
                    key={i}
                    onClick={() => goToPage(Number(p))}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      currentPage === p
                        ? "bg-yellow-500 text-black"
                        : "text-white hover:bg-gray-700"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-lg text-sm ${
                  currentPage === totalPages
                    ? "text-gray-500 cursor-not-allowed"
                    : "text-white hover:bg-gray-700"
                }`}
              >
                Next →
              </button>
            </nav>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogAll;
