import { fetchNews } from "@/lib/ingest/news";
import { NextResponse } from "next/server";

// News moves faster than the other sources, so it refreshes twice as often.
export const revalidate = 1800;

export async function GET() {
  try {
    const news = await fetchNews();
    return NextResponse.json({ news, errors: [] });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 502 });
  }
}
