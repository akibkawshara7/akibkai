import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { AJAX_HEADERS } from "@/lib/config";

const BASE_URL = "https://anikai.to";

// 🔥 Normalize titles (remove noise)
function normalizeTitle(title: string): string {
    return title.toLowerCase().replace(/season\s*\d+/gi, "").replace(/\([^)]*\)/g, "").replace(/[^a-z0-9 ]/gi, " ").replace(/\s+/g, " ").trim();
}

// 🔥 Simple fuzzy score
function similarity(a: string, b: string): number {
    a = normalizeTitle(a);
    b = normalizeTitle(b);
    if (!a || !b) return 0;
    let matches = 0;
    const wordsA = a.split(" ");
    const wordsB = b.split(" ");
    wordsA.forEach((w) => {
        if (wordsB.includes(w)) matches++;
    });
    return matches / Math.max(wordsA.length, wordsB.length);
}

// 🔥 Batch search with MULTIPLE candidates
async function getAnilistBatchAdvanced(items: any[]) {
    const queries = items.map((item, i) => {
        const t = JSON.stringify(item.title);
        const j = item.jpTitle ? JSON.stringify(item.jpTitle) : null;
        return `
      t${i}: Page(perPage: 5) {
        media(search: ${t}, type: ANIME) {
          id
          title { romaji english native }
          bannerImage
          coverImage { extraLarge }
        }
      }
      ${j ? `
      j${i}: Page(perPage: 5) {
        media(search: ${j}, type: ANIME) {
          id
          title { romaji english native }
          bannerImage
          coverImage { extraLarge }
        }
      }
      ` : ""}
      `;
    });
    const query = `query { ${queries.join("")} }`;

    const res = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({ query }),
    });

    const data = await res.json();

    return items.map((item, i) => {
        const candidates = [
            ...(data.data?.[`t${i}`]?.media || []),
            ...(item.jpTitle ? data.data?.[`j${i}`]?.media || [] : []),
        ];

        let best = null;
        let bestScore = 0;

        for (const media of candidates) {
            const titles = [
                media.title?.romaji,
                media.title?.english,
                media.title?.native,
            ].filter(Boolean);

            for (const t of titles) {
                const score = Math.max(
                    similarity(item.title, t),
                    similarity(item.jpTitle || "", t)
                );
                if (score > bestScore) {
                    bestScore = score;
                    best = media;
                }
            }
        }

        return best ? {
            anilistId: best.id,
            banner: best.bannerImage || best.coverImage?.extraLarge,
        } : null;
    });
}

export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}

async function getTimezoneFromIP(ip: string): Promise<string> {
    try {
        const res = await fetch(`https://ipapi.co/${ip}/json/`);
        const data = await res.json();
        if (data.timezone) {
            const now = new Date();
            const offset = now.toLocaleString('en', { timeZone: data.timezone, timeZoneName: 'short' }).match(/GMT([+-]\d{2}:\d{2})/)?.[1] || '+05:30';
            return offset;
        }
    } catch (err) {
        console.error('Failed to get timezone from IP:', err);
    }
    return '+05:30';
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        let time = searchParams.get("time");

        // Get user's IP
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '127.0.0.1';
        const tz = await getTimezoneFromIP(ip);
        const TZ = encodeURIComponent(tz);

        const scheduleRes = await fetch(`${BASE_URL}/ajax/schedule`, {
            headers: AJAX_HEADERS,
        });

        const scheduleData = await scheduleRes.json();
        const $ = cheerio.load(scheduleData.result);

        const days: any[] = [];
        let activeTime = "";

        $(".day").each((_, el) => {
            const timestamp = $(el).attr("data-time") || "";

            const dayObj = {
                day: $(el).find("span").text(),
                date: $(el).find("div").text(),
                fullDate: $(el).attr("title"),
                timestamp,
                active: $(el).hasClass("active"),
            };

            if (dayObj.active) activeTime = timestamp;
            days.push(dayObj);
        });

        const selectedTime = time || activeTime;

        const itemsRes = await fetch(
            `${BASE_URL}/ajax/schedule/items?tz=${TZ}&time=${selectedTime}`,
            { headers: { "X-Requested-With": "XMLHttpRequest" } }
        );

        const itemsData = await itemsRes.json();
        const $$ = cheerio.load(itemsData.result);

        const items: any[] = [];

        $$("li").each((_, el) => {
            const link = $$(el).find("a");

            items.push({
                time: link.find(".time").text(),
                title: link.find(".title").text(),
                jpTitle: link.find(".title").attr("data-jp") || null,
                episode: link.find("span").last().text(),
                url: link.attr("href"),
                isCurrent: link.hasClass("current"),
                isPassed: link.hasClass("passed"),
            });
        });

        // 🔥 Advanced matching
        const anilistResults = await getAnilistBatchAdvanced(items);

        const schedule = items.map((item, i) => ({
            ...item,
            anilistId: anilistResults[i]?.anilistId || null,
            banner: anilistResults[i]?.banner || null,
        }));

        return NextResponse.json({
            status: "ok",
            selectedTime,
            days,
            schedule,
        }, {
            headers: {
                'Cache-Control': 'public, max-age=900',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
