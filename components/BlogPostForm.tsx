"use client";

import React, { useEffect, useMemo, useState } from "react";

const API_URL = "/api/blogs";

export interface BlogPostDTO {
  id: number;
  post_title: string;
  post_content: string;     // We send/receive plain HTML string (stored in Prisma Json)
  category: string;
  tags?: string | null;
  post_status?: string | null;
  post_excerpt?: string | null;
  post_author?: number | null;
  createdAt?: string;
}

interface BlogPostFormProps {
  blog?: BlogPostDTO | null;     // when provided -> edit mode
  closeForm: () => void;
  onSaved?: (saved: BlogPostDTO) => void; // parent can refresh table
}

const BlogPostForm: React.FC<BlogPostFormProps> = ({ blog, closeForm, onSaved }) => {
  const isEditing = !!blog?.id;

  const [formData, setFormData] = useState<BlogPostDTO>({
    id: 0,
    post_title: "",
    post_content: "",
    category: "",
    tags: "",
    post_status: "Draft",
    post_excerpt: "",
    post_author: undefined,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // hydrate form in edit mode
  useEffect(() => {
    if (blog) {
      setFormData({
        id: blog.id ?? 0,
        post_title: blog.post_title ?? "",
        post_content:
          typeof blog.post_content === "string" ? blog.post_content : JSON.stringify(blog.post_content ?? ""),
        category: blog.category ?? "",
        tags: blog.tags ?? "",
        post_status: blog.post_status ?? "Draft",
        post_excerpt: blog.post_excerpt ?? "",
        post_author: blog.post_author ?? undefined,
        createdAt: blog.createdAt,
      });
    }
  }, [blog]);

  const canSubmit = useMemo(() => {
    return !!formData.post_title?.trim() && !!formData.post_content?.trim() && !!formData.category?.trim();
  }, [formData.post_title, formData.post_content, formData.category]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "post_author") {
        const num = value === "" ? undefined : Number(value);
        return { ...prev, post_author: Number.isNaN(num) ? undefined : num };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!canSubmit) {
      setError("Title, content, and category are required.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        id: formData.id,
        post_title: formData.post_title,
        post_content: formData.post_content, // HTML string; your route stores it in Json field
        category: formData.category,
        tags: formData.tags ?? "",
        // The POST route also allows these:
        post_status: formData.post_status ?? "Draft",
        post_excerpt: formData.post_excerpt ?? "",
        post_author: formData.post_author ?? undefined,
      };

      const res = await fetch(API_URL, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEditing
            ? // PUT expects: { id, post_title, post_content, category, tags }
              {
                id: payload.id,
                post_title: payload.post_title,
                post_content: payload.post_content,
                category: payload.category,
                tags: payload.tags,
              }
            : // POST accepts more
              {
                post_title: payload.post_title,
                post_content: payload.post_content,
                category: payload.category,
                tags: payload.tags,
                post_status: payload.post_status,
                post_excerpt: payload.post_excerpt,
                post_author: payload.post_author,
              }
        ),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `Request failed (${res.status})`);
      }

      const saved: BlogPostDTO = await res.json();
      if (onSaved) onSaved(saved);

      // reset & close
      setFormData({
        id: 0,
        post_title: "",
        post_content: "",
        category: "",
        tags: "",
        post_status: "Draft",
        post_excerpt: "",
        post_author: undefined,
      });
      closeForm();
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="post_title" className="block text-sm font-medium text-gray-700">
          Title *
        </label>
        <input
          type="text"
          id="post_title"
          name="post_title"
          value={formData.post_title}
          onChange={handleChange}
          placeholder="Enter blog title"
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div>
        <label htmlFor="post_content" className="block text-sm font-medium text-gray-700">
          Content (HTML) *
        </label>
        <textarea
          id="post_content"
          name="post_content"
          value={formData.post_content}
          onChange={handleChange}
          placeholder="Write your blog content (HTML or plain text)"
          rows={6}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category *
        </label>
        <input
          type="text"
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="e.g. Tech"
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          Tags
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags ?? ""}
          onChange={handleChange}
          placeholder="e.g. nextjs, prisma"
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="post_status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="post_status"
            name="post_status"
            value={formData.post_status ?? "Draft"}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
          </select>
        </div>

        <div>
          <label htmlFor="post_author" className="block text-sm font-medium text-gray-700">
            Author ID
          </label>
          <input
            type="number"
            id="post_author"
            name="post_author"
            value={formData.post_author ?? ""}
            onChange={handleChange}
            placeholder="Numeric user id (optional)"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="post_excerpt" className="block text-sm font-medium text-gray-700">
          Excerpt
        </label>
        <textarea
          id="post_excerpt"
          name="post_excerpt"
          value={formData.post_excerpt ?? ""}
          onChange={handleChange}
          placeholder="Short summary (optional)"
          rows={3}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          className="px-4 py-2 bg-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-400"
          onClick={closeForm}
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:opacity-60"
          disabled={!canSubmit || submitting}
        >
          {submitting ? (isEditing ? "Updating..." : "Submitting...") : isEditing ? "Update Post" : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default BlogPostForm;
