import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { storage } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || undefined;
    const brand = searchParams.get("brand") || undefined;
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const query = searchParams.get("query") || undefined;
    const inStockStr = searchParams.get("inStock");
    const inStock = inStockStr === "true" ? true : inStockStr === "false" ? false : undefined;
    const sortBy = (searchParams.get("sortBy") as any) || undefined;
    const sortOrder = (searchParams.get("sortOrder") as any) || undefined;
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 20;

    const result = await storage.searchPartsAdvanced({
      type,
      brand,
      minPrice,
      maxPrice,
      query,
      inStock,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
