"use client";

import { useNationalLabs } from "@/lib/hooks";

export default function LabsPage() {
  const { data: labs } = useNationalLabs();
  return (
    <div className="flex flex-wrap gap-2 max-w-3xl">
      {(labs ?? []).map((l) => <div key={l} className="border border-slate-800 rounded-lg px-4 py-3 bg-slate-900/40 text-xs text-slate-300">{l} National Laboratory</div>)}
    </div>
  );
}
