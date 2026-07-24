"use client";

import { useAppState } from "@/components/app-state";
import { Loader2, Send, Sparkles, X } from "lucide-react";
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
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

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
    if (!content || busy) return;
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
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { reply: string } = await res.json();
      setMsgs((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: "Request failed — try again." }]);
    }
    setBusy(false);
  }

  if (!open) return null;
  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-slate-950 border-l border-slate-800 z-50 flex flex-col shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-emerald-400" />
          <span className="text-sm font-semibold text-slate-200">Axom Assistant</span>
          {context && <span className="text-[10px] font-mono text-slate-500 truncate max-w-[140px]">ctx: {context.program}</span>}
        </div>
        <button onClick={() => setAssistantOpen(false)} className="text-slate-500 hover:text-slate-200"><X size={16} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {msgs.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-slate-500">Ask about solicitations, fit, requirements, or strategy.</p>
            {QUICK.map((q) => (
              <button key={q} onClick={() => send(q)}
                className="block w-full text-left text-xs text-slate-300 bg-slate-900 border border-slate-800 rounded px-3 py-2 hover:border-emerald-500/50 transition">
                {q}
              </button>
            ))}
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`text-sm leading-relaxed whitespace-pre-wrap rounded-lg px-3 py-2 ${
            m.role === "user" ? "bg-blue-500/10 border border-blue-500/20 text-blue-100 ml-6" : "bg-slate-900 border border-slate-800 text-slate-300 mr-2"}`}>
            {m.content}
          </div>
        ))}
        {busy && <div className="flex items-center gap-2 text-slate-500 text-xs"><Loader2 size={13} className="animate-spin" /> Thinking…</div>}
        <div ref={endRef} />
      </div>
      <div className="p-3 border-t border-slate-800 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask the assistant…" className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50" />
        <button onClick={() => send()} disabled={busy} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded px-3 transition">
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
