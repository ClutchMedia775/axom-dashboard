"use client";

import { useAppState } from "@/components/app-state";
import { Deadline } from "@/components/deadline";
import { ScoreBadge } from "@/components/score-badge";
import { useProgramManagers, useScoredOpportunities } from "@/lib/hooks";
import { Bookmark, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { bookmarks, toggleBookmark, setScoreModal, setAssistantOpen, setAssistantContext } = useAppState();
  const scored = useScoredOpportunities();
  const { data: pms } = useProgramManagers();

  const o = scored.find((x) => x.id === id);

  // Give the Assistant the opportunity in view as context while on this page.
  useEffect(() => {
    setAssistantContext(o ?? null);
    return () => setAssistantContext(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [o?.id, o?._s.score]);

  if (!o) return null;
  const pm = (pms ?? []).find((p) => p.name === o.pm);
  const rows: [string, string][] = [
    ["Agency / Office", `${o.agency} — ${o.office}`], ["Type", o.type], ["Program Funding", o.amount],
    ["Award Size", o.awardSize], ["TRL", o.trl], ["Technology Area", o.techArea],
    ["Eligibility", o.eligibility], ["Application Requirements", o.requirements],
    ["Previous Winners", o.previousWinners.join(", ")], ["Official Link", o.link],
  ];

  return (
    <div className="max-w-3xl">
      <Link href="/funding" className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 mb-3">
        <ChevronLeft size={13} /> Back to funding
      </Link>
      <div className="flex items-start justify-between gap-4 mb-1">
        <h1 className="text-lg text-slate-100 font-semibold leading-snug">{o.program}</h1>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => toggleBookmark(o.id)} className={bookmarks.has(o.id) ? "text-emerald-400" : "text-slate-600 hover:text-slate-400"}>
            <Bookmark size={16} fill={bookmarks.has(o.id) ? "currentColor" : "none"} />
          </button>
          <ScoreBadge s={o._s.score} onClick={() => setScoreModal(o)} />
        </div>
      </div>
      <div className="text-xs text-slate-500 font-mono mb-4">{o.agency} · deadline <Deadline d={o.deadline} /></div>
      <p className="text-sm text-slate-300 leading-relaxed mb-5">{o.summary}</p>
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-xs border border-slate-800 rounded-lg p-4 mb-5 bg-slate-900/40">
        {rows.map(([k, v]) => (
          <div key={k}>
            <div className="text-slate-500 text-[10px] uppercase tracking-wider">{k}</div>
            <div className="text-slate-300 mt-0.5">{v}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-1 mb-5">
        {o.keywords.map((k) => <span key={k} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{k}</span>)}
      </div>
      {pm && (
        <button onClick={() => router.push(`/program-managers/${pm.id}`)} className="flex items-center justify-between w-full sm:w-80 border border-slate-800 rounded-lg px-4 py-3 hover:border-blue-500/40 transition text-left mb-5">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Program Manager</div>
            <div className="text-sm text-slate-200">{pm.name}</div>
          </div>
          <ChevronRight size={14} className="text-slate-600" />
        </button>
      )}
      <button onClick={() => setAssistantOpen(true)}
        className="flex items-center gap-2 text-xs bg-emerald-600/90 hover:bg-emerald-500 text-white rounded px-3 py-2 transition">
        <Sparkles size={13} /> Analyze with Axom Assistant
      </button>
    </div>
  );
}
