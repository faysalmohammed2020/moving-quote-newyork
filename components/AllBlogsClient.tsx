"use client";
import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
  useTransition,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import RichTextEditor from "./RichTextEditor";

const API_URL = "/api/blogs";

/** ---------- Helpers ---------- */
function toLabel(v: any): string {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean")
    return String(v);
  if (Array.isArray(v)) return v.map(toLabel).join(", ");
  if (typeof v === "object") {
    if ("name" in v) return String((v as any).name);
    if ("title" in v) return String((v as any).title);
    try {
      return JSON.stringify(v);
    } catch {
      return "[object]";
    }
  }
  return String(v);
}

type UPost = {
  ID: number;
  post_title: string;
  post_content: string;
  post_status?: string;
  comment_status?: string;
  category?: string;
  tags?: string;
  __fromDB?: boolean;
};

type Meta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

function setStatusLocal(
  setPosts: React.Dispatch<React.SetStateAction<UPost[]>>,
  id: number,
  next: "Draft" | "Published"
) {
  setPosts((prev) =>
    prev.map((p) => (p.ID === id ? { ...p, post_status: next } : p))
  );
}

function normalizeRows(rows: any[]): UPost[] {
  return (rows || []).map((r) => ({
    ID: Number(r.id ?? r.ID),
    post_title: r.post_title ?? "",
    post_content:
      typeof r.post_content === "string"
        ? r.post_content
        : toLabel(r.post_content),
    post_status: r.post_status ?? "Draft",
    comment_status: r.comment_status ?? "Open",
    category: toLabel(r.category),
    tags: toLabel(r.tags),
    __fromDB: true,
  }));
}

