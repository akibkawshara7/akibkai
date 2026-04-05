import { NextResponse } from "next/server";
import { searchAnime, scrapeAnimeInfo } from "@/lib/scraper";
import { successResponse, errorResponse } from "@/lib/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ANILIST_QUERY = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    title { romaji english native }
    synonyms
  }
}`;

export async function GET(
  _req: Request,
  { params }: { params: { anilistId: string } }
): Promise<NextResponse> {
  const anilistId = parseInt(params.anilistId, 10);
  if (isNaN(anilistId)) {
    return errorResponse("Invalid AniList ID", 400);
  }

  try {
    // 1. Resolve titles from AniList GraphQL
    const anilistRes = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: ANILIST_QUERY, variables: { id: anilistId } }),
    });

    if (!anilistRes.ok) throw new Error(`AniList API returned ${anilistRes.status}`);

    const anilistData = await anilistRes.json();
    const media = anilistData?.data?.Media;
    if (!media) {
      return errorResponse(`AniList ID ${anilistId} not found`, 404);
    }

    // Build prioritised search term list
    const searchTerms: string[] = [
      media.title?.romaji,
      media.title?.english,
      media.title?.native,
      ...(media.synonyms ?? []),
    ].filter(Boolean) as string[];

    // 2. Try each term until a match is found on AniKai
    for (const term of searchTerms) {
      const results = await searchAnime(term);
      if (!Array.isArray(results) || !results.length) continue;

      const slug = results[0]?.slug;
      if (!slug) continue;

      const animeInfo = await scrapeAnimeInfo(slug);
      return successResponse({
        anilist_id: anilistId,
        search_term_used: term,
        ...animeInfo,
      });
    }

    return errorResponse(
      `Anime with AniList ID ${anilistId} not found on AniKai`,
      404
    );
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Unknown error");
  }
}
