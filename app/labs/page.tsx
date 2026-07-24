"use client";

import { useNationalLabs } from "@/lib/hooks";

export default function LabsPage() {
  const { data: labs } = useNationalLabs();
  return (
    <div className="flex flex-wrap gap-2 max-w-3xl">
      {(labs ?? []).map((l) => (
        <div key={l} className="glass glass-hover rounded-2xl px-4 py-3 text-xs text-ax-dim">{l} National Laboratory</div>
      ))}
    </div>
  );
}
