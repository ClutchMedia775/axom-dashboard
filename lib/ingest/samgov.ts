import type { Opportunity } from "@/lib/types";
import { cleanText, tagKeywords, truncate } from "./tagger";

const SEARCH_URL = "https://api.sam.gov/opportunities/v2/search";

interface SamNotice {
  noticeId: string;
  title: string;
  fullParentPathName?: string;
  type?: string;
  postedDate?: string;
  responseDeadLine?: string | null;
  uiLink?: string;
  description?: string;
  pointOfContact?: { fullName?: string; email?: string }[] | null;
}

function mapAgency(path?: string): string {
  const top = (path ?? "").split(".")[0].toUpperCase();
  if (top.includes("DEFENSE ADVANCED")) return "DARPA";
  if (top.includes("DEFENSE")) return "DOD";
  if (top.includes("ENERGY")) return "DOE";
  if (top.includes("HEALTH")) return "NIH";
  if (top.includes("NASA") || top.includes("AERONAUTICS")) return "NASA";
  if (top.includes("COMMERCE")) return "NIST";
  if (top.includes("NATIONAL SCIENCE FOUNDATION")) return "NSF";
  return top || "—";
}

function fmtDate(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
}

function normalize(n: SamNotice): Opportunity {
  const office = (n.fullParentPathName ?? "").split(".").slice(-1)[0] || "—";
  const title = cleanText(n.title);
  const summary = truncate(title);
  const keywords = tagKeywords(title);
  return {
    id: `sam-${n.noticeId}`,
    agency: mapAgency(n.fullParentPathName),
    office,
    program: title,
    type: n.type ?? "Notice",
    amount: "—",
    awardSize: "—",
    deadline: (n.responseDeadLine ?? "").slice(0, 10),
    trl: "—",
    techArea: keywords[0] ? keywords[0].replace(/\b\w/g, (ch) => ch.toUpperCase()) : "Federal Contract",
    summary,
    pm: n.pointOfContact?.[0]?.fullName ?? "—",
    pmEmail: n.pointOfContact?.[0]?.email,
    link: n.uiLink ?? `sam.gov/opp/${n.noticeId}/view`,
    eligibility: "See solicitation",
    requirements: "See full notice on SAM.gov",
    previousWinners: [],
    keywords,
  };
}

/**
 * Search active SAM.gov contract opportunities. Requires SAM_GOV_API_KEY
 * (free — generate one under your SAM.gov account profile). Returns [] when
 * the key is not configured so the app degrades gracefully to Grants.gov only.
 */
export async function fetchSamGovOpportunities(title: string, limit = 25): Promise<Opportunity[]> {
  const apiKey = process.env.SAM_GOV_API_KEY;
  if (!apiKey) return [];

  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 364);

  const params = new URLSearchParams({
    api_key: apiKey,
    limit: String(limit),
    postedFrom: fmtDate(from),
    postedTo: fmtDate(to),
    title,
    // Solicitations, presolicitations, combined synopsis/solicitations, SRFIs
    ptype: "o,p,k,r",
  });

  const res = await fetch(`${SEARCH_URL}?${params}`);
  if (!res.ok) throw new Error(`SAM.gov search failed: HTTP ${res.status}`);
  const json = await res.json();
  const notices: SamNotice[] = json?.opportunitiesData ?? [];
  return notices
    .map(normalize)
    .filter((o) => o.deadline !== "" && new Date(o.deadline).getTime() > Date.now());
}
