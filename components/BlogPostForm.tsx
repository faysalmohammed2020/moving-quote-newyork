import React, { useState, useEffect } from "react";

interface BlogPost {
  id: number;
  title: string;
  content: string;
  author: string;
}

interface BlogPostFormProps {
  blog?: BlogPost | null; // Accept an optional blog object
  closeForm: () => void;  // Function to close the form
}

const BlogPostForm: React.FC<BlogPostFormProps> = ({ blog, closeForm }) => {
  const [formData, setFormData] = useState<BlogPost>({
    id: 0,
    title: "",
    content: "",
    author: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  // Populate form data when editing
  useEffect(() => {
    if (blog) {
      setFormData(blog);
      setIsEditing(true);
    }
  }, [blog]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Submit logic (either add or update the blog post)
    if (isEditing) {
      console.log("Updating blog post:", formData);
    } else {
      console.log("Creating new blog post:", formData);
    }

    // Clear the form and close the modal
    setFormData({ id: 0, title: "", content: "", author: "" });
    setIsEditing(false);
    closeForm();
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter blog title"
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Write your blog content"
          rows={4}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="author" className="block text-sm font-medium text-gray-700">
          Author
        </label>
        <input
          type="text"
          id="author"
          name="author"
          value={formData.author}
          onChange={handleChange}
          placeholder="Enter author name"
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          className="px-4 py-2 bg-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-400"
          onClick={closeForm}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700"
        >
          {isEditing ? "Update Post" : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default BlogPostForm;
