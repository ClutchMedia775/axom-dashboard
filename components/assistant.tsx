"use client";

import { useAppState } from "@/components/app-state";
import { Loader2, Lock, Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const QUICK = ["Summarize this solicitation", "Generate a proposal outline", "Explain Axom's technical fit", "What are the key requirements?"];

export function Assistant() {
  const { assistantOpen: open, setAssistantOpen, assistantContext } = useAppState();
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [locked, setLocked] = useState(false);
  const [pw, setPw] = useState("");
  const [authErr, setAuthErr] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  // Ask up front whether this deployment is gated, so the prompt appears
  // before the user types rather than after a rejected message.
  useEffect(() => {
    if (!open) return;
    fetch("/api/auth")
      .then((r) => r.json())
      .then((d: { required?: boolean; authenticated?: boolean }) =>
        setLocked(Boolean(d.required) && !d.authenticated))
      .catch(() => {});
  }, [open]);

  async function unlock() {
    if (!pw || unlocking) return;
    setUnlocking(true);
    setAuthErr(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const data: { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setPw("");
      setLocked(false);
    } catch (e) {
      setAuthErr(e instanceof Error ? e.message : "Unlock failed.");
    }
    setUnlocking(false);
  }

  const context = assistantContext
    ? {
        program: assistantContext.program,
        agency: assistantContext.agency,
        summary: assistantContext.summary,
        deadline: assistantContext.deadline,
        awardSize: assistantContext.awardSize,
        requirements: assistantContext.requirements,
        keywords: assistantContext.keywords,
        score: assistantContext._s.score,
      }
    : null;

  async function send(text?: string) {
    const content = text || input.trim();
    if (!content || busy || locked) return;
    const history = [...msgs, { role: "user" as const, content }];
    setMsgs(history);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, context }),
      });
      const data: { reply?: string; error?: string } = await res.json();
      // Session expired or never established — surface the unlock prompt.
      if (res.status === 401) {
        setLocked(true);
        setBusy(false);
        return;
      }
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setMsgs((m) => [...m, { role: "assistant", content: data.reply ?? "No response." }]);
    } catch (e) {
      setMsgs((m) => [...m, { role: "assistant", content: e instanceof Error ? e.message : "Request failed — try again." }]);
    }
    setBusy(false);
  }

  if (!open) return null;
  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] z-50 flex flex-col shadow-2xl glass border-y-0 border-r-0 rounded-none">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-ax">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles size={15} className="text-ax-accent shrink-0" />
          <span className="text-sm font-bold text-ax-text tracking-wide">Axom Assistant</span>
          {context && <span className="text-[10px] font-mono text-ax-muted truncate">ctx: {context.program}</span>}
        </div>
        <button onClick={() => setAssistantOpen(false)} className="text-ax-muted hover:text-ax-text transition" aria-label="Close assistant">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {msgs.length === 0 && (
          <div className="space-y-2">
            <p className="prose-body text-xs text-ax-muted">Ask about solicitations, fit, requirements, or strategy.</p>
            {QUICK.map((q) => (
              <button key={q} onClick={() => send(q)} disabled={locked}
                className="glass glass-hover block w-full text-left text-xs text-ax-dim hover:text-ax-text rounded-xl px-3 py-2.5 transition disabled:opacity-40 disabled:cursor-not-allowed">
                {q}
              </button>
            ))}
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`prose-body text-sm leading-relaxed whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 ${
            m.role === "user"
              ? "bg-ax-accent-bg border border-ax-accent-border text-ax-text ml-6"
              : "glass text-ax-dim mr-2"}`}>
            {m.content}
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-ax-muted text-xs">
            <Loader2 size={13} className="animate-spin" /> Thinking…
          </div>
        )}
        <div ref={endRef} />
      </div>

      {locked ? (
        <div className="p-3 border-t border-ax space-y-2">
          <div className="flex items-center gap-2 text-[11px] text-ax-muted">
            <Lock size={12} className="shrink-0" />
            <span>Unlock to use the assistant.</span>
          </div>
          <div className="flex gap-2">
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && unlock()}
              placeholder="Access password"
              aria-label="Access password"
              className="prose-body flex-1 rounded-xl px-3 py-2 text-sm text-ax-text placeholder-ax-muted bg-ax-glass border border-ax focus:outline-none focus:border-ax-accent-border transition" />
            <button onClick={unlock} disabled={unlocking || !pw} aria-label="Unlock"
              className="rounded-xl px-3.5 transition bg-ax-accent-bg border border-ax-accent-border text-ax-accent hover:brightness-125 disabled:opacity-40">
              {unlocking ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
            </button>
          </div>
          {authErr && <div className="text-[11px] text-ax-danger">{authErr}</div>}
        </div>
      ) : (
        <div className="p-3 border-t border-ax flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask the assistant…"
            className="prose-body flex-1 rounded-xl px-3 py-2 text-sm text-ax-text placeholder-ax-muted bg-ax-glass border border-ax focus:outline-none focus:border-ax-accent-border transition" />
          <button onClick={() => send()} disabled={busy} aria-label="Send"
            className="rounded-xl px-3.5 transition bg-ax-accent-bg border border-ax-accent-border text-ax-accent hover:brightness-125 disabled:opacity-40">
            <Send size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
