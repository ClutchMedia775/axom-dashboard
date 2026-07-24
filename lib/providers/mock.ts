import type {
  NewsItem,
  Opportunity,
  Paper,
  ProgramManager,
  VentureRound,
} from "@/lib/types";
import type { DataProvider } from "./types";

const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: "darpa-air-01", agency: "DARPA", office: "I2O", program: "Autonomous Intelligence for Research (AIR)",
    type: "BAA", amount: "$42M program", awardSize: "$1M–$4M", deadline: "2026-09-18", trl: "3–5",
    techArea: "Agentic AI / Autonomous Science",
    summary: "Seeking multi-agent AI systems capable of autonomously formulating hypotheses, designing experiments, and orchestrating laboratory instrumentation with human oversight. Emphasis on secure, on-premise deployment and explainable agent decision chains.",
    pm: "Dr. Elena Vasquez", link: "sam.gov/opp/darpa-air-01",
    eligibility: "U.S. entities; small business teaming encouraged",
    requirements: "Abstract (5pp) → Full proposal (30pp); DD254 for classified annex",
    previousWinners: ["Helix Autonomy", "Praxis Labs"],
    keywords: ["agentic ai", "multi-agent systems", "autonomous laboratories", "scientific research", "secure ai", "research automation"],
  },
  {
    id: "doe-ascr-22", agency: "DOE", office: "Office of Science / ASCR", program: "AI for Scientific Discovery at Exascale",
    type: "FOA", amount: "$68M program", awardSize: "$2M–$6M / 3yr", deadline: "2026-08-29", trl: "2–4",
    techArea: "Scientific Computing / HPC",
    summary: "Foundation models and agentic workflows for exascale scientific computing across materials, chemistry, and fusion. Partnerships with DOE national laboratories required.",
    pm: "Dr. Marcus Chen", link: "science.osti.gov/foa/ascr-22",
    eligibility: "Universities, industry, DOE labs; lab partnership required",
    requirements: "Pre-application (mandatory) → Full application via PAMS",
    previousWinners: ["ANL + Voltaic AI", "ORNL + Kepler Systems"],
    keywords: ["scientific computing", "exascale computing", "foundation models", "scientific research", "high performance computing", "scientific workflows"],
  },
  {
    id: "arpah-adapt-3", agency: "ARPA-H", office: "Resilient Systems", program: "ADAPT: Autonomous Drug Discovery Pipelines",
    type: "Solicitation", amount: "$120M program", awardSize: "$5M–$15M", deadline: "2026-10-02", trl: "3–6",
    techArea: "Biotech / Drug Discovery",
    summary: "Closed-loop autonomous laboratories for small-molecule discovery: AI-driven design, robotic synthesis, and automated assay interpretation. Strong preference for platforms with demonstrated wet-lab integration.",
    pm: "Dr. Priya Raman", link: "arpa-h.gov/adapt",
    eligibility: "U.S. organizations; foreign subs case-by-case",
    requirements: "Solution summary (8pp) → Oral pitch → Full proposal",
    previousWinners: ["First cycle — none yet"],
    keywords: ["drug discovery", "autonomous laboratories", "laboratory automation", "biomedical ai", "agentic ai", "robotics"],
  },
  {
    id: "sbir-af-262", agency: "AFWERX", office: "AF SBIR/STTR", program: "SBIR 26.2 — Secure Agentic AI for Mission Systems",
    type: "SBIR Phase I/II", amount: "Open topic", awardSize: "$75K PhI / $1.25M PhII", deadline: "2026-08-13", trl: "4–7",
    techArea: "Defense AI / Secure AI",
    summary: "Open topic seeking dual-use agentic AI platforms deployable in air-gapped and classified environments. Direct-to-Phase-II available with commercial traction evidence.",
    pm: "Maj. Sarah Okafor", link: "afwerx.com/sbir-262",
    eligibility: "U.S. small businesses (<500 employees), >50% U.S.-owned",
    requirements: "15pp technical volume + commercialization plan + DAF customer memo",
    previousWinners: ["Redline Autonomy", "Cache Systems"],
    keywords: ["secure ai", "agentic ai", "defense ai", "sovereign ai", "enterprise ai", "multi-agent systems"],
  },
  {
    id: "nsf-pose-9", agency: "NSF", office: "TIP Directorate", program: "AI Institutes: Intelligent Cyberinfrastructure",
    type: "Grant", amount: "$20M / 5yr per institute", awardSize: "$20M", deadline: "2026-11-14", trl: "1–3",
    techArea: "Scientific AI / Knowledge Systems",
    summary: "National-scale AI institutes advancing knowledge graphs, retrieval-augmented systems, and scientific workflow automation for the research enterprise.",
    pm: "Dr. James Whitfield", link: "nsf.gov/ai-institutes",
    eligibility: "IHEs lead; industry as partners",
    requirements: "LOI → Preliminary → Full proposal (NSF PAPPG)",
    previousWinners: ["AI Institute for Molecular Discovery (2024)"],
    keywords: ["knowledge graphs", "retrieval augmented generation", "scientific workflows", "scientific research", "knowledge management"],
  },
  {
    id: "nih-nigms-4", agency: "NIH", office: "NIGMS", program: "R01: AI Foundation Models for Computational Biology",
    type: "Grant (R01)", amount: "Rolling", awardSize: "$500K/yr direct", deadline: "2026-10-05", trl: "1–3",
    techArea: "Computational Biology",
    summary: "Investigator-initiated research applying foundation models to genomics, protein structure, and systems biology. Industry eligible via SBIR companion (R43/R44).",
    pm: "Dr. Lisa Tanaka", link: "grants.nih.gov/pa-26-118",
    eligibility: "Broad; for-profits via SBIR companion",
    requirements: "Standard R01 package; specific aims 1pp, research strategy 12pp",
    previousWinners: ["Multiple annual awards"],
    keywords: ["foundation models", "computational biology", "genomics", "bioinformatics", "protein folding", "biomedical ai"],
  },
  {
    id: "nist-ai-tb", agency: "NIST", office: "ITL", program: "AI Measurement & Assurance Testbed Cooperative Agreements",
    type: "Cooperative Agreement", amount: "$14M program", awardSize: "$750K–$2M", deadline: "2026-09-04", trl: "4–6",
    techArea: "Secure AI / Assurance",
    summary: "Cooperative agreements to build evaluation harnesses and assurance tooling for enterprise and government AI deployments, including agent-based systems.",
    pm: "Dr. Robert Kessler", link: "nist.gov/itl/ai-testbed",
    eligibility: "U.S. entities; academia + industry consortia favored",
    requirements: "Technical proposal 20pp + budget via grants.gov",
    previousWinners: ["MITRE consortium (2025)"],
    keywords: ["secure ai", "enterprise ai", "government modernization", "llms", "multi-agent systems"],
  },
  {
    id: "diu-lab-7", agency: "DIU", office: "AI/ML Portfolio", program: "CSO: Autonomous Lab Operations for Biodefense",
    type: "CSO / OTA", amount: "Prototype OTA", awardSize: "$1M–$8M", deadline: "2026-08-21", trl: "6–8",
    techArea: "Laboratory Automation / Biodefense",
    summary: "Commercial solutions opening for laboratory automation platforms with AI orchestration, targeting BSL-2 biodefense workflows. Fast OTA path to production contracts.",
    pm: "Cmdr. Dana Reyes", link: "diu.mil/work-with-us/cso-lab7",
    eligibility: "Commercial vendors with fielded product",
    requirements: "Solution brief 5pp; 30-day evaluation cycle",
    previousWinners: ["OpenBench Robotics"],
    keywords: ["laboratory automation", "autonomous laboratories", "robotics", "agentic ai", "defense ai", "digital twins"],
  },
];

