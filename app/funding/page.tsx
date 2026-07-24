"use client";

import { useAppState } from "@/components/app-state";
import { Deadline } from "@/components/deadline";
import { ScoreBadge } from "@/components/score-badge";
import { AGENCIES } from "@/lib/constants";
import { useFilteredOpportunities, useScoredOpportunities } from "@/lib/hooks";
import { Bookmark, Filter } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FundingPage() {
  const router = useRouter();
  const { agencyFilter, setAgencyFilter, bookmarks, toggleBookmark, setScoreModal } = useAppState();
  const scored = useScoredOpportunities();
  const filtered = useFilteredOpportunities();

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Filter size={13} className="text-slate-500" />
        {["All", ...new Set([...AGENCIES.filter((a) => scored.some((o) => o.agency === a)), ...scored.map((o) => o.agency)])].map((a) => (
          <button key={a} onClick={() => setAgencyFilter(a)}
            className={`text-[11px] font-mono px-2 py-1 rounded border transition ${agencyFilter === a ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300" : "border-slate-800 text-slate-400 hover:border-slate-600"}`}>
            {a}
          </button>
        ))}
        <span className="text-[11px] text-slate-600 ml-auto font-mono">{filtered.length} results · sorted by score</span>
      </div>
      <div className="border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-slate-500 bg-slate-900/80 border-b border-slate-800">
              <th className="px-3 py-2">Score</th>
              <th className="px-3 py-2">Program</th>
              <th className="px-3 py-2 hidden md:table-cell">Agency</th>
              <th className="px-3 py-2 hidden lg:table-cell">Award Size</th>
              <th className="px-3 py-2">Deadline</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b border-slate-800/60 hover:bg-slate-900/60 transition cursor-pointer" onClick={() => router.push(`/funding/${o.id}`)}>
                <td className="px-3 py-2"><ScoreBadge s={o._s.score} onClick={(e) => { e.stopPropagation(); setScoreModal(o); }} /></td>
                <td className="px-3 py-2">
                  <div className="text-xs text-slate-200">{o.program}</div>
                  <div className="text-[10px] text-slate-500">{o.techArea} · {o.type}</div>
                </td>
                <td className="px-3 py-2 hidden md:table-cell"><span className="text-[11px] font-mono text-blue-300">{o.agency}</span></td>
                <td className="px-3 py-2 hidden lg:table-cell text-[11px] font-mono text-slate-400">{o.awardSize}</td>
                <td className="px-3 py-2"><Deadline d={o.deadline} /></td>
                <td className="px-3 py-2">
                  <button onClick={(e) => { e.stopPropagation(); toggleBookmark(o.id); }}
                    className={bookmarks.has(o.id) ? "text-emerald-400" : "text-slate-600 hover:text-slate-400"}>
                    <Bookmark size={14} fill={bookmarks.has(o.id) ? "currentColor" : "none"} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
