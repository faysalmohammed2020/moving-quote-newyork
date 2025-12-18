import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ---- helpers ----
function getClientIp(req: Request) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xrip = req.headers.get("x-real-ip");
  if (xrip) return xrip.trim();
  return "0.0.0.0";
}

// ✅ dayKey in UTC (stable). If you want Dhaka day, tell me.
function getDayKeyUTC(d = new Date()) {
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const slug = body.slug || "home";

    const ip = getClientIp(req);
    const dayKey = getDayKeyUTC();

    // 1) Try to insert VisitLog for (slug, ip, dayKey)
    // If already exists => P2002 unique error => do NOT increment
    let isNewToday = false;

    try {
      await prisma.visitLog.create({
        data: { slug, ip, dayKey },
      });
      isNewToday = true;
    } catch (e: unknown) {
      // Prisma unique constraint error code: P2002
      if (
        typeof e === "object" &&
        e !== null &&
        "code" in e &&
        (e as { code?: string }).code === "P2002"
      ) {
        isNewToday = false;
      } else {
        throw e; // real error
      }
    }

    // 2) Upsert counter row for (slug, dayKey)
    // If new visit today => increment, else keep same
    const row = await prisma.visitCounter.upsert({
      where: { slug_dayKey: { slug, dayKey } }, // requires @@unique([slug, dayKey])
      update: isNewToday ? { count: { increment: 1 } } : {},
      create: { slug, dayKey, count: 1 },
    });

    return NextResponse.json({
      ok: true,
      counted: isNewToday, // ✅ true if increment happened
      dayKey,
      count: row.count,
    });
  } catch (e) {
    console.error("Visits POST error:", e);
    return NextResponse.json(
      { ok: false, error: "Failed to track visit" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || "home";
    const dayKey = searchParams.get("day") || getDayKeyUTC();

    const row = await prisma.visitCounter.findUnique({
      where: { slug_dayKey: { slug, dayKey } },
    });

    return NextResponse.json({
      ok: true,
      dayKey,
      count: row?.count || 0,
    });
  } catch (e) {
    console.error("Visits GET error:", e);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch visits" },
      { status: 500 }
    );
  }
}
