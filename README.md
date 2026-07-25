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
| `ANTHROPIC_API_KEY` | No | Enables the Axom Assistant panel **and** model-based opportunity classification (see Scoring below). Without it the Assistant returns a clear "not configured" message and scoring falls back to the deterministic keyword tagger; the rest of the app works. |
| `SAM_GOV_API_KEY` | No | Free key from SAM.gov (Account Details → API Key). Without it, live mode runs on Grants.gov alone. |
| `SEC_EDGAR_USER_AGENT` | Outside local dev | SEC requires EDGAR clients to identify themselves with real contact details, e.g. `Your Org (you@example.com)`. |
| `AXOM_ACCESS_PASSWORD` | **In production** | Shared password gating the credit-spending routes (see Access control). Unset in production ⇒ those routes return 503 rather than serving unauthenticated. Unset in local dev ⇒ ungated, for zero-setup development. |

## Access control

`/api/assistant` spends Anthropic credits on caller-supplied input, so on a
public deployment an open endpoint is effectively a free Claude proxy billed to
you. Two gates sit in front of it:

**Shared-password session** (`lib/auth.ts`) — the dashboard is single-tenant, so
rather than user accounts there is one password. `POST /api/auth` exchanges it
for an HMAC-signed, httpOnly, 12-hour cookie; the password doubles as the HMAC
key, so rotating it invalidates every outstanding session. The Assistant panel
prompts for it inline and re-prompts on expiry. **Fails closed**: in production
with no password set, the gated routes return 503 instead of serving openly.

**Rate limiting** (`lib/rate-limit.ts`) — fixed-window, per client IP: 20
assistant requests per 5 minutes, and a tighter 10-per-15-minutes on unlock
attempts to make password guessing impractical. Counters are per-instance, so on
serverless this caps abuse rather than enforcing an exact global ceiling; set a
spend limit on the Anthropic key as the real backstop.

`/api/opportunities` is lower risk — it is a cached `GET` (`revalidate = 3600`),
so classification runs at most hourly regardless of traffic.

## Architecture

**Data providers** (`lib/providers/`) — all data access goes through the
`DataProvider` interface. `mock.ts` serves bundled sample data; `live.ts` pulls
real opportunities from the API routes. Swapping in a new backend means writing
one file, not touching any UI component.

**Scoring engine** (`lib/scoring.ts`) — the Axom Opportunity Score. Weights are
adjustable at runtime on the Settings page and every score in the app
recalculates live. Opportunities are tagged against the scoring taxonomy in two
passes: a deterministic keyword tagger (`lib/ingest/tagger.ts`) that fires on
exact phrases, then — when `ANTHROPIC_API_KEY` is set — a model-based classifier
(`lib/ingest/classifier.ts`) that reads each solicitation and maps it onto the
same taxonomy keys semantically, so relevant work scores even when it avoids the
literal keywords. The classifier only augments the deterministic tags and no-ops
without a key, so scoring never depends on the model being reachable.

**Ingestion** (`lib/ingest/`) — one module per upstream source, each fetching
and normalizing into a shared type from `lib/types.ts`:

| Module | Source | Produces |
|---|---|---|
| `grantsgov.ts` / `samgov.ts` | Grants.gov, SAM.gov | `Opportunity` |
| `arxiv.ts` | arXiv Atom API | `Paper` |
| `edgar.ts` | SEC EDGAR Form D | `VentureRound` |
| `news.ts` | DOE / DARPA / NSF / ScienceDaily RSS | `NewsItem` |
| `program-managers.ts` | derived from ingested opportunities | `ProgramManager` |

`feed.ts` holds the small Atom/RSS readers shared by `arxiv.ts` and `news.ts`;
`tagger.ts` holds text cleanup and taxonomy tagging shared by everything.

Two notes on the ingested data, both driven by what the sources actually
provide rather than what we would prefer:

- **Form D has no round label.** There is no "Series B" field, only amounts, so
  `edgar.ts` reports the amount sold and never invents a series name. It also
  filters out pooled investment funds — a full-text search for AI terms
  otherwise returns mostly funds with "Artificial Intelligence" in their name
  rather than companies raising money.
- **Agency RSS feeds are general-purpose.** The DOE feed carries solar and grid
  announcements alongside AI work, so `news.ts` filters for relevance before
  anything reaches the dashboard.
- **Program managers are derived, not fetched.** No public API lists federal
  program managers, so `program-managers.ts` builds the index from the contact
  each ingested solicitation publishes — who is running what, how to reach
  them, and what they fund. Roughly a third of those contacts are shared
  organizational mailboxes ("National Institutes of Health") rather than
  people, and they are filtered out. Fields with no public source — bio,
  profile links, talks, publications, prior programs — are left empty rather
  than guessed, and the detail page renders only what is known. Guessing a
  profile URL from a person's name would fabricate a record about a real
  individual.

**Pursuit pipeline** (`lib/pipeline.ts`) — bookmarking an opportunity tracks it
through Identified → Qualifying → Pursuing → Drafting → Submitted → Won/Lost,
with a per-opportunity checklist and notes. `/saved` shows the pipeline grouped
by stage; the dashboard surfaces active pursuits by nearest deadline. State
persists in localStorage (`lib/persist.ts`) behind the same interface a
database-backed store would present.

**Routes** — `/dashboard`, `/funding` (+ detail), `/program-managers`
(+ detail), `/saved` (pipeline), `/settings`, plus reference sections for
agencies, labs, biotech, papers, news, and companies.

## Current status

Live: opportunities (scored through both the deterministic tagger and the
model-based classifier), papers, venture rounds, news, and program managers.

Still mock: conferences, national labs, and biotech orgs — hand-curated, with
no clean public source.

Program-manager coverage is bounded by the solicitations currently ingested,
so the directory grows as the opportunity feed does rather than being complete
on its own.
