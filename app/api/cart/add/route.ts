import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { storage } from "@/lib/storage";
import { getSessionId } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const sessionId = await getSessionId();
    const { partId, quantity } = await req.json();
    
    if (!partId) {
      return NextResponse.json({ error: "partId is required" }, { status: 400 });
    }

    const cart = await storage.getOrCreateCart(undefined, sessionId);
    const updatedCart = await storage.addToCart(cart._id.toString(), partId, quantity || 1);
    return NextResponse.json(updatedCart);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
