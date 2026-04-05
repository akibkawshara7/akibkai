import * as cheerio from "cheerio";

/**
 * Parses sub/dub/type from the .info element's spans.
 * Mirrors Python's parse_info_spans().
 */
export function parseInfoSpans(
  $: cheerio.CheerioAPI,
  infoEl: cheerio.Cheerio<any> | null
): { sub: string; dub: string; animeType: string } {
  let sub = "";
  let dub = "";
  let animeType = "";

  if (!infoEl || !infoEl.length) return { sub, dub, animeType };

  infoEl.find("span").each((_, span) => {
    const cls = $(span).attr("class")?.split(" ") ?? [];
    if (cls.includes("sub")) {
      sub = $(span).text().trim();
    } else if (cls.includes("dub")) {
      dub = $(span).text().trim();
    } else {
      const b = $(span).find("b");
      if (b.length) {
        animeType = $(span).text().trim();
      }
    }
  });

  return { sub, dub, animeType };
}
