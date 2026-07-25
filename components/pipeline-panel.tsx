"use client";

import { useAppState } from "@/components/app-state";
import { STAGES, STAGE_LABELS } from "@/lib/pipeline";
import { Bookmark, CheckSquare, Square } from "lucide-react";

/**
 * Pursuit controls for one opportunity: stage, checklist, and notes.
 * Tracking rides on bookmarks — an untracked opportunity shows a single
 * "track" call-to-action instead of empty controls.
 */
export function PipelinePanel({ oppId }: { oppId: string }) {
  const { bookmarks, toggleBookmark, entryFor, setStage, toggleTask, notes, setNote } = useAppState();
  const tracked = bookmarks.has(oppId);
  const entry = entryFor(oppId);
  const done = entry.tasks.filter((t) => t.done).length;

  if (!tracked) {
    return (
      <div className="glass rounded-2xl p-5 mb-3 flex items-center justify-between gap-4">
        <div className="prose-body text-xs text-ax-dim">
          Track this opportunity to manage its pursuit — stage, checklist, and notes.
        </div>
        <button onClick={() => toggleBookmark(oppId)}
          className="flex items-center gap-2 shrink-0 text-xs font-semibold rounded-xl px-4 py-2.5 transition bg-ax-accent-bg border border-ax-accent-border text-ax-accent hover:brightness-125">
          <Bookmark size={13} /> Track in pipeline
        </button>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-5 mb-3">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="eyebrow">Pursuit Pipeline</div>
        <div className="text-[10px] font-mono text-ax-muted tabular">{done}/{entry.tasks.length} tasks</div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {STAGES.map((s) => (
          <button key={s} onClick={() => setStage(oppId, s)}
            className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border transition ${
              entry.stage === s
                ? "bg-ax-accent-bg border-ax-accent-border text-ax-accent"
                : "glass glass-hover border-ax text-ax-dim"
            }`}>
            {STAGE_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="space-y-1.5 mb-4">
        {entry.tasks.map((t) => (
          <button key={t.id} onClick={() => toggleTask(oppId, t.id)}
            className="flex items-center gap-2.5 w-full text-left group">
            {t.done
              ? <CheckSquare size={14} className="text-ax-accent shrink-0" />
              : <Square size={14} className="text-ax-muted group-hover:text-ax-dim shrink-0" />}
            <span className={`prose-body text-xs leading-relaxed ${t.done ? "text-ax-muted line-through" : "text-ax-dim"}`}>
              {t.label}
            </span>
          </button>
        ))}
      </div>

      <div className="eyebrow mb-1.5">Notes</div>
      <textarea
        value={notes[oppId] ?? ""}
        onChange={(e) => setNote(oppId, e.target.value)}
        placeholder="Contact history, teaming ideas, positioning…"
        rows={3}
        className="prose-body w-full rounded-xl px-3 py-2 text-xs text-ax-text placeholder-ax-muted bg-ax-glass border border-ax focus:outline-none focus:border-ax-accent-border transition resize-y"
      />
    </div>
  );
}
