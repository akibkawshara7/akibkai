import { scrapeHome } from '@/lib/scraper';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const data = await scrapeHome();

    return new NextResponse(
      JSON.stringify({ banner: data.banner }),
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*", // allow all (dev)
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error) {
    console.error('Error fetching spotlight:', error);

    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch spotlight' }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}

// 🔥 Handle preflight request
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}