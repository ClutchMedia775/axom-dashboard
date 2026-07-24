"use client";

import { usePapers } from "@/lib/hooks";

export default function PapersPage() {
  const { data: papers } = usePapers();
  return (
    <div className="max-w-3xl">
      <div className="space-y-2">
        {(papers ?? []).map((p) => (
          <div key={p.id} className="border border-slate-800 rounded-lg px-4 py-3 bg-slate-900/40">
            <div className="text-xs text-slate-200">{p.title}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">{p.venue} · {p.date}</div>
            <div className="flex flex-wrap gap-1 mt-2">{p.tags.map((t) => <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{t}</span>)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
