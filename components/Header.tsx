"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import Image from "next/image";
import { signOut, useSession } from "@/lib/auth-client";

type BlogLite = { id: number; post_title: string };

const API_URL = "/api/blogs";

const HeaderMenu: React.FC = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { data: session } = useSession();

  // ✅ শুধু ডাটাবেস থেকে
  const [blogs, setBlogs] = useState<BlogLite[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingBlogs(true);
        const res = await fetch(API_URL, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load blogs");
        const rows = (await res.json()) as BlogLite[];
        if (!mounted) return;
        setBlogs(rows);
      } catch {
        // error swallow; UI তে Total Blogs: … থাকবে
      } finally {
        if (mounted) setLoadingBlogs(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredBlogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return blogs;
    return blogs.filter((b) => (b.post_title ?? "").toLowerCase().includes(q));
  }, [blogs, searchQuery]);

  const highlightSearchTerm = (text: string, query: string): string => {
    if (!query) return text;
    const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${safe})`, "gi");
    return text.replace(
      regex,
      (match) => `<span style="color: #fbbf24; font-weight: 600;">${match}</span>`
    );
  };

  return (
    <header className="bg-white shadow-md text-black">
      <nav className="container flex items-center justify-between py-4 px-6">
        {/* Logo Section */}
        <div className="text-xl font-bold">
          <Link href="/">
            <Image
              src="/image/logo-png.png"
              width={200}
              height={200}
              alt="Moving Quote New York"
            />
          </Link>
        </div>

        {/* Hamburger Menu for Mobile */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="text-black"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Desktop Navigation */}
        <ul className="hidden mx-auto md:flex items-center space-x-6 text-lg">
          {/* Home */}
          <li>
            <Link href="/Home" className="hover:text-orange-400">
              Home
            </Link>
          </li>

          {/* Services Dropdown */}
          <li className="group relative">
            <div className="flex items-center cursor-pointer hover:text-orange-400">
              <span>Services</span>
              <ChevronDown className="ml-2 w-4 h-4" />
            </div>
            <ul className="absolute z-50 left-0 mt-2 w-64 bg-gray-700 text-white shadow-lg rounded-md opacity-0 group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out invisible h-auto">
              <li className="px-4 py-2 hover:bg-gray-900">
                <Link href="/services/long-distance-moving">Long Distance Moving</Link>
              </li>
              <li className="px-4 py-2 hover:bg-gray-900">
                <Link href="/services/auto-transport">Auto Transport</Link>
              </li>
              <li className="px-4 py-2 hover:bg-gray-900">
                <Link href="/services/storage-solutions">Storage Solutions</Link>
              </li>
              <li className="group relative px-4 py-2 hover:bg-gray-900">
                <div className="flex items-center cursor-pointer">
                  <span className="hover:text-orange-400">Commercial Moving</span>
                  <ChevronDown className="ml-2 w-4 h-4" />
                </div>
                {/* Nested Dropdown */}
                <ul className="absolute z-50 left-full top-0 mt-0 w-64 bg-gray-700 text-white shadow-lg rounded-md opacity-0 group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out invisible">
                  <li className="px-4 py-2 hover:bg-gray-900">
                    <Link href="/services/commercial-moving/office-relocation">
                      Office Relocation
                    </Link>
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-900">
                    <Link href="/services/commercial-moving/retail-relocation">
                      Retail Relocation
                    </Link>
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-900">
                    <Link href="/services/commercial-moving/corporate-relocation">
                      Corporate Relocation
                    </Link>
                  </li>
                </ul>
              </li>
              <li className="px-4 py-2 hover:bg-gray-900">
                <Link href="/services/specialized-moving">Specialized Moving</Link>
              </li>
              <li className="px-4 py-2 hover:bg-gray-900">
                <Link href="/services/small-moves">Small Moves</Link>
              </li>
            </ul>
          </li>

          {/* About Us Dropdown */}
          <li className="group relative">
            <div className="flex items-center cursor-pointer hover:text-orange-400">
              <span>About Us</span>
              <ChevronDown className="ml-2 w-4 h-4" />
            </div>
            <ul className="absolute left-0 mt-2 w-48 bg-gray-700 text-white shadow-lg rounded-md opacity-0 group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out invisible">
              <li className="px-4 py-2 hover:bg-gray-900">
                <Link href="/allTestimonials">Testimonials</Link>
              </li>
            </ul>
          </li>

          {/* Contact */}
          <li>
            <Link href="/Contact" className="hover:text-orange-400">
              Contact
            </Link>
          </li>

          {/* Blog Dropdown (DB only) */}
          <li className="group relative">
            <div className="flex items-center cursor-pointer hover:text-orange-500">
              <span className="text-lg">Blog</span>
              <ChevronDown className="ml-2 w-5 h-5 text-gray-300 transition-all duration-300 ease-in-out group-hover:rotate-180" />
            </div>

            <ul className="absolute z-50 left-0 mt-4 bg-gray-800 text-white shadow-lg rounded-lg opacity-0 group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out invisible w-96 p-4">
              <div className="bg-orange-600 w-36 p-2 rounded-full text-white text-sm font-semibold">
                Total Blogs: {loadingBlogs ? "…" : blogs.length}
              </div>

              {/* Search Input */}
              <div className="mt-4 relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">🔍</span>
                </div>
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 p-3 pl-12 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm border border-gray-600 transition-all duration-300"
                />
              </div>

              <div className="scrollbar mt-4 space-y-3 max-h-80 overflow-auto pr-1">
                {loadingBlogs ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={`sk-${i}`}
                      className="h-9 w-full rounded-md bg-gray-700/70 animate-pulse"
                    />
                  ))
                ) : filteredBlogs.length > 0 ? (
                  filteredBlogs.map((item) => (
                    <li
                      key={item.id}
                      className="group p-2 rounded-md bg-slate-700 hover:bg-gradient-to-r hover:from-orange-500/80 hover:to-orange-400/80 transition-colors duration-300 ease-in-out shadow-md"
                    >
                      <Link
                        href={`/blogs/${item.id}`}
                        className="block text-sm sm:text-base font-medium text-gray-100 hover:underline"
                      >
                        <span
                          dangerouslySetInnerHTML={{
                            __html: highlightSearchTerm(
                              item.post_title,
                              searchQuery
                            ),
                          }}
                        />
                      </Link>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-300 text-sm">No blogs found.</p>
                )}
              </div>
            </ul>
          </li>
        </ul>

        {/* Auth Button */}
        {session ? (
          <button
            onClick={() => signOut()}
            className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition-all duration-300"
          >
            Logout
          </button>
        ) : (
          <Link
            href="/sign-in"
            className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-all duration-300"
          >
            Login
          </Link>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <ul className="absolute top-16 left-0 w-full bg-gray-800 shadow-lg flex flex-col text-lg text-white">
            <li className="px-4 py-2 border-b hover:bg-gray-700">
              <Link href="/Home">Home</Link>
            </li>
            <li className="px-4 py-2 border-b hover:bg-gray-700">
              <Link href="/services">Services</Link>
            </li>
            <li className="px-4 py-2 border-b hover:bg-gray-700">
              <Link href="/about-us/testimonials">About Us</Link>
            </li>
            <li className="px-4 py-2 border-b hover:bg-gray-700">
              <Link href="/contact">Contact</Link>
            </li>
            <li className="px-4 py-2 border-b hover:bg-gray-700">
              <Link href="/blog">Blog</Link>
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
};

export default HeaderMenu;
