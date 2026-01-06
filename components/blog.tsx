"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

// ✅ normalize any kind of relative image path safely
const normalizeImageUrl = (src?: string) => {
  const fallback = "https://via.placeholder.com/400x200";
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

// ✅ slugify (title -> slug)
function slugify(input: string) {
  return (input || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

// Function to extract the first image's src from the post_content
const extractFirstImage = (htmlContent: string): string => {
  const placeholderImage = "https://via.placeholder.com/400x200";
  if (typeof window !== "undefined") {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent || "", "text/html");
    const imgElement = doc.querySelector("img");
    return imgElement
      ? imgElement.getAttribute("src") ?? placeholderImage
      : placeholderImage;
  }
  return placeholderImage;
};

// ✅ get first N words from HTML content
const getFirstWords = (html: string, wordLimit = 200) => {
  if (typeof window === "undefined") return "";

  const doc = new DOMParser().parseFromString(html || "", "text/html");
  const text = (doc.body.textContent || "").trim();

  if (!text) return "";

  const words = text.split(/\s+/);
  return words.slice(0, wordLimit).join(" ");
};

type BlogCard = {
  id?: number | string;
  post_title?: string;
  post_content?: string;
  imageUrl?: string;
  slug?: string; // ✅ if API provides
  post_status?: string; // ✅ add for publish-only
  image?: unknown;
  post_image?: unknown;
  thumbnail?: unknown;
  [key: string]: unknown;
};

// ✅ publish-only checker
const isPublish = (status: unknown) =>
  String(status || "").toLowerCase().trim() === "publish";

// ✅ AbortError checker
const isAbortError = (err: unknown) =>
  err instanceof DOMException && err.name === "AbortError";

const BlogSection = () => {
  const [blogCards, setBlogCards] = useState<BlogCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const loadBlogs = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/blogs?limit=3", {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch blogs");

        const json: unknown = await res.json();

        const data: BlogCard[] = Array.isArray((json as any)?.data)
          ? ((json as any).data as BlogCard[])
          : [];

        // ✅ ONLY publish posts
        const publishOnly = data.filter((b) => isPublish(b?.post_status));

        // ✅ prefer API image, fallback to first image from content
        const processedData = publishOnly.slice(0, 3).map((blog) => {
          const apiImg =
            blog.imageUrl ??
            (typeof blog.image === "string" ? blog.image : undefined) ??
            (typeof blog.post_image === "string" ? blog.post_image : undefined) ??
            (typeof blog.thumbnail === "string" ? blog.thumbnail : undefined);

          const title = String(blog?.post_title ?? "");
          const derivedSlug =
            typeof blog?.slug === "string" && blog.slug.trim()
              ? blog.slug.trim()
              : slugify(title);

          const content = String(blog?.post_content ?? "");
          const fallbackImg = extractFirstImage(content);

          return {
            ...blog,
            slug: derivedSlug,
            imageUrl: normalizeImageUrl(String(apiImg || fallbackImg)),
          };
        });

        setBlogCards(processedData);
      } catch (err: unknown) {
        if (!isAbortError(err)) {
          setBlogCards([]); // ensure empty state
        }
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
    return () => controller.abort();
  }, []);

  return (
    <section className="py-16 bg-black text-white">
      <h2 className="text-4xl font-bold text-center mb-12">Blogs</h2>

      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="border border-gray-700 bg-gray-900 p-6 text-center shadow-lg rounded-lg animate-pulse"
            >
              <div className="w-full h-40 bg-gray-800 rounded-md mb-4" />
              <div className="h-6 w-3/4 bg-gray-800 rounded mx-auto mb-4" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-800 rounded" />
                <div className="h-4 w-5/6 bg-gray-800 rounded mx-auto" />
                <div className="h-4 w-2/3 bg-gray-800 rounded mx-auto" />
              </div>
              <div className="mt-5 h-10 w-32 bg-gray-800 rounded-full mx-auto" />
            </div>
          ))
        ) : blogCards.length === 0 ? (
          <div className="col-span-full">
            <div className="min-h-[30vh] grid place-items-center">
              <div className="text-center p-8 bg-gray-900/80 rounded-lg border border-gray-700 shadow-lg">
                <h3 className="text-2xl font-bold text-yellow-400 mb-2">
                  No blogs found
                </h3>
                <p className="text-gray-300">
                  There are no articles available right now.
                </p>
              </div>
            </div>
          </div>
        ) : (
          blogCards.map((blog, index) => {
            const title = String(blog.post_title ?? "");
            const content = String(blog.post_content ?? "");
            const slug =
              typeof blog.slug === "string" && blog.slug.trim()
                ? blog.slug.trim()
                : slugify(title);

            return (
              <div
                key={index}
                className="border border-gray-700 bg-gray-900 p-6 text-center shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300"
              >
                <img
                  src={String(blog.imageUrl ?? "")}
                  alt={title}
                  className="w-full h-40 object-cover rounded-md mb-4"
                  loading="lazy"
                />

                <h3 className="text-xl font-bold text-yellow-400 mb-4">
                  {title}
                </h3>

                <div className="text-white text-lg leading-7">
                  {getFirstWords(content, 200)}...
                </div>

                <Link
                  href={`/${encodeURIComponent(slug)}`}
                  className="mt-5 inline-block bg-yellow-500 text-black px-4 py-2 rounded-full hover:bg-yellow-600 transition-colors"
                >
                  Read More
                </Link>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/allBlogs"
          className="px-4 py-2 bg-yellow-400 text-black shadow-md hover:bg-yellow-500 transition"
        >
          VIEW MORE
        </Link>
      </div>
    </section>
  );
};

export default BlogSection;
