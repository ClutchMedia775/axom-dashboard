import { fetchVentureRounds } from "@/lib/ingest/edgar";
import { NextResponse } from "next/server";

// Form D filings trickle in daily and each response costs several SEC
// requests, so this caches for six hours to stay a light client.
export const revalidate = 21600;

export async function GET() {
  try {
    const venture = await fetchVentureRounds();
    return NextResponse.json({ venture, errors: [] });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 502 });
  }
}
