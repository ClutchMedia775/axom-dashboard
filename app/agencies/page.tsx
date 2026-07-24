"use client";

import { useAppState } from "@/components/app-state";
import { AGENCIES } from "@/lib/constants";
import { useScoredOpportunities } from "@/lib/hooks";
import { useRouter } from "next/navigation";

export default function AgenciesPage() {
  const router = useRouter();
  const { setAgencyFilter } = useAppState();
  const scored = useScoredOpportunities();

  return (
    <div className="grid sm:grid-cols-2 gap-3 max-w-3xl">
      {AGENCIES.map((a) => {
        const n = scored.filter((o) => o.agency === a).length;
        return (
          <button key={a} onClick={() => { setAgencyFilter(a); router.push("/funding"); }}
            className="text-left border border-slate-800 rounded-lg px-4 py-3 bg-slate-900/40 hover:border-blue-500/40 transition flex justify-between items-center">
            <span className="text-xs text-slate-200 font-mono">{a}</span>
            <span className="text-[10px] text-slate-500">{n} tracked {n === 1 ? "opportunity" : "opportunities"}</span>
          </button>
        );
      })}
    </div>
  );
}
