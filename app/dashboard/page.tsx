"use client";

import { useAppState } from "@/components/app-state";
import { Deadline } from "@/components/deadline";
import { DeadlineTimeline } from "@/components/deadline-timeline";
import { KpiStrip } from "@/components/kpi-strip";
import { ScoreBadge } from "@/components/score-badge";
import { Widget } from "@/components/widget";
import { useNews, usePapers, useProgramManagers, useScoredOpportunities, useVenture } from "@/lib/hooks";
import { ACTIVE_STAGES, STAGE_LABELS } from "@/lib/pipeline";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const { setAgencyFilter, setScoreModal, bookmarks, entryFor } = useAppState();
  const scored = useScoredOpportunities();

  // Tracked pursuits still in play, nearest deadline first — the day's worklist.
  const needsAction = scored
    .filter((o) => bookmarks.has(o.id) && ACTIVE_STAGES.includes(entryFor(o.id).stage))
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 4);
  const { data: pms } = useProgramManagers();
  const { data: papers } = usePapers();
  const { data: news } = useNews();
  const { data: venture } = useVenture();

  const deadlines = [...scored].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()).slice(0, 6);
  const byAgency = (ag: string) => scored.filter((o) => o.agency === ag);
  const agenciesWithItems = ["DARPA", "DOE", "ARPA-H", "NSF", "NIH", "NIST"].filter((ag) => byAgency(ag).length > 0);

  return (
    <div className="space-y-3">
      <KpiStrip />
      <DeadlineTimeline />

      {/* Bento: deadlines gets the wide tile, everything else fills around it. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Widget title="Upcoming Deadlines" action={() => router.push("/funding")} className="md:col-span-2 md:row-span-2">
          {deadlines.map((o) => (
            <button key={o.id} onClick={() => router.push(`/funding/${o.id}`)}
              className="w-full flex items-center justify-between gap-3 px-2 py-2 rounded-lg hover:bg-ax-glass-hi transition text-left">
              <div className="min-w-0">
                <div className="text-xs text-ax-text font-medium truncate">{o.program}</div>
                <div className="text-[10px] text-ax-dim font-mono mt-0.5">{o.agency} · {o.type}</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Deadline d={o.deadline} />
                <ScoreBadge s={o._s.score} onClick={(e) => { e.stopPropagation(); setScoreModal(o); }} />
              </div>
            </button>
          ))}
          {deadlines.length === 0 && <div className="prose-body text-[11px] text-ax-muted px-2 py-2">Loading opportunities…</div>}
        </Widget>

        <Widget title="Program Managers" action={() => router.push("/program-managers")}>
          {(pms ?? []).slice(0, 4).map((p) => (
            <button key={p.id} onClick={() => router.push(`/program-managers/${p.id}`)}
              className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-ax-glass-hi transition text-left">
              <div className="min-w-0">
                <div className="text-xs text-ax-text font-medium truncate">{p.name}</div>
                <div className="text-[10px] text-ax-dim truncate">{p.agency} · {p.office}</div>
              </div>
              <ChevronRight size={13} className="text-ax-muted shrink-0" />
            </button>
          ))}
        </Widget>

        <Widget title="Recent Venture Funding" action={() => router.push("/companies")}>
          {(venture ?? []).map((v) => (
            <div key={v.id} className="px-2 py-2 flex justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs text-ax-text truncate">{v.co}</div>
                <div className="text-[10px] text-ax-dim truncate">{v.focus}</div>
              </div>
              <div className="text-[11px] font-mono text-ax-accent shrink-0 tabular">{v.round}</div>
            </div>
          ))}
        </Widget>

        {agenciesWithItems.map((ag) => (
          <Widget key={ag} title={`${ag} Opportunities`} action={() => { setAgencyFilter(ag); router.push("/funding"); }}>
            {byAgency(ag).slice(0, 4).map((o) => (
              <button key={o.id} onClick={() => router.push(`/funding/${o.id}`)}
                className="w-full flex items-center justify-between gap-2 px-2 py-2 rounded-lg hover:bg-ax-glass-hi transition text-left">
                <div className="text-xs text-ax-dim truncate">{o.program}</div>
                <ScoreBadge s={o._s.score} onClick={(e) => { e.stopPropagation(); setScoreModal(o); }} />
              </button>
            ))}
          </Widget>
        ))}

        <Widget title="Recent Scientific AI Papers" action={() => router.push("/papers")}>
          {(papers ?? []).slice(0, 3).map((p) => (
            <div key={p.id} className="px-2 py-2">
              <div className="prose-body text-xs text-ax-dim leading-snug">{p.title}</div>
              <div className="text-[10px] text-ax-muted font-mono mt-1">{p.venue} · {p.date}</div>
            </div>
          ))}
        </Widget>

        <Widget title="AI Policy & News" action={() => router.push("/news")}>
          {(news ?? []).slice(0, 3).map((n) => (
            <div key={n.id} className="px-2 py-2">
              <div className="prose-body text-xs text-ax-dim leading-snug">{n.title}</div>
              <div className="text-[10px] text-ax-muted font-mono mt-1">{n.src} · {n.date}</div>
            </div>
          ))}
        </Widget>

        <Widget title="Pipeline — Needs Action" action={() => router.push("/saved")}>
          {needsAction.length === 0 && (
            <div className="px-2 py-2 prose-body text-xs text-ax-muted">
              No active pursuits — track opportunities from the funding table.
            </div>
          )}
          {needsAction.map((o) => {
            const entry = entryFor(o.id);
            const open = entry.tasks.filter((t) => !t.done).length;
            return (
              <button key={o.id} onClick={() => router.push(`/funding/${o.id}`)}
                className="w-full text-left px-2 py-2 rounded-xl hover:bg-ax-glass transition">
                <div className="text-xs text-ax-text font-medium truncate">{o.program}</div>
                <div className="text-[10px] text-ax-dim font-mono mt-0.5">
                  {STAGE_LABELS[entry.stage]} · <Deadline d={o.deadline} /> · {open} open task{open === 1 ? "" : "s"}
                </div>
              </button>
            );
          })}
        </Widget>

      </div>
    </div>
  );
}
