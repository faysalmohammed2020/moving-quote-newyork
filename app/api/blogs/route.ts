import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

// ✅ Create New Blog Post
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received POST request with data:", body); // Debugging log

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
        tags: tags || "", // Optional tags defaulting to an empty string
        post_author,
        post_status,
        post_excerpt,
        post_date: new Date(),
        post_date_gmt: new Date(),
        post_modified: new Date(),
        post_modified_gmt: new Date(),
        createdAt: new Date(),
      },
    });

    console.log("Blog post created successfully:", newBlogPost); // Debugging log
    return NextResponse.json(newBlogPost, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating blog post:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}

// ✅ Update Blog Post
export async function PUT(req: Request) {
  try {
    const { id, post_title, post_content, category, tags } = await req.json();

    if (!id || !post_title || !post_content || !category) {
      return NextResponse.json(
        { error: "ID, Title, Content, and Category are required" },
        { status: 400 }
      );
    }

    const updatedBlogPost = await prisma.blogPost.update({
      where: { id },
      data: {
        post_title,
        post_content,
        category,
        tags: tags || "",
      },
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

// ✅ Fetch All Blog Posts
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const authorId = searchParams.get("authorId");

    const filters: any = {};
    if (category) filters.category = category;
    if (authorId) filters.post_author = parseInt(authorId);

    // ✅ Ensure response matches the expected `Blog` type
    const blogPosts = await prisma.blogPost.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        post_title: true,
        post_content: true,
        category: true, // ✅ Ensure category is included
        tags: true, // ✅ Ensure tags are included
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
