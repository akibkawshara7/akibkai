import { NextResponse } from "next/server";
import { scrapeHome } from "@/lib/scraper";
import { successResponse, errorResponse } from "@/lib/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const data = await scrapeHome();
    return successResponse({
      banner: data.banner,
      latest_updates: data.latest_updates,
      top_trending: data.top_trending,
    });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Unknown error");
  }
}
