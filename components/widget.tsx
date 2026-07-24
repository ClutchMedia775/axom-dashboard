"use client";

import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

export function Widget({ title, action, children, className = "" }: {
  title: string;
  action?: () => void;
  children: ReactNode;
  /** Grid spans for the bento layout, e.g. "md:col-span-2 md:row-span-2". */
  className?: string;
}) {
  return (
    <div className={`glass rounded-2xl overflow-hidden flex flex-col ${className}`}>
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-ax">
        <span className="eyebrow">{title}</span>
        {action && (
          <button onClick={action} className="text-ax-muted hover:text-ax-accent transition" aria-label={`Open ${title}`}>
            <ArrowUpRight size={13} />
          </button>
        )}
      </div>
      <div className="p-2 flex-1 min-h-0">{children}</div>
    </div>
  );
}
