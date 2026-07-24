# AXOM — Federal Intelligence Dashboard

Tracks federal funding opportunities relevant to Axom's technology areas
(agentic AI, autonomous laboratories, scientific computing, secure/sovereign AI)
and ranks them with a configurable, explainable scoring engine.

## Running locally

```bash
npm install
cp .env.example .env.local   # then fill in the values you want
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_DATA_PROVIDER` | No | Set to `live` for real Grants.gov/SAM.gov data. Unset uses bundled mock data. |
| `ANTHROPIC_API_KEY` | No | Enables the Axom Assistant panel. Without it the Assistant returns a clear "not configured" message; the rest of the app works. |
| `SAM_GOV_API_KEY` | No | Free key from SAM.gov (Account Details → API Key). Without it, live mode runs on Grants.gov alone. |

## Architecture

**Data providers** (`lib/providers/`) — all data access goes through the
`DataProvider` interface. `mock.ts` serves bundled sample data; `live.ts` pulls
real opportunities from the API routes. Swapping in a new backend means writing
one file, not touching any UI component.

**Scoring engine** (`lib/scoring.ts`) — the Axom Opportunity Score. Weights are
adjustable at runtime on the Settings page and every score in the app
recalculates live.

**Ingestion** (`lib/ingest/`) — one module per upstream source. Each fetches,
normalizes into the shared `Opportunity` type, and tags keywords against the
scoring taxonomy. Currently Grants.gov and SAM.gov.

**Routes** — `/dashboard`, `/funding` (+ detail), `/program-managers`
(+ detail), `/settings`, plus reference sections for agencies, labs, biotech,
papers, news, conferences, and companies.

## Current status

Opportunities are live. Program managers, papers, news, conferences, and
venture data still serve mock content pending their own ingestion modules.

Known limitation: the keyword tagger matches exact taxonomy phrases, so
solicitations that describe relevant work in different wording score low.
Replacing it with model-based classification is the next planned improvement.
