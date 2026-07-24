"use client";

import { useVenture } from "@/lib/hooks";

export default function CompaniesPage() {
  const { data: venture } = useVenture();
  return (
    <div className="max-w-3xl">
      <div className="space-y-2">
        {(venture ?? []).map((v) => (
          <div key={v.id} className="border border-slate-800 rounded-lg px-4 py-3 bg-slate-900/40 flex justify-between gap-3">
            <div>
              <div className="text-xs text-slate-200">{v.co}</div>
              <div className="text-[10px] text-slate-500">{v.focus}</div>
            </div>
            <div className="text-xs font-mono text-emerald-400">{v.round}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
