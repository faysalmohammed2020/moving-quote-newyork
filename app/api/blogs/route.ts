import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

// ✅ Create New Blog Post
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

// ✅ Update Blog Post (supports partial updates incl. status-only)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, post_title, post_content, category, tags, post_status } = body ?? {};

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const data: any = {};
    if (post_title !== undefined) data.post_title = post_title;
    if (post_content !== undefined) data.post_content = post_content;
    if (category !== undefined) data.category = category;
    if (tags !== undefined) data.tags = tags || "";
    if (post_status !== undefined) data.post_status = post_status;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
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

// ✅ Delete Blog Post
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

// ✅ Fetch All Blog Posts OR a Single Post by ?id=
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    // Single post by id: /api/blogs?id=123
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
        },
      });
      if (!post) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json(post, { status: 200 });
    }

    // List with optional filters
    const category = searchParams.get("category");
    const authorId = searchParams.get("authorId");
    const filters: any = {};
    if (category) filters.category = category;
    if (authorId) filters.post_author = parseInt(authorId);

    const blogPosts = await prisma.blogPost.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        post_title: true,
        post_content: true,
        category: true,
        tags: true,
        post_status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(blogPosts, { status: 200 });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts." },
      { status: 500 }
    );
  }
}
