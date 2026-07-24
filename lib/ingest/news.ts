import type { NewsItem } from "@/lib/types";
import { extractBlocks, tagText, toIsoDate } from "./feed";
import { cleanText } from "./tagger";

/**
 * Agency + science-press news ingestion over RSS.
 *
 * These feeds are general-purpose — the DOE feed carries solar timelines and
 * grid announcements alongside AI work — so items are filtered for relevance
 * to Axom's areas before they reach the dashboard. Without that filter the
 * news panel is mostly noise.
 */

interface Feed {
  src: string;
  url: string;
}

// NIH's news feed 404s (verified), so it is deliberately absent.
const FEEDS: Feed[] = [
  { src: "DOE", url: "https://www.energy.gov/rss.xml" },
  { src: "DARPA", url: "https://www.darpa.mil/rss.xml" },
  { src: "NSF", url: "https://www.nsf.gov/rss/rss_www_news.xml" },
  {
    src: "ScienceDaily",
    url: "https://www.sciencedaily.com/rss/computers_math/artificial_intelligence.xml",
  },
];

const RELEVANT =
  /\b(artificial intelligence|machine learning|deep learning|neural|autonomous|agentic|multi-agent|robotic|laborator|supercomput|exascale|high.performance computing|quantum|semiconductor|biotech|genomic|drug discovery|scientific comput|data science|foundation model|\bAI\b|\bML\b|\bHPC\b)/i;

/** "https://www.nsf.gov/news/new-nsf-initiative…" → "new-nsf-initiative…" */
function slugOf(link: string, fallback: string): string {
  const cleaned = link.split("?")[0].replace(/\/$/, "");
  const last = cleaned.split("/").pop();
  return (last || fallback).slice(0, 80);
}

function parseItems(xml: string, src: string): NewsItem[] {
  return extractBlocks(xml, "item").flatMap((block) => {
    const title = cleanText(tagText(block, "title"));
    const description = cleanText(tagText(block, "description"));
    const link = tagText(block, "link").trim();
    const date = toIsoDate(tagText(block, "pubDate"));
    if (!title || !date) return [];
    if (!RELEVANT.test(`${title} ${description}`)) return [];
    return [{ id: `news-${src.toLowerCase()}-${slugOf(link, title)}`, src, date, title }];
  });
}

/**
 * Fetch every configured feed, keep the items relevant to Axom's areas, and
 * return them newest first. A feed that fails is skipped rather than failing
 * the batch — one dead agency feed should not empty the panel.
 */
export async function fetchNews(limit = 30): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    FEEDS.map(async (f) => {
      const res = await fetch(f.url);
      if (!res.ok) throw new Error(`${f.src} feed failed: HTTP ${res.status}`);
      return parseItems(await res.text(), f.src);
    }),
  );

  const items = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  if (items.length === 0 && results.every((r) => r.status === "rejected")) {
    throw new Error("All news feeds failed");
  }

  // Dedupe by id — the same story can appear in more than one feed.
  const seen = new Set<string>();
  return items
    .filter((i) => (seen.has(i.id) ? false : (seen.add(i.id), true)))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}
