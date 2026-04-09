import { NextResponse } from "next/server";
import { successResponse } from "@/lib/response";

export async function GET(): Promise<NextResponse> {
  return successResponse({
    api: "Anime Kai REST API",
    version: "1.1.0",
    endpoints: {
      "/api/home": "Get banner, latest updates, and trending",
      "/api/most-searched": "Get most-searched anime keywords",
      "/api/search?keyword=...": "Search anime",
      "/api/anime/:slug": "Get anime details and ani_id",
      "/api/episodes/:ani_id": "Get episode list and ep tokens",
      "/api/servers/:ep_token": "Get available servers for an episode",
      "/api/source/:link_id": "Get direct m3u8 stream and skip times",
      "/api/anikai/:anilist_id": "Get anime info by AniList ID",
      "/api/spotlight": "Get spotlight anime",
      "/api/items_home/:name?page={number}": "Get items by name",
      "/api/schedule?time={timestamp}": "Get schedule for a specific time",
    },
  });
}
