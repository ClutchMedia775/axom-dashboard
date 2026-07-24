"use client";

import { useAppState } from "@/components/app-state";
import { Deadline } from "@/components/deadline";
import { ScoreBadge } from "@/components/score-badge";
import { Widget } from "@/components/widget";
import { useConferences, useNews, usePapers, useProgramManagers, useScoredOpportunities, useVenture } from "@/lib/hooks";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const { setAgencyFilter, setScoreModal } = useAppState();
  const scored = useScoredOpportunities();
  const { data: pms } = useProgramManagers();
  const { data: papers } = usePapers();
  const { data: news } = useNews();
  const { data: conferences } = useConferences();
  const { data: venture } = useVenture();

  const deadlines = [...scored].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()).slice(0, 5);
  const byAgency = (ag: string) => scored.filter((o) => o.agency === ag);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      <Widget title="Upcoming Deadlines" action={() => router.push("/funding")} wide>
        {deadlines.map((o) => (
          <button key={o.id} onClick={() => router.push(`/funding/${o.id}`)} className="w-full flex items-center justify-between gap-3 px-2 py-1.5 rounded hover:bg-slate-800/50 transition text-left">
            <div className="min-w-0">
              <div className="text-xs text-slate-200 truncate">{o.program}</div>
              <div className="text-[10px] text-slate-500 font-mono">{o.agency} · {o.type}</div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Deadline d={o.deadline} />
              <ScoreBadge s={o._s.score} onClick={(e) => { e.stopPropagation(); setScoreModal(o); }} />
            </div>
          </button>
        ))}
      </Widget>

      <Widget title="Program Managers to Contact" action={() => router.push("/program-managers")}>
        {(pms ?? []).slice(0, 4).map((p) => (
          <button key={p.id} onClick={() => router.push(`/program-managers/${p.id}`)} className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-800/50 transition text-left">
            <div>
              <div className="text-xs text-slate-200">{p.name}</div>
              <div className="text-[10px] text-slate-500">{p.agency} · {p.office}</div>
            </div>
            <ChevronRight size={13} className="text-slate-600" />
          </button>
        ))}
      </Widget>

      {["DARPA", "DOE", "ARPA-H", "NSF", "NIH", "NIST"].map((ag) => (
        <Widget key={ag} title={`${ag} Opportunities`} action={() => { setAgencyFilter(ag); router.push("/funding"); }}>
          {byAgency(ag).length === 0 && <div className="text-[11px] text-slate-600 px-2 py-1">No open items tracked.</div>}
          {byAgency(ag).map((o) => (
            <button key={o.id} onClick={() => router.push(`/funding/${o.id}`)} className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-800/50 transition text-left">
              <div className="text-xs text-slate-300 truncate pr-2">{o.program}</div>
              <ScoreBadge s={o._s.score} onClick={(e) => { e.stopPropagation(); setScoreModal(o); }} />
            </button>
          ))}
        </Widget>
      ))}

      <Widget title="Recent Scientific AI Papers" action={() => router.push("/papers")}>
        {(papers ?? []).slice(0, 4).map((p) => (
          <div key={p.id} className="px-2 py-1.5">
            <div className="text-xs text-slate-300 leading-snug">{p.title}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">{p.venue} · {p.date}</div>
          </div>
        ))}
      </Widget>

      <Widget title="Recent AI Policy & News" action={() => router.push("/news")}>
        {(news ?? []).slice(0, 4).map((n) => (
          <div key={n.id} className="px-2 py-1.5">
            <div className="text-xs text-slate-300 leading-snug">{n.title}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">{n.src} · {n.date}</div>
          </div>
        ))}
      </Widget>

      <Widget title="Upcoming Conferences" action={() => router.push("/conferences")}>
        {(conferences ?? []).slice(0, 4).map((c) => (
          <div key={c.id} className="px-2 py-1.5 flex justify-between gap-2">
            <div className="text-xs text-slate-300">{c.name}</div>
            <div className="text-[10px] text-slate-500 font-mono shrink-0">{c.date}</div>
          </div>
        ))}
      </Widget>

      <Widget title="Recent Venture Funding" action={() => router.push("/companies")}>
        {(venture ?? []).map((v) => (
          <div key={v.id} className="px-2 py-1.5 flex justify-between gap-2">
            <div>
              <div className="text-xs text-slate-300">{v.co}</div>
              <div className="text-[10px] text-slate-500">{v.focus}</div>
            </div>
            <div className="text-[11px] font-mono text-emerald-400 shrink-0">{v.round}</div>
          </div>
        ))}
      </Widget>

      <Widget title="National Lab Opportunities" action={() => router.push("/labs")}>
        <div className="px-2 py-1.5 text-xs text-slate-300">DOE ASCR exascale FOA requires lab partnership — ANL and ORNL flagged as best-fit hosts for AXOM&apos;s HPC-adjacent modules.</div>
        <div className="flex flex-wrap gap-1 px-2 pb-1">
          {["Argonne", "Oak Ridge", "LBNL"].map((l) => <span key={l} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300">{l}</span>)}
        </div>
      </Widget>
    </div>
  );
}
