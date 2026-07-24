"use client";

import { useBiotechOrgs } from "@/lib/hooks";

export default function BiotechPage() {
  const { data: orgs } = useBiotechOrgs();
  return (
    <div className="flex flex-wrap gap-2 max-w-3xl">
      {(orgs ?? []).map((b) => <div key={b} className="border border-slate-800 rounded-lg px-4 py-3 bg-slate-900/40 text-xs text-slate-300">{b}</div>)}
    </div>
  );
}
