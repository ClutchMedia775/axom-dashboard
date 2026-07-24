"use client";

// Rendered as a span (not a button) because it frequently sits inside
// clickable rows — nested <button> elements are invalid HTML and break
// React hydration.
export function ScoreBadge({ s, onClick, size = "sm" }: {
  s: number;
  onClick?: (e: React.MouseEvent) => void;
  size?: "sm" | "lg";
}) {
  const tone = s >= 75
    ? "text-ax-accent bg-ax-accent-bg border-ax-accent-border"
    : s >= 55
    ? "text-ax-info bg-ax-glass-hi border-ax-strong"
    : "text-ax-dim bg-ax-glass border-ax";
  const dims = size === "lg" ? "text-base px-3 py-1 rounded-xl" : "text-xs px-2 py-0.5 rounded-lg";
  return (
    <span role="button" tabIndex={0} onClick={onClick} title="View score breakdown"
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick?.(e as unknown as React.MouseEvent); }}
      className={`font-bold tabular border cursor-default select-none transition hover:brightness-125 ${tone} ${dims}`}>
      {s}
    </span>
  );
}
