"use client";

import { ExtLink } from "@/components/ext-link";
import { usePapers } from "@/lib/hooks";

export default function PapersPage() {
  const { data: papers } = usePapers();
  return (
    <div className="max-w-3xl space-y-2">
      {(papers ?? []).map((p) => (
        <div key={p.id} className="glass rounded-2xl px-4 py-3.5">
          <ExtLink href={p.url} className="prose-body text-xs text-ax-text leading-relaxed">
            {p.title}
          </ExtLink>
          <div className="text-[10px] text-ax-muted font-mono mt-1.5">{p.venue} · {p.date}</div>
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {p.tags.map((t) => (
              <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-ax-glass-hi border border-ax text-ax-dim">{t}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
