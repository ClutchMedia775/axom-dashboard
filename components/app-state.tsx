"use client";

import { usePersistentState } from "@/lib/persist";
import { DEFAULT_WEIGHTS, type ScoringWeight } from "@/lib/scoring";
import type { Opportunity } from "@/lib/types";
import type { ScoreResult } from "@/lib/scoring";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type ScoredOpportunity = Opportunity & { _s: ScoreResult };

/* Codecs for persisted state. Weights store only {key, weight} and re-merge
   against the current DEFAULT_WEIGHTS on load, so a taxonomy change in code
   never resurrects stale labels/aliases from someone's browser storage. */
const bookmarksCodec = {
  pack: (s: Set<string>) => [...s],
  unpack: (raw: unknown): Set<string> =>
    new Set(Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : []),
};

const weightsCodec = {
  pack: (ws: ScoringWeight[]) => ws.map(({ key, weight }) => ({ key, weight })),
  unpack: (raw: unknown): ScoringWeight[] => {
    const saved = Array.isArray(raw) ? (raw as { key?: string; weight?: number }[]) : [];
    return DEFAULT_WEIGHTS.map((w) => {
      const s = saved.find((r) => r?.key === w.key);
      return s && typeof s.weight === "number" ? { ...w, weight: s.weight } : w;
    });
  },
};

interface AppState {
  search: string;
  setSearch: (v: string) => void;
  agencyFilter: string;
  setAgencyFilter: (v: string) => void;
  bookmarks: Set<string>;
  toggleBookmark: (id: string) => void;
  /** Free-text notes keyed by record id (opportunity or program manager). */
  notes: Record<string, string>;
  setNote: (id: string, text: string) => void;
  weights: ScoringWeight[];
  setWeights: React.Dispatch<React.SetStateAction<ScoringWeight[]>>;
  resetWeights: () => void;
  scoreModal: ScoredOpportunity | null;
  setScoreModal: (o: ScoredOpportunity | null) => void;
  assistantOpen: boolean;
  setAssistantOpen: (open: boolean) => void;
  assistantContext: ScoredOpportunity | null;
  setAssistantContext: (o: ScoredOpportunity | null) => void;
}

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState("");
  const [agencyFilter, setAgencyFilter] = useState("All");
  const [bookmarks, setBookmarks] = usePersistentState<Set<string>>("axom.bookmarks", new Set(), bookmarksCodec);
  const [notes, setNotes] = usePersistentState<Record<string, string>>("axom.notes", {});
  const [weights, setWeights] = usePersistentState<ScoringWeight[]>("axom.weights", DEFAULT_WEIGHTS, weightsCodec);
  const [scoreModal, setScoreModal] = useState<ScoredOpportunity | null>(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantContext, setAssistantContext] = useState<ScoredOpportunity | null>(null);

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks((b) => {
      const n = new Set(b);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });
  }, [setBookmarks]);

  const resetWeights = useCallback(() => setWeights(DEFAULT_WEIGHTS), [setWeights]);

  const setNote = useCallback((id: string, text: string) => {
    setNotes((n) => {
      if (!text.trim()) {
        const rest = { ...n };
        delete rest[id];
        return rest;
      }
      return { ...n, [id]: text };
    });
  }, [setNotes]);

  const value = useMemo<AppState>(
    () => ({
      search, setSearch,
      agencyFilter, setAgencyFilter,
      bookmarks, toggleBookmark,
      notes, setNote,
      weights, setWeights, resetWeights,
      scoreModal, setScoreModal,
      assistantOpen, setAssistantOpen,
      assistantContext, setAssistantContext,
    }),
    [search, agencyFilter, bookmarks, toggleBookmark, notes, setNote, weights, setWeights, resetWeights, scoreModal, assistantOpen, assistantContext],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
