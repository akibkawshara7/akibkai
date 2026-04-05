import { NextResponse } from "next/server";
import { resolveSource } from "@/lib/scraper";
import { successResponse, errorResponse } from "@/lib/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { linkId: string } }
): Promise<NextResponse> {
  try {
    const data = await resolveSource(params.linkId);
    return successResponse({ ...data });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Unknown error");
  }
}
