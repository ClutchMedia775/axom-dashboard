import type { VentureRound } from "@/lib/types";

/**
 * SEC EDGAR ingestion for private funding rounds.
 *
 * Private raises surface as Form D (Regulation D exempt offering) filings.
 * Two things about that data shape drive this module:
 *
 * 1. Form D does not carry a round label. There is no "Series B" field — only
 *    amounts. So `round` reports the amount actually sold and never invents a
 *    series name.
 * 2. A full-text search for AI terms returns mostly *investment funds* whose
 *    names contain the search phrase ("Brookfield Artificial Intelligence
 *    Infrastructure Fund-A, L.P."), not AI companies raising money. Those are
 *    filtered out by industry group, which is what makes the panel useful.
 *
 * SEC's access policy requires a declared User-Agent with real contact info;
 * set SEC_EDGAR_USER_AGENT. Requests are batched to stay well under their
 * 10 requests/second guidance.
 */

const SEARCH_URL = "https://efts.sec.gov/LATEST/search-index";
const ARCHIVE_URL = "https://www.sec.gov/Archives/edgar/data";

const SEARCH_PHRASES = ["artificial intelligence", "machine learning"];

/** Pooled vehicles are funds raising capital, not companies being funded. */
const EXCLUDED_INDUSTRIES = new Set(["Pooled Investment Fund", "Other Investment Fund"]);

const DETAIL_BATCH = 5;

function userAgent(): string {
  return (
    process.env.SEC_EDGAR_USER_AGENT ??
    "Axom Federal Intelligence Dashboard (contact not configured)"
  );
}

interface SearchHit {
  _id: string;
  _source: { ciks?: string[]; display_names?: string[]; file_date?: string };
}

/** 85000000 → "$85.0M"; 850000 → "$850K" */
function formatAmount(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

function field(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`, "i"));
  return m ? m[1].trim() : "";
}

/** Thrown when SEC rejects us outright, so the cause is visible rather than
 *  surfacing as a silently empty panel. */
class SecRejectedError extends Error {}

async function fetchFiling(hit: SearchHit): Promise<VentureRound | null> {
  const [accession, file] = hit._id.split(":");
  const cik = (hit._source.ciks?.[0] ?? "").replace(/^0+/, "");
  if (!cik || !accession || !file) return null;

  try {
    const url = `${ARCHIVE_URL}/${cik}/${accession.replace(/-/g, "")}/${file}`;
    const res = await fetch(url, { headers: { "User-Agent": userAgent() } });
    // www.sec.gov enforces the contact policy that the search host does not:
    // a User-Agent without real contact details gets a blanket 403, which
    // would otherwise filter every filing out and look like "no results".
    if (res.status === 403) {
      throw new SecRejectedError(
        "SEC returned 403 for filing documents. Set SEC_EDGAR_USER_AGENT to real contact details, e.g. \"Your Org (you@example.com)\".",
      );
    }
    if (!res.ok) return null;
    const xml = await res.text();

    const industry = field(xml, "industryGroupType");
    if (EXCLUDED_INDUSTRIES.has(industry)) return null;

    // "Indefinite" and other non-numeric values parse to NaN and are dropped —
    // this panel reports money actually raised, not offerings merely announced.
    const sold = Number(field(xml, "totalAmountSold"));
    if (!Number.isFinite(sold) || sold <= 0) return null;

    const name = field(xml, "entityName") || (hit._source.display_names?.[0] ?? "").split("  (CIK")[0];
    if (!name) return null;

    return {
      id: `edgar-${accession}`,
      co: name,
      round: `${formatAmount(sold)} raised`,
      focus: industry || "—",
      date: hit._source.file_date ?? "",
      // Human-readable filing index page, not the raw XML we parsed.
      link: `https://www.sec.gov/Archives/edgar/data/${cik}/${accession.replace(/-/g, "")}/${accession}-index.htm`,
    };
  } catch (error) {
    // A single unparseable filing is skipped, but an outright rejection is a
    // configuration fault affecting every filing — let it surface.
    if (error instanceof SecRejectedError) throw error;
    return null;
  }
}

async function search(phrase: string): Promise<SearchHit[]> {
  const params = new URLSearchParams({ q: `"${phrase}"`, forms: "D" });
  const res = await fetch(`${SEARCH_URL}?${params}`, {
    headers: { "User-Agent": userAgent() },
  });
  if (!res.ok) throw new Error(`EDGAR search failed: HTTP ${res.status}`);
  const json = await res.json();
  return (json?.hits?.hits as SearchHit[]) ?? [];
}

/**
 * Recent Form D filings from AI-adjacent operating companies, newest first.
 */
export async function fetchVentureRounds(limit = 12): Promise<VentureRound[]> {
  const searches = await Promise.allSettled(SEARCH_PHRASES.map(search));
  const hits = searches.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  if (hits.length === 0) throw new Error("EDGAR search returned no filings");

  // Dedupe by accession, then work newest-first so the detail budget is spent
  // on the filings most likely to be shown.
  const byId = new Map<string, SearchHit>();
  for (const h of hits) if (!byId.has(h._id)) byId.set(h._id, h);
  const ordered = [...byId.values()].sort((a, b) =>
    (b._source.file_date ?? "").localeCompare(a._source.file_date ?? ""),
  );

  const rounds: VentureRound[] = [];
  for (let i = 0; i < ordered.length && rounds.length < limit; i += DETAIL_BATCH) {
    const batch = await Promise.all(ordered.slice(i, i + DETAIL_BATCH).map(fetchFiling));
    rounds.push(...batch.filter((r): r is VentureRound => r !== null));
  }

  return rounds.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}
