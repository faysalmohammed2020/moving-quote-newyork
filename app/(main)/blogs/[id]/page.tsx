"use client";

import { useEffect, useMemo, useState } from "react";
import Head from "next/head"; // SEO meta (client-only fallback)
import { useRouter, useParams } from "next/navigation";
import { CalendarIcon, TagIcon, ChevronLeft } from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import Categories from "@/components/Categories";
import RichTextEditor from "@/components/RichTextEditor";
import { postdata } from "@/app/(main)/data/postdata";

const API_URL = "/api/blogs";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.example.com";

/* -------------------- Helpers -------------------- */
type DbPost = {
  id: number;
  post_title: string;
  post_content: string;
  category?: string | null;
  tags?: string | string[] | null;
  post_status?: string | null;
  createdAt?: string | null;
  post_date?: string | null;
  cover_image?: string | null;
};

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]!));
}
function contentToHtml(v: any): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  try {
    return `<pre style="white-space:pre-wrap; background:#f4f4f5; padding:1rem; border-radius:0.5rem; overflow-x:auto;">${escapeHtml(
      JSON.stringify(v, null, 2)
    )}</pre>`;
  } catch {
    return "";
  }
}
function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* -------------------- Component -------------------- */
export default function BlogCategory() {
  const params = useParams() as { id?: string };
  const numericId = useMemo(() => Number(params?.id), [params?.id]);

  const { status } = useSession();
  const isAuthed = status === "authenticated";

  const [post, setPost] = useState<DbPost | null>(null);
  const [loading, setLoading] = useState(true);

  // EDIT MODAL
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<{
    id?: number;
    post_title: string;
    post_content: string;
    category: string;
    tags: string;
    post_status?: "draft" | "publish" | "private" | string;
  }>({ post_title: "", post_content: "", category: "", tags: "" });

  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const localFallback = (postdata as any[]).find((b) => Number(b.ID) === numericId);

      if (!numericId || Number.isNaN(numericId)) {
        if (mounted) setLoading(false);
        return;
      }

      let fetchedPost: any = null;
      try {
        const res = await fetch(`${API_URL}?id=${numericId}`, { cache: "no-store" });
        if (res.ok) fetchedPost = await res.json();
      } catch {}
      finally {
        if (!mounted) return;
        const normalized: DbPost | null =
          fetchedPost ??
          (localFallback
            ? {
                id: Number(localFallback.ID),
                post_title: localFallback.post_title || localFallback.title || "Untitled Post",
                post_content: String(localFallback.post_content ?? localFallback.content ?? ""),
                category: localFallback.category ?? "",
                tags: Array.isArray(localFallback.tags) ? localFallback.tags.join(",") : (localFallback.tags ?? ""),
                post_status: localFallback.post_status ?? "draft",
                createdAt:
                  localFallback.createdAt ??
                  localFallback.post_date ??
                  localFallback.postDate ??
                  new Date().toISOString(),
                post_date: localFallback.post_date ?? null,
                cover_image: localFallback.cover_image ?? null,
              }
            : null);
        setPost(normalized);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [numericId]);

  // Normalized fields for SEO
  const title = (post as any)?.post_title ?? (post as any)?.title ?? "Untitled Post";
  const dateStr =
    (post as any)?.createdAt || (post as any)?.post_date || (post as any)?.postDate || new Date().toISOString();
  const category = (post as any)?.category ?? "";
  const tagsStr = Array.isArray((post as any)?.tags)
    ? ((post as any)?.tags as string[]).join(",")
    : ((post as any)?.tags as string) ?? "";
  const tags = tagsStr ? tagsStr.split(",").map((t: string) => t.trim()) : [];
  const html = contentToHtml((post as any)?.post_content ?? (post as any)?.content);

  // SEO meta (client fallback): description/canonical/og/twitter
  const description = stripHtml((post as any)?.post_content ?? (post as any)?.content ?? "").slice(0, 160) ||
    "Read this article on Birds Of Eden Blog.";
  const isPublished =
    String((post?.post_status ?? "draft")).toLowerCase() === "publish" ||
    String((post?.post_status ?? "draft")).toLowerCase() === "published";
  const canonicalPath = `/blogs/${numericId || ""}`;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;

  // JSON-LD Article
  const articleJsonLd = post
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        datePublished: new Date(dateStr).toISOString(),
        dateModified: new Date(dateStr).toISOString(),
        author: [{ "@type": "Organization", name: "Moving Quote New York" }],
        publisher: {
          "@type": "Organization",
          name: "Moving Quote New York",
          logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
        },
        mainEntityOfPage: canonicalUrl,
        image: post.cover_image ? [post.cover_image] : undefined,
        articleSection: category || undefined,
        keywords: tags.length ? tags.join(", ") : undefined,
      }
    : null;

  const goBack = () => router.push("/allBlogs");

  // Edit modal open
  const openEdit = () => {
    if (!isAuthed) return signIn();
    if (!post) return;
    setEditForm({
      id: post.id,
      post_title: post.post_title || "",
      post_content: post.post_content || "",
      category: (post.category as string) || "",
      tags: typeof post.tags === "string" ? post.tags : ((post.tags || []) as string[]).join(","),
      post_status: (post.post_status as any) || "draft",
    });
    setIsEditOpen(true);
  };
  const closeEdit = () => setIsEditOpen(false);

  // Update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/blogs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editForm.id ?? post?.id,
          post_title: editForm.post_title,
          post_content: editForm.post_content,
          category: editForm.category,
          tags: editForm.tags,
          post_status: editForm.post_status ?? "draft",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to update");
      }
      const updated: DbPost = await res.json();
      setPost((prev) => (prev ? { ...prev, ...updated } : updated));
      setIsEditOpen(false);
    } catch (err) {
      alert((err as Error).message || "Update failed");
      console.error(err);
    }
  };

  /* -------------------- Loading/Not Found -------------------- */
  if (loading || status === "loading") {
    return (
      <>
        <Head>
          <title>Loading… | Birds Of Eden Blog</title>
          <meta name="robots" content="noindex,nofollow" />
        </Head>
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
              <div className="h-10 w-4/5 bg-gray-200 rounded-lg mb-6 animate-pulse" />
              <div className="flex space-x-6 mb-12">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="space-y-4">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-11/12 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-10/12 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-9/12 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Head>
          <title>Not Found | Moving Quote New York Blog</title>
          <meta name="robots" content="noindex,nofollow" />
          <link rel="canonical" href={`${SITE_URL}/blogs/${numericId || ""}`} />
        </Head>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
          <div className="text-center bg-white p-10 rounded-xl shadow-lg">
            <h2 className="text-4xl font-extrabold text-gray-800 mb-4">Post Not Found 🧐</h2>
            <p className="text-xl text-gray-500">It looks like the article you're searching for doesn't exist.</p>
            <button
              onClick={goBack}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition duration-150 ease-in-out"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  /* -------------------- Page -------------------- */
  return (
    <>
      {/* SEO head (client fallback). For best SEO use server-side Metadata, but keeping it within this file as requested. */}
      <Head>
        <title>{`${title} | Moving Quote New York Blog`}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta
          name="robots"
          content={isPublished ? "index,follow" : "noindex,nofollow,noimageindex,nocache"}
        />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        {post.cover_image && <meta property="og:image" content={post.cover_image} />}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {post.cover_image && <meta name="twitter:image" content={post.cover_image} />}

        {/* JSON-LD */}
        {articleJsonLd && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
        )}
      </Head>

      <main className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 font-['Inter',_sans-serif]">
        {/* Breadcrumb (semantic) */}
        <nav aria-label="Breadcrumb" className="max-w-4xl mx-auto mb-4">
          <ol className="flex items-center space-x-2 text-sm text-slate-600">
            <li><a href="/" className="hover:text-cyan-700">Home</a></li>
            <li aria-hidden="true">/</li>
            <li><a href="/allBlogs" className="hover:text-cyan-700">Blog</a></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-slate-900 font-medium">{title}</li>
          </ol>
        </nav>

        <div className="max-w-4xl mx-auto">
          <button
            onClick={goBack}
            className="mb-6 inline-flex items-center text-sm font-medium text-gray-600 hover:text-cyan-600 transition duration-150 ease-in-out"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Blog
          </button>

          {/* Article with Schema.org microdata */}
          <article
            itemScope
            itemType="https://schema.org/Article"
            className="relative group bg-white rounded-2xl shadow-xl transition-all duration-300 border border-gray-100"
          >
            {/* Edit button (auth only) */}
            {isAuthed && (
              <button
                onClick={openEdit}
                title="Edit this post"
                className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 hover:border-cyan-300 hover:text-cyan-700"
              >
                ✏️ Edit
              </button>
            )}

            {/* Optional cover image (good for LCP with proper alt) */}
            {post.cover_image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.cover_image}
                alt={title}
                width={1200}
                height={630}
                loading="eager"
                fetchPriority="high"
                className="w-full h-auto rounded-t-2xl"
                itemProp="image"
              />
            )}

            <div className="p-8 sm:p-12">
              {category && (
                <p className="text-sm font-semibold uppercase text-cyan-600 tracking-wider mb-2" itemProp="articleSection">
                  {category}
                </p>
              )}

              <h1 className="text-slate-900 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 break-words" itemProp="headline">
                {title}
              </h1>

              <div className="flex flex-wrap items-center text-sm text-gray-500 mb-10 border-b border-gray-200 pb-4">
                <span className="flex items-center mr-6 mb-2 sm:mb-0">
                  <CalendarIcon className="w-4 h-4 mr-2 text-cyan-600" />
                  <time dateTime={new Date(dateStr).toISOString()} itemProp="datePublished">
                    {new Date(dateStr).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </span>
                {tags.length > 0 && (
                  <span className="flex items-center">
                    <TagIcon className="w-4 h-4 mr-2 text-cyan-600" />
                    <span className="ml-1 space-x-2">
                      {tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium hover:bg-cyan-100 transition"
                          itemProp="keywords"
                        >
                          {tag}
                        </span>
                      ))}
                      {tags.length > 3 && <span className="text-xs text-gray-400">...</span>}
                    </span>
                  </span>
                )}
                {/* Organization as author */}
                <meta itemProp="author" content="Birds Of Eden" />
                <meta itemProp="dateModified" content={new Date(dateStr).toISOString()} />
              </div>

              <div className="relative group/content">
                {isAuthed && (
                  <button
                    onClick={openEdit}
                    title="Edit content"
                    className="absolute -right-2 -top-2 rounded-full bg-cyan-600 text-white p-2 shadow-lg hover:bg-cyan-700 opacity-0 group-hover/content:opacity-100 transition z-10"
                  >
                    ✎
                  </button>
                )}
                <div
                  className="prose prose-xl max-w-none text-slate-800
                    prose-headings:text-slate-900 prose-headings:font-extrabold prose-h2:mt-16 prose-h3:mt-10
                    prose-a:text-cyan-600 prose-a:font-medium hover:prose-a:text-cyan-700
                    prose-img:rounded-xl prose-img:shadow-lg prose-img:border prose-img:border-slate-200 prose-img:mt-8 prose-img:mb-12
                    prose-hr:my-16 prose-hr:border-slate-200
                    prose-blockquote:border-l-4 prose-blockquote:border-cyan-500 prose-blockquote:bg-cyan-50/70 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:text-slate-700
                    [&_table]:w-full [&_table]:table-auto [&_table]:border-collapse [&_table]:my-10 [&_table]:shadow-md [&_table]:rounded-lg [&_table]:overflow-hidden
                    [&_thead]:bg-cyan-600 [&_thead]:text-white
                    [&_th]:px-4 [&_td]:px-4 [&_th]:py-3 [&_td]:py-3 [&_td]:align-top
                    [&_th]:text-left [&_th]:font-semibold 
                    [&_tr]:border-b [&_tr]:border-gray-200
                    [&_tbody_tr:nth-child(even)]:bg-gray-50
                    [&_tbody_tr:hover]:bg-cyan-50
                    [&_td]:text-center"
                  dangerouslySetInnerHTML={{ __html: html }}
                  itemProp="articleBody"
                />
              </div>
            </div>
          </article>
        </div>

        <Categories />

        {/* EDIT MODAL */}
        {isEditOpen && (
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            onClick={closeEdit}
          >
            <div
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">Edit Blog Post</h3>
                <button onClick={closeEdit} className="text-gray-400 hover:text-gray-500 transition-colors">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="overflow-y-auto p-6">
                <form onSubmit={handleUpdate}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Post Title</label>
                      <input
                        type="text"
                        name="post_title"
                        value={editForm.post_title}
                        onChange={(e) => setEditForm((p) => ({ ...p, post_title: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <input
                        type="text"
                        name="category"
                        value={editForm.category}
                        onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <input
                      type="text"
                      name="tags"
                      value={editForm.tags}
                      onChange={(e) => setEditForm((p) => ({ ...p, tags: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Post Content</label>
                    <RichTextEditor
                      value={editForm.post_content}
                      onChange={(content) => setEditForm((p) => ({ ...p, post_content: content }))}
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={closeEdit}
                      className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {/* End Edit Modal */}
      </main>
    </>
  );
}
