"use client";

// Rendered as a span (not a button) because it frequently sits inside
// clickable rows — nested <button> elements are invalid HTML and break
// React hydration.
export function ScoreBadge({ s, onClick }: { s: number; onClick?: (e: React.MouseEvent) => void }) {
  const color = s >= 75 ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
    : s >= 55 ? "text-blue-400 border-blue-500/40 bg-blue-500/10"
    : "text-slate-400 border-slate-600/60 bg-slate-800/60";
  return (
    <span role="button" tabIndex={0} onClick={onClick} title="View score breakdown"
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick?.(e as unknown as React.MouseEvent); }}
      className={`font-mono text-xs px-2 py-0.5 rounded border cursor-default select-none ${color} hover:brightness-125 transition`}>
      {s}
    </span>
  );
}