const MOCK_PMS: ProgramManager[] = [
  {
    id: "pm-vasquez", name: "Dr. Elena Vasquez", agency: "DARPA", office: "Information Innovation Office (I2O)", role: "Program Manager",
    bio: "Former Stanford HAI research scientist; joined DARPA in 2024. Built one of the first closed-loop autonomous chemistry platforms at SRI.",
    interests: ["Agentic AI", "Autonomous science", "Human-AI teaming", "Explainability"],
    currentPrograms: ["AIR", "Assured Autonomy II"], pastPrograms: ["SAIL-ON (contributor)"],
    email: "elena.vasquez@darpa.mil", scholar: "scholar.google.com/evasquez", linkedin: "linkedin.com/in/evasquez",
    talks: ["Keynote, AAAI 2026 — 'Agents that Do Science'", "DARPA Forward, Austin 2025"],
    pubs: ["Closed-Loop Discovery Agents (Nature MI, 2024)", "Trust Calibration in Multi-Agent Labs (2023)"],
    openOpps: ["darpa-air-01"], notes: "", relationship: "Met at AAAI 2026 poster session — receptive to OS-level agent orchestration framing.",
  },
  {
    id: "pm-chen", name: "Dr. Marcus Chen", agency: "DOE", office: "ASCR", role: "Program Manager, AI & Data",
    bio: "20 years at Argonne before moving to DOE HQ. Leads the AI-for-Science exascale portfolio.",
    interests: ["Exascale AI", "Foundation models for simulation", "Scientific workflows"],
    currentPrograms: ["AI for Scientific Discovery at Exascale"], pastPrograms: ["ECP Co-Design"],
    email: "marcus.chen@science.doe.gov", scholar: "scholar.google.com/mchen", linkedin: "linkedin.com/in/marcuschen-doe",
    talks: ["SC25 panel — AI Surrogates at Scale"],
    pubs: ["Surrogate Models for Fusion Codes (2022)"],
    openOpps: ["doe-ascr-22"], notes: "", relationship: "Cold — no contact yet. Warm intro possible via ANL partnership channel.",
  },
  {
    id: "pm-raman", name: "Dr. Priya Raman", agency: "ARPA-H", office: "Resilient Systems", role: "Program Manager",
    bio: "Ex-Genentech automation lead; founded a lab-robotics startup acquired in 2023. Owns the ADAPT autonomous discovery program.",
    interests: ["Self-driving labs", "Assay automation", "AI-designed molecules"],
    currentPrograms: ["ADAPT"], pastPrograms: ["—"],
    email: "priya.raman@arpa-h.gov", scholar: "scholar.google.com/praman", linkedin: "linkedin.com/in/priyaraman",
    talks: ["SLAS 2026 — The Autonomous Lab Stack"],
    pubs: ["Throughput Limits of Closed-Loop Synthesis (2024)"],
    openOpps: ["arpah-adapt-3"], notes: "", relationship: "Responded to intro email 6/2026; suggested attending ADAPT proposers day.",
  },
  {
    id: "pm-okafor", name: "Maj. Sarah Okafor", agency: "AFWERX", office: "AF SBIR/STTR", role: "Topic Lead",
    bio: "Cyber operations officer; manages the secure agentic AI open topic and D2P2 pipeline.",
    interests: ["Air-gapped AI", "Mission autonomy", "Dual-use transition"],
    currentPrograms: ["SBIR 26.2 Open Topic"], pastPrograms: ["SBIR 25.1"],
    email: "sarah.okafor@afwerx.af.mil", scholar: "—", linkedin: "linkedin.com/in/sokafor",
    talks: ["AFWERX Accelerate 2026"],
    pubs: ["—"],
    openOpps: ["sbir-af-262"], notes: "", relationship: "No contact. D2P2 requires DAF customer memo — start with 16th Air Force innovation cell.",
  },
];

