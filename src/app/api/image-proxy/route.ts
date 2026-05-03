import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy d'images avec cache agressif (Vercel Edge / CDN).
 *
 * Usage : /api/image-proxy?url=<encoded-url>
 *
 * - Limite aux hosts autorises (Pollinations)
 * - Cache HTTP public immutable 30 jours (Vercel CDN + navigateur)
 * - Retry cote serveur sur 429 (jusqu'a 3x)
 * - Fallback image placeholder en cas d'echec
 */

const ALLOWED_HOSTS = new Set([
  "image.pollinations.ai",
  "pollinations.ai",
]);

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=2592000, s-maxage=31536000, immutable",
  "CDN-Cache-Control": "public, max-age=31536000",
  "Vercel-CDN-Cache-Control": "public, max-age=31536000",
};

async function fetchWithRetry(url: string, maxAttempts = 3): Promise<Response> {
  let delay = 1000;
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "EleoFormation-Proxy/1.0" },
        signal: AbortSignal.timeout(30000),
      });
      if (res.status === 429 && i < maxAttempts) {
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
        continue;
      }
      return res;
    } catch (e) {
      if (i >= maxAttempts) throw e;
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
  throw new Error("Max retries exceeded");
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "url parameter required" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    return NextResponse.json({ error: "host not allowed" }, { status: 403 });
  }

  try {
    const upstream = await fetchWithRetry(url);
    if (!upstream.ok) {
      return NextResponse.json(
        { error: `upstream ${upstream.status}` },
        { status: upstream.status },
      );
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    const buf = await upstream.arrayBuffer();

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        ...CACHE_HEADERS,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
