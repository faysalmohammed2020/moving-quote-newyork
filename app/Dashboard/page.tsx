"use client";
import React, { useState } from "react";
import { postdata } from "@/app/(main)/data/postdata";
import { FaBlog, FaFileAlt, FaComments, FaHeart } from "react-icons/fa";
import BlogPostForm from "@/components/blogForm";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const [isFormVisible, setFormVisible] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const { data: session } = useSession();
  const router = useRouter();

  const openForm = (blog = null) => {
    setSelectedBlog(blog);
    setFormVisible(true);
  };

  const closeForm = () => {
    setFormVisible(false);
    setSelectedBlog(null);
  };

  return (
    <>
      <div className="bg-gray-50 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Welcome Admin! 👋</h1>
            <p className="text-gray-500">Good evening!</p>
          </div>
          <div className="text-gray-500">Today: December 28, 2024</div>
          {session && (
             <button
             onClick={() => signOut().then(() => router.push("/sign-in"))}
             className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
           >
             Logout
           </button>
          )}
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Blogs"
            value={postdata.length}
            icon={<FaBlog className="text-blue-500 text-2xl" />}
          />
          <StatCard
            title="Total Pages"
            value="56"
            icon={<FaFileAlt className="text-green-500 text-2xl" />}
          />
          <StatCard
            title="Comments"
            value="34,267"
            icon={<FaComments className="text-yellow-500 text-2xl" />}
          />
          <StatCard
            title="Total Likes"
            value="65.26K"
            icon={<FaHeart className="text-red-500 text-2xl" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Visitors</h3>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <span>Chart Placeholder</span>
              </div>
            </div>
          </div>
          <div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Recent Blogs</h3>
              </div>
              <BlogList openForm={openForm} />
            </div>
          </div>
        </div>
      </div>

      {isFormVisible && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeForm}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-md w-1/3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{selectedBlog ? "Edit Blog" : "Create a New Blog"}</h3>
              <button
                onClick={closeForm}
                className="text-red-500 text-xl font-semibold"
              >
                &times;
              </button>
            </div>
            <BlogPostForm blog={selectedBlog} closeForm={closeForm} />
          </div>
        </div>
      )}
    </>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-4 rounded-lg shadow flex items-center">
    <div className="p-3 bg-gray-100 rounded-lg mr-4">{icon}</div>
    <div>
      <h4 className="text-sm text-gray-500">{title}</h4>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  </div>
);

const BlogList = ({ openForm }) => {
  const blogs = postdata.slice(0, 8);
  return (
    <ul className="scrollbar max-h-[250px] divide-y divide-gray-200 overflow-y-auto">
      {blogs.map((blog, index) => (
        <li key={index} className="py-4 flex justify-between items-center">
          <div>
            <p className="font-medium">{blog.post_title}</p>
            <p className="text-sm text-gray-500">
              {blog.post_status} Comments • {blog.comment_status} Views
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default Dashboard;
