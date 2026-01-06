"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X, Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";

type BlogLite = {
  id: number;
  post_title: string;
  slug?: string;
  post_status?: string; // ✅ need for filtering
};

const API_URL = "/api/blogs";

// ✅ localStorage cache keys
const CACHE_KEY = "blog_titles_cache_v2";
const CACHE_TIME_KEY = "blog_titles_cache_time_v2";

// ✅ cache TTL (10 minutes)
const CACHE_TTL_MS = 10 * 60 * 1000;

// ✅ slugify (title -> slug)
function slugify(input: string) {
  return (input || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

// ✅ ONLY publish
const isPublished = (status: unknown) =>
  String(status || "").toLowerCase().trim() === "publish";

// ---- safe highlight
const highlightSearchTerm = (text: string, query: string): string => {
  if (!query.trim() || !text) return text || "";

  const safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  try {
    const regex = new RegExp(`(${safeQuery})`, "gi");
    return safeText.replace(
      regex,
      '<span style="color: #f97316; font-weight: 600;">$1</span>'
    );
  } catch {
    return safeText;
  }
};

// ✅ debounced value hook
function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

type TitlesApiRow = {
  id?: unknown;
  post_title?: unknown;
  post_name?: unknown;
  slug?: unknown;
  post_status?: unknown;
};

const HeaderMenu: React.FC = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebouncedValue(searchQuery, 250);

  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const [blogs, setBlogs] = useState<BlogLite[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ read cache instantly
  const loadFromCache = useCallback(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      const rawTime = localStorage.getItem(CACHE_TIME_KEY);
      const time = rawTime ? Number(rawTime) : 0;

      if (!raw) return { cached: null as BlogLite[] | null, fresh: false };

      const cached = JSON.parse(raw) as BlogLite[];
      const fresh = Date.now() - time < CACHE_TTL_MS;

      return { cached, fresh };
    } catch {
      return { cached: null, fresh: false };
    }
  }, []);

  // ✅ save cache
  const saveCache = useCallback((list: BlogLite[]) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(list));
      localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
    } catch {}
  }, []);

  // ✅ fetch ALL titles (keep status, filter later safely)
  const fetchBlogsTitles = useCallback(async (signal?: AbortSignal) => {
    const res = await fetch(`${API_URL}?titles=1`, {
      cache: "no-store",
      signal,
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error(`Failed to load blogs: ${res.status}`);

    const raw = (await res.json()) as unknown;

    const rawList: TitlesApiRow[] = Array.isArray(raw)
      ? (raw as TitlesApiRow[])
      : [];

    const list: BlogLite[] = rawList
      .map((r) => {
        const title = String(r?.post_title ?? r?.post_name ?? "").trim();

        const apiSlug =
          typeof r?.slug === "string" && r.slug.trim() ? r.slug.trim() : "";

        const finalSlug = apiSlug || slugify(title);

        const status =
          typeof r?.post_status === "string" ? r.post_status.trim() : "";

        return {
          id: Number(r?.id),
          post_title: title,
          slug: finalSlug,
          post_status: status, // ✅ IMPORTANT
        };
      })
      .filter((b) => b.id && b.post_title);

    return list;
  }, []);

  // ✅ initial load: cache-first + background refresh
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const run = async () => {
      setError(null);

      const { cached, fresh } = loadFromCache();

      // ✅ cache থেকেও unpublish বাদ (IMPORTANT)
      const cachedPublishedOnly = (cached || []).filter((b) =>
        isPublished(b.post_status)
      );

      if (cachedPublishedOnly.length && mounted) {
        setBlogs(cachedPublishedOnly);
      }

      if (!fresh) setLoadingBlogs(true);

      try {
        const list = await fetchBlogsTitles(controller.signal);
        if (!mounted) return;

        // ✅ API list থেকেও unpublish বাদ
        const publishedOnly = list.filter((b) => isPublished(b.post_status));

        setBlogs(publishedOnly);

        // ✅ cache এও published-only save করো যাতে পরে unpublish না আসে
        saveCache(publishedOnly);
      } catch (err) {
        if (!mounted) return;

        if (!cachedPublishedOnly.length) {
          setError(err instanceof Error ? err.message : "Failed to load blogs");
        }
        console.error("Error fetching blogs:", err);
      } finally {
        if (mounted) setLoadingBlogs(false);
      }
    };

    run();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [fetchBlogsTitles, loadFromCache, saveCache]);

  // ✅ filter (blogs already publish-only, this is only search)
  const filteredBlogs = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();

    const base = blogs; // ✅ already publish-only
    if (!q) return base.slice(0, 10);

    return base
      .filter((b) => (b.post_title || "").toLowerCase().includes(q))
      .slice(0, 10);
  }, [blogs, debouncedQuery]);

  const handleNavigation = () => setMobileMenuOpen(false);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-white shadow-md text-black transition-all duration-300 ${
        isScrolled ? "shadow-lg" : "shadow-md"
      }`}
    >
      <nav className="container mx-auto flex items-center justify-between py-3 px-4 sm:px-6">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" onClick={handleNavigation}>
            <Image
              src="/image/logo-png.png"
              width={160}
              height={60}
              alt="Moving Quote New York"
              className="h-12 w-auto sm:h-14 sm:w-48"
              priority
            />
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex flex-1 justify-center">
          <ul className="flex items-center space-x-4 xl:space-x-6 text-base xl:text-lg">
            <li>
              <Link
                href="/"
                className="hover:text-orange-400 transition-colors duration-200 font-medium"
                onClick={handleNavigation}
              >
                Home
              </Link>
            </li>

            {/* Services */}
            <li className="group relative">
              <div className="flex items-center cursor-pointer hover:text-orange-400 transition-colors duration-200 font-medium py-2">
                <span>Services</span>
                <ChevronDown className="ml-1 w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
              </div>
              <ul className="absolute z-50 left-0 mt-2 w-64 bg-white border border-gray-200 shadow-xl rounded-md opacity-0 group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out invisible">
                <li className="border-b border-gray-100">
                  <Link
                    href="/services/long-distance-moving"
                    className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    onClick={handleNavigation}
                  >
                    Long Distance Moving
                  </Link>
                </li>
                <li className="border-b border-gray-100">
                  <Link
                    href="/services/auto-transport"
                    className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    onClick={handleNavigation}
                  >
                    Auto Transport
                  </Link>
                </li>
                <li className="border-b border-gray-100">
                  <Link
                    href="/services/storage-solutions"
                    className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    onClick={handleNavigation}
                  >
                    Storage Solutions
                  </Link>
                </li>

                <li className="border-b border-gray-100">
                  <Link
                    href="/services/specialized-moving"
                    className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    onClick={handleNavigation}
                  >
                    Specialized Moving
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services/small-moves"
                    className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    onClick={handleNavigation}
                  >
                    Small Moves
                  </Link>
                </li>
              </ul>
            </li>

            {/* About Us */}
            <li className="group relative">
              <div className="flex items-center cursor-pointer hover:text-orange-400 transition-colors duration-200 font-medium py-2">
                <span>About Us</span>
                <ChevronDown className="ml-1 w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
              </div>
              <ul className="absolute z-50 left-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl rounded-md opacity-0 group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out invisible">
                <li>
                  <Link
                    href="/allTestimonials"
                    className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    onClick={handleNavigation}
                  >
                    Testimonials
                  </Link>
                </li>
              </ul>
            </li>

            {/* Contact */}
            <li>
              <Link
                href="/contacts"
                className="hover:text-orange-400 transition-colors duration-200 font-medium"
                onClick={handleNavigation}
              >
                Contact
              </Link>
            </li>

            {/* Blog Dropdown */}
            <li className="group relative">
              <div className="flex items-center cursor-pointer hover:text-orange-500 transition-colors duration-200 font-medium py-2">
                <span className="text-base xl:text-lg">Blog</span>
                <ChevronDown className="ml-1 w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
              </div>

              <div className="absolute z-50 left-1/2 transform -translate-x-1/2 mt-4 w-96 bg-white border border-gray-200 shadow-xl rounded-lg opacity-0 group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out invisible">
                <div className="p-4">
                  <div className="bg-orange-500 inline-flex items-center px-3 py-1 rounded-full text-white text-xs font-semibold">
                    Total Blogs:{" "}
                    {loadingBlogs ? "..." : error ? "0" : blogs.length}
                  </div>

                  <div className="mt-3 relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Search className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search blogs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full p-2 pl-10 rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                    {error ? (
                      <p className="text-red-500 text-sm py-2 text-center">
                        {error}
                      </p>
                    ) : loadingBlogs && blogs.length === 0 ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={`skeleton-${i}`}
                          className="h-10 rounded bg-gray-100 animate-pulse"
                        />
                      ))
                    ) : filteredBlogs.length > 0 ? (
                      filteredBlogs.map((item) => {
                        const slug =
                          typeof item.slug === "string" && item.slug.trim()
                            ? item.slug.trim()
                            : slugify(item.post_title);

                        return (
                          <Link
                            key={item.id}
                            href={`/${encodeURIComponent(slug)}`} // ✅ ROOT SLUG URL
                            className="block p-2 rounded-md bg-gray-50 hover:bg-orange-50 border border-transparent hover:border-orange-200 transition-all duration-200 group/item"
                            onClick={handleNavigation}
                          >
                            <span
                              className="text-sm text-gray-700 group-hover/item:text-orange-600 font-medium line-clamp-2"
                              dangerouslySetInnerHTML={{
                                __html: highlightSearchTerm(
                                  item.post_title,
                                  searchQuery
                                ),
                              }}
                            />
                          </Link>
                        );
                      })
                    ) : (
                      <p className="text-gray-500 text-sm py-3 text-center">
                        {searchQuery ? "No blogs found." : "No blogs available."}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>

        {/* Auth Button */}
        <div className="hidden lg:block flex-shrink-0">
          {session ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-5 py-2 rounded-full hover:bg-red-600 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/sign-in"
              className="bg-orange-500 text-white px-5 py-2 rounded-full hover:bg-orange-600 transition-all duration-200 font-medium shadow-sm hover:shadow-md inline-block"
              onClick={handleNavigation}
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile button */}
        <div className="lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-700 hover:text-orange-500 hover:bg-gray-100 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-lg lg:hidden">
            <ul className="flex flex-col text-lg">
              <li className="border-b border-gray-100">
                <Link
                  href="/"
                  className="block px-6 py-4 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors font-medium"
                  onClick={handleNavigation}
                >
                  Home
                </Link>
              </li>
              <li className="border-b border-gray-100">
                <Link
                  href="/services/auto-transport"
                  className="block px-6 py-4 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors font-medium"
                  onClick={handleNavigation}
                >
                  Services
                </Link>
              </li>
              <li className="border-b border-gray-100">
                <Link
                  href="/allTestimonials"
                  className="block px-6 py-4 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors font-medium"
                  onClick={handleNavigation}
                >
                  About Us
                </Link>
              </li>
              <li className="border-b border-gray-100">
                <Link
                  href="/contacts"
                  className="block px-6 py-4 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors font-medium"
                  onClick={handleNavigation}
                >
                  Contact
                </Link>
              </li>
              <li className="border-b border-gray-100">
                <Link
                  href="/allBlogs"
                  className="block px-6 py-4 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors font-medium"
                  onClick={handleNavigation}
                >
                  Blog
                </Link>
              </li>
              <li className="p-4">
                {session ? (
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-all duration-200 font-medium"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    href="/sign-in"
                    className="block w-full bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-all duration-200 font-medium text-center"
                    onClick={handleNavigation}
                  >
                    Login
                  </Link>
                )}
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
};

export default HeaderMenu;
