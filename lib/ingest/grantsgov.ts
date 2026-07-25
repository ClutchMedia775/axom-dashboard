import type { Opportunity } from "@/lib/types";
import { cleanText, tagKeywords, truncate } from "./tagger";

const SEARCH_URL = "https://api.grants.gov/v1/api/search2";
const DETAIL_URL = "https://api.grants.gov/v1/api/fetchOpportunity";

interface OppHit {
  id: string;
  number: string;
  title: string;
  agencyCode: string;
  agency: string;
  openDate: string;
  closeDate: string;
  oppStatus: string;
  docType: string;
}

interface Synopsis {
  synopsisDesc?: string;
  responseDateStr?: string;
  agencyContactName?: string;
  agencyContactEmail?: string;
  awardCeilingFormatted?: string;
  awardFloorFormatted?: string;
  estimatedFundingFormatted?: string;
  applicantTypes?: { description?: string }[];
}

interface OppDetail {
  id: number;
  opportunityNumber: string;
  opportunityTitle: string;
  owningAgencyCode: string;
  opportunityCategory?: { description?: string };
  synopsis?: Synopsis;
}

function mapAgency(code: string, name: string): string {
  const c = code.toUpperCase();
  if (c.includes("DARPA")) return "DARPA";
  if (c.includes("NIH")) return "NIH";
  if (c.startsWith("NSF")) return "NSF";
  if (c.startsWith("DOE") || c.startsWith("PAMS")) return "DOE";
  if (c.startsWith("DOD")) return "DOD";
  if (c.startsWith("NASA")) return "NASA";
  if (c.startsWith("NIST") || c.includes("NIST")) return "NIST";
  if (c.startsWith("HHS")) return "HHS";
  if (c.startsWith("USDA")) return "USDA";
  return code.split("-")[0] || name;
}

/** "07/09/2026" → "2026-07-09"; "2026-08-05-00-00-00" → "2026-08-05" */
function toIsoDate(mmddyyyy?: string, dateStr?: string): string {
  if (dateStr && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr.slice(0, 10);
  if (mmddyyyy && /^\d{2}\/\d{2}\/\d{4}$/.test(mmddyyyy)) {
    const [m, d, y] = mmddyyyy.split("/");
    return `${y}-${m}-${d}`;
  }
  return "";
}

async function fetchDetail(id: string): Promise<OppDetail | null> {
  try {
    const res = await fetch(DETAIL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId: Number(id) }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data as OppDetail) ?? null;
  } catch {
    return null;
  }
}

function normalize(hit: OppHit, detail: OppDetail | null): Opportunity {
  const syn = detail?.synopsis;
  const fullText = cleanText(syn?.synopsisDesc ?? "");
  const summary = truncate(fullText);
  const deadline = toIsoDate(hit.closeDate, syn?.responseDateStr);
  const floor = syn?.awardFloorFormatted;
  const ceiling = syn?.awardCeilingFormatted;
  const awardSize =
    floor && ceiling && ceiling !== "none" ? `$${floor}–$${ceiling}`
    : ceiling && ceiling !== "none" ? `up to $${ceiling}`
    : floor ? `from $${floor}` : "—";
  const title = cleanText(hit.title);
  const keywords = tagKeywords(`${title} ${fullText}`);
  return {
    id: `grants-${hit.id}`,
    agency: mapAgency(hit.agencyCode, hit.agency),
    office: hit.agency,
    program: title,
    type: detail?.opportunityCategory?.description ?? "Grant",
    amount: syn?.estimatedFundingFormatted ? `$${syn.estimatedFundingFormatted} program` : "—",
    awardSize,
    deadline,
    trl: "—",
    techArea: keywords[0] ? keywords[0].replace(/\b\w/g, (ch) => ch.toUpperCase()) : "Federal Grant",
    summary: summary || title,
    description: fullText || undefined,
    pm: syn?.agencyContactName ?? "—",
    pmEmail: syn?.agencyContactEmail,
    link: `https://www.grants.gov/search-results-detail/${hit.id}`,
    eligibility: syn?.applicantTypes?.map((a) => a.description).filter(Boolean).join("; ") || "See solicitation",
    requirements: "See full announcement on Grants.gov",
    previousWinners: [],
    keywords,
  };
}

async function searchTerm(keyword: string, rows: number): Promise<OppHit[]> {
  const res = await fetch(SEARCH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keyword, oppStatuses: "posted", rows }),
  });
  if (!res.ok) throw new Error(`Grants.gov search failed: HTTP ${res.status}`);
  const json = await res.json();
  return (json?.data?.oppHits as OppHit[]) ?? [];
}

// Detail fetches run in waves rather than all at once — a multi-term sweep
// can surface 100+ distinct hits and Grants.gov gets one hourly burst as it is.
const DETAIL_BATCH = 10;

/**
 * Search posted Grants.gov opportunities across several keywords and
 * normalize them into the app's Opportunity shape (detail-fetched for full
 * text and deadlines). Hits are deduped before the detail pass, so
 * overlapping terms cost one fetch, not one per term. A term whose search
 * fails is skipped; the sweep only throws when every term fails.
 */
export async function fetchGrantsGovOpportunities(
  keywords: string[],
  rowsPerTerm = 15,
): Promise<Opportunity[]> {
  const searches = await Promise.allSettled(keywords.map((k) => searchTerm(k, rowsPerTerm)));
  if (searches.every((s) => s.status === "rejected")) {
    throw new Error(`Grants.gov search failed: ${String((searches[0] as PromiseRejectedResult).reason)}`);
  }

  const byId = new Map<string, OppHit>();
  for (const s of searches) {
    if (s.status !== "fulfilled") continue;
    for (const h of s.value) if (!byId.has(h.id)) byId.set(h.id, h);
  }
  const hits = [...byId.values()];

  const out: Opportunity[] = [];
  for (let i = 0; i < hits.length; i += DETAIL_BATCH) {
    const batch = hits.slice(i, i + DETAIL_BATCH);
    const details = await Promise.all(batch.map((h) => fetchDetail(h.id)));
    out.push(...batch.map((h, j) => normalize(h, details[j])));
  }
  return out.filter((o) => o.deadline !== "");
}
