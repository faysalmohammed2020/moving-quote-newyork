import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("Received data:", data);

    if (!data.first_name || !data.last_name || !data.email || !data.phone || !data.lead_type || !data.lead_source) {
      console.error("Validation failed. Required fields missing.");
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    let moveDateObj: Date | null = null;
    if (data.move_date && data.move_date.trim() !== "") {
      const tempDate = new Date(data.move_date);
      if (!isNaN(tempDate.getTime())) {
        moveDateObj = tempDate;
      }
    }

    // ✅ Calculate Bangladesh Time (+6 hours)
    const getBangladeshTime = () => {
      const now = new Date();
      return new Date(now.getTime() + (6 * 60 * 60 * 1000)); // +6 hours
    };

    const formSubmission = await prisma.lead.create({
      data: {
        key: data.key ?? "",
        leadType: data.lead_type ?? "",
        leadSource: data.lead_source ?? "",
        referer: data.referer ?? "",
        fromIp: data.from_ip ?? "",
        firstName: data.first_name ?? "",
        lastName: data.last_name ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        fromState: data.from_state ?? "",
        fromStateCode: data.from_state_code ?? "",
        fromCity: data.from_city ?? "",
        fromZip: data.from_zip ?? "",
        toState: data.to_state ?? "",
        toStateCode: data.to_state_code ?? "",
        toCity: data.to_city ?? "",
        toZip: data.to_zip ?? "",
        moveDate: moveDateObj,
        moveSize: data.move_size ?? "",
        selfPackaging: false,
        hasCar: false,
        carMake: data.car_make || null,
        carModel: data.car_model || null,
        carMakeYear: data.car_make_year || null,
        createdAt: getBangladeshTime()  // ✅ BD time!
      },
    });

    return NextResponse.json({ message: "Form submitted successfully", data: formSubmission });

  } catch (error: any) {
    console.error("Server error:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
