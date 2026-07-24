"use client";

import { useProgramManagers } from "@/lib/hooks";
import { useRouter } from "next/navigation";

export default function ProgramManagersPage() {
  const router = useRouter();
  const { data: pms } = useProgramManagers();

  return (
    <div className="grid sm:grid-cols-2 gap-3 max-w-4xl">
      {(pms ?? []).map((p) => (
        <button key={p.id} onClick={() => router.push(`/program-managers/${p.id}`)} className="text-left border border-slate-800 rounded-lg p-4 hover:border-blue-500/40 bg-slate-900/40 transition">
          <div className="text-sm text-slate-200 font-medium">{p.name}</div>
          <div className="text-[11px] font-mono text-blue-300 mt-0.5">{p.agency} · {p.office}</div>
          <div className="text-xs text-slate-400 mt-2 line-clamp-2">{p.bio}</div>
          <div className="flex flex-wrap gap-1 mt-2">
            {p.interests.slice(0, 3).map((i) => <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{i}</span>)}
          </div>
        </button>
      ))}
    </div>
  );
}
