"use client";

export function daysUntil(d: string): number {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
}

/** Past its deadline. Due-today (0d) is still open and still actionable. */
export function isExpired(d: string): boolean {
  return daysUntil(d) < 0;
}

/** Urgency tone shared by the deadline text and the timeline pins. */
export function urgencyClass(days: number): string {
  return days <= 21 ? "text-ax-danger" : days <= 45 ? "text-ax-warn" : "text-ax-dim";
}

export function Deadline({ d }: { d: string }) {
  const days = daysUntil(d);
  return (
    <span className={`font-mono text-xs tabular ${urgencyClass(days)}`} suppressHydrationWarning>
      {d}{" "}
      <span className="opacity-70">
        {days < 0 ? `(closed ${-days}d ago)` : `(${days}d)`}
      </span>
    </span>
  );
}
