"use client";

export function daysUntil(d: string): number {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
}

export function Deadline({ d }: { d: string }) {
  const days = daysUntil(d);
  const c = days <= 21 ? "text-red-400" : days <= 45 ? "text-amber-400" : "text-slate-400";
  return (
    <span className={`font-mono text-xs ${c}`} suppressHydrationWarning>
      {d} <span className="opacity-70">({days}d)</span>
    </span>
  );
}
