import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { storage } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { ids } = await req.json();
    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: "ids must be an array" }, { status: 400 });
    }
    const parts = await storage.getPartsByIds(ids);
    return NextResponse.json(parts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
