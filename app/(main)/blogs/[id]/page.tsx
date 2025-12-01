"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Head from "next/head";
import { useEffect, useMemo, useState, useRef } from "react";
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
  const [loading, setLoading] = useState(true);

  // ✅ notFound state
  const [notFound, setNotFound] = useState(false);

  // ✅ StrictMode FIX: only latest request can update state
  const requestIdRef = useRef(0);

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
      setNotFound(true);
      setPost(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const myReqId = ++requestIdRef.current; // ✅ unique id

    const fetchPost = async () => {
      setLoading(true);
      setNotFound(false);

      try {
        const res = await fetch(`/api/blogs?id=${postId}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        // ✅ ignore aborted / stale request
        if (controller.signal.aborted || myReqId !== requestIdRef.current) return;

        if (!res.ok) {
          setNotFound(true);
          setPost(null);
          return;
        }

        const data = await res.json();

        if (!data || !data.id) {
          setNotFound(true);
          setPost(null);
          return;
        }

        const transformed: Blog = {
          id: data.id,
          post_title: data.post_title,
          post_content:
            typeof data.post_content === "object" && data.post_content?.text
              ? data.post_content.text
              : String(data.post_content ?? ""),
          createdAt: data.createdAt,
          category: data.category ?? "",
          tags: data.tags ?? [],
          post_status: data.post_status ?? "draft",
        };

        setPost(transformed);
      } catch (e: any) {
        if (controller.signal.aborted || myReqId !== requestIdRef.current) return;
        console.error(e);
        setNotFound(true);
        setPost(null);
      } finally {
        if (controller.signal.aborted || myReqId !== requestIdRef.current) return;
        setLoading(false);
      }
    };

    fetchPost();
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
  if (loading) {
    return (
      <>
        <Head>
          <title>Loading… | Moving Quote New York Blog</title>
          <meta name="robots" content="noindex,nofollow" />
          <link rel="canonical" href={canonical} />
        </Head>

        <div className="min-h-screen bg-white">
          <div className="mx-auto max-w-7xl px-6 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-12 lg:gap-12 animate-pulse">
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

            <aside className="lg:col-span-4 mt-10 lg:mt-0">
              <div className="p-6 border border-slate-100 rounded-xl bg-slate-50 shadow-md space-y-4">
                <div className="h-4 w-1/2 bg-slate-200 rounded" />
                <div className="h-10 w-full bg-slate-200 rounded" />
                <div className="h-10 w-full bg-slate-200 rounded" />
              </div>
            </aside>
          </div>
        </div>
      </>
    );
  }

  /** ✅ Not Found only after latest fetch */
  if (notFound || !post) {
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

      {/* ---- rest of your UI unchanged ---- */}
      <div className="min-h-screen bg-white relative">
        {/* Header */}
        <header className="py-8 border-b border-slate-100 shadow-sm" role="banner">
          <div className="mx-auto max-w-7xl px-6">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-slate-500 text-sm">
                <li>
                  <Link href="/" className="hover:text-cyan-600">Home</Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/allBlogs" className="hover:text-cyan-600">Blog</Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-slate-800 font-medium">
                  {title}
                </li>
              </ol>
            </nav>
          </div>
        </header>

        {/* Content + Sidebar */}
        <main
          className="mx-auto max-w-7xl px-6 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-12 lg:gap-12"
          itemScope
          itemType="https://schema.org/Article"
        >
          <article className="lg:col-span-8">
            <div className="max-w-4xl space-y-8">
              {/* Title */}
              <div className="relative group">
                <h1
                  className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-snug"
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Category */}
              {post.category && (
                <div>
                  <span
                    className="text-sm font-semibold uppercase text-cyan-600 border border-cyan-200 bg-cyan-50 px-3 py-1 rounded-full tracking-wider"
                    itemProp="articleSection"
                  >
                    {post.category}
                  </span>
                </div>
              )}

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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                )}

                <div
                  className="blog-content mt-2 max-w-none text-slate-800 overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: post.post_content }}
                  itemProp="articleBody"
                />
              </div>

              <div className="sr-only">
                <time dateTime={dateISO} itemProp="datePublished">{dateISO}</time>
                <meta itemProp="dateModified" content={dateISO} />
                <meta itemProp="author" content="Moving Quote New York" />
                {keywords && <meta itemProp="keywords" content={keywords} />}
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 mt-12 lg:mt-0" aria-label="Article details">
            <div className="lg:sticky lg:top-10">
              <div className="p-6 border border-slate-100 rounded-xl bg-slate-50 shadow-md">
                <p className="text-sm font-semibold uppercase text-slate-500 mb-4 tracking-wider">
                  Article Details
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-xs text-slate-500">Published</p>
                      <p className="font-semibold text-slate-800">
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-xs text-slate-500">Reading Time</p>
                      <p className="font-semibold text-slate-800">{readTime} min read</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Link href="/allBlogs" className="text-cyan-600 font-semibold hover:text-cyan-700 transition">
                  Browse All Articles →
                </Link>
              </div>
            </div>
          </aside>
        </main>
      </div>

      {/* Edit Modal unchanged */}
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
              <button onClick={handleCloseModal} className="text-gray-500 font-bold text-xl">
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