const MOCK_PAPERS: Paper[] = [
  { id: "p1", title: "LabOS: An Operating System Abstraction for Autonomous Laboratories", venue: "arXiv", date: "2026-07-19", tags: ["autonomous laboratories", "agentic ai", "scientific workflows"] },
  { id: "p2", title: "Multi-Agent Retrieval for Genome-Scale Hypothesis Generation", venue: "bioRxiv", date: "2026-07-16", tags: ["multi-agent systems", "genomics", "retrieval augmented generation"] },
  { id: "p3", title: "Secure Enclaves for Sovereign Foundation Model Serving", venue: "arXiv", date: "2026-07-11", tags: ["sovereign ai", "secure ai", "foundation models"] },
  { id: "p4", title: "Closed-Loop CRISPR Screen Design with LLM Agents", venue: "Nature Methods", date: "2026-07-08", tags: ["crispr", "drug discovery", "agentic ai"] },
];

const MOCK_NEWS: NewsItem[] = [
  { id: "n1", src: "OSTP", date: "2026-07-21", title: "OSTP issues implementation guidance on federal agentic AI procurement standards" },
  { id: "n2", src: "Endpoints News", date: "2026-07-18", title: "ARPA-H signals second ADAPT cycle will double autonomous-lab funding" },
  { id: "n3", src: "STAT News", date: "2026-07-15", title: "NIH pilots AI-native grant review for computational biology R01s" },
  { id: "n4", src: "TechCrunch", date: "2026-07-14", title: "Sovereign AI infrastructure startups raise $2.1B in Q2, led by defense-adjacent rounds" },
];

const MOCK_VENTURE: VentureRound[] = [
  { id: "v1", co: "Periodic Labs", round: "$85M Series B", focus: "Autonomous chemistry", date: "2026-07-17" },
  { id: "v2", co: "Sentinel Compute", round: "$140M Series C", focus: "Air-gapped AI infra", date: "2026-07-10" },
  { id: "v3", co: "Helix Autonomy", round: "$32M Series A", focus: "Multi-agent lab orchestration", date: "2026-07-02" },
];

const NATIONAL_LABS = ["Oak Ridge", "Argonne", "Lawrence Berkeley", "Lawrence Livermore", "Los Alamos", "Sandia", "Brookhaven", "Pacific Northwest", "Idaho", "NREL"];

const BIOTECH_ORGS = ["Broad Institute", "Allen Institute", "Scripps Research", "Mayo Clinic Research", "Fred Hutch", "CZ Biohub", "Whitehead Institute", "Stanford HAI", "Berkeley AI Research", "Johns Hopkins", "MIT", "Carnegie Mellon", "Caltech", "Georgia Tech", "Cleveland Clinic Research"];

export const mockProvider: DataProvider = {
  name: "MockProvider",
  getOpportunities: async () => MOCK_OPPORTUNITIES,
  getProgramManagers: async () => MOCK_PMS,
  getPapers: async () => MOCK_PAPERS,
  getNews: async () => MOCK_NEWS,
  getVenture: async () => MOCK_VENTURE,
  getNationalLabs: async () => NATIONAL_LABS,
  getBiotechOrgs: async () => BIOTECH_ORGS,
};
