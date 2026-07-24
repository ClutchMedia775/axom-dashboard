import type {
  Conference,
  NewsItem,
  Opportunity,
  Paper,
  ProgramManager,
  VentureRound,
} from "@/lib/types";

/**
 * All data access goes through a DataProvider. Swap the MockProvider for a
 * REST/GraphQL/RSS/scraper-backed implementation without touching UI code —
 * every method is async so a network-backed provider is a drop-in.
 */
export interface DataProvider {
  /** Human-readable name shown in the header ("provider: MockProvider"). */
  readonly name: string;
  getOpportunities(): Promise<Opportunity[]>;
  getProgramManagers(): Promise<ProgramManager[]>;
  getPapers(): Promise<Paper[]>;
  getConferences(): Promise<Conference[]>;
  getNews(): Promise<NewsItem[]>;
  getVenture(): Promise<VentureRound[]>;
  getNationalLabs(): Promise<string[]>;
  getBiotechOrgs(): Promise<string[]>;
}
