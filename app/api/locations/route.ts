import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const locations = await prisma.location.findMany({
      where: { isActive: true },
      include: { city: true },
      orderBy: [{ city: { name: "asc" } }, { name: "asc" }],
    });

    return NextResponse.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
