"use client";

import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

export function Widget({ title, action, children, wide }: {
  title: string;
  action?: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden flex flex-col ${wide ? "col-span-2" : ""}`}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80">
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">{title}</span>
        {action && (
          <button onClick={action} className="text-slate-500 hover:text-emerald-400 transition">
            <ArrowUpRight size={13} />
          </button>
        )}
      </div>
      <div className="p-2 flex-1 min-h-0">{children}</div>
    </div>
  );
}
