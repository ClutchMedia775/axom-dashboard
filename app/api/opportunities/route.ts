import { fetchGrantsGovOpportunities } from "@/lib/ingest/grantsgov";
import { fetchSamGovOpportunities } from "@/lib/ingest/samgov";
import type { Opportunity } from "@/lib/types";
import { NextResponse } from "next/server";

// Re-fetch from the upstream APIs at most once an hour — this is the
// monitoring cadence until a real database + scheduled ingestion lands.
export const revalidate = 3600;

const SEARCH_TERM = "artificial intelligence";

export async function GET() {
  const results = await Promise.allSettled([
    fetchGrantsGovOpportunities(SEARCH_TERM),
    fetchSamGovOpportunities(SEARCH_TERM),
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

  return NextResponse.json({ opportunities, errors });
}
