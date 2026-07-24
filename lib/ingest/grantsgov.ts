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
    pm: syn?.agencyContactName ?? "—",
    link: `grants.gov/search-results-detail/${hit.id}`,
    eligibility: syn?.applicantTypes?.map((a) => a.description).filter(Boolean).join("; ") || "See solicitation",
    requirements: "See full announcement on Grants.gov",
    previousWinners: [],
    keywords,
  };
}

/**
 * Search posted Grants.gov opportunities for a keyword and normalize them
 * into the app's Opportunity shape (detail-fetched for summaries/deadlines).
 */
export async function fetchGrantsGovOpportunities(keyword: string, rows = 25): Promise<Opportunity[]> {
  const res = await fetch(SEARCH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keyword, oppStatuses: "posted", rows }),
  });
  if (!res.ok) throw new Error(`Grants.gov search failed: HTTP ${res.status}`);
  const json = await res.json();
  const hits: OppHit[] = json?.data?.oppHits ?? [];
  const details = await Promise.all(hits.map((h) => fetchDetail(h.id)));
  return hits
    .map((h, i) => normalize(h, details[i]))
    .filter((o) => o.deadline !== "");
}
