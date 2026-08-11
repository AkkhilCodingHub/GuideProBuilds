import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { generateRecommendation } from "@/lib/recommendation-engine";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { budget, useCase, performance, brands } = await req.json();
    
    if (!budget || !useCase || !performance) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const recommendation = await generateRecommendation({
      budget,
      useCase,
      performance,
      brands,
    });

    return NextResponse.json(recommendation);
  } catch (error: any) {
    console.error("Recommendation generation failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
