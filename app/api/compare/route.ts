import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { compareParts } from "@/lib/recommendation-engine";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { partIds } = await req.json();
    
    if (!partIds || !Array.isArray(partIds) || partIds.length < 2) {
      return NextResponse.json(
        { error: "At least two part IDs are required for comparison" },
        { status: 400 }
      );
    }

    const comparison = await compareParts(partIds);
    return NextResponse.json(comparison);
  } catch (error: any) {
    console.error("Comparison failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
