"use client";

import { useAppState } from "@/components/app-state";

export default function SettingsPage() {
  const { weights, setWeights, resetWeights } = useAppState();
  const total = weights.reduce((s, w) => s + w.weight, 0);

  return (
    <div className="max-w-2xl">
      <div className="glass rounded-2xl p-5 mb-3">
        <h2 className="text-sm text-ax-text font-bold tracking-wide">Axom Opportunity Score — weights</h2>
        <p className="prose-body text-xs text-ax-dim mt-1 leading-relaxed">
          Adjust criteria weights; every score in the app recalculates live.
          Total weight: <span className="font-mono text-ax-accent tabular">{total}</span>
        </p>
      </div>

      <div className="space-y-2">
        {weights.map((w, i) => (
          <div key={w.key} className="glass rounded-2xl px-4 py-3 flex items-center gap-4">
            <span className="text-xs text-ax-text w-52 shrink-0">{w.label}</span>
            <input type="range" min="0" max="30" value={w.weight}
              aria-label={`${w.label} weight`}
              onChange={(e) => setWeights((ws) => ws.map((x, j) => j === i ? { ...x, weight: +e.target.value } : x))}
              className="flex-1 accent-[var(--ax-accent)]" />
            <span className="font-mono text-xs text-ax-accent w-9 text-right tabular">+{w.weight}</span>
          </div>
        ))}
      </div>

      <button onClick={resetWeights}
        className="glass glass-hover mt-3 text-xs text-ax-dim hover:text-ax-text rounded-xl px-4 py-2 transition">
        Reset to defaults
      </button>
    </div>
  );
}
