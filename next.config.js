/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from AniKai CDN
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.anikai.to" },
      { protocol: "https", hostname: "**.animekai.to" },
    ],
  },
  // Expose runtime env vars to server components
  env: {
    ANIMEKAI_URL: process.env.ANIMEKAI_URL ?? "",
    ANIMEKAI_HOME_URL: process.env.ANIMEKAI_HOME_URL ?? "",
    ANIMEKAI_SEARCH_URL: process.env.ANIMEKAI_SEARCH_URL ?? "",
    ANIMEKAI_EPISODES_URL: process.env.ANIMEKAI_EPISODES_URL ?? "",
    ANIMEKAI_SERVERS_URL: process.env.ANIMEKAI_SERVERS_URL ?? "",
    ANIMEKAI_LINKS_VIEW_URL: process.env.ANIMEKAI_LINKS_VIEW_URL ?? "",
    ENCDEC_URL: process.env.ENCDEC_URL ?? "",
    ENCDEC_DEC_KAI: process.env.ENCDEC_DEC_KAI ?? "",
    ENCDEC_DEC_MEGA: process.env.ENCDEC_DEC_MEGA ?? "",
  },
};

module.exports = nextConfig;