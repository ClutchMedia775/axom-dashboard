"use client";

import { useNews } from "@/lib/hooks";

export default function NewsPage() {
  const { data: news } = useNews();
  return (
    <div className="max-w-3xl">
      <div className="space-y-2">
        {(news ?? []).map((n) => (
          <div key={n.id} className="border border-slate-800 rounded-lg px-4 py-3 bg-slate-900/40 flex justify-between gap-3">
            <div className="text-xs text-slate-200">{n.title}</div>
            <div className="text-[10px] text-slate-500 font-mono shrink-0">{n.src} · {n.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
