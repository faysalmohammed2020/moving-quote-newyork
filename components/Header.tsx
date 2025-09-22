"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X, Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";

type BlogLite = { id: number; post_title: string };

const API_URL = "/api/blogs";

const HeaderMenu: React.FC = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  // Blog data state
  const [blogs, setBlogs] = useState<BlogLite[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch blogs data
  useEffect(() => {
    let mounted = true;
    
    const fetchBlogs = async () => {
      try {
        setLoadingBlogs(true);
        setError(null);
        const res = await fetch(API_URL, { 
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          }
        });
        
        if (!res.ok) throw new Error(`Failed to load blogs: ${res.status}`);
        const rows = (await res.json()) as BlogLite[];
        
        if (!mounted) return;
        setBlogs(Array.isArray(rows) ? rows : []);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load blogs");
        console.error("Error fetching blogs:", err);
      } finally {
        if (mounted) setLoadingBlogs(false);
      }
    };

    fetchBlogs();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Filter blogs based on search query
  const filteredBlogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return blogs.slice(0, 10); // Limit to 10 items when no search
    return blogs.filter((b) => (b.post_title ?? "").toLowerCase().includes(q));
  }, [blogs, searchQuery]);

  // Safe HTML highlighting function
  const highlightSearchTerm = (text: string, query: string): string => {
    if (!query.trim() || !text) return text || "";
    
    const safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    
    try {
      const regex = new RegExp(`(${safeQuery})`, "gi");
      return safeText.replace(
        regex, 
        '<span style="color: #fbbf24; font-weight: 600;">$1</span>'
      );
    } catch {
      return safeText; // Return original text if regex fails
    }
  };

  // Close mobile menu when navigating
  const handleNavigation = () => {
    setMobileMenuOpen(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <header className={`sticky top-0 z-50 bg-white shadow-md text-black transition-all duration-300 ${
      isScrolled ? "shadow-lg" : "shadow-md"
    }`}>
      <nav className="container mx-auto flex items-center justify-between py-3 px-4 sm:px-6">
        {/* Logo Section */}
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

        {/* Desktop Navigation */}
        <div className="hidden lg:flex flex-1 justify-center">
          <ul className="flex items-center space-x-4 xl:space-x-6 text-base xl:text-lg">
            {/* Home */}
            <li>
              <Link 
                href="/home" 
                className="hover:text-orange-400 transition-colors duration-200 font-medium"
                onClick={handleNavigation}
              >
                Home
              </Link>
            </li>

            {/* Services Dropdown */}
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
                <li className="group/sub relative border-b border-gray-100">
                  <div className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors cursor-pointer">
                    <span>Commercial Moving</span>
                    <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover/sub:rotate-180" />
                  </div>
                  <ul className="absolute z-50 left-full top-0 ml-1 w-64 bg-white border border-gray-200 shadow-xl rounded-md opacity-0 group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-300 ease-in-out invisible">
                    <li className="border-b border-gray-100">
                      <Link 
                        href="/services/commercial-moving/office-relocation"
                        className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        onClick={handleNavigation}
                      >
                        Office Relocation
                      </Link>
                    </li>
                    <li className="border-b border-gray-100">
                      <Link 
                        href="/services/commercial-moving/retail-relocation"
                        className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        onClick={handleNavigation}
                      >
                        Retail Relocation
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/services/commercial-moving/corporate-relocation"
                        className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        onClick={handleNavigation}
                      >
                        Corporate Relocation
                      </Link>
                    </li>
                  </ul>
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

            {/* About Us Dropdown */}
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
                href="/contact" 
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
                  {/* Blog Count Badge */}
                  <div className="bg-orange-500 inline-flex items-center px-3 py-1 rounded-full text-white text-xs font-semibold">
                    Total Blogs: {loadingBlogs ? "..." : error ? "0" : blogs.length}
                  </div>

                  {/* Search Input */}
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

                  {/* Blog List */}
                  <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                    {error ? (
                      <p className="text-red-500 text-sm py-2 text-center">{error}</p>
                    ) : loadingBlogs ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={`skeleton-${i}`}
                          className="h-10 rounded bg-gray-100 animate-pulse"
                        />
                      ))
                    ) : filteredBlogs.length > 0 ? (
                      filteredBlogs.map((item) => (
                        <Link
                          key={item.id}
                          href={`/blogs/${item.id}`}
                          className="block p-2 rounded-md bg-gray-50 hover:bg-orange-50 border border-transparent hover:border-orange-200 transition-all duration-200 group/item"
                          onClick={handleNavigation}
                        >
                          <span 
                            className="text-sm text-gray-700 group-hover/item:text-orange-600 font-medium line-clamp-2"
                            dangerouslySetInnerHTML={{
                              __html: highlightSearchTerm(item.post_title, searchQuery),
                            }}
                          />
                        </Link>
                      ))
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

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-700 hover:text-orange-500 hover:bg-gray-100 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-lg lg:hidden">
            <ul className="flex flex-col text-lg">
              <li className="border-b border-gray-100">
                <Link 
                  href="/home" 
                  className="block px-6 py-4 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors font-medium"
                  onClick={handleNavigation}
                >
                  Home
                </Link>
              </li>
              <li className="border-b border-gray-100">
                <Link 
                  href="/services" 
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
                  href="/contact" 
                  className="block px-6 py-4 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors font-medium"
                  onClick={handleNavigation}
                >
                  Contact
                </Link>
              </li>
              <li className="border-b border-gray-100">
                <Link 
                  href="/blog" 
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