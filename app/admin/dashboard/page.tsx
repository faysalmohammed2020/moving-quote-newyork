"use client";
import React, { useEffect, useState } from "react";
import { postdata } from "@/app/(main)/data/postdata";
import { FaBlog, FaFileAlt, FaComments, FaHeart, FaSignOutAlt, FaCalendarAlt, FaChartLine } from "react-icons/fa";
import { IoIosAddCircle } from "react-icons/io";
import BlogPostForm from "@/components/blogForm";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
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
  const [submissions, setSubmissions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [statsRes, subRes, respRes] = await Promise.all([
          fetch("/api/admin/leads/stats"),
          axios.get("/api/admin/leads/submissions"),
          axios.get("/api/admin/leads/responses")
        ]);
        
        const statsData = await statsRes.json();
        setStats({
          dailyLeads: statsData.dailyLeads,
          dailyResponses: statsData.dailyResponses,
        });
        setTotalLeads(statsData.totalLeads);
        setTotalResponses(statsData.totalResponses);
        setSubmissions(subRes.data);
        setResponses(respRes.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
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
    <div className="bg-gray-50 min-h-screen w-full p-6">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Welcome back, {session?.user?.name || 'Admin'}! Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <span className="text-gray-600 text-sm flex items-center">
            <FaCalendarAlt className="mr-2" />
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
          {/* {session && (
            <button
              onClick={() =>
                signOut({
                  redirect: true,
                  callbackUrl: "/sign-in",
                })
              }
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center text-sm"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          )} */}
        </div>
      </header>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Blogs"
          value={postdata.length}
          icon={<FaBlog className="text-blue-500 text-xl" />}
          color="bg-blue-100"
          textColor="text-blue-600"
        />
        <StatCard
          title="Total Submissions"
          value={totalLeads}
          icon={<FaFileAlt className="text-green-500 text-xl" />}
          color="bg-green-100"
          textColor="text-green-600"
        />
        <StatCard
          title="Total Responses"
          value={totalResponses}
          icon={<FaComments className="text-purple-500 text-xl" />}
          color="bg-purple-100"
          textColor="text-purple-600"
        />
        <StatCard
          title="Engagement Rate"
          value="72.8%"
          icon={<FaHeart className="text-red-500 text-xl" />}
          color="bg-red-100"
          textColor="text-red-600"
        />
      </div>

      {/* Analytics Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <FaChartLine className="mr-2 text-indigo-500" />
            Weekly Performance
          </h2>
          <select className="text-sm border rounded-md px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-100">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={stats.dailyLeads.map((lead, index) => ({
                date: lead.date,
                leads: lead.count,
                responses: stats.dailyResponses[index]?.count || 0,
              }))}
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: "#6b7280" }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                }}
                labelStyle={{ color: "#374151", fontWeight: "bold", fontSize: "14px" }}
                itemStyle={{ fontSize: "14px", color: "#4b5563" }}
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle" 
                iconSize={10}
                wrapperStyle={{ fontSize: "12px", paddingBottom: "20px" }}
              />
              <Bar
                dataKey="leads"
                fill="url(#leadGradient)"
                radius={[4, 4, 0, 0]}
                name="Submissions"
                barSize={24}
              />
              <Line
                type="monotone"
                dataKey="responses"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: "#16a34a" }}
                activeDot={{ r: 6, fill: "#16a34a" }}
                name="Responses"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Submissions Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Recent Lead Submissions</h2>
            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {submissions.length} Total
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 bg-gray-50 uppercase tracking-wider">
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.slice(0, 5).map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {lead.firstName} {lead.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{lead.phone || "—"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.email || "—"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-500">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {submissions.length > 5 && (
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-center">
              <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                View all submissions
              </button>
            </div>
          )}
        </div>

        {/* Responses Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Leads with Responses</h2>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {responses.length} Total
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 bg-gray-50 uppercase tracking-wider">
                  <th className="px-6 py-3 text-left">Lead ID</th>
                  <th className="px-6 py-3 text-left">Contact</th>
                  <th className="px-6 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {responses.slice(0, 5).map((leadId, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{leadId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{leadId.email || "—"}</div>
                      <div className="text-xs text-gray-500">{leadId.phone || "—"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-500">
                        {new Date(leadId.date).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {responses.length > 5 && (
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-center">
              <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                View all responses
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Blogs Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Recent Blog Posts</h2>
          <button 
            onClick={() => openForm()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center"
          >
            <IoIosAddCircle className="mr-1 text-lg" />
            New Post
          </button>
        </div>
        <BlogList openForm={openForm} />
      </div>

      {/* Blog Form Modal */}
      {isFormVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                {selectedBlog ? "Edit Blog Post" : "Create New Blog Post"}
              </h3>
              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <BlogPostForm blog={selectedBlog} closeForm={closeForm} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color, textColor }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center">
      <div className={`p-3 rounded-lg ${color} ${textColor}`}>
        {icon}
      </div>
      <div className="ml-4">
        <h4 className="text-sm font-medium text-gray-500">{title}</h4>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
    </div>
  </div>
);

const BlogList = ({ openForm }) => {
  const blogs = postdata.slice(0, 5);
  
  return (
    <div className="divide-y divide-gray-100">
      {blogs.map((blog, index) => (
        <div
          key={index}
          className="py-4 hover:bg-gray-50 px-2 rounded-md cursor-pointer transition flex justify-between items-center"
          onClick={() => openForm(blog)}
        >
          <div>
            <p className="font-semibold text-gray-800">{blog.post_title}</p>
            <p className="text-sm text-gray-500 mt-1">
              {blog.post_status} • {blog.comment_status} Comments
            </p>
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {new Date(blog.post_date).toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;