"use client";

import { useAppState } from "@/components/app-state";
import { Deadline } from "@/components/deadline";
import { ScoreBadge } from "@/components/score-badge";
import { useScoredOpportunities } from "@/lib/hooks";
import { STAGES, STAGE_LABELS } from "@/lib/pipeline";
import { useRouter } from "next/navigation";

/**
 * The pursuit pipeline: every tracked opportunity grouped by stage, with
 * checklist progress and deadline. Bookmarking an opportunity anywhere in
 * the app is what adds it here.
 */
export default function PipelinePage() {
  const router = useRouter();
  const { bookmarks, entryFor, setScoreModal, notes } = useAppState();
  const scored = useScoredOpportunities();
  const tracked = scored.filter((o) => bookmarks.has(o.id));

  if (tracked.length === 0) {
    return (
      <div className="glass rounded-2xl px-5 py-6 max-w-3xl prose-body text-xs text-ax-muted">
        The pipeline is empty — track opportunities from the funding table to manage
        their pursuit here.
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-5">
      {STAGES.map((stage) => {
        const inStage = tracked.filter((o) => entryFor(o.id).stage === stage);
        if (inStage.length === 0) return null;
        return (
          <div key={stage}>
            <div className="eyebrow mb-2">{STAGE_LABELS[stage]} · {inStage.length}</div>
            <div className="space-y-2">
              {inStage.map((o) => {
                const entry = entryFor(o.id);
                const done = entry.tasks.filter((t) => t.done).length;
                const pct = Math.round((done / entry.tasks.length) * 100);
                return (
                  <button key={o.id} onClick={() => router.push(`/funding/${o.id}`)}
                    className="glass glass-hover w-full rounded-2xl px-4 py-3 text-left">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs text-ax-text font-medium truncate">{o.program}</div>
                        <div className="text-[10px] text-ax-dim font-mono mt-0.5">
                          {o.agency} · <Deadline d={o.deadline} /> · {done}/{entry.tasks.length} tasks
                        </div>
                      </div>
                      <ScoreBadge s={o._s.score} onClick={(e) => { e.stopPropagation(); setScoreModal(o); }} />
                    </div>
                    <div className="mt-2.5 h-1 rounded-full bg-ax-glass overflow-hidden">
                      <div className="h-full rounded-full bg-ax-accent transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    {notes[o.id] && (
                      <div className="prose-body text-[10px] text-ax-muted mt-2 truncate">{notes[o.id]}</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
