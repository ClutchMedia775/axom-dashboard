"use client";

import { useAppState, type ScoredOpportunity } from "@/components/app-state";
import { provider } from "@/lib/providers";
import { scoreItem } from "@/lib/scoring";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export function useOpportunities() {
  return useQuery({ queryKey: ["opportunities"], queryFn: () => provider.getOpportunities() });
}

export function useProgramManagers() {
  return useQuery({ queryKey: ["program-managers"], queryFn: () => provider.getProgramManagers() });
}

export function usePapers() {
  return useQuery({ queryKey: ["papers"], queryFn: () => provider.getPapers() });
}

export function useConferences() {
  return useQuery({ queryKey: ["conferences"], queryFn: () => provider.getConferences() });
}

export function useNews() {
  return useQuery({ queryKey: ["news"], queryFn: () => provider.getNews() });
}

export function useVenture() {
  return useQuery({ queryKey: ["venture"], queryFn: () => provider.getVenture() });
}

export function useNationalLabs() {
  return useQuery({ queryKey: ["national-labs"], queryFn: () => provider.getNationalLabs() });
}

export function useBiotechOrgs() {
  return useQuery({ queryKey: ["biotech-orgs"], queryFn: () => provider.getBiotechOrgs() });
}

/** Opportunities scored with the live weights, sorted by score descending. */
export function useScoredOpportunities(): ScoredOpportunity[] {
  const { data: opps } = useOpportunities();
  const { weights } = useAppState();
  return useMemo(
    () =>
      (opps ?? [])
        .map((o) => ({ ...o, _s: scoreItem(o.keywords, weights) }))
        .sort((a, b) => b._s.score - a._s.score),
    [opps, weights],
  );
}

/** Scored opportunities filtered by the header search and agency filter. */
export function useFilteredOpportunities(): ScoredOpportunity[] {
  const scored = useScoredOpportunities();
  const { search, agencyFilter } = useAppState();
  return useMemo(
    () =>
      scored.filter((o) => {
        const q = search.toLowerCase();
        const matchQ = !q || [o.program, o.agency, o.summary, o.techArea, ...o.keywords].join(" ").toLowerCase().includes(q);
        const matchA = agencyFilter === "All" || o.agency === agencyFilter;
        return matchQ && matchA;
      }),
    [scored, search, agencyFilter],
  );
}
