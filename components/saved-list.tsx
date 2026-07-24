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
    return <div className="text-xs text-slate-500">Nothing saved yet — bookmark opportunities from the funding table.</div>;
  }
  return (
    <div className="max-w-3xl">
      <div className="space-y-2">
        {items.map((o) => (
          <button key={o.id} onClick={() => router.push(`/funding/${o.id}`)} className="w-full flex items-center justify-between border border-slate-800 rounded-lg px-4 py-3 hover:border-emerald-500/40 transition text-left">
            <div>
              <div className="text-xs text-slate-200">{o.program}</div>
              <div className="text-[10px] text-slate-500 font-mono">{o.agency} · <Deadline d={o.deadline} /></div>
            </div>
            <ScoreBadge s={o._s.score} onClick={(e) => { e.stopPropagation(); setScoreModal(o); }} />
          </button>
        ))}
      </div>
    </div>
  );
}
