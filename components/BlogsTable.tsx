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
    try { return JSON.stringify(v); } catch { return "[object]"; }
  }
  return String(v);
}

type UPost = {
  ID: number;                 // keep your ID for the table
  post_title: string;
  post_content: string;
  post_status?: string;
  comment_status?: string;
  category?: string;          // <- normalized to string
  tags?: string;              // <- normalized to string
  __fromDB?: boolean;         // used if you wired the API
};

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
    category: "",   // keep as strings for inputs
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

  // OPTIONAL: if you’re also loading DB posts, normalize those too
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
    // call this if you want DB posts merged in; otherwise you can remove it
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

    // If this row came from DB, hit your API (optional)
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

    // If DB-backed, call your PUT (optional)
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

    // Create in DB (optional). If you want only local, comment out this block and use the local add below it.
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
            post_content: typeof created.post_content === "string" ? created.post_content : toLabel(created.post_content),
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

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Blog Management: {filteredPosts.length}</h1>

      {/* Controls */}
      <div className="flex justify-end mb-6">
        <div>
          <input
            type="text"
            placeholder="Search blogs by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-auto mt-8 p-2 mr-4 border rounded"
          />
        </div>
        <div className="mt-8">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Add New Post
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="scrollbar max-h-[350px] overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">ID</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Title</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Category</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase">Status</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-700 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-6 py-4" colSpan={5}>Loading...</td>
              </tr>
            ) : (
              filteredPosts.map((blog, index) => (
                <tr key={blog.ID} className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} border-b`}>
                  <td className="px-6 py-4 text-gray-700">{blog.ID}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <Link href={`/blogs/${blog.ID}`}>{blog.post_title}</Link>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{toLabel(blog.category) || "-"}</td>
                  <td className="px-6 py-4 text-gray-700">{toLabel(blog.post_status) || "Draft"}</td>
                  <td className="flex px-6 py-4 justify-end">
                    <button
                      onClick={() => handleEdit(blog)}
                      className="bg-blue-500 text-white font-medium text-sm py-2 px-4 rounded-lg hover:bg-blue-600 transition-transform transform hover:scale-105 shadow-sm"
                      title="Edit Blog"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(blog.ID)}
                      className="bg-red-500 text-white font-medium text-sm py-2 px-4 rounded-lg hover:bg-red-600 transition-transform transform hover:scale-105 shadow-sm ml-2"
                      title="Delete Blog"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add New Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-2/3" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium mb-4">Add New Blog Post</h3>
            <form onSubmit={handleAddNewPost}>
              <div className="mb-4">
                <label htmlFor="post_title" className="block">Post Title</label>
                <input
                  type="text"
                  id="post_title"
                  name="post_title"
                  value={newPost.post_title}
                  onChange={handleNewPostChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="category" className="block">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={newPost.category}
                  onChange={handleNewPostChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="tags" className="block">Tags</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={newPost.tags}
                  onChange={handleNewPostChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="post_content" className="block">Post Content</label>
                <RichTextEditor
                  value={newPost.post_content}
                  onChange={(content) => setNewPost((prev) => ({ ...prev, post_content: content }))}
                />
              </div>
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 font-medium px-4 py-2 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  Add Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-2/3" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium mb-4">Edit Blog</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="post_title" className="block">Post Title</label>
                <input
                  type="text"
                  id="post_title"
                  name="post_title"
                  value={formData.post_title}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="category" className="block">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="tags" className="block">Tags (comma separated)</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="post_content" className="block">Post Content</label>
                <RichTextEditor
                  value={formData.post_content}
                  onChange={(content) => setFormData((prev) => ({ ...prev, post_content: content }))}
                />
              </div>
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setSelectedBlog(null)}
                  className="text-gray-500 font-medium px-4 py-2 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllBlogs;