/** ---------- Component ---------- */
export default function AllBlogsClient({
  initialPosts,
  initialMeta,
  itemsPerPage,
}: {
  initialPosts: UPost[];
  initialMeta: Meta;
  itemsPerPage: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<UPost[]>(initialPosts);
  const [meta, setMeta] = useState<Meta>(initialMeta);
  const [currentPage, setCurrentPage] = useState(initialMeta.page || 1);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedBlog, setSelectedBlog] = useState<UPost | null>(null);
  const [formData, setFormData] = useState({
    post_title: "",
    post_content: "",
    category: "",
    tags: "",
  });
  const [newPost, setNewPost] = useState({
    post_title: "",
    post_content: "",
    category: "",
    tags: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [isPending, startTransition] = useTransition();
  const pageCacheRef = useRef<Map<number, UPost[]>>(new Map());

  /** ✅ sync from URL (back/forward/refresh) */
  useEffect(() => {
    const urlPage = Math.max(1, Number(searchParams.get("page") || 1));
    if (urlPage !== currentPage) setCurrentPage(urlPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /** ✅ fetch page when currentPage changes (except SSR page already loaded) */
  useEffect(() => {
    if (currentPage === initialMeta.page) return; // SSR already has it

    const cached = pageCacheRef.current.get(currentPage);
    if (cached) {
      startTransition(() => setPosts(cached));
      return;
    }

    const controller = new AbortController();
    const fetchPage = async () => {
      setError(null);
      if (posts.length === 0) setLoading(true);
      else setPageLoading(true);

      try {
        const res = await fetch(
          `${API_URL}?page=${currentPage}&limit=${itemsPerPage}`,
          { cache: "no-store", signal: controller.signal }
        );
        if (!res.ok) throw new Error("fetch failed");

        const json: any = await res.json();
        const list: any[] = Array.isArray(json)
          ? json
          : json.data || json.items || [];

        const nextMeta: Meta = Array.isArray(json)
          ? {
              page: currentPage,
              limit: itemsPerPage,
              total: list.length,
              totalPages: Math.max(1, Math.ceil(list.length / itemsPerPage)),
            }
          : json.meta || {
              page: currentPage,
              limit: itemsPerPage,
              total: list.length,
              totalPages: 1,
            };

        const normalized = normalizeRows(list).sort((a, b) => b.ID - a.ID);

        pageCacheRef.current.set(currentPage, normalized);

        startTransition(() => {
          setPosts(normalized);
          setMeta(nextMeta);
        });

        // prefetch next page
        if (currentPage < nextMeta.totalPages) {
          fetch(
            `${API_URL}?page=${currentPage + 1}&limit=${itemsPerPage}`,
            { cache: "no-store" }
          )
            .then((r) => r.json())
            .then((njson) => {
              const nlist = Array.isArray(njson)
                ? njson
                : njson.data || njson.items || [];
              const nnormalized = normalizeRows(nlist).sort(
                (a, b) => b.ID - a.ID
              );
              pageCacheRef.current.set(currentPage + 1, nnormalized);
            })
            .catch(() => {});
        }
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error(e);
          setError("Failed to fetch blogs. Please try again later.");
        }
      } finally {
        setLoading(false);
        setPageLoading(false);
      }
    };

    fetchPage();
    return () => controller.abort();
  }, [currentPage, itemsPerPage, initialMeta.page, posts.length, startTransition]);

  /** ✅ filter current page */
  const filteredPosts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return posts;
    return posts.filter((p) => p.post_title.toLowerCase().includes(q));
  }, [posts, searchQuery]);

  /** ✅ pagination click => URL update for SSR on refresh */
  const paginate = (p: number) => {
    if (p < 1 || p > meta.totalPages) return;
    setCurrentPage(p);
    router.push(`?page=${p}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const totalPages = meta.totalPages;
    const page = currentPage;
    const maxVisiblePages = 3;

    if (totalPages <= 6)
      return Array.from({ length: totalPages }, (_, i) => i + 1);

    if (page <= maxVisiblePages) return [1, 2, 3, "...", totalPages];
    if (page > totalPages - maxVisiblePages)
      return [1, "...", totalPages - 2, totalPages - 1, totalPages];

    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  /** ---------- actions: same as before ---------- */
  const handleEdit = (blog: UPost) => {
    setSelectedBlog(blog);
    setFormData({
      post_title: blog.post_title,
      post_content: blog.post_content ?? "",
      category: toLabel(blog.category),
      tags: toLabel(blog.tags),
    });
  };

  const refreshCurrentPage = useCallback(() => {
    pageCacheRef.current.delete(currentPage);
    setCurrentPage((p) => p);
  }, [currentPage]);

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this blog post?"
    );
    if (!confirmDelete) return;

    const target = posts.find((p) => p.ID === id);
    if (!target) return;

    if (target.__fromDB) {
      try {
        const res = await fetch(API_URL, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (!res.ok) throw new Error();
      } catch {
        alert("Failed to delete the post.");
        return;
      }
    }

    setPosts((prev) => prev.filter((p) => p.ID !== id));
    alert("Blog post deleted successfully!");
    refreshCurrentPage();
  };

  const handlePublish = async (post: UPost) => {
    if (!post.__fromDB) {
      setStatusLocal(setPosts, post.ID, "Published");
      return;
    }
    try {
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.ID, post_status: "Published" }),
      });
      if (!res.ok) throw new Error();
      setStatusLocal(setPosts, post.ID, "Published");
      refreshCurrentPage();
    } catch {
      alert("Could not publish the post.");
    }
  };

  const handleUnpublish = async (post: UPost) => {
    if (!post.__fromDB) {
      setStatusLocal(setPosts, post.ID, "Draft");
      return;
    }
    try {
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.ID, post_status: "Draft" }),
      });
      if (!res.ok) throw new Error();
      setStatusLocal(setPosts, post.ID, "Draft");
      refreshCurrentPage();
    } catch {
      alert("Could not change status.");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBlog) return;

    if (
      !formData.post_title.trim() ||
      !formData.post_content.trim() ||
      !formData.category.trim()
    ) {
      alert("Title, Content, and Category are required.");
      return;
    }

    if (selectedBlog.__fromDB) {
      try {
        const res = await fetch(API_URL, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedBlog.ID,
            post_title: formData.post_title,
            post_content: formData.post_content,
            category: formData.category,
            tags: formData.tags,
          }),
        });
        if (!res.ok) throw new Error();
      } catch {
        alert("Failed to save changes.");
        return;
      }
    }

    setPosts((prev) =>
      prev.map((p) =>
        p.ID === selectedBlog.ID
          ? {
              ...p,
              post_title: formData.post_title,
              post_content: formData.post_content,
              category: formData.category,
              tags: formData.tags,
            }
          : p
      )
    );
    setSelectedBlog(null);
    alert("Changes saved!");
    refreshCurrentPage();
  };

  const handleNewPostChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewPost((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleAddNewPost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !newPost.post_title.trim() ||
      !newPost.post_content.trim() ||
      !newPost.category.trim()
    ) {
      alert("Title, Content, and Category are required.");
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_title: newPost.post_title,
          post_content: newPost.post_content,
          category: newPost.category,
          tags: newPost.tags || "",
          post_status: "Draft",
        }),
      });

      if (res.ok) {
        alert("New post added successfully!");
        setIsModalOpen(false);
        setNewPost({
          post_title: "",
          post_content: "",
          category: "",
          tags: "",
        });
        pageCacheRef.current.clear();
        paginate(1);
        return;
      }
    } catch {}

    alert("Server rejected, added locally.");
    setPosts((prev) => [
      {
        ID: prev.length ? Math.max(...prev.map((p) => p.ID)) + 1 : 1,
        post_title: newPost.post_title,
        post_content: newPost.post_content,
        post_status: "Draft",
        comment_status: "Open",
        category: newPost.category,
        tags: newPost.tags,
        __fromDB: false,
      },
      ...prev,
    ]);

    setIsModalOpen(false);
  };

  /** ---------- render UI (same as your vibe) ---------- */
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Blog Management
        </h1>
        <p className="text-gray-600">
          Manage all your blog posts in one place
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <input
            type="text"
            placeholder="Search blogs by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-96 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all shadow-md"
          >
            Add New Post
          </button>
        </div>
      </div>

      {(pageLoading || isPending) && (
        <div className="w-full h-1 bg-gray-200 rounded mb-4 overflow-hidden">
          <div className="h-full w-1/3 bg-indigo-500 animate-pulse" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td className="px-6 py-8 text-center" colSpan={5}>
                    Loading posts...
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center" colSpan={5}>
                    No posts found.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((blog) => (
                  <tr
                    key={blog.ID}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {blog.ID}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">
                      <Link
                        href={`/blogs/${blog.ID}`}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {blog.post_title}
                      </Link>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {toLabel(blog.category) || "-"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          (blog.post_status ?? "Draft") === "Published"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {toLabel(blog.post_status) || "Draft"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        {(blog.post_status ?? "Draft") === "Draft" ? (
                          <button
                            onClick={() => handlePublish(blog)}
                            className="px-3 py-1.5 text-xs rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
                          >
                            Publish
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnpublish(blog)}
                            className="px-3 py-1.5 text-xs rounded-md text-white bg-amber-600 hover:bg-amber-700"
                          >
                            Unpublish
                          </button>
                        )}

                        <button
                          onClick={() => handleEdit(blog)}
                          className="px-3 py-1.5 text-xs rounded-md border border-gray-300 bg-white hover:bg-gray-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(blog.ID)}
                          className="px-3 py-1.5 text-xs rounded-md text-white bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex space-x-1 p-2 bg-white rounded-xl shadow border border-gray-200">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 text-sm rounded-lg ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              ← Prev
            </button>

            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={i} className="px-4 py-2 text-gray-500">
                  ...
                </span>
              ) : (
                <button
                  key={i}
                  onClick={() => paginate(Number(p))}
                  className={`px-4 py-2 text-sm rounded-lg ${
                    currentPage === p
                      ? "bg-indigo-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === meta.totalPages}
              className={`px-4 py-2 text-sm rounded-lg ${
                currentPage === meta.totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Next →
            </button>
          </nav>
        </div>
      )}

      {/* Add Modal + Edit Modal তোমার আগের মতোই থাকবে */}
      {/* — এখানে জায়গা বাঁচাতে তোমার আগের modal UI 그대로 রাখবে — */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold">Add New Blog Post</h3>
              <button onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <div className="overflow-y-auto p-6">
              <form onSubmit={handleAddNewPost}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Post Title
                    </label>
                    <input
                      type="text"
                      name="post_title"
                      value={newPost.post_title}
                      onChange={handleNewPostChange}
                      className="w-full p-3 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={newPost.category}
                      onChange={handleNewPostChange}
                      className="w-full p-3 border rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-1">Tags</label>
                  <input
                    type="text"
                    name="tags"
                    value={newPost.tags}
                    onChange={handleNewPostChange}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-1">
                    Post Content
                  </label>
                  <RichTextEditor
                    value={newPost.post_content}
                    onChange={(content) =>
                      setNewPost((prev) => ({
                        ...prev,
                        post_content: content,
                      }))
                    }
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white rounded-md bg-gradient-to-r from-blue-600 to-indigo-700"
                  >
                    Add Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {selectedBlog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold">Edit Blog Post</h3>
              <button onClick={() => setSelectedBlog(null)}>✕</button>
            </div>

            <div className="overflow-y-auto p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Post Title
                    </label>
                    <input
                      type="text"
                      name="post_title"
                      value={formData.post_title}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-1">Tags</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-1">
                    Post Content
                  </label>
                  <RichTextEditor
                    value={formData.post_content}
                    onChange={(content) =>
                      setFormData((prev) => ({
                        ...prev,
                        post_content: content,
                      }))
                    }
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setSelectedBlog(null)}
                    className="px-4 py-2 border rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white rounded-md bg-gradient-to-r from-blue-600 to-indigo-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
