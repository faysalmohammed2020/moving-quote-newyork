"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { placeData } from "@/app/(main)/data/placeData";
import Link from "next/link";

type ApiBlog = {
  id: number;
  post_title: string;
  post_category?: any; // comes from prisma.category
  post_status?: string;
  createdAt?: string;
  slug?: string | null; // ✅ add slug if your backend sends it
};

// ✅ slugify (same logic as blog page)
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

function isAbortError(err: unknown) {
  return err instanceof DOMException && err.name === "AbortError";
}

// ✅ category normalize
const normalizeCat = (val: any) => {
  if (!val) return "";

  if (typeof val === "object" && !Array.isArray(val)) {
    val = val.slug || val.name || val.title || val.id || "";
  }

  return String(val)
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
};

// ✅ category keys extract
const extractCategoryKeys = (post_category: any): string[] => {
  if (!post_category) return [];

  if (Array.isArray(post_category)) {
    return post_category.map(normalizeCat).filter(Boolean);
  }

  if (typeof post_category === "string") {
    return post_category
      .split(",")
      .map(normalizeCat)
      .filter(Boolean);
  }

  const key = normalizeCat(post_category);
  return key ? [key] : [];
};

const Categories = () => {
  const [blogs, setBlogs] = useState<ApiBlog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/blogs?page=1&limit=500`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Failed to fetch blogs");

        const json = await res.json();

        const list: ApiBlog[] = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json)
          ? json
          : json?.items || [];

        const published = list.filter((p) => {
          const st = String(p.post_status || "").toLowerCase();
          return st === "publish" || st === "published";
        });

        setBlogs(published);
      } catch (e) {
        if (!isAbortError(e)) {
          console.error("Fetch error:", e);
          setBlogs([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchBlogs();
    return () => controller.abort();
  }, []);

  // ✅ place lookup once
  const placeLookup = useMemo(() => {
    const m = new Map<string, string>();
    placeData.forEach((p) => {
      m.set(normalizeCat(p.name), p.name);
    });
    return m;
  }, []);

  // ✅ group by place
  const blogsByPlaceKey = useMemo(() => {
    const map = new Map<string, ApiBlog[]>();

    for (const key of placeLookup.keys()) {
      map.set(key, []);
    }

    blogs.forEach((b) => {
      const catKeys = extractCategoryKeys(b.post_category);

      catKeys.forEach((catKey) => {
        if (map.has(catKey)) {
          map.get(catKey)!.push(b);
        }
      });
    });

    // newest first
    for (const [k, arr] of map.entries()) {
      arr.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
      map.set(k, arr);
    }

    return map;
  }, [blogs, placeLookup]);

  if (loading) {
    return (
      <div className="container mx-auto mt-12 mb-12 px-4">
        <p className="text-center text-gray-400">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-12 mb-12 px-4">
      <Accordion
        type="single"
        collapsible
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6"
      >
        {placeData.map((item) => {
          const placeKey = normalizeCat(item.name);
          const catBlogs = blogsByPlaceKey.get(placeKey) || [];

          return (
            <AccordionItem
              key={item.id}
              value={`item-${item.id}`}
              className="bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
            >
              <AccordionTrigger className="text-yellow-500 font-bold">
                {item.name}
              </AccordionTrigger>

              <AccordionContent className="scrollbar text-white mt-2">
                <div className="mt-4">
                  <strong>Blogs Title:</strong>

                  {catBlogs.length > 0 ? (
                    catBlogs.map((post) => {
                      // ✅ choose slug: backend slug > title slug
                      const postSlug =
                        (typeof post.slug === "string" && post.slug.trim()
                          ? post.slug.trim()
                          : slugify(post.post_title)) || "";

                      // ✅ route:
                      // যদি তোমার blog route root হয় "/[slug]" তাহলে `/${postSlug}`
                      // যদি "/blogs/[slug]" হয় তাহলে `/blogs/${postSlug}`
                      const href = `/${encodeURIComponent(postSlug)}`;

                      return (
                        <div
                          key={post.id}
                          className="mt-2 bg-gray-700 p-2 rounded-md shadow-sm"
                        >
                          <Link href={href} className="font-bold text-yellow-400">
                            {post.post_title}
                          </Link>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-400 mt-2">
                      No posts available for this category.
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default Categories;
