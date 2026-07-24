"use client";

import { daysUntil } from "@/components/deadline";
import { useScoredOpportunities } from "@/lib/hooks";
import { useMemo } from "react";

/** Pull the largest dollar figure out of free-text amount/award fields. */
function parseDollars(s: string): number {
  let best = 0;
  const re = /\$\s?([\d,.]+)\s*([MBK])?/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    const n = parseFloat(m[1].replace(/,/g, ""));
    if (Number.isNaN(n)) continue;
    const mult = m[2]?.toUpperCase() === "B" ? 1e9 : m[2]?.toUpperCase() === "M" ? 1e6 : m[2]?.toUpperCase() === "K" ? 1e3 : 1;
    best = Math.max(best, n * mult);
  }
  return best;
}

function formatDollars(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${Math.round(n / 1e6)}M`;
  if (n >= 1e3) return `$${Math.round(n / 1e3)}K`;
  return n > 0 ? `$${n}` : "—";
}

function Kpi({ label, value, unit, alert }: { label: string; value: string; unit?: string; alert?: boolean }) {
  return (
    <div className="glass rounded-2xl px-4 py-3">
      <div className="eyebrow">{label}</div>
      <div className={`text-2xl font-bold tabular tracking-tight mt-0.5 ${alert ? "text-ax-warn" : "text-ax-text"}`}>
        {value}
        {unit && <span className="text-[11px] font-medium text-ax-dim ml-1 tracking-normal">{unit}</span>}
      </div>
    </div>
  );
}

/**
 * Answers "is anything urgent" before the user reads a single row.
 * Everything is derived from the same scored set the rest of the app uses.
 */
export function KpiStrip() {
  const scored = useScoredOpportunities();

  const { tracked, closing, top } = useMemo(() => {
    const totalDollars = scored.reduce((sum, o) => sum + Math.max(parseDollars(o.amount), parseDollars(o.awardSize)), 0);
    const closingSoon = scored.filter((o) => {
      const d = daysUntil(o.deadline);
      return d >= 0 && d <= 30;
    }).length;
    const topScore = scored.length ? Math.max(...scored.map((o) => o._s.score)) : 0;
    return { tracked: formatDollars(totalDollars), closing: closingSoon, top: topScore };
  }, [scored]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
      <Kpi label="Tracked funding" value={tracked} />
      <Kpi label="Closing in 30d" value={String(closing)} unit={closing === 1 ? "opp" : "opps"} alert={closing > 0} />
      <Kpi label="Top score" value={String(top)} />
    </div>
  );
}
