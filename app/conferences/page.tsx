"use client";

import { useConferences } from "@/lib/hooks";

export default function ConferencesPage() {
  const { data: conferences } = useConferences();
  return (
    <div className="max-w-3xl">
      <div className="space-y-2">
        {(conferences ?? []).map((c) => (
          <div key={c.id} className="border border-slate-800 rounded-lg px-4 py-3 bg-slate-900/40">
            <div className="flex justify-between gap-3">
              <div className="text-xs text-slate-200">{c.name}</div>
              <div className="text-[10px] text-slate-500 font-mono shrink-0">{c.date} · {c.loc}</div>
            </div>
            <div className="text-[11px] text-emerald-400/80 mt-1">{c.why}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
