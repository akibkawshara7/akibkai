import * as cheerio from "cheerio";
import { config, HEADERS, AJAX_HEADERS } from "./config";
import { parseInfoSpans } from "./parser";
import { encodeToken, decodeKai, decodeMega } from "./crypto";
import { MegaUp } from "./megacup";
import type {
  AnimeItem,
  BannerItem,
  LatestItem,
  TrendingItem,
  HomeData,
  AnimeDetail,
  Episode,
  ServersData,
  SourceData,
  MostSearchedItem,
} from "../types";

// ---------- most-searched ----------

export async function scrapeMostSearched(): Promise<MostSearchedItem[]> {
  const res = await fetch(config.ANIMEKAI_URL, {
    headers: HEADERS,
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const $ = cheerio.load(await res.text());
  const section =
    $(".most_searched").first() ?? $(".most-searched").first();
  if (!section.length) throw new Error("Could not find most-searched section");

  const results: MostSearchedItem[] = [];
  section.find("a").each((_, el) => {
    const name = $(el).text().trim();
    const href = $(el).attr("href") ?? "";
    const keyword = href.includes("keyword=")
      ? href.split("keyword=").pop()!.replace(/\+/g, " ")
      : "";
    if (name) {
      results.push({
        name,
        keyword,
        search_url: href.startsWith("/")
          ? `${config.ANIMEKAI_URL.replace(/\/$/, "")}${href}`
          : href,
      });
    }
  });
  return results;
}

// ---------- search ----------

export async function searchAnime(keyword: string): Promise<AnimeItem[]> {
  const url = new URL(config.ANIMEKAI_SEARCH_URL);
  url.searchParams.set("keyword", keyword);

  const res = await fetch(url.toString(), {
    headers: AJAX_HEADERS,
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = await res.json();
  const html: string = json?.result?.html ?? "";
  if (!html) return [];

  const $ = cheerio.load(html);
  const results: AnimeItem[] = [];

  $("a.aitem").each((_, el) => {
    const item = $(el);
    const titleTag = item.find("h6.title");
    const title = titleTag.text().trim();
    const japanese_title = titleTag.attr("data-jp") ?? "";
    const poster = item.find(".poster img").attr("src") ?? "";
    const href = item.attr("href") ?? "";
    const slug = href.startsWith("/watch/") ? href.replace("/watch/", "") : href;

    let sub = "",
      dub = "",
      animeType = "",
      year = "",
      rating = "",
      total_eps = "";

    item.find(".info span").each((_, span) => {
      const cls = $(span).attr("class")?.split(" ") ?? [];
      const text = $(span).text().trim();
      if (cls.includes("sub")) sub = text;
      else if (cls.includes("dub")) dub = text;
      else if (cls.includes("rating")) rating = text;
      else {
        const hasB = $(span).find("b").length > 0;
        if (hasB && /^\d+$/.test(text)) total_eps = text;
        else if (hasB) animeType = text;
        else year = text;
      }
    });

    if (title) {
      results.push({
        title,
        japanese_title,
        slug,
        url: `${config.ANIMEKAI_URL.replace(/\/$/, "")}${href}`,
        poster,
        sub_episodes: sub,
        dub_episodes: dub,
        total_episodes: total_eps,
        year,
        type: animeType,
        rating,
      });
    }
  });

  return results;
}

// ---------- home ----------

export async function scrapeHome(): Promise<HomeData> {
  const res = await fetch(config.ANIMEKAI_HOME_URL, {
    headers: HEADERS,
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const $ = cheerio.load(await res.text());
  const base = config.ANIMEKAI_URL.replace(/\/$/, "");

  // Banner
  const banner: BannerItem[] = [];
  $(".swiper-slide").each((_, el) => {
    const slide = $(el);
    const style = slide.attr("style") ?? "";
    const poster = style.includes("url(")
      ? style.split("url(")[1].split(")")[0]
      : "";
    const titleTag = slide.find("p.title");
    const href = slide.find("a.watch-btn").attr("href") || "";
    const id = href.startsWith("/watch/") ? href.slice(7) : "";
    const title = titleTag.text().trim();
    const japanese_title = titleTag.attr("data-jp") ?? "";
    const description = slide.find("p.desc").text().trim();
    const infoEl = slide.find(".info");
    const { sub, dub, animeType } = parseInfoSpans($, infoEl);

    let genres = "";
    infoEl.find("span").each((_, span) => {
      const cls = $(span).attr("class") ?? "";
      if (!cls && !$(span).find("b").length) {
        const t = $(span).text().trim();
        if (t && !/^\d+$/.test(t)) genres = t;
      }
    });

    let rating = "",
      release = "",
      quality = "";
    slide.find(".mics > div").each((_, div) => {
      const lbl = $(div).find("div").first().text().trim().toLowerCase();
      const val = $(div).find("span").first().text().trim();
      if (lbl === "rating") rating = val;
      else if (lbl === "release") release = val;
      else if (lbl === "quality") quality = val;
    });

    if (title) {
      banner.push({
        id: id,
        title: title,
        japanese_title: japanese_title,
        description: description,
        poster: poster,
        url: href ? `${base}${href}` : "",
        sub_episodes: sub,
        dub_episodes: dub,
        type: animeType,
        genres: genres,
        rating: rating,
        release: release,
        quality: quality,
      });
    }
  });

  // Latest
  const latest: LatestItem[] = [];
  $(".aitem-wrapper.regular .aitem").each((_, el) => {
    const item = $(el);
    const titleTag = item.find("a.title");
    let href = item.find("a.poster").attr("href") ?? "";
    const episode = href.includes("#ep=") ? href.split("#ep=").pop()! : "";
    href = href.split("#ep=")[0];
    const id = href.startsWith("/watch/") ? href.slice(7) : "";
    const { sub, dub, animeType } = parseInfoSpans($, item.find(".info"));

    if (titleTag.text().trim()) {
      latest.push({
        id: id,
        title: titleTag.text().trim(),
        japanese_title: titleTag.attr("data-jp") ?? "",
        poster: item.find("img.lazyload").attr("data-src") ?? "",
        url: `${base}${href}`,
        current_episode: episode,
        sub_episodes: sub,
        dub_episodes: dub,
        type: animeType,
      });
    }
  });

  // Trending
  const top_trending: Record<string, TrendingItem[]> = {};
  const TAB_MAP: Record<string, string> = {
    trending: "NOW",
    day: "DAY",
    week: "WEEK",
    month: "MONTH",
  };

  for (const [tabId, tabLabel] of Object.entries(TAB_MAP)) {
    const container = $(`.aitem-col.top-anime[data-id="${tabId}"]`);
    if (!container.length) continue;
    const items: TrendingItem[] = [];

    container.find("a.aitem").each((_, el) => {
      const item = $(el);
      const style = item.attr("style") ?? "";
      const poster = style.includes("url(")
        ? style.split("url(")[1].split(")")[0]
        : "";
      const { sub, dub, animeType } = parseInfoSpans($, item.find(".info"));
      const id = item.attr("href")?.split("/").pop() ?? "";

      items.push({
        id: id,
        rank: item.find(".num").text().trim(),
        title: item.find(".detail .title").text().trim(),
        japanese_title: item.find(".detail .title").attr("data-jp") ?? "",
        poster,
        url: `${base}${item.attr("href") ?? ""}`,
        sub_episodes: sub,
        dub_episodes: dub,
        type: animeType,
      });
    });

    top_trending[tabLabel] = items;
  }

  return { banner, latest_updates: latest, top_trending };
}

// ---------- anime info ----------

export async function scrapeAnimeInfo(slug: string): Promise<AnimeDetail> {
  const url = `${config.ANIMEKAI_URL}watch/${slug}`;
  const res = await fetch(url, { headers: HEADERS, next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const $ = cheerio.load(await res.text());

  let ani_id = "";
  const syncScript = $("script#syncData");
  if (syncScript.length) {
    try {
      ani_id = JSON.parse(syncScript.html() ?? "")?.anime_id ?? "";
    } catch {
      /* ignore */
    }
  }

  const infoEl = $(".main-entity .info");
  const { sub, dub, animeType } = parseInfoSpans($, infoEl);

  const detail: Record<string, string | string[]> = {};
  $(".detail > div > div").each((_, div) => {
    const text = $(div).text().replace(/\s+/g, " ").trim();
    if (!text.includes(":")) return;
    const [rawKey, ...rest] = text.split(":");
    const key = rawKey.trim().toLowerCase().replace(/\s+/g, "_");
    const links = $(div).find("span a");
    detail[key] = links.length
      ? links.map((_, a) => $(a).text().trim()).get()
      : rest.join(":").trim();
  });

  const seasons = $(".swiper-wrapper.season .aitem")
    .map((_, el) => {
      const item = $(el);
      const d = item.find(".detail");
      return {
        title: d.find("span").first().text().trim(),
        episodes: d.find(".btn").first().text().trim(),
        poster: item.find("img").attr("src") ?? "",
        url: item.find("a.poster").length
          ? `${config.ANIMEKAI_URL.replace(/\/$/, "")}${item.find("a.poster").attr("href") ?? ""
          }`
          : "",
        active: (item.attr("class") ?? "").includes("active"),
      };
    })
    .get();

  const bgEl = $(".watch-section-bg");
  const bgStyle = bgEl.attr("style") ?? "";
  const bannerImg =
    bgStyle.includes("url(") ? bgStyle.split("url(")[1].split(")")[0] : "";

  const episodes: Episode[] = [];
  try {
    const epRes = await fetchEpisodes(ani_id);
    episodes.push(...epRes);
  } catch (e) {
    // ignore
  }

  return {
    ani_id,
    title: $("h1.title").first().text().trim(),
    japanese_title: $("h1.title").first().attr("data-jp") ?? "",
    description: $(".desc").first().text().trim(),
    poster: $(".poster img[itemprop='image']").attr("src") ?? "",
    banner: bannerImg,
    sub_episodes: sub,
    dub_episodes: dub,
    type: animeType,
    rating: infoEl.find(".rating").first().text().trim(),
    mal_score: $(".rate-box .value").first().text().trim(),
    detail,
    seasons,
    episodes,
  };
}

// ---------- episodes ----------

export async function fetchEpisodes(ani_id: string): Promise<Episode[]> {
  const encoded = await encodeToken(ani_id);
  if (!encoded) throw new Error("Token encryption failed");

  const url = new URL(config.ANIMEKAI_EPISODES_URL);
  url.searchParams.set("ani_id", ani_id);
  url.searchParams.set("_", encoded);

  const res = await fetch(url.toString(), {
    headers: AJAX_HEADERS,
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const html: string = (await res.json())?.result ?? "";
  if (!html) return [];

  const $ = cheerio.load(html);
  const episodes: Episode[] = [];

  $(".eplist a").each((_, el) => {
    const ep = $(el);
    const langs = ep.attr("langs") ?? "0";
    episodes.push({
      number: ep.attr("num") ?? "",
      slug: ep.attr("slug") ?? "",
      title: ep.find("span").first().text().trim(),
      japanese_title: ep.find("span").first().attr("data-jp") ?? "",
      token: ep.attr("token") ?? "",
      has_sub: /^\d+$/.test(langs) ? Boolean(parseInt(langs) & 1) : false,
      has_dub: /^\d+$/.test(langs) ? Boolean(parseInt(langs) & 2) : false,
    });
  });

  return episodes;
}

// ---------- servers ----------

export async function fetchServers(ep_token: string): Promise<ServersData> {
  const encoded = await encodeToken(ep_token);
  if (!encoded) throw new Error("Token encryption failed");

  const url = new URL(config.ANIMEKAI_SERVERS_URL);
  url.searchParams.set("token", ep_token);
  url.searchParams.set("_", encoded);

  const res = await fetch(url.toString(), {
    headers: AJAX_HEADERS,
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const html: string = (await res.json())?.result ?? "";
  const $ = cheerio.load(html);

  const servers: Record<string, ServersData["servers"][string]> = {};
  $(".server-items").each((_, group) => {
    const lang = $(group).attr("data-id") ?? "unknown";
    servers[lang] = $(group)
      .find(".server")
      .map((_, s) => ({
        name: $(s).text().trim(),
        server_id: $(s).attr("data-sid") ?? "",
        episode_id: $(s).attr("data-eid") ?? "",
        link_id: $(s).attr("data-lid") ?? "",
      }))
      .get();
  });

  return {
    watching: $(".server-note p").first().text().trim(),
    servers,
  };
}

// ---------- source ----------

export async function resolveSource(link_id: string): Promise<SourceData> {
  console.log("🔍 resolveSource called with:", link_id);

  // 🔐 Generate token using MegaUp API
  const encoded = await MegaUp.generateToken(link_id);
  console.log("🔐 Encoded token:", encoded);

  if (!encoded) throw new Error("Token encryption failed");

  const url = new URL(config.ANIMEKAI_LINKS_VIEW_URL);
  url.searchParams.set("id", link_id);
  url.searchParams.set("_", encoded);

  console.log("🌐 Fetching links view URL:", url.toString());

  const res = await fetch(url.toString(), {
    headers: AJAX_HEADERS,
    next: { revalidate: 0 },
  });

  console.log("📡 Response status (links view):", res.status);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = await res.json();
  console.log("📦 Raw links view response:", json);

  const encryptedResult: string = json?.result ?? "";
  console.log("🔒 Encrypted result:", encryptedResult);

  // 🔓 Decode iframe data using MegaUp
  const embedData = await MegaUp.decodeIframeData(encryptedResult);
  console.log("🔓 Decrypted embed data:", embedData);

  if (!embedData) throw new Error("Embed decryption failed");

  const embed_url = embedData.url || "";
  console.log("🎬 Embed URL:", embed_url);

  if (!embed_url) throw new Error("No embed URL found");

  // 🚀 Extract final sources directly
  const extracted = await MegaUp.extract(embed_url);
  console.log("🎥 Extracted media:", extracted);

  const output: SourceData = {
    embed_url,
    skip: embedData.skip ?? {},
    sources: extracted.sources ?? [],
    tracks: extracted.subtitles ?? [],
    download: extracted.download ?? "",
  };

  console.log("✅ Final output:", output);

  return output;
}