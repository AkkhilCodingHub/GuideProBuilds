import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { pcppService } from "@/lib/pcpp-service";

export async function POST() {
  try {
    await connectToDatabase();
    const parts = await pcppService.syncPCPPToDatabase();
    return NextResponse.json({
      success: true,
      count: parts.length,
      message: `Successfully synchronized ${parts.length} parts from PCPartPicker Python API!`,
    });
  } catch (error: any) {
    console.error("PCPP Sync error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
