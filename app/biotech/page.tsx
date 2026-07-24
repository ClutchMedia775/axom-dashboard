"use client";

import { useBiotechOrgs } from "@/lib/hooks";

export default function BiotechPage() {
  const { data: orgs } = useBiotechOrgs();
  return (
    <div className="flex flex-wrap gap-2 max-w-3xl">
      {(orgs ?? []).map((b) => (
        <div key={b} className="glass glass-hover rounded-2xl px-4 py-3 text-xs text-ax-dim">{b}</div>
      ))}
    </div>
  );
}
