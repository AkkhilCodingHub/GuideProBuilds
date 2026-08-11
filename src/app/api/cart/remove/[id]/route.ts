import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { storage } from "@/lib/storage";
import { getSessionId } from "@/lib/session";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const sessionId = await getSessionId();
    const partId = (await params).id;
    
    const cart = await storage.getCart(undefined, sessionId);
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const updatedCart = await storage.removeFromCart(cart._id.toString(), partId);
    return NextResponse.json(updatedCart);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
