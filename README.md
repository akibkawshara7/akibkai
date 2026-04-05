<div align="center">
  <img src="https://i.ibb.co/LMHCkMP/a9ac83a4a9395baac1907c584a52c3bf.jpg" alt="AnimeKai API" width="200">
  <h1>🎬 AnimeKai Next.js API</h1>
  <p><strong>A modern, high-performance anime streaming API built with Next.js 14</strong></p>
  
  [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/leodevil334-eng/AnimeKai-API.git)
  [![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
  
  > **Author:** Leo Devil
  
  [Features](#-features) • [Quick Start](#-quick-start) • [API Endpoints](#-api-endpoints) • [Project Structure](#-project-structure) • [Deployment](#-deployment)
</div>

---

## 📖 About

A **Next.js 14** (App Router) port of the Python/Flask AnimeKai scraper API. All scraping logic is built with **Cheerio** and **TypeScript** for maximum performance and type safety.

### ✨ Features

- 🚀 **High Performance** - Built on Next.js 14 with edge-ready architecture
- 🔒 **Type Safe** - Full TypeScript implementation with strict mode
- 📦 **Zero Dependencies** - Uses native fetch instead of axios/requests
- 🎯 **SEO Optimized** - Server-side rendering ready endpoints
- 🔐 **Secure** - Server-only environment variables
- 📱 **Responsive** - JSON responses optimized for any client

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 14 (App Router) | Modern React framework with API routes |
| HTML Parsing | Cheerio | Fast jQuery-like DOM manipulation |
| Language | TypeScript (strict) | Type safety and better DX |
| Runtime | Node.js | Full Node.js ecosystem support |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- npm/yarn/pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/leodevil334-eng/AnimeKai-API.git
cd AnimeKai-API

# Install dependencies
npm install
# or
bun install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
# or
bun dev
Environment Variables
Create a .env.local file with the following variables:

env
# Required URLs
BASE_URL=https://animekai.to
BASE_URL_CDN=https://cdn.animekai.to
BASE_API_URL=https://api.animekai.to

# Optional: Custom configuration
NEXT_PUBLIC_API_TIMEOUT=30000
⚠️ Note: All environment variables are server-only and never exposed to the browser.

📡 API Endpoints
Base Information
Method	Endpoint	Description
GET	/api	API information and endpoint list
Content Endpoints
Method	Endpoint	Description
GET	/api/home	Banner, latest updates, trending anime
GET	/api/most-searched	Most searched keywords
GET	/api/search?keyword={query}	Search anime by keyword
Anime Details
Method	Endpoint	Description
GET	/api/anime/{slug}	Complete anime details with ani_id
GET	/api/episodes/{aniId}	Episode list with tokens
GET	/api/servers/{epToken}	Available servers for an episode
GET	/api/source/{linkId}	Direct m3u8 stream URL with skip times
Utility Endpoints
Method	Endpoint	Description
GET	/api/anikai/{anilistId}	Lookup by AniList ID
Example Response
json
{
  "status": "success",
  "author": "Leo Devil",
  "data": {
    "title": "Solo Leveling",
    "episodes": [...],
    "stream_url": "https://..."
  }
}
📁 Project Structure
text
AnimeKai-API/
├── src/
│   ├── app/
│   │   └── api/
│   │       ├── route.ts                    # GET /api
│   │       ├── home/route.ts               # GET /api/home
│   │       ├── most-searched/route.ts      # GET /api/most-searched
│   │       ├── search/route.ts             # GET /api/search
│   │       ├── anime/[slug]/route.ts       # GET /api/anime/:slug
│   │       ├── episodes/[aniId]/route.ts   # GET /api/episodes/:aniId
│   │       ├── servers/[epToken]/route.ts  # GET /api/servers/:epToken
│   │       ├── source/[linkId]/route.ts    # GET /api/source/:linkId
│   │       └── anikai/[anilistId]/route.ts # GET /api/anikai/:anilistId
│   ├── lib/
│   │   ├── config.ts       # Environment configuration
│   │   ├── crypto.ts       # Token encoding/decoding
│   │   ├── parser.ts       # Cheerio parsing helpers
│   │   ├── response.ts     # Response formatters
│   │   └── scraper.ts      # Core scraping logic
│   └── types/
│       └── index.ts        # TypeScript interfaces
├── .env.example            # Environment template
├── package.json            # Dependencies
└── tsconfig.json          # TypeScript config
🔄 Flask vs Next.js Migration
Flask Version	Next.js Version
requests + BeautifulSoup	Native fetch + cheerio
@app.route decorators	export async function GET()
Flask middleware	src/lib/response.ts helper
Module-level constants	process.env configuration
Python types	Full TypeScript interfaces
🚢 Deployment
Deploy to Vercel (Recommended)
https://vercel.com/button

Manual Deployment
bash
# Build the application
npm run build

# Start production server
npm start
Docker Deployment
dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
📝 Usage Examples
JavaScript/TypeScript
typescript
// Search for anime
const search = await fetch('https://your-api.com/api/search?keyword=naruto');
const results = await search.json();

// Get anime details
const anime = await fetch('https://your-api.com/api/anime/naruto');
const details = await anime.json();

// Get streaming source
const source = await fetch('https://your-api.com/api/source/abc123');
const stream = await source.json();
Python
python
import requests

# Search anime
response = requests.get('https://your-api.com/api/search', 
                       params={'keyword': 'one piece'})
data = response.json()

# Get streaming URL
source = requests.get(f'https://your-api.com/api/source/{link_id}')
stream_url = source.json()['data']['sources'][0]['file']
🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

Fork the repository

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Original AnimeKai platform for providing the content

Next.js team for the amazing framework

All contributors and users of this API

<div align="center"> Made with ❤️ by <a href="https://github.com/leodevil334-eng">Leo Devil</a> </div> ```
This README features:

🎨 Visual header with badges

📖 Clear sections with emojis

📊 Tech stack comparison table

🔄 Migration guide from Flask

💻 Multi-language code examples

🚀 Deployment options (Vercel, Docker)

🎯 Professional formatting and structure

📱 Mobile-responsive design

The file is ready to copy and paste into your project!
