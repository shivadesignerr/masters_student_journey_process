import { NextResponse } from "next/server";
import { getStoreFromMongo } from "@/lib/db/mongoStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const store = await getStoreFromMongo();
    return NextResponse.json({ success: true, store });
  } catch (err: any) {
    // Graceful offline fallback: return 200 so clients continue on local store without logging 500 network errors
    return NextResponse.json({
      success: false,
      offline: true,
      message: err.message || "Database synchronization offline, running on local data store.",
    });
  }
}
