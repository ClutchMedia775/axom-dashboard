"use client";

import { useAppState } from "@/components/app-state";
import { Deadline } from "@/components/deadline";
import { PipelinePanel } from "@/components/pipeline-panel";
import { ScoreBadge } from "@/components/score-badge";
import { useProgramManagers, useScoredOpportunities } from "@/lib/hooks";
import { Bookmark, ChevronLeft, ChevronRight, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { bookmarks, toggleBookmark, setScoreModal, setAssistantOpen, setAssistantContext } = useAppState();
  const scored = useScoredOpportunities();
  const { data: pms } = useProgramManagers();
  const [expanded, setExpanded] = useState(false);

  const o = scored.find((x) => x.id === id);

  // Give the Assistant the opportunity in view as context while on this page.
  useEffect(() => {
    setAssistantContext(o ?? null);
    return () => setAssistantContext(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [o?.id, o?._s.score]);

  if (!o) return null;
  const pm = (pms ?? []).find((p) => p.name === o.pm);
  const rows: [string, string][] = [
    ["Agency / Office", `${o.agency} — ${o.office}`], ["Type", o.type], ["Program Funding", o.amount],
    ["Award Size", o.awardSize], ["TRL", o.trl], ["Technology Area", o.techArea],
    ["Eligibility", o.eligibility], ["Application Requirements", o.requirements],
    ["Previous Winners", o.previousWinners.join(", ") || "—"],
  ];

  // Full solicitation text when the source provides it; the summary is only
  // the card-length cut and reads as truncated on a detail page.
  const fullText = o.description ?? o.summary;
  const isLong = fullText.length > 600;
  const shownText = expanded || !isLong ? fullText : `${fullText.slice(0, 600).replace(/\s+\S*$/, "")}…`;

  return (
    <div className="max-w-3xl">
      <Link href="/funding" className="inline-flex items-center gap-1 text-xs text-ax-dim hover:text-ax-text mb-3 transition">
        <ChevronLeft size={13} /> Back to funding
      </Link>

      <div className="glass rounded-2xl p-5 mb-3">
        <div className="flex items-start justify-between gap-4 mb-1">
          <h1 className="text-lg text-ax-text font-bold leading-snug tracking-tight">{o.program}</h1>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => toggleBookmark(o.id)}
              aria-label={bookmarks.has(o.id) ? "Remove bookmark" : "Add bookmark"}
              className={bookmarks.has(o.id) ? "text-ax-accent" : "text-ax-muted hover:text-ax-dim"}>
              <Bookmark size={16} fill={bookmarks.has(o.id) ? "currentColor" : "none"} />
            </button>
            <ScoreBadge s={o._s.score} size="lg" onClick={() => setScoreModal(o)} />
          </div>
        </div>
        <div className="text-xs text-ax-dim font-mono mb-4">{o.agency} · deadline <Deadline d={o.deadline} /></div>
        <p className="prose-body text-sm text-ax-dim leading-relaxed whitespace-pre-line">{shownText}</p>
        {isLong && (
          <button onClick={() => setExpanded((e) => !e)}
            className="mt-2 text-xs font-semibold text-ax-accent hover:brightness-125 transition">
            {expanded ? "Show less" : "Read full solicitation text"}
          </button>
        )}
      </div>

      <div className="glass rounded-2xl p-5 mb-3 grid sm:grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
        {rows.map(([k, v]) => (
          <div key={k}>
            <div className="eyebrow">{k}</div>
            <div className="prose-body text-ax-dim mt-1 leading-relaxed">{v}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {o.keywords.map((k) => (
          <span key={k} className="text-[10px] font-mono px-2 py-1 rounded-lg glass text-ax-dim">{k}</span>
        ))}
      </div>

      <PipelinePanel oppId={o.id} />

      {pm && (
        <button onClick={() => router.push(`/program-managers/${pm.id}`)}
          className="glass glass-hover flex items-center justify-between w-full sm:w-80 rounded-2xl px-4 py-3 text-left mb-3">
          <div>
            <div className="eyebrow">Program Manager</div>
            <div className="text-sm text-ax-text font-medium mt-0.5">{pm.name}</div>
          </div>
          <ChevronRight size={14} className="text-ax-muted" />
        </button>
      )}

      <div className="flex flex-wrap gap-2">
        {/^https?:\/\//.test(o.link) && (
          <a href={o.link} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-semibold rounded-xl px-4 py-2.5 transition glass glass-hover text-ax-text">
            <ExternalLink size={13} /> View official solicitation
          </a>
        )}
        <button onClick={() => setAssistantOpen(true)}
          className="flex items-center gap-2 text-xs font-semibold rounded-xl px-4 py-2.5 transition bg-ax-accent-bg border border-ax-accent-border text-ax-accent hover:brightness-125">
          <Sparkles size={13} /> Analyze with Axom Assistant
        </button>
      </div>
    </div>
  );
}
