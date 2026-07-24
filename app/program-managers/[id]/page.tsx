"use client";

import { useAppState } from "@/components/app-state";
import { ScoreBadge } from "@/components/score-badge";
import { useProgramManagers, useScoredOpportunities } from "@/lib/hooks";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function ProgramManagerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { setScoreModal } = useAppState();
  const { data: pms } = useProgramManagers();
  const scored = useScoredOpportunities();

  const p = (pms ?? []).find((x) => x.id === id);
  if (!p) return null;
  const theirOpps = scored.filter((o) => p.openOpps.includes(o.id));

  return (
    <div className="max-w-3xl">
      <Link href="/program-managers" className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 mb-3">
        <ChevronLeft size={13} /> Back to program managers
      </Link>
      <h1 className="text-lg text-slate-100 font-semibold">{p.name}</h1>
      <div className="text-xs font-mono text-blue-300 mb-4">{p.role} · {p.agency} — {p.office}</div>
      <p className="text-sm text-slate-300 leading-relaxed mb-5">{p.bio}</p>
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-xs border border-slate-800 rounded-lg p-4 bg-slate-900/40 mb-5">
        {([["Research Interests", p.interests.join(", ")], ["Current Programs", p.currentPrograms.join(", ")],
          ["Past Programs", p.pastPrograms.join(", ")], ["Email", p.email], ["LinkedIn", p.linkedin],
          ["Google Scholar", p.scholar], ["Recent Talks", p.talks.join(" · ")], ["Publications", p.pubs.join(" · ")],
        ] as const).map(([k, v]) => (
          <div key={k}>
            <div className="text-slate-500 text-[10px] uppercase tracking-wider">{k}</div>
            <div className="text-slate-300 mt-0.5">{v}</div>
          </div>
        ))}
      </div>
      <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-lg p-4 mb-5">
        <div className="text-[10px] uppercase tracking-wider text-emerald-400 mb-1">Relationship History</div>
        <div className="text-xs text-slate-300">{p.relationship}</div>
      </div>
      {theirOpps.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Open Opportunities</div>
          {theirOpps.map((o) => (
            <button key={o.id} onClick={() => router.push(`/funding/${o.id}`)} className="w-full flex items-center justify-between border border-slate-800 rounded-lg px-4 py-2.5 hover:border-emerald-500/40 transition text-left mb-2">
              <span className="text-xs text-slate-200">{o.program}</span>
              <ScoreBadge s={o._s.score} onClick={(e) => { e.stopPropagation(); setScoreModal(o); }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
