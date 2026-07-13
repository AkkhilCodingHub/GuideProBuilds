import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { storage } from "@/lib/storage";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const id = (await params).id;
    const part = await storage.getPart(id);
    if (!part) {
      return NextResponse.json({ error: "Part not found" }, { status: 404 });
    }
    return NextResponse.json(part);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
