"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { postdata } from "@/app/(main)/data/postdata";
import RichTextEditor from "./RichTextEditor";

const API_URL = "/api/blogs";

// ---- Helpers: safely turn anything into a displayable string
function toLabel(v: any): string {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return v.map(toLabel).join(", ");
  // common shapes: {name}, {title}, or {id,name}
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
  ID: number; // UI will use this for key and URLs
  post_title: string;
  post_content: string;
  post_status?: string;
  comment_status?: string;
  category?: string; // normalized to string
  tags?: string; // normalized to string
  __fromDB?: boolean; // true if row came from DB
};

function setStatusLocal(
  setPosts: React.Dispatch<React.SetStateAction<UPost[]>>,
  id: number,
  next: "Draft" | "Published"
) {
  setPosts((prev) => prev.map((p) => (p.ID === id ? { ...p, post_status: next } : p)));
}

const AllBlogs: React.FC = () => {
  // seed from your postdata and normalize category/tags to strings
  const [posts, setPosts] = useState<UPost[]>(
    (postdata as any[]).map((p) => ({
      ID: p.ID,
      post_title: p.post_title,
      post_content: p.post_content ?? "",
      post_status: p.post_status ?? "Draft",
      comment_status: p.comment_status ?? "Open",
      category: toLabel((p as any).category),
      tags: toLabel((p as any).tags),
      __fromDB: false,
    }))
  );

  const [loading, setLoading] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<UPost | null>(null);
  const [formData, setFormData] = useState({
    post_title: "",
    post_content: "",
    category: "", // keep as strings for inputs
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

  // Load posts from DB and merge into table (keeps postdata too)
  const loadDbPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL, { cache: "no-store" });
      if (!res.ok) return; // keep UI working with postdata-only
      const dbRows = await res.json();
      const normalized: UPost[] = (dbRows as any[]).map((r) => ({
        ID: r.id,
        post_title: r.post_title ?? "",
        post_content: typeof r.post_content === "string" ? r.post_content : toLabel(r.post_content),
        post_status: r.post_status ?? "Draft",
        comment_status: "Open",
        category: toLabel(r.category),
        tags: toLabel(r.tags),
        __fromDB: true,
      }));
      setPosts((prev) => {
        const m = new Map(prev.map((p) => [p.ID, p]));
        normalized.forEach((dbp) => m.set(dbp.ID, dbp));
        return Array.from(m.values()).sort((a, b) => b.ID - a.ID);
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDbPosts();
  }, []);

  const filteredPosts = useMemo(
    () => posts.filter((post) => post.post_title.toLowerCase().includes(searchQuery.toLowerCase())),
    [posts, searchQuery]
  );

  const handleEdit = (blog: UPost) => {
    setSelectedBlog(blog);
    setFormData({
      post_title: blog.post_title,
      post_content: blog.post_content ?? "",
      category: toLabel(blog.category),
      tags: toLabel(blog.tags),
    });
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this blog post?");
    if (!confirmDelete) return;

    const target = posts.find((p) => p.ID === id);
    if (!target) return;

    // If this row came from DB, hit your API
    if (target.__fromDB) {
      try {
        const res = await fetch(API_URL, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || "Failed to delete");
        }
      } catch {
        alert("Failed to delete the post.");
        return;
      }
    }

    setPosts((prev) => prev.filter((p) => p.ID !== id));
    alert("Blog post deleted successfully!");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBlog) return;

    if (!formData.post_title.trim() || !formData.post_content.trim() || !formData.category.trim()) {
      alert("Title, Content, and Category are required.");
      return;
    }

    const updatedLocal: UPost = {
      ...selectedBlog,
      post_title: formData.post_title,
      post_content: formData.post_content,
      category: toLabel(formData.category),
      tags: toLabel(formData.tags),
    };

    // If DB-backed, call your PUT
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
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || "Update failed");
        }
      } catch {
        alert("Failed to save changes.");
        return;
      }
    }

    setPosts((prev) => prev.map((p) => (p.ID === updatedLocal.ID ? updatedLocal : p)));
    setSelectedBlog(null);
    alert("Changes saved!");
  };

  const handleNewPostChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewPost((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleAddNewPost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPost.post_title.trim() || !newPost.post_content.trim() || !newPost.category.trim()) {
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
          post_excerpt: "",
          post_author: undefined,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setPosts((prev) => [
          {
            ID: created.id,
            post_title: created.post_title,
            post_content:
              typeof created.post_content === "string"
                ? created.post_content
                : toLabel(created.post_content),
            post_status: created.post_status ?? "Draft",
            comment_status: "Open",
            category: toLabel(created.category),
            tags: toLabel(created.tags),
            __fromDB: true,
          },
          ...prev,
        ]);
      } else {
        // fallback to local-only add if server rejects
        setPosts((prev) => [
          {
            ID: prev.length ? Math.max(...prev.map((p) => p.ID)) + 1 : 1,
            post_title: newPost.post_title,
            post_content: newPost.post_content,
            post_status: "Draft",
            comment_status: "Open",
            category: toLabel(newPost.category),
            tags: toLabel(newPost.tags),
            __fromDB: false,
          },
          ...prev,
        ]);
      }
    } catch {
      // local-only add
      setPosts((prev) => [
        {
          ID: prev.length ? Math.max(...prev.map((p) => p.ID)) + 1 : 1,
          post_title: newPost.post_title,
          post_content: newPost.post_content,
          post_status: "Draft",
          comment_status: "Open",
          category: toLabel(newPost.category),
          tags: toLabel(newPost.tags),
          __fromDB: false,
        },
        ...prev,
      ]);
    }

    setNewPost({ post_title: "", post_content: "", category: "", tags: "" });
    setIsModalOpen(false);
    alert("New post added successfully!");
  };

  // Publish / Unpublish (status toggle)
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
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Failed to publish");
      }
      setStatusLocal(setPosts, post.ID, "Published");
      alert("Post published!");
    } catch (e) {
      console.error(e);
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
      alert("Post set to Draft.");
    } catch {
      alert("Could not change status.");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Blog Management</h1>
        <p className="text-gray-600">Manage all your blog posts in one place</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <h3 className="text-lg font-medium text-gray-700">Total Posts</h3>
          <p className="text-3xl font-bold text-gray-900">{posts.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <h3 className="text-lg font-medium text-gray-700">Published</h3>
          <p className="text-3xl font-bold text-gray-900">
            {posts.filter(p => p.post_status === "Published").length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
          <h3 className="text-lg font-medium text-gray-700">Drafts</h3>
          <p className="text-3xl font-bold text-gray-900">
            {posts.filter(p => p.post_status === "Draft").length}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search blogs by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all transform hover:-translate-y-0.5 shadow-md flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Post
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td className="px-6 py-8 text-center" colSpan={5}>
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                    <p className="mt-2 text-gray-500">Loading posts...</p>
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center" colSpan={5}>
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No posts found</h3>
                    <p className="mt-1 text-gray-500">Try adjusting your search query or create a new post.</p>
                  </td>
                </tr>
              ) : (
                filteredPosts.map((blog, index) => (
                  <tr key={blog.ID} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{blog.ID}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">
                      <Link href={`/blogs/${blog.ID}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                        {blog.post_title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {toLabel(blog.category) || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${(blog.post_status ?? "Draft") === "Published" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"}`}>
                        {toLabel(blog.post_status) || "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {(blog.post_status ?? "Draft") === "Draft" ? (
                          <button
                            onClick={() => handlePublish(blog)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors shadow-sm"
                            title="Publish"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Publish
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnpublish(blog)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors shadow-sm"
                            title="Set Draft"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Unpublish
                          </button>
                        )}

                        <button
                          onClick={() => handleEdit(blog)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          title="Edit Blog"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(blog.ID)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors shadow-sm"
                          title="Delete Blog"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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

      {/* Add New Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Add New Blog Post</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <form onSubmit={handleAddNewPost}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="post_title" className="block text-sm font-medium text-gray-700 mb-1">
                      Post Title
                    </label>
                    <input
                      type="text"
                      id="post_title"
                      name="post_title"
                      value={newPost.post_title}
                      onChange={handleNewPostChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={newPost.category}
                      onChange={handleNewPostChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                    Tags 
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={newPost.tags}
                    onChange={handleNewPostChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="post_content" className="block text-sm font-medium text-gray-700 mb-1">
                    Post Content
                  </label>
                  <RichTextEditor
                    value={newPost.post_content}
                    onChange={(content) => setNewPost((prev) => ({ ...prev, post_content: content }))}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                  >
                    Add Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Edit Blog Post</h3>
              <button 
                onClick={() => setSelectedBlog(null)}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="edit_post_title" className="block text-sm font-medium text-gray-700 mb-1">
                      Post Title
                    </label>
                    <input
                      type="text"
                      id="edit_post_title"
                      name="post_title"
                      value={formData.post_title}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="edit_category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      id="edit_category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label htmlFor="edit_tags" className="block text-sm font-medium text-gray-700 mb-1">
                    Tags 
                  </label>
                  <input
                    type="text"
                    id="edit_tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="edit_post_content" className="block text-sm font-medium text-gray-700 mb-1">
                    Post Content
                  </label>
                  <RichTextEditor
                    value={formData.post_content}
                    onChange={(content) => setFormData((prev) => ({ ...prev, post_content: content }))}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setSelectedBlog(null)}
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
    </div>
  );
};

export default AllBlogs;