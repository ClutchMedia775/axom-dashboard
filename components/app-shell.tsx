"use client";

import { Ambient } from "@/components/ambient";
import { useAppState } from "@/components/app-state";
import { Assistant } from "@/components/assistant";
import { ScoreModal } from "@/components/score-modal";
import { ThemeToggle } from "@/components/theme-toggle";
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
    <>
      <Ambient />
      <div className="min-h-screen flex text-ax-text">
        {/* Sidebar */}
        <aside className="w-52 shrink-0 hidden md:flex flex-col glass border-y-0 border-l-0 rounded-none">
          <div className="px-4 py-4 border-b border-ax">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-ax-accent-bg border border-ax-accent-border">
                <Target size={14} className="text-ax-accent" />
              </div>
              <div>
                <div className="text-sm font-bold text-ax-text tracking-wide">AXOM</div>
                <div className="text-[9px] uppercase tracking-[0.18em] text-ax-dim">Federal Intelligence</div>
              </div>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto py-2">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = pathname === n.href || pathname.startsWith(`${n.href}/`);
              return (
                <Link key={n.href} href={n.href}
                  className={`w-full flex items-center gap-2.5 px-4 py-[7px] text-xs transition relative ${
                    active
                      ? "text-ax-accent bg-ax-accent-bg font-semibold"
                      : "text-ax-dim hover:text-ax-text hover:bg-ax-glass-hi"
                  }`}>
                  {active && <span className="absolute left-0 inset-y-0 w-[2px] bg-ax-accent" />}
                  <Icon size={14} /> {n.label}
                  {n.href === "/bookmarks" && bookmarks.size > 0 && (
                    <span className="ml-auto text-[9px] font-mono text-ax-accent tabular">{bookmarks.size}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="h-14 shrink-0 flex items-center gap-3 px-4 sticky top-0 z-40 glass border-x-0 border-t-0 rounded-none">
            <div className="flex-1 max-w-xl relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ax-muted" />
              <input value={search}
                onChange={(e) => { setSearch(e.target.value); if (pathname !== "/funding") router.push("/funding"); }}
                placeholder="Search programs, agencies, keywords…"
                className="w-full rounded-lg pl-8 pr-3 py-2 text-xs text-ax-text placeholder-ax-muted bg-ax-glass border border-ax focus:outline-none focus:border-ax-accent-border transition" />
            </div>

            <ThemeToggle />

            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)}
                className="glass glass-hover relative rounded-lg p-2 text-ax-dim hover:text-ax-text transition"
                aria-label="Notifications">
                <Bell size={14} />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-ax-accent" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-11 w-72 glass rounded-xl shadow-2xl p-2 z-50">
                  {[
                    "AFWERX 26.2 closes in 20 days — abstract not started",
                    "ARPA-H ADAPT proposers day registered (Aug 6)",
                    "New DOE FOA matched 6 tracked keywords",
                  ].map((t, i) => (
                    <div key={i} className="prose-body text-[11px] text-ax-dim px-2 py-2 rounded-lg hover:bg-ax-glass-hi hover:text-ax-text transition border-b border-ax last:border-0">{t}</div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => setAssistantOpen(true)}
              className="glass glass-hover flex items-center gap-1.5 text-[11px] font-medium text-ax-dim hover:text-ax-text rounded-lg px-2.5 py-1.5 transition">
              <Sparkles size={12} className="text-ax-accent" /> <span className="hidden sm:inline">Assistant</span>
            </button>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-4">
            {/* Sample data is indistinguishable from real data at a glance, so
                say so loudly rather than in small grey type. Missing the
                NEXT_PUBLIC_DATA_PROVIDER=live setting is the easy mistake. */}
            {!isLiveProvider && (
              <div className="mb-4 rounded-xl px-4 py-3 border border-ax-danger/40 bg-ax-danger/10">
                <div className="text-xs font-bold text-ax-danger">
                  Showing sample data — not real federal data
                </div>
                <div className="prose-body text-[11px] text-ax-dim mt-1 leading-relaxed">
                  Every record on screen is placeholder content. Set{" "}
                  <span className="font-mono">NEXT_PUBLIC_DATA_PROVIDER=live</span> and redeploy to
                  pull live Grants.gov, SAM.gov, arXiv, SEC EDGAR, and agency data.
                </div>
              </div>
            )}
            <div className="mb-4 flex items-baseline gap-3 flex-wrap">
              <h1 className="text-base font-bold text-ax-text uppercase tracking-[0.12em]">
                {pageTitle(pathname)}
              </h1>
              <span className="text-[10px] font-mono text-ax-muted tabular">
                {today} · {isLiveProvider ? "live data" : "mock data"} · {provider.name}
              </span>
            </div>
            {children}
          </main>
        </div>

        <ScoreModal />
        <Assistant />
      </div>
    </>
  );
}
