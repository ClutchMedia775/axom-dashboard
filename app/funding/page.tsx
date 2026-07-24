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

  const chips = ["All", ...new Set([...AGENCIES.filter((a) => scored.some((o) => o.agency === a)), ...scored.map((o) => o.agency)])];

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Filter size={13} className="text-ax-muted" />
        {chips.map((a) => (
          <button key={a} onClick={() => setAgencyFilter(a)}
            className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition ${
              agencyFilter === a
                ? "border-ax-accent-border bg-ax-accent-bg text-ax-accent font-semibold"
                : "border-ax text-ax-dim hover:text-ax-text hover:border-ax-strong"
            }`}>
            {a}
          </button>
        ))}
        <span className="text-[11px] text-ax-muted ml-auto font-mono tabular">{filtered.length} results · sorted by score</span>
      </div>

      {/* Table rows stay flat — blurring 25 rows at once stutters on older GPUs. */}
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="eyebrow border-b border-ax">
              <th className="px-3 py-2.5 font-semibold">Score</th>
              <th className="px-3 py-2.5 font-semibold">Program</th>
              <th className="px-3 py-2.5 font-semibold hidden md:table-cell">Agency</th>
              <th className="px-3 py-2.5 font-semibold hidden lg:table-cell">Award Size</th>
              <th className="px-3 py-2.5 font-semibold">Deadline</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b border-ax last:border-0 hover:bg-ax-glass-hi transition cursor-pointer"
                onClick={() => router.push(`/funding/${o.id}`)}>
                <td className="px-3 py-2.5"><ScoreBadge s={o._s.score} onClick={(e) => { e.stopPropagation(); setScoreModal(o); }} /></td>
                <td className="px-3 py-2.5">
                  <div className="text-xs text-ax-text font-medium">{o.program}</div>
                  <div className="text-[10px] text-ax-dim mt-0.5">{o.techArea} · {o.type}</div>
                </td>
                <td className="px-3 py-2.5 hidden md:table-cell"><span className="text-[11px] font-mono text-ax-info">{o.agency}</span></td>
                <td className="px-3 py-2.5 hidden lg:table-cell text-[11px] font-mono text-ax-dim tabular">{o.awardSize}</td>
                <td className="px-3 py-2.5"><Deadline d={o.deadline} /></td>
                <td className="px-3 py-2.5">
                  <button onClick={(e) => { e.stopPropagation(); toggleBookmark(o.id); }}
                    aria-label={bookmarks.has(o.id) ? "Remove bookmark" : "Add bookmark"}
                    className={bookmarks.has(o.id) ? "text-ax-accent" : "text-ax-muted hover:text-ax-dim"}>
                    <Bookmark size={14} fill={bookmarks.has(o.id) ? "currentColor" : "none"} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="prose-body px-3 py-6 text-center text-xs text-ax-muted">No opportunities match this filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
