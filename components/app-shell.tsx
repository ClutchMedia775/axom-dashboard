"use client";

import { useAppState } from "@/components/app-state";
import { Assistant } from "@/components/assistant";
import { ScoreModal } from "@/components/score-modal";
import { NAV } from "@/lib/constants";
import { isLiveProvider, provider } from "@/lib/providers";
import { Bell, Search, Sparkles, Target } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

function pageTitle(pathname: string): string {
  const item = NAV.find((n) => pathname === n.href || pathname.startsWith(`${n.href}/`));
  return item?.label ?? "";
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { search, setSearch, bookmarks, setAssistantOpen } = useAppState();
  const [notifOpen, setNotifOpen] = useState(false);
  const [today, setToday] = useState("");
  useEffect(() => { setToday(new Date().toDateString()); }, []);

  return (
    <div className="min-h-screen bg-black text-slate-300 flex font-sans" style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-52 shrink-0 border-r border-slate-800/80 bg-slate-950 hidden md:flex flex-col">
        <div className="px-4 py-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Target size={13} className="text-emerald-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100 tracking-tight">AXOM</div>
              <div className="text-[9px] uppercase tracking-widest text-slate-500">Federal Intelligence</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = pathname === n.href || pathname.startsWith(`${n.href}/`);
            return (
              <Link key={n.href} href={n.href}
                className={`w-full flex items-center gap-2.5 px-4 py-1.5 text-xs transition ${active ? "text-emerald-300 bg-emerald-500/5 border-r-2 border-emerald-500" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"}`}>
                <Icon size={14} /> {n.label}
                {n.href === "/bookmarks" && bookmarks.size > 0 && <span className="ml-auto text-[9px] font-mono text-emerald-400">{bookmarks.size}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-12 shrink-0 border-b border-slate-800/80 bg-slate-950/90 flex items-center gap-3 px-4 sticky top-0 z-40">
          <div className="flex-1 max-w-xl relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
            <input value={search}
              onChange={(e) => { setSearch(e.target.value); if (pathname !== "/funding") router.push("/funding"); }}
              placeholder="Search programs, agencies, keywords…"
              className="w-full bg-slate-900 border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50" />
          </div>
          <div className="relative">
            <button onClick={() => setNotifOpen(!notifOpen)} className="relative text-slate-500 hover:text-slate-300 transition">
              <Bell size={15} />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-8 w-72 bg-slate-950 border border-slate-800 rounded-lg shadow-2xl p-2 z-50">
                {[
                  "AFWERX 26.2 closes in 20 days — abstract not started",
                  "ARPA-H ADAPT proposers day registered (Aug 6)",
                  "New DOE FOA matched 6 tracked keywords",
                ].map((t, i) => (
                  <div key={i} className="text-[11px] text-slate-300 px-2 py-2 rounded hover:bg-slate-900 border-b border-slate-800/50 last:border-0">{t}</div>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setAssistantOpen(true)}
            className="flex items-center gap-1.5 text-xs bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-slate-300 rounded px-2.5 py-1.5 transition">
            <Sparkles size={12} className="text-emerald-400" /> Assistant
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4">
          <div className="mb-4 flex items-baseline gap-3">
            <h1 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              {pageTitle(pathname)}
            </h1>
            <span className="text-[10px] font-mono text-slate-600">{today} · {isLiveProvider ? "live data" : "mock data"} · provider: {provider.name}</span>
          </div>
          {children}
        </main>
      </div>

      <ScoreModal />
      <Assistant />
    </div>
  );
}
