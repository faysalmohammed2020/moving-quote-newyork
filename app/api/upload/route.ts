// app/api/upload/route.ts
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // allow-list + size limit
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
    }

    const bytes = await file.arrayBuffer();
    if (bytes.byteLength > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 413 });
    }

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const hash = crypto.randomBytes(8).toString("hex");
    const filename = `${Date.now()}-${hash}.${ext}`;

    const dir = path.join(process.cwd(), "public", "image");
    await fs.mkdir(dir, { recursive: true });

    const filepath = path.join(dir, filename);
    await fs.writeFile(filepath, Buffer.from(bytes));

    // Return relative URL for <img src="...">
    const url = `/image/${filename}`;
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
