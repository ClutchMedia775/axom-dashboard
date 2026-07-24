"use client";

import { useAppState } from "@/components/app-state";
import { scoreItem } from "@/lib/scoring";
import { X } from "lucide-react";

export function ScoreModal() {
  const { scoreModal: item, weights, setScoreModal } = useAppState();
  if (!item) return null;
  const r = scoreItem(item.keywords, weights);
  const onClose = () => setScoreModal(null);
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-950 border border-slate-800 rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-slate-800 flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Axom Opportunity Score</div>
            <div className="text-sm text-slate-200 font-medium">{item.program}</div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-end gap-4">
            <div>
              <div className={`text-5xl font-mono font-bold ${r.score >= 75 ? "text-emerald-400" : r.score >= 55 ? "text-blue-400" : "text-slate-400"}`}>{r.score}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Overall</div>
            </div>
            <div className="pb-1">
              <div className="text-xl font-mono text-slate-300">{r.confidence}%</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Confidence</div>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Why it scored this way</div>
            <div className="space-y-1">
              {r.matched.map((w) => (
                <div key={w.key} className="flex justify-between text-xs bg-emerald-500/5 border border-emerald-500/20 rounded px-2 py-1">
                  <span className="text-emerald-300">{w.label}</span>
                  <span className="font-mono text-emerald-400">+{w.weight}</span>
                </div>
              ))}
              {r.matched.length === 0 && <div className="text-xs text-slate-500">No weighted criteria matched.</div>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Matched keywords</div>
              <div className="flex flex-wrap gap-1">
                {item.keywords.map((k) => <span key={k} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{k}</span>)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Missing criteria</div>
              <div className="flex flex-wrap gap-1">
                {r.missing.map((w) => <span key={w.key} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-500">{w.label}</span>)}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs border-t border-slate-800 pt-4">
            {([["Recommended action", r.nextAction], ["Internal priority", r.priority], ["Proposal difficulty", r.difficulty], ["Probability of success", r.pWin], ["Strategic value", r.strategic]] as const).map(([k, v]) => (
              <div key={k}>
                <div className="text-slate-500 text-[10px] uppercase tracking-wider">{k}</div>
                <div className="text-slate-300 mt-0.5">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
