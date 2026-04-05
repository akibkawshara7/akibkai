import { config, HEADERS } from "./config";

export async function encodeToken(text: string): Promise<string | null> {
  try {
    const url = new URL(config.ENCDEC_URL);
    url.searchParams.set("text", text);
    const res = await fetch(url.toString(), {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.status === 200 ? (data?.result ?? null) : null;
  } catch {
    return null;
  }
}

export async function decodeKai(
  text: string
): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(config.ENCDEC_DEC_KAI, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.status === 200 ? (data?.result ?? null) : null;
  } catch {
    return null;
  }
}

export async function decodeMega(
  text: string
): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(config.ENCDEC_DEC_MEGA, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, agent: HEADERS["User-Agent"] }),
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.status === 200 ? (data?.result ?? null) : null;
  } catch {
    return null;
  }
}
