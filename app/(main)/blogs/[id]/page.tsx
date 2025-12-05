"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Head from "next/head";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import BlogPostForm from "@/components/BlogPostForm";

/** Types */
interface Blog {
  post_content: string;
  createdAt: string | number | Date;
  id: number;
  post_title: string;
  category?: string;
  tags?: string[] | string;
  post_status?: "draft" | "publish" | "private" | string;
  imageUrl?: string | null;
  excerpt?: string;
  readTime?: number;
}

/* ---------- helpers ---------- */
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.example.com";

function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);

  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSlug = searchParams.get("slug") || "";

  const { status } = useSession();
  const isAuthed = status === "authenticated";

  const [post, setPost] = useState<Blog | null>(null);

  /** ✅ one status instead of mixed flags */
  const [viewStatus, setViewStatus] = useState<
    "loading" | "ready" | "notfound"
  >("loading");

  // ✅ recent posts state
  const [recentPosts, setRecentPosts] = useState<Blog[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);

  // ✅ StrictMode safety (latest request only)
  const postReqIdRef = useRef(0);
  const recentReqIdRef = useRef(0);

  // === unified modal state ===
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editBlogData, setEditBlogData] = useState<{
    id?: number;
    post_title: string;
    post_content: string;
    category?: string;
    tags?: string[] | string;
    post_status?: "draft" | "publish" | "private" | string;
  } | null>(null);

  /** ✅ Fetch single post by id (STRICTMODE SAFE) */
  useEffect(() => {
    if (!postId || Number.isNaN(postId)) {
      setPost(null);
      setViewStatus("notfound");
      return;
    }

    const controller = new AbortController();
    const myReqId = ++postReqIdRef.current;

    const fetchPost = async () => {
      setViewStatus("loading");

      try {
        const res = await fetch(`/api/blogs?id=${postId}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        // ✅ stale/aborted ignore
        if (controller.signal.aborted || myReqId !== postReqIdRef.current) return;

        if (!res.ok) {
          setPost(null);
          setViewStatus("notfound");
          return;
        }

        const data = await res.json();

        if (!data?.id) {
          setPost(null);
          setViewStatus("notfound");
          return;
        }

        const transformed: Blog = {
          id: Number(data.id),
          post_title: String(data.post_title || ""),
          post_content:
            typeof data.post_content === "object" && data.post_content?.text
              ? data.post_content.text
              : String(data.post_content ?? ""),
          createdAt: data.createdAt ?? data.post_date ?? new Date().toISOString(),
          category: data.category ?? data.post_category ?? "",
          tags: data.tags ?? data.post_tags ?? [],
          post_status: data.post_status ?? "draft",
          imageUrl: data.imageUrl ?? null,
          excerpt: data.excerpt ?? data.post_excerpt ?? "",
          readTime: data.readTime ?? 1,
        };

        setPost(transformed);
        setViewStatus("ready");
      } catch (e: any) {
        if (controller.signal.aborted || myReqId !== postReqIdRef.current) return;
        console.error(e);
        setPost(null);
        setViewStatus("notfound");
      }
    };

    fetchPost();
    return () => controller.abort();
  }, [postId]);

  /** ✅ Fetch recent/new blog posts (MOST RECENT + STRICTMODE SAFE) */
/** ✅ Fetch recent/new blog posts (MOST RECENT + FALLBACK FIX) */
useEffect(() => {
  const controller = new AbortController();
  const myReqId = ++recentReqIdRef.current;

  const mapRecent = (item: any): Blog => ({
    id: Number(item.id),
    post_title: String(item.post_title || ""),
    post_content: String(item.post_content || ""),
    createdAt: item.createdAt ?? item.post_date ?? new Date().toISOString(),
    category: item.category ?? item.post_category ?? "",
    tags: item.tags ?? item.post_tags ?? [],
    post_status: item.post_status ?? "draft",
    imageUrl:
      item.imageUrl ||
      item.image_url ||
      item.thumbnail ||
      item.featured_image ||
      null,
    excerpt: item.excerpt ?? item.post_excerpt ?? "",
    readTime: item.readTime ?? 1,
  });

  const fetchRecent = async () => {
    setRecentLoading(true);

    try {
      const res = await fetch(`/api/blogs?page=1&limit=50`, {
        signal: controller.signal,
        cache: "no-store",
      });

      if (controller.signal.aborted || myReqId !== recentReqIdRef.current) return;
      if (!res.ok) throw new Error("Failed to fetch recent posts");

      const json = await res.json();
      const rawList = Array.isArray(json)
        ? json
        : json?.data || json?.items || [];

      const mappedList: Blog[] = rawList.map(mapRecent);

      // ✅ newest first
      const newestSorted = [...mappedList].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // ✅ remove current post
      let filtered = newestSorted.filter((p) => p.id !== postId);

      // ✅ BUT if only current exists, show it anyway
      if (filtered.length === 0) {
        filtered = newestSorted;
      }

      setRecentPosts(filtered.slice(0, 6));
    } catch (e: any) {
      if (controller.signal.aborted || myReqId !== recentReqIdRef.current) return;
      console.error(e);
      setRecentPosts([]);
    } finally {
      if (controller.signal.aborted || myReqId !== recentReqIdRef.current) return;
      setRecentLoading(false);
    }
  };

  fetchRecent();
  return () => controller.abort();
}, [postId]);


  // ✅ ensure URL has ?slug=<slug-from-title>
  useEffect(() => {
    if (!post) return;
    const desired = slugify(post.post_title || "");
    if (!desired) return;

    if (urlSlug !== desired) {
      const qs = new URLSearchParams(Array.from(searchParams.entries()));
      qs.set("slug", desired);
      router.replace(`/blogs/${postId}?${qs.toString()}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, post?.post_title]);

  const readTime = useMemo(() => {
    if (!post?.post_content) return 1;
    const words =
      post.post_content
        .replace(/<[^>]+>/g, " ")
        .trim()
        .split(/\s+/).length || 1;
    return Math.max(1, Math.ceil(words / 200));
  }, [post?.post_content]);

  /** Open Edit */
  const openEdit = (focus: "title" | "content") => {
    if (!isAuthed) return signIn();
    if (!post) return;

    setEditBlogData({
      id: post.id,
      post_title: post.post_title || "",
      post_content: post.post_content || "",
      category: post.category || "",
      tags: post.tags ?? "",
      post_status: (post.post_status as any) || "draft",
    });
    setIsFormVisible(true);
  };

  /** Close modal */
  const handleCloseModal = () => {
    setIsFormVisible(false);
    setEditBlogData(null);
  };

  /** Update (PUT) */
  const handleUpdateBlog = async (payload: {
    id?: number;
    post_title: string;
    post_content: string;
    category?: string;
    tags?: string[] | string;
    post_status?: "draft" | "publish" | "private" | string;
  }) => {
    try {
      const res = await fetch("/api/blogs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: payload.id ?? post?.id,
          post_title: payload.post_title,
          post_content: payload.post_content,
          category: payload.category ?? "",
          tags: payload.tags,
          post_status: payload.post_status ?? "draft",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to update");
      }

      const updated: Blog = await res.json();
      setPost((prev) => (prev ? { ...prev, ...updated } : updated));
      handleCloseModal();
    } catch (e) {
      alert((e as Error).message || "Update failed");
      console.error(e);
    }
  };

  /* ---------- SEO ---------- */
  const title = post?.post_title ?? "Untitled Post";
  const description =
    stripHtml(post?.post_content ?? "").slice(0, 160) ||
    "Read this article on Moving Quote New York Blog.";
  const effectiveSlug = slugify(title);
  const canonical = `${SITE_URL}/blogs/${postId}${
    effectiveSlug ? `?slug=${encodeURIComponent(effectiveSlug)}` : ""
  }`;

  const isPublished =
    String(post?.post_status ?? "draft").toLowerCase() === "publish" ||
    String(post?.post_status ?? "draft").toLowerCase() === "published";

  const keywords =
    (Array.isArray(post?.tags)
      ? post?.tags
      : String(post?.tags || "").split(","))
      .map((t) => String(t).trim())
      .filter(Boolean)
      .join(", ") || undefined;

  const dateISO = post?.createdAt
    ? new Date(post.createdAt).toISOString()
    : new Date().toISOString();

  const jsonLd = post && {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: dateISO,
    dateModified: dateISO,
    author: [{ "@type": "Organization", name: "Moving Quote New York" }],
    publisher: {
      "@type": "Organization",
      name: "Moving Quote New York",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: canonical,
    articleSection: post?.category || undefined,
    keywords,
  };

  /** ✅ Skeleton loader */
  if (viewStatus === "loading") {
    return (
      <>
        <Head>
          <title>Loading… | Moving Quote New York Blog</title>
          <meta name="robots" content="noindex,nofollow" />
          <link rel="canonical" href={canonical} />
        </Head>

        <div className="min-h-screen bg-white">
          <div className="mx-auto w-full max-w-none px-6 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-12 lg:gap-8 animate-pulse">
            <aside className="lg:col-span-2 hidden lg:block">
              <div className="h-[600px] bg-slate-100 rounded-xl" />
            </aside>

            <div className="lg:col-span-8 space-y-6">
              <div className="h-10 w-3/4 bg-slate-200 rounded" />
              <div className="h-6 w-1/3 bg-slate-200 rounded" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-slate-200 rounded" />
                <div className="h-4 w-11/12 bg-slate-200 rounded" />
                <div className="h-4 w-10/12 bg-slate-200 rounded" />
                <div className="h-4 w-9/12 bg-slate-200 rounded" />
              </div>
            </div>

            <aside className="lg:col-span-2 mt-10 lg:mt-0">
              <div className="p-6 border border-slate-100 rounded-xl bg-slate-50 shadow-md space-y-4">
                <div className="h-4 w-1/2 bg-slate-200 rounded" />
                <div className="h-20 w-full bg-slate-200 rounded" />
                <div className="h-20 w-full bg-slate-200 rounded" />
                <div className="h-20 w-full bg-slate-200 rounded" />
              </div>
            </aside>
          </div>
        </div>
      </>
    );
  }

  /** ✅ Not Found only after real 404 */
  if (viewStatus === "notfound" || !post) {
    return (
      <>
        <Head>
          <title>Not Found | Moving Quote New York Blog</title>
          <meta name="robots" content="noindex,nofollow" />
          <link rel="canonical" href={canonical} />
        </Head>
        <div className="min-h-screen grid place-items-center bg-slate-50">
          <div className="text-center p-10 bg-white rounded-xl shadow-2xl">
            <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-cyan-100 shadow-inner flex items-center justify-center">
              <span className="text-4xl">🤷‍♂️</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Content Missing
            </h2>
            <p className="mt-2 text-lg text-slate-600">
              The requested article could not be located.
            </p>
            <Link
              href="/allBlogs"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-cyan-500/30 hover:bg-cyan-700 transition"
            >
              <span className="text-xl">←</span> Return to Blog Home
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`${title} | Moving Quote New York Blog`}</title>
        <meta name="description" content={description} />
        {keywords && <meta name="keywords" content={keywords} />}
        <link rel="canonical" href={canonical} />
        <meta
          name="robots"
          content={
            isPublished
              ? "index,follow"
              : "noindex,nofollow,noimageindex,nocache"
          }
        />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Moving Quote New York Blog" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta name="twitter:card" content="summary" />
        <meta
          name="twitter:title"
          content={`${title} | Moving Quote New York Blog`}
        />
        <meta name="twitter:description" content={description} />
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}
      </Head>

      <div className="min-h-screen bg-white relative">
        {/* Header */}
        <header className="py-6 border-b border-slate-100 shadow-sm">
          <div className="mx-auto max-w-7xl px-6">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-slate-500 text-sm">
                <li>
                  <Link href="/" className="hover:text-cyan-600">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/allBlogs" className="hover:text-cyan-600">
                    Blog
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-slate-800 font-medium">
                  {title}
                </li>
              </ol>
            </nav>
          </div>
        </header>

        {/* 3 COLUMN LAYOUT - ULTRA WIDE + RESPONSIVE */}
        <main
          className="
            mx-auto w-full max-w-none
            px-3 sm:px-6 lg:px-8 2xl:px-10
            pt-8 md:pt-10 pb-20 md:pb-24
            grid grid-cols-1 lg:grid-cols-12
            gap-6 lg:gap-8 2xl:gap-10
          "
        >
          {/* LEFT ADS */}
          <aside className="order-2 lg:order-1 lg:col-span-2 hidden lg:block">
            <div className="sticky top-6 space-y-4">
              <div className="border border-slate-200 rounded-xl bg-slate-50 h-[700px] flex items-center justify-center text-slate-400 text-sm">
                Google Ads Area
              </div>
              <div className="border border-slate-200 rounded-xl bg-slate-50 h-[280px] flex items-center justify-center text-slate-400 text-sm">
                Ads / Banner
              </div>
            </div>
          </aside>

          {/* CENTER BLOG */}
          <article
            className="
              order-1 lg:order-2
              lg:col-span-8 xl:col-span-7 2xl:col-span-8
              min-w-0
            "
            itemScope
            itemType="https://schema.org/Article"
          >
            <div
              className="
                max-w-none space-y-8 bg-white
                lg:border lg:border-slate-100 lg:rounded-2xl
                lg:p-8 xl:p-10 2xl:p-12
                lg:shadow-sm
              "
            >
              {/* Title */}
              <div className="relative group">
                <h1
                  className="
                    text-3xl sm:text-4xl md:text-5xl
                    font-extrabold tracking-tight text-slate-900 leading-snug
                  "
                  itemProp="headline"
                >
                  {post.post_title}
                </h1>

                {isAuthed && (
                  <button
                    type="button"
                    onClick={() => openEdit("title")}
                    title="Edit title"
                    className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 focus:opacity-100
                               transition rounded-full bg-cyan-600 text-white p-2 shadow-lg hover:bg-cyan-700"
                  >
                    ✎
                  </button>
                )}
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span>
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="text-slate-300">•</span>
                <span>{readTime} min read</span>

                {post.category && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 font-semibold text-xs uppercase">
                      {post.category}
                    </span>
                  </>
                )}
              </div>

              {/* Content */}
              <div className="relative group">
                {isAuthed && (
                  <button
                    type="button"
                    onClick={() => openEdit("content")}
                    title="Edit content"
                    className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 focus:opacity-100
                               transition rounded-full bg-cyan-600 text-white p-2 shadow-lg hover:bg-cyan-700 z-10"
                  >
                    ✎
                  </button>
                )}

                <div
                  className="
                    blog-content mt-2 max-w-none text-slate-800 leading-relaxed
                    text-[16px] sm:text-[17px] md:text-[18px] 2xl:text-[19px]
                    overflow-x-auto
                  "
                  dangerouslySetInnerHTML={{ __html: post.post_content }}
                  itemProp="articleBody"
                />
              </div>

              {/* hidden SEO meta */}
              <div className="sr-only">
                <time dateTime={dateISO} itemProp="datePublished">
                  {dateISO}
                </time>
                <meta itemProp="dateModified" content={dateISO} />
                <meta itemProp="author" content="Moving Quote New York" />
                {keywords && <meta itemProp="keywords" content={keywords} />}
              </div>
            </div>
          </article>

          {/* RIGHT NEW BLOGS */}
          <aside
            className="
              order-3 lg:order-3
              lg:col-span-2 xl:col-span-3 2xl:col-span-2
              mt-2 lg:mt-0 min-w-0
            "
          >
            <div className="lg:sticky lg:top-6 space-y-6">
              <div className="p-5 sm:p-6 border border-slate-100 rounded-xl bg-white shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Recent BLogs
                </h3>

                {recentLoading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-20 bg-slate-100 rounded-lg" />
                    <div className="h-20 bg-slate-100 rounded-lg" />
                    <div className="h-20 bg-slate-100 rounded-lg" />
                  </div>
                ) : recentPosts.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No recent posts found.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentPosts.map((p) => {
                      const pSlug = slugify(p.post_title || "");
                      const pDesc = stripHtml(
                        p.excerpt || p.post_content || ""
                      ).slice(0, 90);

                      return (
                        <Link
                          key={p.id}
                          href={`/blogs/${p.id}?slug=${encodeURIComponent(
                            pSlug
                          )}`}
                          className="block group"
                        >
                          <div className="flex gap-3 p-3 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 group-hover:text-cyan-700 line-clamp-2">
                                {p.post_title}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {new Date(p.createdAt).toLocaleDateString()}
                                {" • "}
                                {(p.readTime ?? 1)} min read
                              </p>
                              {pDesc && (
                                <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                  {pDesc}...
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                <div className="mt-4 text-center">
                  <Link
                    href="/allBlogs"
                    className="text-cyan-600 text-sm font-semibold hover:text-cyan-700 transition"
                  >
                    View all →
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* MOBILE ADS */}
          <div className="order-4 lg:hidden">
            <div className="mt-6 space-y-4">
              <div className="border border-slate-200 rounded-xl bg-slate-50 h-[220px] flex items-center justify-center text-slate-400 text-sm">
                Google Ads Area (Mobile)
              </div>
              <div className="border border-slate-200 rounded-xl bg-slate-50 h-[160px] flex items-center justify-center text-slate-400 text-sm">
                Banner Ads (Mobile)
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      {isFormVisible && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-70 flex justify-center items-center z-50"
          role="dialog"
          aria-modal="true"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-xl p-8 w-11/12 max-w-4xl shadow-lg overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between mb-2">
              <h2 className="text-2xl font-bold">Edit Blog</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            <BlogPostForm
              initialData={editBlogData!}
              onClose={handleCloseModal}
              onUpdate={handleUpdateBlog}
            />
          </div>
        </div>
      )}
    </>
  );
}
