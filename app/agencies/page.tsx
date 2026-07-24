"use client";

import { useAppState } from "@/components/app-state";
import { AGENCIES } from "@/lib/constants";
import { useScoredOpportunities } from "@/lib/hooks";
import { useRouter } from "next/navigation";

export default function AgenciesPage() {
  const router = useRouter();
  const { setAgencyFilter } = useAppState();
  const scored = useScoredOpportunities();

  const all = [...new Set([...AGENCIES, ...scored.map((o) => o.agency)])];

  return (
    <div className="grid sm:grid-cols-2 gap-3 max-w-3xl">
      {all.map((a) => {
        const n = scored.filter((o) => o.agency === a).length;
        return (
          <button key={a} onClick={() => { setAgencyFilter(a); router.push("/funding"); }}
            className="glass glass-hover text-left rounded-2xl px-4 py-3.5 flex justify-between items-center">
            <span className="text-xs text-ax-text font-mono font-semibold">{a}</span>
            <span className="prose-body text-[10px] text-ax-dim tabular">
              {n} tracked {n === 1 ? "opportunity" : "opportunities"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
