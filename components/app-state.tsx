"use client";

import { DEFAULT_WEIGHTS, type ScoringWeight } from "@/lib/scoring";
import type { Opportunity } from "@/lib/types";
import type { ScoreResult } from "@/lib/scoring";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type ScoredOpportunity = Opportunity & { _s: ScoreResult };

interface AppState {
  search: string;
  setSearch: (v: string) => void;
  agencyFilter: string;
  setAgencyFilter: (v: string) => void;
  bookmarks: Set<string>;
  toggleBookmark: (id: string) => void;
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
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => new Set(["arpah-adapt-3"]));
  const [weights, setWeights] = useState<ScoringWeight[]>(DEFAULT_WEIGHTS);
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
  }, []);

  const resetWeights = useCallback(() => setWeights(DEFAULT_WEIGHTS), []);

  const value = useMemo<AppState>(
    () => ({
      search, setSearch,
      agencyFilter, setAgencyFilter,
      bookmarks, toggleBookmark,
      weights, setWeights, resetWeights,
      scoreModal, setScoreModal,
      assistantOpen, setAssistantOpen,
      assistantContext, setAssistantContext,
    }),
    [search, agencyFilter, bookmarks, toggleBookmark, weights, resetWeights, scoreModal, assistantOpen, assistantContext],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
