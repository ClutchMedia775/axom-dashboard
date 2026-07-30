import type { Opportunity } from "@/lib/types";
import { cleanText, tagKeywords, truncate } from "./tagger";

/*
 * SBIR.gov ingestion — open SBIR/STTR solicitations.
 *
 * Status caveat, verified 2026-07-24: the SBIR Public API currently answers
 * every request with 429 "The SBIR Public API is not available at this time",
 * an outage on their side (the website itself is up). This module is built
 * against the documented response shape and wired into the sweep anyway:
 * while the API is down each fetch fails fast, the route records the error
 * string, and the other sources are unaffected. The day SBIR turns the API
 * back on, solicitations appear without a deploy.
 *
 * Because the parser could not be exercised against live data, every field
 * is treated as optional and records without a title or usable deadline are
 * dropped rather than guessed at. When records first appear, spot-check them.
 */

const API = "https://api.www.sbir.gov/public/api/solicitations";

/** Bound each request so a half-up SBIR cannot stall the whole sweep. */
const TIMEOUT_MS = 15_000;

interface SbirTopic {
  topic_title?: string;
  topic_number?: string;
  topic_description?: string;
  sbir_topic_link?: string;
}

interface SbirSolicitation {
  solicitation_id?: number;
  solicitation_number?: string;
  solicitation_title?: string;
  program?: string; // "SBIR" | "STTR"
  phase?: string; // "Phase I" | "Phase II" | "BOTH"
  agency?: string; // full name, e.g. "Department of Defense"
  branch?: string; // e.g. "USAF", "DARPA"
  release_date?: string;
  open_date?: string;
  close_date?: string;
  application_due_date?: string[];
  sbir_solicitation_link?: string;
  solicitation_agency_url?: string;
  current_status?: string; // "open" | "closed" | "future"
  solicitation_topics?: SbirTopic[];
}

function mapAgency(agency?: string, branch?: string): string {
  const b = (branch ?? "").toUpperCase();
  if (b.includes("DARPA")) return "DARPA";
  if (b.includes("NIH")) return "NIH";
  const a = (agency ?? "").toUpperCase();
  if (a.includes("DEFENSE")) return "DOD";
  if (a.includes("ENERGY")) return "DOE";
  if (a.includes("HEALTH")) return "HHS";
  if (a.includes("AERONAUTICS")) return "NASA";
  if (a.includes("SCIENCE FOUNDATION")) return "NSF";
  if (a.includes("COMMERCE") || a.includes("STANDARDS")) return "NIST";
  if (a.includes("AGRICULTURE")) return "USDA";
  if (a.includes("HOMELAND")) return "DHS";
  if (a.includes("TRANSPORTATION")) return "DOT";
  return branch || agency || "SBIR";
}

/** "BOTH" reads like data, not language. */
function phaseLabel(program?: string, phase?: string): string {
  const p = phase === "BOTH" ? "Phase I/II" : phase ?? "";
  return [program ?? "SBIR", p].filter(Boolean).join(" ");
}

function toIso(d?: string): string {
  if (!d) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(d)) return d.slice(0, 10);
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? "" : t.toISOString().slice(0, 10);
}

function pickLink(s: SbirSolicitation): string {
  for (const l of [s.sbir_solicitation_link, s.solicitation_agency_url]) {
    if (l && /^https?:\/\//.test(l)) return l;
  }
  return "https://www.sbir.gov/topics";
}

function normalize(s: SbirSolicitation): Opportunity | null {
  const title = cleanText(s.solicitation_title ?? "");
  if (!title) return null;

  // Prefer close_date; fall back to the last application_due_date.
  const due = Array.isArray(s.application_due_date) ? s.application_due_date : [];
  const deadline = toIso(s.close_date) || toIso(due[due.length - 1]);
  if (!deadline || new Date(deadline).getTime() <= Date.now()) return null;

  const topics = Array.isArray(s.solicitation_topics) ? s.solicitation_topics : [];
  const topicText = cleanText(
    topics
      .map((t) => [t.topic_title, t.topic_description].filter(Boolean).join(" — "))
      .join(" ")
  );
  const keywords = tagKeywords(`${title} ${s.branch ?? ""} ${topicText}`);
  const idBase = s.solicitation_number || String(s.solicitation_id ?? "");
  if (!idBase) return null;

  return {
    id: `sbir-${idBase.replace(/[^a-zA-Z0-9.-]+/g, "-")}`,
    agency: mapAgency(s.agency, s.branch),
    office: s.branch || s.agency || "SBIR/STTR",
    program: title,
    type: phaseLabel(s.program, s.phase),
    amount: "—",
    awardSize: "—",
    deadline,
    trl: "—",
    techArea: keywords[0] ? keywords[0].replace(/\b\w/g, (ch) => ch.toUpperCase()) : "SBIR/STTR",
    summary: truncate(topicText) || title,
    description: topicText || undefined,
    pm: "—",
    link: pickLink(s),
    eligibility: "U.S. small businesses per SBIR/STTR eligibility rules",
    requirements: "See solicitation on SBIR.gov",
    previousWinners: [],
    keywords,
  };
}

async function searchTerm(keyword: string, rows: number): Promise<SbirSolicitation[]> {
  const params = new URLSearchParams({ keyword, rows: String(rows), open: "1" });
  const res = await fetch(`${API}?${params}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`SBIR.gov search failed: HTTP ${res.status}`);
  const json: unknown = await res.json();
  // The API signals its own outages inside a JSON object body.
  if (!Array.isArray(json)) throw new Error("SBIR.gov API unavailable (non-list response)");
  return json as SbirSolicitation[];
}

/**
 * Search open SBIR/STTR solicitations across several keywords, deduped.
 * Throws when every term fails (e.g. the current API outage) so the route
 * records one error string and moves on.
 */
export async function fetchSbirOpportunities(
  keywords: string[],
  rowsPerTerm = 15,
): Promise<Opportunity[]> {
  const searches = await Promise.allSettled(keywords.map((k) => searchTerm(k, rowsPerTerm)));
  if (searches.every((s) => s.status === "rejected")) {
    throw new Error(`SBIR.gov: ${String((searches[0] as PromiseRejectedResult).reason)}`);
  }

  const byId = new Map<string, Opportunity>();
  for (const s of searches) {
    if (s.status !== "fulfilled") continue;
    for (const raw of s.value) {
      const o = normalize(raw);
      if (o && !byId.has(o.id)) byId.set(o.id, o);
    }
  }
  return [...byId.values()];
}
