import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// ✅ route file load হওয়া মাত্র টার্মিনালে একবার দেখাবে
console.log("✅ /api/visits route file loaded");

export async function POST(req: Request) {
  console.log("✅ VISITS POST HIT");

  try {
    const body = await req.json().catch(() => ({}));
    console.log("📦 POST BODY =", body);

    const slug = body.slug || "home";
    console.log("🔖 SLUG =", slug);

    const row = await prisma.visitCounter.upsert({
      where: { slug },
      update: { count: { increment: 1 } },
      create: { slug, count: 1 },
    });

    console.log("✅ DB UPSERT OK. COUNT =", row.count);

    return NextResponse.json({ ok: true, count: row.count });
  } catch (e) {
    console.error("❌ VISITS POST ERROR:", e);
    return NextResponse.json(
      { ok: false, error: "server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  console.log("✅ VISITS GET HIT");

  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || "home";

    console.log("🔖 GET SLUG =", slug);

    const row = await prisma.visitCounter.findUnique({ where: { slug } });

    console.log("✅ DB FIND OK. ROW =", row);

    return NextResponse.json({ count: row?.count || 0 });
  } catch (e) {
    console.error("❌ VISITS GET ERROR:", e);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
