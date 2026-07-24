"use client";

import { daysUntil } from "@/components/deadline";
import { useScoredOpportunities } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

const WINDOW_DAYS = 90;

/**
 * The next 90 days as a track. Clustering is obvious at a glance here in a way
 * a sorted list never shows — pins are coloured by the same urgency thresholds
 * used on the deadline text.
 */
export function DeadlineTimeline() {
  const router = useRouter();
  const scored = useScoredOpportunities();

  const pins = useMemo(
    () =>
      scored
        .map((o) => ({ ...o, days: daysUntil(o.deadline) }))
        .filter((o) => o.days >= 0 && o.days <= WINDOW_DAYS)
        .sort((a, b) => a.days - b.days),
    [scored],
  );

  const months = useMemo(() => {
    const out: { label: string; pct: number }[] = [];
    const now = new Date();
    for (let i = 0; i <= 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const offset = Math.ceil((d.getTime() - now.getTime()) / 86400000);
      if (offset >= 0 && offset <= WINDOW_DAYS) {
        out.push({ label: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(), pct: (offset / WINDOW_DAYS) * 100 });
      }
    }
    return out;
  }, []);

  return (
    <div className="glass rounded-2xl px-4 py-3">
      <div className="flex items-baseline justify-between mb-1">
        <span className="eyebrow">Next 90 days</span>
        <span className="text-[10px] font-mono text-ax-muted tabular">{pins.length} closing</span>
      </div>

      {pins.length === 0 ? (
        <div className="prose-body text-[11px] text-ax-muted py-3">Nothing closes in the next 90 days.</div>
      ) : (
        <>
          <div className="relative h-8 mt-1">
            <div className="absolute left-0 right-0 top-1/2 h-px bg-ax-strong" />
            {months.map((m) => (
              <div key={m.label} className="absolute top-1/2 h-2 w-px bg-ax-strong" style={{ left: `${m.pct}%` }} />
            ))}
            {pins.map((o) => (
              <button
                key={o.id}
                onClick={() => router.push(`/funding/${o.id}`)}
                title={`${o.program} — ${o.agency}, ${o.days}d`}
                aria-label={`${o.program}, closes in ${o.days} days`}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 transition hover:scale-150 focus:scale-150 focus:outline-none"
                style={{
                  left: `${Math.min(99, (o.days / WINDOW_DAYS) * 100)}%`,
                  background: o.days <= 21 ? "var(--ax-danger)" : o.days <= 45 ? "var(--ax-warn)" : "var(--ax-accent)",
                  borderColor: "var(--ax-bg)",
                }}
              />
            ))}
          </div>
          <div className="relative h-3">
            {months.map((m) => (
              <span key={m.label} className="absolute text-[9px] font-mono text-ax-muted -translate-x-1/2" style={{ left: `${m.pct}%` }}>
                {m.label}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
