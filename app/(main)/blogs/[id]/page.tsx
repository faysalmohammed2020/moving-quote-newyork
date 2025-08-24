"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { postdata } from "@/app/(main)/data/postdata";

const API_URL = "/api/blogs";

// Normalize possible JSON/string content to HTML string
function contentToHtml(v: any): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  // If your editor saves JSON, adapt here (e.g., v.html or convert JSON->HTML)
  try {
    // last resort: show serialized JSON
    return `<pre style="white-space:pre-wrap">${escapeHtml(JSON.stringify(v, null, 2))}</pre>`;
  } catch {
    return "";
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]!));
}

type DbPost = {
  id: number;
  post_title: string;
  post_content: any;
  category?: string | null;
  tags?: string | null;
  post_status?: string | null;
  createdAt?: string | null;
  post_date?: string | null;
};

export default function BlogCategory() {
  const params = useParams() as { id?: string };
  const numericId = useMemo(() => Number(params?.id), [params?.id]);

  const [post, setPost] = useState<DbPost | null>(null);
  const [loading, setLoading] = useState(true);

  // Load from API by id; fallback to postdata if not found
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!numericId || Number.isNaN(numericId)) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}?id=${numericId}`, { cache: "no-store" });
        if (res.ok) {
          const data: DbPost = await res.json();
          if (mounted) setPost(data);
        } else {
          // fallback to local postdata
          const local = (postdata as any[]).find((b) => Number(b.ID) === numericId);
          if (mounted) setPost(local ?? null);
        }
      } catch {
        const local = (postdata as any[]).find((b) => Number(b.ID) === numericId);
        if (mounted) setPost(local ?? null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [numericId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-black rounded-lg shadow-md p-6">
          <div className="h-8 w-2/3 bg-yellow-300/30 rounded mb-4 animate-pulse" />
          <div className="h-4 w-40 bg-white/20 rounded mb-6 animate-pulse" />
          <div className="space-y-3">
            <div className="h-3 w-full bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-11/12 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-10/12 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return <p className="text-center mt-20 text-2xl">Category not found.</p>;
  }

  // The API returns `id`; local postdata uses `ID`. Normalize accessors:
  const title = (post as any).post_title ?? (post as any).title ?? "";
  const dateStr =
    (post as any).createdAt ||
    (post as any).post_date ||
    (post as any).postDate ||
    new Date().toISOString();

  const html = contentToHtml((post as any).post_content ?? (post as any).content);

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Blog Header Section */}
      <div className="bg-black rounded-lg shadow-md">
        <div className="p-6">
          {/* Blog Title */}
          <h1 className="text-yellow-400 text-3xl sm:text-4xl font-bold mb-4 break-words">
            {title}
          </h1>

          {/* Post Meta */}
          <div className="text-white/80 text-sm mb-6">
            Published on: {new Date(dateStr).toLocaleDateString()}
          </div>

          {/* Blog Content */}
          <div
            className="prose prose-invert max-w-none prose-headings:text-yellow-300 prose-a:text-yellow-300 prose-strong:text-white text-white text-lg leading-7"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}
