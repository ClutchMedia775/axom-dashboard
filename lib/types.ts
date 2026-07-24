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
  pm: string;
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
}

export interface Conference {
  id: string;
  name: string;
  date: string;
  loc: string;
  why: string;
}

export interface NewsItem {
  id: string;
  src: string;
  date: string;
  title: string;
}

export interface VentureRound {
  id: string;
  co: string;
  round: string;
  focus: string;
  date: string;
}
