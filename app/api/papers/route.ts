import { fetchArxivPapers } from "@/lib/ingest/arxiv";
import { NextResponse } from "next/server";

// Preprints appear in daily batches; hourly is well inside that cadence.
export const revalidate = 3600;

export async function GET() {
  try {
    const papers = await fetchArxivPapers();
    return NextResponse.json({ papers, errors: [] });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 502 });
  }
}
