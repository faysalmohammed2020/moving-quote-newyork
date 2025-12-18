"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useTransition,
} from "react";
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
  Area,
} from "recharts";
import {
  FaFileAlt,
  FaEye,
  FaEdit,
  FaTrash,
  FaGlobeAmericas,
  FaRegChartBar,
  FaBlog,
} from "react-icons/fa";

type ApiBlog = {
  id: number;
  post_title: string;
  post_content?: unknown;
  category?: string;
  tags?: string | string[] | null;
  post_status: string;
  createdAt?: string;
  post_date?: string;
};

interface Blog {
  id: number;
  post_title: string;
  post_status: string;
  createdAt?: string | null;
  _d?: Date | null; // ✅ precomputed date
}

type Lead = {
  id: number;
  key?: string;
  leadType?: string;
  leadSource?: string;
  referer?: string;
  fromIp: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneExt?: string | null;
  fromState: string;
  fromStateCode: string;
  fromCity: string;
  fromZip: string;
  toState: string;
  toStateCode: string;
  toCity: string;
  toZip: string;
  moveDate?: string | null;
  moveSize: string;
  selfPackaging?: boolean | null;
  hasCar?: boolean | null;
  carMake?: string | null;
  carModel?: string | null;
  carMakeYear?: string | null;
  createdAt: string;
};

type TrendInfo = { value: string; isPositive: boolean };

// ---------- helpers ----------
function uniq<T>(arr: T[], keyFn: (x: T) => string | number | null | undefined) {
  const set = new Set<string | number>();
  for (const item of arr) {
    const k = keyFn(item);
    if (k !== null && k !== undefined && k !== "") set.add(k);
  }
  return set.size;
}
function between(d: Date, start: Date, end: Date) {
  return d >= start && d < end;
}
function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, m: number) {
  return new Date(d.getFullYear(), d.getMonth() + m, 1);
}
function addDays(d: Date, n: number) {
  return new Date(d.getTime() + n * 24 * 60 * 60 * 1000);
}
function pctChange(curr: number, prev: number): TrendInfo {
  if (prev <= 0) {
    if (curr <= 0) return { value: "0%", isPositive: false };
    return { value: "+100%", isPositive: true };
  }
  const delta = ((curr - prev) / prev) * 100;
  const val = `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`;
  return { value: val, isPositive: delta >= 0 };
}

const SUBS_PAGE_SIZE = 50;
const numberFormatter = new Intl.NumberFormat();

// ✅ idle callback helper
const runIdle = (cb: () => void) => {
  if (typeof window === "undefined") return cb();
  if (window.requestIdleCallback) {
    window.requestIdleCallback(cb, { timeout: 500 });
  } else {
    setTimeout(cb, 0);
  }
};

// ---------- Skeleton helpers ----------
const SkeletonBox: React.FC<{ className?: string }> = React.memo(
  function SkeletonBox({ className = "" }) {
    return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
  }
);
SkeletonBox.displayName = "SkeletonBox";

