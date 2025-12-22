import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import type { Prisma } from "@prisma/client";

export const revalidate = 60; // ✅ 60s cache on GET (server-side)

// -------------------- helpers --------------------
const FALLBACK_IMG = "/placeholder-blog.svg";

function stripHtml(html: string) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractFirstImageServer(html: string) {
  if (!html) return FALLBACK_IMG;

  // ✅ fast regex first <img src="">
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  let src = match?.[1] || FALLBACK_IMG;

  // normalize "/public/xxx" -> "/xxx"
  src = src.replace(/^\/public\//, "/");

  return src || FALLBACK_IMG;
}

function computeMetaFromContent(rawContent: string) {
  const plainText = stripHtml(rawContent);
  const words = plainText ? plainText.split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(words / 200));
  const excerpt = plainText.slice(0, 150);
  const imageUrl = extractFirstImageServer(rawContent);

  return { plainText, readTime, excerpt, imageUrl };
}

/** ✅ safe extractor for json/html content (replaces all as any) */
function extractContent(content: unknown): string {
  if (content && typeof content === "object") {
    const maybeText = (content as Record<string, unknown>)["text"];
    if (typeof maybeText === "string") return maybeText;
  }
  return String(content ?? "");
}

// -------------------- POST: create --------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      post_title,
      post_content,
      category,
      tags,
      post_author,
      post_status,
      post_excerpt,
    } = body;

    if (!post_title || !post_content || !category) {
      return NextResponse.json(
        { error: "Title, content, and category are required" },
        { status: 400 }
      );
    }

    const newBlogPost = await prisma.blogPost.create({
      data: {
        post_name: post_title,
        post_title,
        post_content,
        category,
        tags: tags || "",
        post_author,
        post_status: post_status || "Draft",
        post_excerpt,
        post_date: new Date(),
        post_date_gmt: new Date(),
        post_modified: new Date(),
        post_modified_gmt: new Date(),
        createdAt: new Date(),
      },
    });

    return NextResponse.json(newBlogPost, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating blog post:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}

// -------------------- PUT: update --------------------
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, post_title, post_content, category, tags, post_status } =
      body ?? {};

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const data: Prisma.BlogPostUpdateInput = {}; // ✅ any removed
    if (post_title !== undefined) data.post_title = post_title;
    if (post_content !== undefined) data.post_content = post_content;
    if (category !== undefined) data.category = category;
    if (tags !== undefined) data.tags = tags || "";
    if (post_status !== undefined) data.post_status = post_status;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    data.post_modified = new Date();
    data.post_modified_gmt = new Date();

    const updatedBlogPost = await prisma.blogPost.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedBlogPost, { status: 200 });
  } catch (error) {
    console.error("❌ Error updating blog post:", error);
    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 }
    );
  }
}

// -------------------- DELETE --------------------
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Blog post ID is required" },
        { status: 400 }
      );
    }

    await prisma.blogPost.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Blog post deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error deleting blog post:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}

