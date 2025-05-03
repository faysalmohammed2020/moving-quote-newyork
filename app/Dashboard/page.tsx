"use client";
import React, { useEffect, useState } from "react";
import { postdata } from "@/app/(main)/data/postdata";
import { FaBlog, FaFileAlt, FaComments, FaHeart } from "react-icons/fa";
import BlogPostForm from "@/components/blogForm";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ComposedChart,
  Legend,
  Line,
} from "recharts";
import axios from "axios";
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
        setStats({
          dailyLeads: data.dailyLeads,
          dailyResponses: data.dailyResponses,
        });
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
  const [submissions, setSubmissions] = useState([]);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [subRes, respRes] = await Promise.all([
        axios.get("/api/admin/leads/submissions"),
        axios.get("/api/admin/leads/responses"),
      ]);
      setSubmissions(subRes.data);
      setResponses(respRes.data);
    };

    fetchData();
  }, []);

  return (
    <div className="bg-gray-50 p-8 min-h-screen w-full">
      <header className="flex flex-wrap justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome Admin! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Hope you're having a productive day!
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600 text-sm">
            📅{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
          {session && (
            <button
              onClick={() => signOut().then(() => router.push("/sign-in"))}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatCard
          title="Total Blogs"
          value={postdata.length}
          icon={<FaBlog className="text-blue-500 text-xl" />}
          color="text-blue-500"
        />
        <StatCard
          title="Total Submission"
          value={totalLeads}
          icon={<FaFileAlt className="text-green-500 text-xl" />}
          color="text-green-500"
        />
        <StatCard
          title="Total Responses"
          value={totalResponses}
          icon={<FaComments className="text-yellow-500 text-xl" />}
          color="text-yellow-500"
        />
        <StatCard
          title="Total Likes"
          value="65.26K"
          icon={<FaHeart className="text-red-500 text-xl" />}
          color="text-red-500"
        />
      </div>

      <div className="space-y-12">
        {/* Submissions Table */}
        <div>
          <h2 className="text-xl font-semibold">Lead Submissions</h2>
          <table className="min-w-full table-auto border mt-4">
            <thead className="bg-gray-100 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">IP</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((lead) => (
                <tr key={lead.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {lead.firstName} {lead.lastName}
                  </td>
                  <td className="px-6 py-4">{lead.email || "—"}</td>
                  <td className="px-6 py-4">{lead.phone || "—"}</td>
                  <td className="px-6 py-4">{lead.fromIp || "—"}</td>
                  <td className="px-6 py-4">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Responses Table */}
        <div>
          <h2 className="text-xl font-semibold ">Leads with Responses</h2>
          <table className="min-w-full table-auto border mt-4 mb-10">
            <thead className="bg-green-100 text-xs uppercase text-green-700">
              <tr>
                <th className="px-6 py-3">Lead ID</th>
                <th className="px-6 py-3">Response</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((leadId, index) => (
                <tr key={index} className="border-b hover:bg-green-50">
                  <td className="px-6 py-4">{leadId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="col-span-1 lg:col-span-2">
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>📊</span> Weekly Insights
          </h2>
          <ResponsiveContainer width="100%" height={360}>
            <ComposedChart
              data={stats.dailyLeads.map((lead, index) => ({
                date: lead.date,
                leads: lead.count,
                responses: stats.dailyResponses[index]?.count || 0,
              }))}
              margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
            >
              <defs>
                <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient
                  id="responseGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#6b7280" }} />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderColor: "#ddd",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#374151", fontWeight: "bold" }}
                itemStyle={{ fontSize: "14px", color: "#4b5563" }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar
                dataKey="leads"
                fill="url(#leadGradient)"
                radius={[6, 6, 0, 0]}
                name="Submission"
                barSize={28}
              />
              <Line
                type="monotone"
                dataKey="responses"
                stroke="#16a34a"
                strokeWidth={3}
                dot={{ r: 5, strokeWidth: 2, fill: "#16a34a" }}
                name="Responses"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-10">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              📝 Recent Blogs
            </h3>
          </div>
          <BlogList openForm={openForm} />
        </div>
      </div>

      {isFormVisible && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeForm}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {selectedBlog ? "Edit Blog" : "Create a New Blog"}
              </h3>
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
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>{icon}</div>
      <div>
        <h4 className="text-sm font-medium text-gray-500">{title}</h4>
        <p className="text-xl font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  </div>
);

const BlogList = ({ openForm }) => {
  const blogs = postdata.slice(0, 8);
  return (
    <ul className="divide-y divide-gray-100 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
      {blogs.map((blog, index) => (
        <li
          key={index}
          className="py-4 hover:bg-gray-50 px-2 rounded-md cursor-pointer transition"
        >
          <div>
            <p className="font-semibold text-gray-800">{blog.post_title}</p>
            <p className="text-sm text-gray-500 mt-1">
              {blog.post_status} Comments • {blog.comment_status} Views
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default Dashboard;
