# AnimeKai Next.js API

A **Next.js 14** (App Router) port of the Python/Flask AnimeKai scraper API.  
All scraping logic lives in `src/lib/`, routes in `src/app/api/`.

## Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 14 (App Router) |
| HTML parsing | cheerio |
| Language | TypeScript (strict) |
| Runtime | Node.js (`runtime = "nodejs"`) |

## Project Structure

```
src/
├── app/
│   └── api/
│       ├── route.ts                    → GET /api  (index)
│       ├── home/route.ts               → GET /api/home
│       ├── most-searched/route.ts      → GET /api/most-searched
│       ├── search/route.ts             → GET /api/search?keyword=
│       ├── anime/[slug]/route.ts       → GET /api/anime/:slug
│       ├── episodes/[aniId]/route.ts   → GET /api/episodes/:aniId
│       ├── servers/[epToken]/route.ts  → GET /api/servers/:epToken
│       ├── source/[linkId]/route.ts    → GET /api/source/:linkId
│       └── anikai/[anilistId]/route.ts → GET /api/anikai/:anilistId
├── lib/
│   ├── config.ts    ← env vars + author watermark
│   ├── crypto.ts    ← encodeToken / decodeKai / decodeMega
│   ├── parser.ts    ← parseInfoSpans (cheerio helper)
│   ├── response.ts  ← successResponse / errorResponse helpers
│   └── scraper.ts   ← all scraping functions
└── types/index.ts   ← shared TypeScript interfaces
```

## Setup

```bash
cp .env.example .env.local
# fill in your real URLs in .env.local

npm install
npm run dev
```

## Environment Variables

See `.env.example` for all required variables.  
All vars are server-only (never exposed to the browser).

## Endpoint Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api` | API info & endpoint list |
| GET | `/api/home` | Banner, latest updates, trending |
| GET | `/api/most-searched` | Most-searched keywords |
| GET | `/api/search?keyword=` | Search anime |
| GET | `/api/anime/:slug` | Anime details + `ani_id` |
| GET | `/api/episodes/:aniId` | Episode list + tokens |
| GET | `/api/servers/:epToken` | Servers for an episode |
| GET | `/api/source/:linkId` | Direct m3u8 stream + skip times |
| GET | `/api/anikai/:anilistId` | Lookup by AniList ID |

## Key Differences from Flask Version

- `requests` + `BeautifulSoup` → native `fetch` + `cheerio`
- Flask middleware → `src/lib/response.ts` helper injects `Author` field on every JSON response
- `@app.route` decorators → Next.js App Router `export async function GET()`
- Configuration via `process.env` instead of module-level constants
- Full TypeScript types for all data structures