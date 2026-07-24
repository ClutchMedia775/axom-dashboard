import type { Opportunity } from "@/lib/types";
import { mockProvider } from "./mock";
import type { DataProvider } from "./types";

/**
 * Live provider: opportunities come from the /api/opportunities route
 * (Grants.gov + SAM.gov, cached server-side). The remaining categories
 * still fall back to mock data until their sources are wired up —
 * papers → arXiv, venture → SEC EDGAR, news → RSS, etc.
 */
export const liveProvider: DataProvider = {
  name: "Grants.gov + SAM.gov",
  async getOpportunities(): Promise<Opportunity[]> {
    const res = await fetch("/api/opportunities");
    if (!res.ok) throw new Error(`Failed to load opportunities: HTTP ${res.status}`);
    const data: { opportunities: Opportunity[] } = await res.json();
    return data.opportunities;
  },
  getProgramManagers: mockProvider.getProgramManagers,
  getPapers: mockProvider.getPapers,
  getConferences: mockProvider.getConferences,
  getNews: mockProvider.getNews,
  getVenture: mockProvider.getVenture,
  getNationalLabs: mockProvider.getNationalLabs,
  getBiotechOrgs: mockProvider.getBiotechOrgs,
};
