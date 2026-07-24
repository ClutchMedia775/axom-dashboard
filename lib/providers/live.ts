import { deriveProgramManagers } from "@/lib/ingest/program-managers";
import type { NewsItem, Opportunity, Paper, ProgramManager, VentureRound } from "@/lib/types";
import { mockProvider } from "./mock";
import type { DataProvider } from "./types";

/**
 * Live provider: opportunities (Grants.gov + SAM.gov), papers (arXiv), venture
 * rounds (SEC EDGAR Form D), and news (agency + science-press RSS) all come
 * from their API routes, which cache server-side.
 *
 * Program managers are derived from the opportunities rather than fetched:
 * they come from the contact each solicitation publishes, so there is no
 * separate upstream to call and no extra route to cache.
 *
 * Conferences, labs, and biotech orgs still fall back to mock data — they have
 * no clean public source and are hand-curated for now.
 */

async function getJson<T>(path: string, key: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${key}: HTTP ${res.status}`);
  const data = (await res.json()) as Record<string, T>;
  return data[key];
}

export const liveProvider: DataProvider = {
  name: "Grants.gov + SAM.gov + arXiv + EDGAR + RSS",
  getOpportunities: () => getJson<Opportunity[]>("/api/opportunities", "opportunities"),
  getPapers: () => getJson<Paper[]>("/api/papers", "papers"),
  getVenture: () => getJson<VentureRound[]>("/api/venture", "venture"),
  getNews: () => getJson<NewsItem[]>("/api/news", "news"),
  getProgramManagers: async (): Promise<ProgramManager[]> =>
    deriveProgramManagers(await getJson<Opportunity[]>("/api/opportunities", "opportunities")),
  getConferences: mockProvider.getConferences,
  getNationalLabs: mockProvider.getNationalLabs,
  getBiotechOrgs: mockProvider.getBiotechOrgs,
};
