import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { storage } from "@/lib/storage";
import { getSessionId } from "@/lib/session";

export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase();
    const sessionId = await getSessionId();
    const { partId, quantity } = await req.json();
    
    if (!partId || quantity === undefined) {
      return NextResponse.json({ error: "partId and quantity are required" }, { status: 400 });
    }

    const cart = await storage.getCart(undefined, sessionId);
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const updatedCart = await storage.updateCartItem(cart._id.toString(), partId, quantity);
    return NextResponse.json(updatedCart);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
