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

export async function POST(request: NextRequest) {
  try {
    const { name, latitude, longitude, cityName } = await request.json();

    if (!name || !cityName) {
      return NextResponse.json(
        { success: false, error: "Name and city name are required" },
        { status: 400 }
      );
    }

    // Find or create city
    let city = await prisma.city.findFirst({
      where: { name: cityName },
    });

    if (!city) {
      city = await prisma.city.create({
        data: {
          name: cityName,
          nameVi: cityName, // Add Vietnamese name (same as name for now)
          country: "Vietnam", // Default country
          isActive: true,
        },
      });
    }

    // Create location
    const location = await prisma.location.create({
      data: {
        name: name.trim(),
        nameVi: name.trim(), // Add Vietnamese name
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        cityId: city.id,
        isActive: true,
      },
      include: { city: true },
    });

    return NextResponse.json({
      success: true,
      data: location,
    });
  } catch (error) {
    console.error("Error creating location:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
