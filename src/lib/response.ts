import { NextResponse } from "next/server";
import { AUTHOR_TAG } from "./config";

/** Wrap any successful payload with author tag (mirrors Python _finalize_io_v4). */
export function successResponse(
  data: Record<string, unknown>,
  status = 200
): NextResponse {
  return NextResponse.json({ Author: AUTHOR_TAG, success: true, ...data }, { status });
}

export function errorResponse(message: string, status = 500): NextResponse {
  return NextResponse.json(
    { Author: AUTHOR_TAG, success: false, error: message },
    { status }
  );
}
