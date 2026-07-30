export interface Opportunity {
  id: string;
  agency: string;
  office: string;
  program: string;
  type: string;
  amount: string;
  awardSize: string;
  deadline: string;
  trl: string;
  techArea: string;
  summary: string;
  /** Full solicitation text when the source provides it; summary is the
   *  card-length cut. Absent for sources that only publish a title. */
  description?: string;
  pm: string;
  /** Contact email from the solicitation, when the source publishes one. */
  pmEmail?: string;
  link: string;
  eligibility: string;
  requirements: string;
  previousWinners: string[];
  keywords: string[];
}

export interface ProgramManager {
  id: string;
  name: string;
  agency: string;
  office: string;
  role: string;
  bio: string;
  interests: string[];
  currentPrograms: string[];
  pastPrograms: string[];
  email: string;
  scholar: string;
  linkedin: string;
  talks: string[];
  pubs: string[];
  openOpps: string[];
  notes: string;
  relationship: string;
}

export interface Paper {
  id: string;
  title: string;
  venue: string;
  date: string;
  tags: string[];
  /** Link to the paper (arXiv abstract page). */
  url?: string;
}

export interface NewsItem {
  id: string;
  src: string;
  date: string;
  title: string;
  /** Link to the source article. */
  link?: string;
}

export interface VentureRound {
  id: string;
  co: string;
  round: string;
  focus: string;
  date: string;
  /** Link to the SEC filing index for the underlying Form D. */
  link?: string;
  /** Issuer HQ, e.g. "Scottsdale, AZ". */
  location?: string;
  /** Number of investors reported on the filing. */
  investors?: number;
  /** "Equity", "Debt", or "Equity + Debt". */
  securityType?: string;
  /** How the raise stands against its target: "fully subscribed",
   *  "of $20.0M target", or "open-ended offering". */
  offeringStatus?: string;
}
