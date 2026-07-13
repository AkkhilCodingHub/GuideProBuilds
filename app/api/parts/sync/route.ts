import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { fetchLatestPartsFromMarket } from "@/lib/recommendation-engine";

export async function POST() {
  try {
    await connectToDatabase();
    const parts = await fetchLatestPartsFromMarket();
    return NextResponse.json({
      success: true,
      count: parts.length,
      message: "Parts synchronized with latest market catalog!",
    });
  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
