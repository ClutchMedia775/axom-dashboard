/* ────────────────────────────────────────────────────────────────────────────
   AXOM OPPORTUNITY SCORE — configurable, explainable scoring engine
──────────────────────────────────────────────────────────────────────────── */

export interface ScoringWeight {
  key: string;
  label: string;
  weight: number;
  aliases: string[];
}

export interface ScoreResult {
  score: number;
  confidence: number;
  matched: ScoringWeight[];
  missing: ScoringWeight[];
  priority: string;
  difficulty: string;
  pWin: string;
  strategic: string;
  nextAction: string;
}

export const DEFAULT_WEIGHTS: ScoringWeight[] = [
  { key: "agentic ai", label: "Agentic AI", weight: 20, aliases: ["multi-agent systems"] },
  { key: "scientific research", label: "Scientific Research", weight: 20, aliases: ["scientific workflows", "research automation", "autonomous science"] },
  { key: "drug discovery", label: "Biotech / Drug Discovery", weight: 15, aliases: ["biomedical ai", "computational biology", "genomics", "crispr", "protein folding", "bioinformatics"] },
  { key: "autonomous laboratories", label: "Autonomous Laboratories", weight: 15, aliases: ["laboratory automation", "robotics"] },
  { key: "secure ai", label: "Secure / On-Prem AI", weight: 10, aliases: ["sovereign ai"] },
  { key: "multi-agent systems", label: "Multi-Agent Systems", weight: 10, aliases: [] },
  { key: "scientific computing", label: "Scientific Computing / HPC", weight: 10, aliases: ["exascale computing", "high performance computing"] },
  { key: "enterprise ai", label: "Enterprise AI", weight: 5, aliases: ["knowledge management", "knowledge graphs", "retrieval augmented generation"] },
  { key: "government modernization", label: "Government Modernization", weight: 5, aliases: ["defense ai"] },
];

export function scoreItem(keywords: string[], weights: ScoringWeight[]): ScoreResult {
  const kw = keywords.map((k) => k.toLowerCase());
  const matched: ScoringWeight[] = [];
  const missing: ScoringWeight[] = [];
  let raw = 0;
  weights.forEach((w) => {
    const hit = kw.includes(w.key) || w.aliases.some((a) => kw.includes(a));
    if (hit) {
      raw += w.weight;
      matched.push(w);
    } else {
      missing.push(w);
    }
  });
  const max = weights.reduce((s, w) => s + w.weight, 0) || 1;
  const score = Math.min(100, Math.round((raw / max) * 100 + (kw.length >= 5 ? 5 : 0)));
  const confidence = Math.min(95, 55 + matched.length * 7);
  const priority = score >= 75 ? "P0 — Pursue now" : score >= 55 ? "P1 — Qualify this week" : score >= 35 ? "P2 — Monitor" : "P3 — Archive";
  const difficulty = score >= 75 ? "Moderate — strong fit reduces writing burden" : "High — fit gaps require teaming or repositioning";
  const pWin = `${Math.max(5, Math.min(60, Math.round(score * 0.55)))}%`;
  const strategic = score >= 75 ? "High — core roadmap alignment" : score >= 55 ? "Medium — adjacent capability" : "Low — opportunistic only";
  const nextAction = score >= 75 ? "Contact PM before deadline; draft capability abstract" : score >= 55 ? "Assess teaming partners; request Q&A transcript" : "Add to watchlist; revisit next cycle";
  return { score, confidence, matched, missing, priority, difficulty, pWin, strategic, nextAction };
}
