import { classifyOpportunities } from "@/lib/ingest/classifier";
import { fetchGrantsGovOpportunities } from "@/lib/ingest/grantsgov";
import { fetchSamGovOpportunities } from "@/lib/ingest/samgov";
import type { Opportunity } from "@/lib/types";
import { NextResponse } from "next/server";

// Re-fetch from the upstream APIs at most once an hour — this is the
// monitoring cadence until a real database + scheduled ingestion lands.
export const revalidate = 3600;

// One search per taxonomy area, not one per phrase in it — a solicitation
// about autonomous laboratories that never says "artificial intelligence"
// used to be invisible to the whole pipeline. Terms are phrased the way
// solicitations are written, which is why this is curated rather than
// generated from DEFAULT_WEIGHTS verbatim.
const GRANTS_TERMS = [
  "artificial intelligence",
  "machine learning",
  "autonomous laboratory",
  "laboratory automation",
  "high performance computing",
  "multi-agent",
  "drug discovery",
];

// SAM.gov searches spend API-key quota, so the sweep is narrower.
const SAM_TERMS = [
  "artificial intelligence",
  "machine learning",
  "autonomous",
  "high performance computing",
];

export async function GET() {
  const results = await Promise.allSettled([
    fetchGrantsGovOpportunities(GRANTS_TERMS),
    fetchSamGovOpportunities(SAM_TERMS),
  ]);

  const opportunities: Opportunity[] = [];
  const errors: string[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") {
      opportunities.push(...r.value);
    } else {
      errors.push(String(r.reason));
    }
  }

  if (opportunities.length === 0 && errors.length > 0) {
    return NextResponse.json({ error: errors.join("; ") }, { status: 502 });
  }

  // Semantic pass: map each opportunity onto the scoring taxonomy so relevant
  // work scores even when it avoids the literal keywords. No-op without
  // ANTHROPIC_API_KEY, so the route degrades to deterministic tagging.
  const classified = await classifyOpportunities(opportunities);

  return NextResponse.json({ opportunities: classified, errors });
}
