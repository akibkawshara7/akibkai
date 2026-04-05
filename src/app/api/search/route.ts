import { type NextRequest, NextResponse } from "next/server";
import { searchAnime } from "@/lib/scraper";
import { successResponse, errorResponse } from "@/lib/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const keyword = req.nextUrl.searchParams.get("keyword")?.trim() ?? "";
  if (!keyword) {
    return errorResponse("keyword query param is required", 400);
  }

  try {
    const results = await searchAnime(keyword);
    return successResponse({ keyword, count: results.length, results });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Unknown error");
  }
}
