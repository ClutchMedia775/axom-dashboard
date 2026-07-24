import { DEFAULT_WEIGHTS } from "@/lib/scoring";

// Extra display-only terms worth surfacing as chips even though they don't
// map onto the scoring taxonomy directly.
const DISPLAY_TERMS = [
  "artificial intelligence",
  "machine learning",
  "deep learning",
  "quantum computing",
  "cybersecurity",
  "biotechnology",
  "synthetic biology",
  "neural networks",
];

const TAXONOMY_TERMS: string[] = DEFAULT_WEIGHTS.flatMap((w) => [w.key, ...w.aliases]);

function containsTerm(haystack: string, term: string): boolean {
  return new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(haystack);
}

/**
 * Deterministic keyword tagger: maps free solicitation text onto the scoring
 * taxonomy (keys + aliases from DEFAULT_WEIGHTS) so live opportunities score
 * the same way mock data does, plus a few display-only terms.
 */
export function tagKeywords(text: string): string[] {
  const tags = new Set<string>();
  for (const term of TAXONOMY_TERMS) {
    if (containsTerm(text, term)) tags.add(term);
  }
  for (const term of DISPLAY_TERMS) {
    if (containsTerm(text, term)) tags.add(term);
  }
  return [...tags];
}

/** Decode a numeric character reference, leaving anything out of range as-is. */
function fromCharCode(code: number, original: string): string {
  return Number.isFinite(code) && code > 0 && code <= 0x10ffff
    ? String.fromCodePoint(code)
    : original;
}

/**
 * Strip HTML tags and decode the entities the upstream feeds emit.
 *
 * Numeric references are decoded last and generically: RSS double-encodes
 * (`&amp;#039;`), so the `&amp;` pass above leaves a bare `&#039;` behind that
 * a fixed list of named entities would miss.
 */
export function cleanText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x([0-9a-fA-F]+);/g, (m, hex) => fromCharCode(parseInt(hex, 16), m))
    .replace(/&#(\d+);/g, (m, dec) => fromCharCode(Number(dec), m))
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(s: string, max = 400): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max).replace(/\s+\S*$/, "")}…`;
}
