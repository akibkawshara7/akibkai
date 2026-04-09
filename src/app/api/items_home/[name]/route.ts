import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { HEADERS } from "@/lib/config";

// ✅ Batch AniList fetch
async function getBatchAnilistIds(titles: string[]) {
    const uniqueTitles = [...new Set(titles.filter(Boolean))];

    if (!uniqueTitles.length) return {};

    let query = "query(";
    const variables: Record<string, string> = {};

    uniqueTitles.forEach((title, i) => {
        query += `$search${i}: String, `;
        variables[`search${i}`] = title;
    });

    query = query.slice(0, -2) + ") {\n";

    uniqueTitles.forEach((_, i) => {
        query += `
      anime${i}: Media(search: $search${i}, type: ANIME) {
        id
      }
    `;
    });

    query += "\n}";

    try {
        const res = await fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({ query, variables }),
        });

        const json = await res.json();
        const data = json?.data || {};

        const map: Record<string, number | null> = {};

        uniqueTitles.forEach((title, i) => {
            map[title] = data[`anime${i}`]?.id || null;
        });

        return map;
    } catch (err) {
        console.error("AniList batch error:", err);
        return {};
    }
}

export async function GET(req: Request, { params }: { params: { name: string } }) {
    try {
        const { name } = params;

        // ✅ GET PAGE FROM QUERY (?page=2)
        const { searchParams } = new URL(req.url);
        const page = Number(searchParams.get("page")) || 1;

        const url = `https://anikai.to/ajax/home/items?name=${name}&page=${page}`;

        const res = await fetch(url, {
            headers: {
                ...HEADERS,
                "X-Requested-With": "XMLHttpRequest",
            },
        });

        const jsonData = await res.json();
        const html = jsonData.result;

        const $ = cheerio.load(html);

        const tempList: any[] = [];

        $(".aitem").each((_, el) => {
            const title = $(el).find(".title").attr("title")?.trim() || "";
            const jpTitle = $(el).find(".title").attr("data-jp") || "";

            const link = $(el).find(".poster").attr("href") || "";
            const id = link.split("/watch/")[1]?.split("#")[0] || "";

            const image = $(el).find("img").attr("data-src") || "";

            const episode = $(el).find(".sub").text().trim() || "";

            const infoElements = $(el).find(".info span b");
            const type = infoElements.last().text().trim() || "";
            const totalEpisodes = infoElements.first().text().trim() || "";

            tempList.push({
                id,
                title,
                jpTitle,
                image,
                episode: Number(episode) || 0,
                totalEpisodes: totalEpisodes ? Number(totalEpisodes) : null,
                type,
                link,
            });
        });

        // ✅ AniList batching
        const titles = tempList.map(item => item.jpTitle || item.title);
        const anilistMap = await getBatchAnilistIds(titles);

        const animeList = tempList.map(item => ({
            ...item,
            anilist_id:
                anilistMap[item.jpTitle] ||
                anilistMap[item.title] ||
                null,
        }));

        return NextResponse.json({
            status: "ok",
            page, // ✅ current page
            results: animeList.length,
            data: animeList,
        });

    } catch (error) {
        console.error("API ERROR:", error);

        return NextResponse.json(
            { status: "error", message: "Failed to fetch data" },
            { status: 500 }
        );
    }
}
