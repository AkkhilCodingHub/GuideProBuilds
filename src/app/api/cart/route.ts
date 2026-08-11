import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { storage } from "@/lib/storage";
import { getSessionId } from "@/lib/session";

export async function GET() {
  try {
    await connectToDatabase();
    const sessionId = await getSessionId();
    const cart = await storage.getOrCreateCart(undefined, sessionId);
    return NextResponse.json(cart);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
