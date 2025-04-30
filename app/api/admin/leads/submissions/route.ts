
import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"; // update path based on your setup

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        fromIp: true,
        createdAt: true,
      },
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("Error fetching submissions", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
