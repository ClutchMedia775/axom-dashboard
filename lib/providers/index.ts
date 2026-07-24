import { liveProvider } from "./live";
import { mockProvider } from "./mock";
import type { DataProvider } from "./types";

export type { DataProvider } from "./types";

/**
 * The active data provider. Set NEXT_PUBLIC_DATA_PROVIDER=live in .env.local
 * to pull real opportunities from Grants.gov/SAM.gov; anything else (or
 * unset) uses the bundled mock data.
 */
export const provider: DataProvider =
  process.env.NEXT_PUBLIC_DATA_PROVIDER === "live" ? liveProvider : mockProvider;

export const isLiveProvider = provider !== mockProvider;
