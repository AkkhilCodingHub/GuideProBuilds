import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { storage } from "@/lib/storage";
import { getSessionId } from "@/lib/session";
import { sendPCRequestEmail } from "@/lib/email";
import { pcRequestSchema } from "@/shared/schema";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const requestData = pcRequestSchema.parse(body);

    const emailResult = await sendPCRequestEmail({
      customerName: requestData.customerName,
      customerEmail: requestData.customerEmail,
      customerPhone: requestData.customerPhone,
      customerCity: requestData.customerCity,
      customerBudget: requestData.customerBudget,
      customerNotes: requestData.customerNotes,
      items: requestData.items.map(item => ({
        partName: item.partName,
        partType: item.partType,
        partBrand: item.partBrand,
        price: item.price,
        quantity: item.quantity
      })),
      subtotal: requestData.subtotal,
      tax: requestData.tax,
      total: requestData.total,
      currency: requestData.currency,
    });

    const sessionId = await getSessionId();
    const cart = await storage.getCart(undefined, sessionId);
    if (cart) {
      await storage.clearCart(cart._id.toString());
    }

    return NextResponse.json({
      success: true,
      message: 'Your PC request has been sent to an expert builder. We will contact you through your email soon.',
      emailSent: emailResult.success,
      emailError: emailResult.success ? undefined : emailResult.error,
    });
  } catch (error: any) {
    console.error('PC request error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
