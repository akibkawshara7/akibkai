export const config = {
  // Configuration
  ANIMEKAI_URL: "https://anikai.to/",
  ANIMEKAI_HOME_URL: "https://anikai.to/home",
  ANIMEKAI_SEARCH_URL: "https://anikai.to/ajax/anime/search",
  ANIMEKAI_EPISODES_URL: "https://anikai.to/ajax/episodes/list",
  ANIMEKAI_SERVERS_URL: "https://anikai.to/ajax/links/list",
  ANIMEKAI_LINKS_VIEW_URL: "https://anikai.to/ajax/links/view",

  ENCDEC_URL: "https://enc-dec.app/api/enc-kai",
  ENCDEC_DEC_KAI: "https://enc-dec.app/api/dec-kai",
  ENCDEC_DEC_MEGA: "https://enc-dec.app/api/dec-mega",
} as const;

export const HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",

  "Accept":
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",

  "Accept-Language": "en-US,en;q=0.9",

  "Accept-Encoding": "gzip, deflate, br",

  "Cache-Control": "no-cache",

  "Pragma": "no-cache",

  "Connection": "keep-alive",

  "Upgrade-Insecure-Requests": "1",

  "Sec-Fetch-Dest": "document",

  "Sec-Fetch-Mode": "navigate",

  "Sec-Fetch-Site": "same-origin",

  "Sec-Fetch-User": "?1",

  "sec-ch-ua":
    '"Chromium";v="122", "Google Chrome";v="122", "Not:A-Brand";v="99"',

  "sec-ch-ua-mobile": "?0",

  "sec-ch-ua-platform": '"Windows"',

  Referer: "https://anikai.to/",

  Origin: "https://anikai.to",

  Cookie:
    "__p_mov=1; usertype=guest; session=vLrU4aKItp0QltI2asH83yugyWDsSSQtyl9sxWKO",
};

export const AJAX_HEADERS: Record<string, string> = {
  ...HEADERS,

  "X-Requested-With": "XMLHttpRequest",

  Accept: "application/json, text/javascript, */*; q=0.01",

  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",

  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",

  "sec-ch-ua":
    '"Chromium";v="122", "Google Chrome";v="122", "Not:A-Brand";v="99"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',

  Referer: "https://anikai.to/",
  Origin: "https://anikai.to",

  "Cache-Control": "no-cache",
  Pragma: "no-cache", // ✅ FIXED (comma added)

  Cookie:
    "__p_mov=1; usertype=guest; session=vLrU4aKItp0QltI2asH83yugyWDsSSQtyl9sxWKO",
};

// Author watermark (obfuscated)
const _V_L_1 = [
  114, 94, 91, 90, 31, 125, 70, 31, 104, 94, 83, 75, 90, 90, 90, 90, 90, 90,
  90, 90, 90, 90, 77, 31, 88, 86, 75, 87, 74, 93, 17, 92, 80, 82, 16, 72, 94,
  83, 75, 90, 77, 72, 87, 86, 75, 90, 18, 9, 6,
];
const _K_L_1 = 0x3f;

export const AUTHOR_TAG: string = "Made By Leo Devil";