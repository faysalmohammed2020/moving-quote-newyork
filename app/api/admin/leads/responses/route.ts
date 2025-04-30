import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const allLeads = await prisma.apiLead.findMany({
      select: {
        leadId: true,
        callrail: true,
        createdAt: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Filter out leads that have a non-null 'response' inside 'callrail'
    const responses = allLeads.filter(lead => 
      lead.callrail?.response !== undefined &&
      lead.callrail?.response !== null
    ).map(lead => ({
      leadId: lead.leadId
    }));

    return NextResponse.json(responses);
  } catch (error) {
    console.error("Error fetching API responses:", error);
    return NextResponse.json({ message: "Failed to fetch responses" }, { status: 500 });
  }
}