const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = React.memo(
  function TableSkeleton({ rows = 5, cols = 4 }) {
    return (
      <div className="p-4">
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="grid gap-3"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: cols }).map((__, j) => (
                <SkeletonBox key={j} className="h-4" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
);
TableSkeleton.displayName = "TableSkeleton";

const AdminDashboard: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [totalBlogs, setTotalBlogs] = useState<number>(0);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState<boolean>(true);
  const [errorBlogs, setErrorBlogs] = useState<string | null>(null);

  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [editBlogData, setEditBlogData] = useState<Blog | null>(null);

  const [stats, setStats] = useState({
    dailyLeads: [] as any[],
    dailyResponses: [] as any[],
  });
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalResponses, setTotalResponses] = useState(0);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);

  const [submissions, setSubmissions] = useState<Lead[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [subsLoading, setSubsLoading] = useState<boolean>(true);
  const [subsError, setSubsError] = useState<string | null>(null);
  const [subsPage, setSubsPage] = useState(1);

  const [isPending, startTransition] = useTransition();

  const [showFullSubs, setShowFullSubs] = useState(false);
  const fullSubsRef = useRef<HTMLDivElement | null>(null);
  const [totalVisitorsValue, setTotalVisitorsValue] = useState(0);

useEffect(() => {
  const controller = new AbortController();

  const loadVisitors = async () => {
    try {
      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: "home" }),
        cache: "no-store",
        signal: controller.signal,
      });

      const json: { count?: number } = await res.json();
      setTotalVisitorsValue(json.count || 0);
    } catch {}
  };

  loadVisitors();
  return () => controller.abort();
}, []);


  useEffect(() => {
    if (showFullSubs) return;
    const node = fullSubsRef.current;
    if (!node) return;

    if (!(typeof window !== "undefined" && "IntersectionObserver" in window)) {
      setShowFullSubs(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShowFullSubs(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [showFullSubs]);

  // ---------- Fetch Blogs (FAST + GET ALL) ----------
  useEffect(() => {
    const controller = new AbortController();

    const fetchBlogs = async () => {
      setIsLoadingBlogs(true);
      setErrorBlogs(null);
      try {
        const res = await fetch("/api/blogs?page=1&limit=1000", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch blogs");
        const payload = await res.json();

        const items: ApiBlog[] = Array.isArray(payload)
          ? payload
          : payload.data || payload.items || [];

        const total =
          Array.isArray(payload)
            ? items.length
            : payload.meta?.total || payload.total || items.length;

        // ✅ transform + precompute date once
        const transformed: Blog[] = items.map((item) => {
          const createdAt = item.createdAt ?? item.post_date ?? null;
          const d = createdAt ? new Date(createdAt) : null;
          return {
            id: Number(item.id),
            post_title: String(item.post_title || ""),
            post_status: String(item.post_status ?? "draft"),
            createdAt,
            _d: d && !isNaN(d.getTime()) ? d : null,
          };
        });

        runIdle(() => {
          startTransition(() => {
            setBlogs(transformed);
            setTotalBlogs(total);
          });
        });
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error(err);
        setErrorBlogs("Failed to fetch blogs. Please try again later.");
      } finally {
        setIsLoadingBlogs(false);
      }
    };

    fetchBlogs();
    return () => controller.abort();
  }, []);

  // ---------- Fetch Leads Stats ----------
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const res = await fetch("/api/admin/leads/stats", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed stats");
        const data = await res.json();
        setStats({
          dailyLeads: data.dailyLeads ?? [],
          dailyResponses: data.dailyResponses ?? [],
        });
        setTotalLeads(data.totalLeads ?? 0);
        setTotalResponses(data.totalResponses ?? 0);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // ---------- Fetch Submissions & Responses ----------
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setSubsLoading(true);
      setSubsError(null);
      try {
        const [subRes, respRes] = await Promise.all([
          fetch("/api/admin/leads/submissions", {
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch("/api/admin/leads/responses", {
            cache: "no-store",
            signal: controller.signal,
          }),
        ]);

        if (!subRes.ok || !respRes.ok)
          throw new Error("Failed submissions/responses");

        const [subData, respData] = await Promise.all([
          subRes.json(),
          respRes.json(),
        ]);

        runIdle(() => {
          startTransition(() => {
            setSubmissions(subData ?? []);
            setResponses((respData ?? []).slice(0, 5));
            setSubsPage(1);
          });
        });
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        console.error("Failed to load submissions/responses", e);
        setSubsError("Failed to load submissions.");
      } finally {
        setSubsLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  // ✅ Precompute submissions date ONCE
  const submissionsWithDate = useMemo(
    () =>
      submissions.map((l) => ({
        ...l,
        _d: new Date(l.createdAt),
        _createdFmt: new Date(l.createdAt).toLocaleDateString(),
      })),
    [submissions]
  );

  const blogDates = useMemo(
    () => blogs.map((b) => b._d).filter((d): d is Date => !!d),
    [blogs]
  );

  // ---------- Derived / memoized data ----------
  const recentBlogs = useMemo(() => blogs.slice(0, 5), [blogs]);
  const recentSubmissions = useMemo(
    () => submissionsWithDate.slice(0, 5),
    [submissionsWithDate]
  );

  const weeklyPerformanceData = useMemo(
    () =>
      stats.dailyLeads.map((lead: any, index: number) => ({
        date: lead.date,
        leads: lead.count,
        responses: (stats.dailyResponses[index] as any)?.count || 0,
      })),
    [stats.dailyLeads, stats.dailyResponses]
  );

  const {
    totalVisitorsTrend,
    totalBlogsTrend,
    totalSubmissionsTrend,
  } = useMemo(() => {
    const now = new Date();
    const last30Start = addDays(now, -30);
    const prev30Start = addDays(now, -60);
    const prev30End = last30Start;

    const thisMonthStart = startOfMonth(now);
    const nextMonthStart = addMonths(thisMonthStart, 1);
    const lastMonthStart = addMonths(thisMonthStart, -1);

    const totalVisitorsValue = uniq(submissions, (l) => l.fromIp);

    const last30Leads = submissionsWithDate.filter((l) =>
      between(l._d, last30Start, now)
    );
    const prev30Leads = submissionsWithDate.filter((l) =>
      between(l._d, prev30Start, prev30End)
    );

    const last30Unique = uniq(last30Leads, (l) => l.fromIp);
    const prev30Unique = uniq(prev30Leads, (l) => l.fromIp);
    const totalVisitorsTrend = pctChange(last30Unique, prev30Unique);

    const thisMonthLeads = submissionsWithDate.filter((l) =>
      between(l._d, thisMonthStart, nextMonthStart)
    );
    const lastMonthLeads = submissionsWithDate.filter((l) =>
      between(l._d, lastMonthStart, thisMonthStart)
    );

    const thisMonthVisitorsValue = uniq(thisMonthLeads, (l) => l.fromIp);
    const lastMonthUnique = uniq(lastMonthLeads, (l) => l.fromIp);
    const thisMonthVisitorsTrend = pctChange(
      thisMonthVisitorsValue,
      lastMonthUnique
    );

    const last30Blogs = blogDates.filter((d) =>
      between(d, last30Start, now)
    ).length;
    const prev30Blogs = blogDates.filter((d) =>
      between(d, prev30Start, prev30End)
    ).length;
    const totalBlogsTrend = pctChange(last30Blogs, prev30Blogs);

    const submissionsLast30 = last30Leads.length;
    const submissionsPrev30 = prev30Leads.length;
    const totalSubmissionsTrend = pctChange(
      submissionsLast30,
      submissionsPrev30
    );

    return {
      totalVisitorsValue,
      totalVisitorsTrend,
      thisMonthVisitorsValue,
      thisMonthVisitorsTrend,
      totalBlogsTrend,
      totalSubmissionsTrend,
    };
  }, [submissions, submissionsWithDate, blogDates]);

  const visitorDistribution = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const l of submissions) {
      const stateLabel =
        (l.fromStateCode && l.fromStateCode.trim()) ||
        (l.fromState && l.fromState.trim()) ||
        "Unknown";
      if (!map.has(stateLabel)) map.set(stateLabel, new Set());
      if (l.fromIp) map.get(stateLabel)!.add(l.fromIp);
    }
    const rows = Array.from(map.entries()).map(([name, ips]) => ({
      name,
      count: ips.size,
    }));
    rows.sort((a, b) => b.count - a.count);
    return rows.slice(0, 10);
  }, [submissions]);

  const totalSubsPages = useMemo(
    () => Math.max(1, Math.ceil(submissions.length / SUBS_PAGE_SIZE)),
    [submissions.length]
  );

  const pagedSubmissions = useMemo(
    () =>
      submissionsWithDate.slice(
        (subsPage - 1) * SUBS_PAGE_SIZE,
        subsPage * SUBS_PAGE_SIZE
      ),
    [submissionsWithDate, subsPage]
  );

  const handleSubsPageChange = useCallback(
    (dir: "prev" | "next") => {
      setSubsPage((prev) => {
        if (dir === "prev") return Math.max(1, prev - 1);
        return Math.min(totalSubsPages, prev + 1);
      });
    },
    [totalSubsPages]
  );

  // ---------- Blog actions ----------
  const handleDeleteClick = useCallback(async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this blog post?"))
      return;
    try {
      const resp = await fetch("/api/blogs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!resp.ok) throw new Error("Delete failed");
      startTransition(() => {
        setBlogs((prev) => prev.filter((b) => b.id !== id));
        setTotalBlogs((t) => Math.max(0, t - 1));
      });
    } catch {
      alert("Failed to delete blog post. Please try again.");
    }
  }, []);

  const handleEditClick = useCallback((blog: Blog) => {
    setEditBlogData(blog);
    setIsEditModalVisible(true);
  }, []);

  const handleEditClose = useCallback(() => {
    setIsEditModalVisible(false);
    setEditBlogData(null);
  }, []);

  const handleEditSave = useCallback(async (updatedBlog: Blog) => {
    try {
      const resp = await fetch("/api/blogs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updatedBlog.id,
          post_title: updatedBlog.post_title,
          post_status: updatedBlog.post_status,
        }),
      });
      if (!resp.ok) throw new Error("Update failed");

      startTransition(() => {
        setBlogs((prev) =>
          prev.map((b) =>
            b.id === updatedBlog.id ? { ...b, ...updatedBlog } : b
          )
        );
        setIsEditModalVisible(false);
        setEditBlogData(null);
      });
    } catch {
      alert("Failed to update blog post. Please try again.");
    }
  }, []);

  const fmt = useCallback(
    (v: any) => (v === null || v === undefined || v === "" ? "—" : String(v)),
    []
  );
  const fmtDate = useCallback(
    (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString() : "—"),
    []
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Analytics Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <StatCard
          title="Total Visitors"
          value={numberFormatter.format(totalVisitorsValue)}
          trend={totalVisitorsTrend}
          icon={<FaEye className="text-xl text-blue-500" />}
          color="bg-blue-100"
          loading={false}
        />

        <StatCard
          title="Total Blogs"
          value={isLoadingBlogs ? "…" : totalBlogs}
          trend={totalBlogsTrend}
          icon={<FaBlog className="text-xl text-green-500" />}
          color="bg-green-100"
          loading={isLoadingBlogs || isPending}
        />
        <StatCard
          title="Total Submissions"
          value={totalLeads}
          trend={totalSubmissionsTrend}
          icon={<FaFileAlt className="text-xl text-amber-500" />}
          color="bg-amber-100"
          loading={statsLoading}
        />
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Performance */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FaRegChartBar className="text-indigo-500" /> Weekly Performance
            </h2>
            {/* <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select> */}
          </div>

          {statsLoading ? (
            <SkeletonBox className="h-[300px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={weeklyPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar dataKey="leads" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Area
                  type="monotone"
                  dataKey="responses"
                  fill="#10b981"
                  stroke="#10b981"
                  strokeWidth={2}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Visitor Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaGlobeAmericas className="text-indigo-500" /> Visitor Distribution
          </h3>
          <div className="h-[300px]">
            {subsLoading ? (
              <SkeletonBox className="h-full w-full" />
            ) : subsError ? (
              <div className="h-full flex items-center justify-center text-red-500">
                {subsError}
              </div>
            ) : visitorDistribution.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                No data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={visitorDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* TWO SMALL TABLES */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Lead Submissions */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Lead Submissions
            </h2>
            <span className="text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
              {recentSubmissions.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            {subsLoading ? (
              <TableSkeleton rows={5} cols={3} />
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-3 text-left">Name</th>
                    <th className="px-5 py-3 text-left">Email</th>
                    <th className="px-5 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentSubmissions.length > 0 ? (
                    recentSubmissions.map((lead) => (
                      <tr key={lead.id}>
                        <td className="px-5 py-4 whitespace-nowrap">
                          {lead.firstName} {lead.lastName}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          {lead.email || "—"}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          {lead._createdFmt}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-5 py-8 text-center text-gray-500"
                      >
                        No recent submissions
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Lead Responses */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Lead Responses
            </h2>
            <span className="text-xs bg-green-100 text-green-800 py-1 px-2 rounded-full">
              {responses.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            {subsLoading ? (
              <TableSkeleton rows={5} cols={3} />
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-3 text-left">Lead ID</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {responses.length > 0 ? (
                    responses.map((leadId: any, index: number) => (
                      <tr key={index}>
                        <td className="px-5 py-4 whitespace-nowrap">
                          #{leadId}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Responded
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">—</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-5 py-8 text-center text-gray-500"
                      >
                        No recent responses
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      {/* Full submissions table */}
      <section className="mb-8" ref={fullSubsRef}>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Calculate Form Submissions User
            </h2>
            <span className="text-xs bg-indigo-100 text-indigo-800 py-1 px-2 rounded-full">
              {submissions.length}
            </span>
          </div>

          {!showFullSubs ? (
            <TableSkeleton rows={8} cols={6} />
          ) : subsLoading ? (
            <TableSkeleton rows={8} cols={8} />
          ) : subsError ? (
            <div className="p-6 text-center text-red-500">{subsError}</div>
          ) : submissions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No submissions found.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3 text-left">ID</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Phone</th>
                      <th className="px-4 py-3 text-left">From State</th>
                      <th className="px-4 py-3 text-left">From Code</th>
                      <th className="px-4 py-3 text-left">From City</th>
                      <th className="px-4 py-3 text-left">From ZIP</th>
                      <th className="px-4 py-3 text-left">To State</th>
                      <th className="px-4 py-3 text-left">To Code</th>
                      <th className="px-4 py-3 text-left">To City</th>
                      <th className="px-4 py-3 text-left">To ZIP</th>
                      <th className="px-4 py-3 text-left">Move Date</th>
                      <th className="px-4 py-3 text-left">Move Size</th>
                      <th className="px-4 py-3 text-left">IP</th>
                      <th className="px-4 py-3 text-left">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pagedSubmissions.map((lead) => (
                      <tr key={lead.id}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          #{lead.id}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {fmt(lead.firstName)} {fmt(lead.lastName)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {fmt(lead.email)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {fmt(lead.phone)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {fmt(lead.fromState)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {fmt(lead.fromStateCode)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {fmt(lead.fromCity)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {fmt(lead.fromZip)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {fmt(lead.toState)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {fmt(lead.toStateCode)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {fmt(lead.toCity)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {fmt(lead.toZip)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {fmtDate(lead.moveDate)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {fmt(lead.moveSize)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {fmt(lead.fromIp)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {lead._createdFmt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-xs text-gray-600">
                <div>
                  Showing{" "}
                  <span className="font-semibold">
                    {(subsPage - 1) * SUBS_PAGE_SIZE + 1}-
                    {Math.min(subsPage * SUBS_PAGE_SIZE, submissions.length)}
                  </span>{" "}
                  of <span className="font-semibold">{submissions.length}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSubsPageChange("prev")}
                    disabled={subsPage === 1}
                    className={`px-3 py-1 rounded border text-xs ${
                      subsPage === 1
                        ? "border-gray-200 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>
                  <span>
                    Page <span className="font-semibold">{subsPage}</span> of{" "}
                    <span className="font-semibold">{totalSubsPages}</span>
                  </span>
                  <button
                    onClick={() => handleSubsPageChange("next")}
                    disabled={subsPage === totalSubsPages}
                    className={`px-3 py-1 rounded border text-xs ${
                      subsPage === totalSubsPages
                        ? "border-gray-200 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Recent Blogs (✅ Status added, ✅ Comments removed) */}
      <section className="mb-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Blog Posts
            </h2>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              Add New Post
            </button>
          </div>

          <div className="overflow-x-auto">
            {isLoadingBlogs ? (
              <TableSkeleton rows={5} cols={3} />
            ) : errorBlogs ? (
              <div className="p-6 text-center text-red-500">{errorBlogs}</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-3 text-left">Title</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {recentBlogs.map((blog) => (
                    <tr key={blog.id}>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900 line-clamp-1">
                          {blog.post_title}
                        </p>
                      </td>

                      {/* ✅ Status badge */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            blog.post_status === "publish" ||
                            blog.post_status === "published"
                              ? "bg-green-100 text-green-800"
                              : blog.post_status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {blog.post_status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(blog)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(blog.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      {/* Edit Modal */}
      {isEditModalVisible && editBlogData && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={handleEditClose}
        >
          <div
            className="bg-white rounded-xl w-full max-w-2xl shadow-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Edit Blog Post
              </h2>
              <button
                onClick={handleEditClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Post Title
                </label>
                <input
                  type="text"
                  value={editBlogData.post_title}
                  onChange={(e) =>
                    setEditBlogData({
                      ...editBlogData,
                      post_title: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Post Status
                </label>
                <select
                  value={editBlogData.post_status}
                  onChange={(e) =>
                    setEditBlogData({
                      ...editBlogData,
                      post_status: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="publish">Published</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending Review</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-gray-200">
              <button
                onClick={handleEditClose}
                className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleEditSave(editBlogData)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: TrendInfo | null;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = React.memo(function StatCard({
  title,
  value,
  trend,
  icon,
  color,
  loading,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="mt-1">
            {loading ? (
              <SkeletonBox className="h-7 w-20" />
            ) : (
              <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      </div>
    </div>
  );
});
StatCard.displayName = "StatCard";

export default AdminDashboard;
