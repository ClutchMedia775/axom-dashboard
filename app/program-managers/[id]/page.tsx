"use client";

import { useAppState } from "@/components/app-state";
import { ScoreBadge } from "@/components/score-badge";
import { useProgramManagers, useScoredOpportunities } from "@/lib/hooks";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function ProgramManagerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { setScoreModal } = useAppState();
  const { data: pms } = useProgramManagers();
  const scored = useScoredOpportunities();

  const p = (pms ?? []).find((x) => x.id === id);
  if (!p) return null;
  const theirOpps = scored.filter((o) => p.openOpps.includes(o.id));

  return (
    <div className="max-w-3xl">
      <Link href="/program-managers" className="inline-flex items-center gap-1 text-xs text-ax-dim hover:text-ax-text mb-3 transition">
        <ChevronLeft size={13} /> Back to program managers
      </Link>

      <div className="glass rounded-2xl p-5 mb-3">
        <h1 className="text-lg text-ax-text font-bold tracking-tight">{p.name}</h1>
        <div className="text-xs font-mono text-ax-info mb-4">{p.role} · {p.agency} — {p.office}</div>
        <p className="prose-body text-sm text-ax-dim leading-relaxed">{p.bio}</p>
      </div>

      {/* Records derived from solicitation contacts have no public source for
          bio, profile links, talks, or publications, so only fields that are
          actually populated are rendered — an empty label reads as a bug. */}
      <div className="glass rounded-2xl p-5 mb-3 grid sm:grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
        {([["Research Interests", p.interests.join(", ")], ["Current Programs", p.currentPrograms.join(", ")],
          ["Past Programs", p.pastPrograms.join(", ")], ["Email", p.email], ["LinkedIn", p.linkedin],
          ["Google Scholar", p.scholar], ["Recent Talks", p.talks.join(" · ")], ["Publications", p.pubs.join(" · ")],
        ] as const).filter(([, v]) => v !== "").map(([k, v]) => (
          <div key={k}>
            <div className="eyebrow">{k}</div>
            <div className="prose-body text-ax-dim mt-1 leading-relaxed">{v}</div>
          </div>
        ))}
      </div>

      {p.relationship !== "" && (
        <div className="rounded-2xl p-4 mb-3 bg-ax-accent-bg border border-ax-accent-border">
          <div className="eyebrow" style={{ color: "var(--ax-accent)" }}>Relationship History</div>
          <div className="prose-body text-xs text-ax-text mt-1.5 leading-relaxed">{p.relationship}</div>
        </div>
      )}

      {theirOpps.length > 0 && (
        <div>
          <div className="eyebrow mb-2">Open Opportunities</div>
          {theirOpps.map((o) => (
            <button key={o.id} onClick={() => router.push(`/funding/${o.id}`)}
              className="glass glass-hover w-full flex items-center justify-between rounded-2xl px-4 py-3 text-left mb-2">
              <span className="text-xs text-ax-text font-medium">{o.program}</span>
              <ScoreBadge s={o._s.score} onClick={(e) => { e.stopPropagation(); setScoreModal(o); }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
