export interface LetterboxdEntry {
  title: string;
  link: string;
  published: string;
  rating: string;
  review: string;
  poster?: string;
}

const FEED_URL = "https://letterboxd.com/saichndra/rss/";

function decode(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_match: string, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_match: string, code: string) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function tag(source: string, name: string) {
  const match = source.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return match ? decode(match[1]).trim() : "";
}

function textFromHtml(value: string) {
  return decode(value)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function getLetterboxdEntries(): Promise<LetterboxdEntry[]> {
  try {
    const response = await fetch(FEED_URL, {
      headers: { "User-Agent": "PraneethReddyPortfolio/1.0 (+https://letterboxd.com/saichndra/)" },
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return [];

    const xml = await response.text();
    return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 8).map((match) => {
      const item: string = match[1] ?? "";
      const rawTitle = tag(item, "title");
      const description = tag(item, "description");
      const image = description.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];
      const rating = rawTitle.match(/[★½]+/)?.[0] ?? "";
      const title = rawTitle.replace(/\s*[-–—]?\s*[★½]+.*$/, "").replace(/\s*\(\d{4}\)\s*$/, "").trim();
      return {
        title: title || rawTitle || "Recent watch",
        link: tag(item, "link") || "https://letterboxd.com/saichndra/",
        published: tag(item, "pubDate"),
        rating,
        review: textFromHtml(description).slice(0, 150),
        poster: image,
      };
    });
  } catch {
    return [];
  }
}
