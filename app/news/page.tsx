"use client";

import { useNews } from "@/lib/hooks";

export default function NewsPage() {
  const { data: news } = useNews();
  return (
    <div className="max-w-3xl space-y-2">
      {(news ?? []).map((n) => (
        <div key={n.id} className="glass rounded-2xl px-4 py-3.5 flex justify-between gap-4">
          <div className="prose-body text-xs text-ax-text leading-relaxed">{n.title}</div>
          <div className="text-[10px] text-ax-muted font-mono shrink-0">{n.src} · {n.date}</div>
        </div>
      ))}
    </div>
  );
}
