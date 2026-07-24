"use client";

import { useAppState } from "@/components/app-state";

export default function SettingsPage() {
  const { weights, setWeights, resetWeights } = useAppState();

  return (
    <div className="max-w-2xl">
      <h2 className="text-sm text-slate-200 font-semibold mb-1">Axom Opportunity Score — weights</h2>
      <p className="text-xs text-slate-500 mb-4">Adjust criteria weights; every score in the app recalculates live.</p>
      <div className="space-y-2">
        {weights.map((w, i) => (
          <div key={w.key} className="flex items-center gap-3 border border-slate-800 rounded-lg px-4 py-2.5 bg-slate-900/40">
            <span className="text-xs text-slate-300 w-56">{w.label}</span>
            <input type="range" min="0" max="30" value={w.weight}
              onChange={(e) => setWeights((ws) => ws.map((x, j) => j === i ? { ...x, weight: +e.target.value } : x))}
              className="flex-1 accent-emerald-500" />
            <span className="font-mono text-xs text-emerald-400 w-8 text-right">+{w.weight}</span>
          </div>
        ))}
      </div>
      <button onClick={resetWeights} className="mt-4 text-xs text-slate-400 border border-slate-800 rounded px-3 py-1.5 hover:border-slate-600 transition">
        Reset to defaults
      </button>
    </div>
  );
}
