"use client";

import { useProgramManagers } from "@/lib/hooks";
import { useRouter } from "next/navigation";

export default function ProgramManagersPage() {
  const router = useRouter();
  const { data: pms } = useProgramManagers();

  return (
    <div className="grid sm:grid-cols-2 gap-3 max-w-4xl">
      {(pms ?? []).map((p) => (
        <button key={p.id} onClick={() => router.push(`/program-managers/${p.id}`)}
          className="glass glass-hover text-left rounded-2xl p-4">
          <div className="text-sm text-ax-text font-semibold">{p.name}</div>
          <div className="text-[11px] font-mono text-ax-info mt-0.5">{p.agency} · {p.office}</div>
          <div className="prose-body text-xs text-ax-dim mt-2 line-clamp-2 leading-relaxed">{p.bio}</div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {p.interests.slice(0, 3).map((i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-lg bg-ax-glass-hi border border-ax text-ax-dim">{i}</span>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}
