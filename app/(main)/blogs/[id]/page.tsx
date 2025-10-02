"use client";
import { useEffect, useMemo, useState } from "react";
// MOCK IMPORTS for standalone compilation: 
import { postdata } from "@/app/(main)/data/postdata"; 
import { CalendarIcon, TagIcon, ChevronLeft } from "lucide-react"; 
import Categories from "@/components/Categories";
import { useRouter,useParams } from "next/navigation";

const API_URL = "/api/blogs";

// Utility to normalize content to an HTML string
function contentToHtml(v: any): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  // If content is not a string, serialize it for display
  try {
    return `<pre style="white-space:pre-wrap; background:#f4f4f5; padding:1rem; border-radius:0.5rem; overflow-x:auto;">${escapeHtml(
      JSON.stringify(v, null, 2)
    )}</pre>`;
  } catch {
    return "";
  }
}

// Utility to safely escape HTML characters
function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[m]!));
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

// Mock function for navigation, since we don't have a real router here


// --- Component Start ---

export default function BlogCategory() {
  // Use mock useParams
  const params = useParams() as { id?: string };
  const numericId = useMemo(() => Number(params?.id), [params?.id]);

  const [post, setPost] = useState<DbPost | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load post logic
  useEffect(() => {
    let mounted = true;
    (async () => {
      // Adjusted fallback logic to prioritize local mock data if API fails or doesn't exist
      
      const localFallback = (postdata as any[]).find(
        (b) => Number(b.ID) === numericId
      );

      if (!numericId || Number.isNaN(numericId)) {
        if (mounted) setLoading(false);
        return;
      }
      
      let fetchedPost = null;

      try {
        // Attempt to fetch from the mock API URL (will likely fail, triggering the fallback)
        const res = await fetch(`${API_URL}?id=${numericId}`, {
          cache: "no-store",
        });
        if (res.ok) {
          fetchedPost = await res.json();
        } 
      } catch (error) {
        // console.error("API fetch failed, using local mock data:", error);
      } finally {
        if (mounted) {
            setPost(fetchedPost ?? localFallback ?? null);
            setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [numericId]);

  // --- Post Data Normalization ---
  const title = (post as any)?.post_title ?? (post as any)?.title ?? "Untitled Post";
  const dateStr =
    (post as any)?.createdAt ||
    (post as any)?.post_date ||
    (post as any)?.postDate ||
    new Date().toISOString();
  const category = (post as any)?.category;
  const tagsStr = (post as any)?.tags;
  const tags = tagsStr ? tagsStr.split(",").map((t: string) => t.trim()) : [];
  const html = contentToHtml(
    (post as any)?.post_content ?? (post as any)?.content
  );
   const goBack = () => {
    router.push("/allBlogs");
  };
  
  // --- Loading State (Skeleton) ---
  if (loading) {
    return (
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
    );
  }

  // --- Not Found State ---
  if (!post) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="text-center bg-white p-10 rounded-xl shadow-lg">
            <h2 className="text-4xl font-extrabold text-gray-800 mb-4">
                Post Not Found 🧐
            </h2>
            <p className="text-xl text-gray-500">
                It looks like the article you're searching for doesn't exist.
            </p>
            <button 
                onClick={goBack}
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition duration-150 ease-in-out"
            >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Go Back
            </button>
        </div>
      </div>
    );
  }

  // --- Main Content Display (Light Mode) ---

  return (
    // Set a subtle light gray background for the overall page
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 font-['Inter',_sans-serif]">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <button 
            onClick={goBack}
            className="mb-6 inline-flex items-center text-sm font-medium text-gray-600 hover:text-cyan-600 transition duration-150 ease-in-out"
        >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Blog
        </button>

        <article className="bg-white rounded-2xl shadow-xl transition-all duration-300 border border-gray-100">
          <div className="p-8 sm:p-12">
            
            {/* Category/Breadcrumb */}
            {category && (
              <p className="text-sm font-semibold uppercase text-cyan-600 tracking-wider mb-2">
                {category}
              </p>
            )}

            {/* Blog Title */}
            <h1 className="text-slate-900 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 break-words">
              {title}
            </h1>

            {/* Post Meta - Refined with Icons */}
            <div className="flex flex-wrap items-center text-sm text-gray-500 mb-10 border-b border-gray-200 pb-4">
              <span className="flex items-center mr-6 mb-2 sm:mb-0">
                <CalendarIcon className="w-4 h-4 mr-2 text-cyan-600" />
                Published:{" "}
                <strong className="text-slate-700 ml-1">
                  {new Date(dateStr).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </strong>
              </span>
              {tags.length > 0 && (
                <span className="flex items-center">
                  <TagIcon className="w-4 h-4 mr-2 text-cyan-600" />
                  Tags:{" "}
                  <span className="ml-1 space-x-2">
                    {tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium hover:bg-cyan-100 transition"
                      >
                        {tag}
                      </span>
                    ))}
                    {tags.length > 3 && (
                      <span className="text-xs text-gray-400">...</span>
                    )}
                  </span>
                </span>
              )}
            </div>

            {/* Blog Content (Table Styling is embedded here) */}
            <div
                className="prose prose-xl max-w-none text-slate-800
                    prose-headings:text-slate-900 prose-headings:font-extrabold prose-h2:mt-16 prose-h3:mt-10
                    prose-a:text-cyan-600 prose-a:font-medium hover:prose-a:text-cyan-700
                    prose-img:rounded-xl prose-img:shadow-lg prose-img:border prose-img:border-slate-200 prose-img:mt-8 prose-img:mb-12
                    prose-hr:my-16 prose-hr:border-slate-200
                    prose-blockquote:border-l-4 prose-blockquote:border-cyan-500 prose-blockquote:bg-cyan-50/70 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:text-slate-700
                    
                    /* --- Professional Table Design (Light Mode) --- */
                    [&_table]:w-full [&_table]:table-auto [&_table]:border-collapse [&_table]:my-10 [&_table]:shadow-md [&_table]:rounded-lg [&_table]:overflow-hidden
                    [&_thead]:bg-cyan-600 [&_thead]:text-white
                    [&_th]:px-4 [&_td]:px-4 [&_th]:py-3 [&_td]:py-3 [&_td]:align-top
                    [&_th]:text-left [&_th]:font-semibold 
                    [&_tr]:border-b [&_tr]:border-gray-200
                    [&_tbody_tr:nth-child(even)]:bg-gray-50 /* Light gray zebra striping */
                    [&_tbody_tr:hover]:bg-cyan-50 /* Light cyan row hover */
                    [&_td]:text-center
                    "
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </article>  
          
      </div>
      <Categories/> 
    </div>
  );
}
