"use client";

import { useAppState } from "@/components/app-state";
import { Deadline } from "@/components/deadline";
import { ScoreBadge } from "@/components/score-badge";
import { useScoredOpportunities } from "@/lib/hooks";
import { useRouter } from "next/navigation";

/** Shared by /saved and /bookmarks — both list bookmarked opportunities. */
export function SavedList() {
  const router = useRouter();
  const { bookmarks, setScoreModal } = useAppState();
  const scored = useScoredOpportunities();
  const items = scored.filter((o) => bookmarks.has(o.id));

  if (items.length === 0) {
    return (
      <div className="glass rounded-2xl px-5 py-6 max-w-3xl prose-body text-xs text-ax-muted">
        Nothing saved yet — bookmark opportunities from the funding table.
      </div>
    );
  }
  return (
    <div className="max-w-3xl space-y-2">
      {items.map((o) => (
        <button key={o.id} onClick={() => router.push(`/funding/${o.id}`)}
          className="glass glass-hover w-full flex items-center justify-between rounded-2xl px-4 py-3 text-left">
          <div className="min-w-0">
            <div className="text-xs text-ax-text font-medium truncate">{o.program}</div>
            <div className="text-[10px] text-ax-dim font-mono mt-0.5">{o.agency} · <Deadline d={o.deadline} /></div>
          </div>
          <ScoreBadge s={o._s.score} onClick={(e) => { e.stopPropagation(); setScoreModal(o); }} />
        </button>
      ))}
    </div>
  );
}
