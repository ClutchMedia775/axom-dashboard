"use client";

import { useVenture } from "@/lib/hooks";

export default function CompaniesPage() {
  const { data: venture } = useVenture();
  return (
    <div className="max-w-3xl space-y-2">
      {(venture ?? []).map((v) => (
        <div key={v.id} className="glass rounded-2xl px-4 py-3.5 flex justify-between gap-4 items-center">
          <div>
            <div className="text-xs text-ax-text font-medium">{v.co}</div>
            <div className="prose-body text-[10px] text-ax-dim mt-0.5">{v.focus}</div>
          </div>
          <div className="text-xs font-mono text-ax-accent tabular shrink-0">{v.round}</div>
        </div>
      ))}
    </div>
  );
}
