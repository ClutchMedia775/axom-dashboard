import type { Paper } from "@/lib/types";
import { attrValues, extractBlocks, tagText, toIsoDate } from "./feed";
import { cleanText, tagKeywords } from "./tagger";

/**
 * arXiv ingestion. Pulls the most recent preprints matching Axom's technology
 * areas and normalizes them into the shared Paper type. Papers are tagged with
 * the same taxonomy tagger the opportunity pipeline uses, so a paper's chips
 * and a solicitation's chips mean the same thing.
 */

const API = "https://export.arxiv.org/api/query";

// Phrase searches, OR'd. Narrower than the scoring taxonomy on purpose: broad
// terms like "robotics" would swamp the feed with work unrelated to Axom.
const QUERY_PHRASES = [
  "autonomous laboratory",
  "self-driving laboratory",
  "multi-agent",
  "agentic",
  "AI for science",
  "scientific discovery",
  "laboratory automation",
];

interface ArxivEntry {
  id: string;
  title: string;
  summary: string;
  published: string;
  categories: string[];
  primary: string;
}

function parseEntry(block: string): ArxivEntry {
  return {
    id: tagText(block, "id"),
    title: cleanText(tagText(block, "title")),
    summary: cleanText(tagText(block, "summary")),
    published: tagText(block, "published"),
    categories: attrValues(block, "category", "term"),
    primary: attrValues(block, "arxiv:primary_category", "term")[0] ?? "",
  };
}

function normalize(e: ArxivEntry): Paper {
  // "http://arxiv.org/abs/2607.21071v1" → "2607.21071v1"
  const shortId = e.id.split("/abs/")[1] ?? e.id;
  const primary = e.primary || e.categories[0] || "";
  // Taxonomy chips first (they carry meaning across the app), then the arXiv
  // subject classes, deduped.
  const tags = [...new Set([...tagKeywords(`${e.title} ${e.summary}`), ...e.categories])];
  return {
    id: `arxiv-${shortId}`,
    title: e.title,
    venue: primary ? `arXiv ${primary}` : "arXiv",
    date: toIsoDate(e.published),
    tags,
  };
}

/**
 * Fetch recent arXiv preprints across Axom's technology areas, newest first.
 */
export async function fetchArxivPapers(maxResults = 30): Promise<Paper[]> {
  const search = QUERY_PHRASES.map((p) => `all:"${p}"`).join(" OR ");
  const params = new URLSearchParams({
    search_query: search,
    start: "0",
    max_results: String(maxResults),
    sortBy: "submittedDate",
    sortOrder: "descending",
  });

  const res = await fetch(`${API}?${params}`);
  if (!res.ok) throw new Error(`arXiv query failed: HTTP ${res.status}`);
  const xml = await res.text();

  return extractBlocks(xml, "entry")
    .map((b) => normalize(parseEntry(b)))
    .filter((p) => p.title !== "" && p.date !== "");
}
