"use client";
import React, { useEffect, useState } from "react";
import { postdata } from "@/app/(main)/data/postdata";
import { FaBlog, FaFileAlt, FaComments, FaHeart } from "react-icons/fa";
import BlogPostForm from "@/components/blogForm";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const [isFormVisible, setFormVisible] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const { data: session } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState({ dailyLeads: [], dailyResponses: [] });
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalResponses, setTotalResponses] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/leads/stats");
        const data = await res.json();
        console.log("📈 Admin Dashboard Stats:", data);
        setStats({ dailyLeads: data.dailyLeads, dailyResponses: data.dailyResponses });
        setTotalLeads(data.totalLeads);
        setTotalResponses(data.totalResponses);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };

    fetchStats();
  }, []);

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
          <div className="text-gray-500">Today: {new Date().toLocaleDateString()}</div>
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
            title="Total Leads"
            value={totalLeads}
            icon={<FaFileAlt className="text-green-500 text-2xl" />}
          />
          <StatCard
            title="Total Responses"
            value={totalResponses}
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
              <h3 className="text-lg font-medium mb-4">Daily Submissions</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.dailyLeads}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" name="Leads" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Daily Responses</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.dailyResponses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#22c55e" name="Responses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Recent Blogs</h3>
            </div>
            <BlogList openForm={openForm} />
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
