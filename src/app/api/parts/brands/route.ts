import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { storage } from "@/lib/storage";

export async function GET() {
  try {
    await connectToDatabase();
    const brands = await storage.getAllBrands();
    return NextResponse.json(brands);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
