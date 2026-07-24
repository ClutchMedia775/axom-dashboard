"use client";

import { useAppState } from "@/components/app-state";
import { scoreItem } from "@/lib/scoring";
import { X } from "lucide-react";

export function ScoreModal() {
  const { scoreModal: item, weights, setScoreModal } = useAppState();
  if (!item) return null;
  const r = scoreItem(item.keywords, weights);
  const onClose = () => setScoreModal(null);
  const scoreTone = r.score >= 75 ? "text-ax-accent" : r.score >= 55 ? "text-ax-info" : "text-ax-dim";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-ax flex items-start justify-between gap-4">
          <div>
            <div className="eyebrow">Axom Opportunity Score</div>
            <div className="text-sm text-ax-text font-semibold mt-1">{item.program}</div>
          </div>
          <button onClick={onClose} className="text-ax-muted hover:text-ax-text transition" aria-label="Close"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-end gap-5">
            <div>
              <div className={`text-5xl font-bold tabular tracking-tight ${scoreTone}`}>{r.score}</div>
              <div className="eyebrow mt-1">Overall</div>
            </div>
            <div className="pb-1.5">
              <div className="text-xl font-bold text-ax-dim tabular">{r.confidence}%</div>
              <div className="eyebrow">Confidence</div>
            </div>
          </div>

          <div>
            <div className="eyebrow mb-2">Why it scored this way</div>
            <div className="space-y-1.5">
              {r.matched.map((w) => (
                <div key={w.key} className="flex justify-between text-xs rounded-lg px-3 py-1.5 bg-ax-accent-bg border border-ax-accent-border">
                  <span className="text-ax-accent">{w.label}</span>
                  <span className="font-mono text-ax-accent tabular">+{w.weight}</span>
                </div>
              ))}
              {r.matched.length === 0 && (
                <div className="prose-body text-xs text-ax-muted">No weighted criteria matched.</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="eyebrow mb-2">Matched keywords</div>
              <div className="flex flex-wrap gap-1">
                {item.keywords.length > 0
                  ? item.keywords.map((k) => <span key={k} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-ax-glass-hi border border-ax text-ax-dim">{k}</span>)
                  : <span className="prose-body text-[10px] text-ax-muted">None detected</span>}
              </div>
            </div>
            <div>
              <div className="eyebrow mb-2">Missing criteria</div>
              <div className="flex flex-wrap gap-1">
                {r.missing.map((w) => <span key={w.key} className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-ax text-ax-muted">{w.label}</span>)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs border-t border-ax pt-4">
            {([["Recommended action", r.nextAction], ["Internal priority", r.priority], ["Proposal difficulty", r.difficulty], ["Probability of success", r.pWin], ["Strategic value", r.strategic]] as const).map(([k, v]) => (
              <div key={k}>
                <div className="eyebrow">{k}</div>
                <div className="prose-body text-ax-dim mt-1 leading-relaxed">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