// -------------------- GET: single OR list --------------------
// -------------------- GET: single OR list --------------------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const idParam = searchParams.get("id");
    const slugParamRaw = (searchParams.get("slug") || "").trim();

    // ✅ local slugify (server-side)
    const slugifyServer = (input: string) =>
      (input || "")
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 120);

    // -------------------- ✅ SLUG: single post --------------------
    // Priority: slug > id (because root url uses slug)
    if (slugParamRaw) {
      const slugParam = slugifyServer(slugParamRaw);

      // 1) Try quick "contains" search to reduce scan
      // (Not perfect but fast; then validate slugify match)
      const candidate = await prisma.blogPost.findFirst({
        where: {
          post_title: { contains: slugParamRaw.replace(/-/g, " "), mode: "insensitive" },
        },
        select: {
          id: true,
          post_title: true,
          post_content: true,
          category: true,
          tags: true,
          post_status: true,
          createdAt: true,
          post_date: true,
          post_excerpt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      if (candidate && slugifyServer(candidate.post_title || "") === slugParam) {
        const rawContent = extractContent(candidate.post_content);
        const { readTime, excerpt, imageUrl } = computeMetaFromContent(rawContent);

        return NextResponse.json(
          {
            ...candidate,
            post_content: rawContent,
            excerpt: candidate.post_excerpt || excerpt,
            readTime,
            imageUrl,
            slug: slugifyServer(candidate.post_title || ""), // ✅ helpful for canonical
          },
          { status: 200 }
        );
      }

      // 2) Fallback scan (titles only) then fetch by id
      // We avoid fetching post_content for all rows
      const titles = await prisma.blogPost.findMany({
        select: { id: true, post_title: true },
        orderBy: { createdAt: "desc" },
      });

      const match = titles.find((p) => slugifyServer(p.post_title || "") === slugParam);

      if (!match?.id) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const post = await prisma.blogPost.findUnique({
        where: { id: match.id },
        select: {
          id: true,
          post_title: true,
          post_content: true,
          category: true,
          tags: true,
          post_status: true,
          createdAt: true,
          post_date: true,
          post_excerpt: true,
        },
      });

      if (!post) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const rawContent = extractContent(post.post_content);
      const { readTime, excerpt, imageUrl } = computeMetaFromContent(rawContent);

      return NextResponse.json(
        {
          ...post,
          post_content: rawContent,
          excerpt: post.post_excerpt || excerpt,
          readTime,
          imageUrl,
          slug: slugifyServer(post.post_title || ""),
        },
        { status: 200 }
      );
    }

    // -------------------- ✅ ID: single post --------------------
    if (idParam) {
      const id = Number(idParam);
      if (Number.isNaN(id)) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
      }

      const post = await prisma.blogPost.findUnique({
        where: { id },
        select: {
          id: true,
          post_title: true,
          post_content: true,
          category: true,
          tags: true,
          post_status: true,
          createdAt: true,
          post_date: true,
          post_excerpt: true,
        },
      });

      if (!post) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const rawContent = extractContent(post.post_content);
      const { readTime, excerpt, imageUrl } = computeMetaFromContent(rawContent);

      return NextResponse.json(
        {
          ...post,
          post_content: rawContent,
          excerpt: post.post_excerpt || excerpt,
          readTime,
          imageUrl,
          slug: slugifyServer(post.post_title || ""), // ✅ helpful for canonical
        },
        { status: 200 }
      );
    }

    // ✅ LIST MODE (global image-first + NO hard cap)
    const mode = searchParams.get("mode");
    if (mode === "dashboard") {
      const posts = await prisma.blogPost.findMany({
        select: {
          id: true,
          post_title: true,
          comment_status: true,
          createdAt: true,
          post_date: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ data: posts, meta: { total: posts.length } });
    }

    const titlesOnly = searchParams.get("titles");
    if (titlesOnly === "1") {
      const titles = await prisma.blogPost.findMany({
        select: { id: true, post_title: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(titles, { status: 200 });
    }

    const category = searchParams.get("category");
    const authorId = searchParams.get("authorId");
    const q = (searchParams.get("q") || "").trim(); // ✅ GLOBAL SEARCH

    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.max(1, Number(searchParams.get("limit") || 6));
    const skip = (page - 1) * limit;

    const filters: Prisma.BlogPostWhereInput = {};
    if (category) filters.category = category;
    if (authorId) filters.post_author = parseInt(authorId, 10);

    // ✅ SAFE prisma search (title/category/tags only)
    if (q) {
      filters.OR = [
        { post_title: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { tags: { contains: q, mode: "insensitive" } },
      ];
    }

    const allPosts = await prisma.blogPost.findMany({
      where: filters,
      select: {
        id: true,
        post_title: true,
        post_content: true,
        category: true,
        tags: true,
        post_status: true,
        createdAt: true,
        post_excerpt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const hasImageFast = (content: string) => /<img\s/i.test(content);

    const sortable = allPosts
      .map((item) => {
        const rawContent = extractContent(item.post_content);

        return {
          id: item.id,
          post_title: item.post_title,
          post_content: rawContent,
          post_category: item.category || "General",
          post_tags: item.tags || "",
          post_status: item.post_status,
          createdAt: item.createdAt,
          post_excerpt: item.post_excerpt || "",
          _hasRealImage: hasImageFast(rawContent),
        };
      })
      .filter((item) => {
        if (!q) return true;
        const needle = q.toLowerCase();
        return (
          String(item.post_title || "").toLowerCase().includes(needle) ||
          String(item.post_category || "").toLowerCase().includes(needle) ||
          String(item.post_tags || "").toLowerCase().includes(needle) ||
          String(item.post_content || "").toLowerCase().includes(needle)
        );
      });

    sortable.sort((a, b) => {
      if (a._hasRealImage !== b._hasRealImage) {
        return Number(b._hasRealImage) - Number(a._hasRealImage);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = sortable.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const pageSlice = sortable.slice(skip, skip + limit);

    const paginated = pageSlice.map((item) => {
      const { readTime, excerpt, imageUrl } = computeMetaFromContent(item.post_content);

      return {
        id: item.id,
        post_title: item.post_title,
        post_category: item.post_category,
        post_tags: item.post_tags,
        post_status: item.post_status,
        createdAt: item.createdAt,
        imageUrl,
        excerpt: item.post_excerpt || excerpt,
        readTime,
      };
    });

    return NextResponse.json(
      {
        data: paginated,
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching blog posts:", error ?? "unknown error");
    return NextResponse.json(
      { error: "Failed to fetch blog posts." },
      { status: 500 }
    );
  }
}

