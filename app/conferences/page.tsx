"use client";

import { useConferences } from "@/lib/hooks";

export default function ConferencesPage() {
  const { data: conferences } = useConferences();
  return (
    <div className="max-w-3xl space-y-2">
      {(conferences ?? []).map((c) => (
        <div key={c.id} className="glass rounded-2xl px-4 py-3.5">
          <div className="flex justify-between gap-4">
            <div className="text-xs text-ax-text font-medium">{c.name}</div>
            <div className="text-[10px] text-ax-muted font-mono shrink-0 tabular">{c.date} · {c.loc}</div>
          </div>
          <div className="prose-body text-[11px] text-ax-accent mt-1.5">{c.why}</div>
        </div>
      ))}
    </div>
  );
}
