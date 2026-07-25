"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

/**
 * useState persisted to localStorage, hydration-safe: the first render always
 * uses `initial` (so server and client markup agree), then the stored value
 * loads in an effect after mount. Writes are skipped until that load has
 * happened, so a mount can never clobber storage with the default value.
 *
 * `codec` maps between the in-memory shape and the JSON-serializable one —
 * needed for Sets, and for values whose stored form should survive schema
 * drift (weights are re-merged against the current taxonomy on load).
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
  codec?: { pack: (v: T) => unknown; unpack: (raw: unknown) => T },
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initial);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw);
        setValue(codec ? codec.unpack(parsed) : (parsed as T));
      }
    } catch {
      // Corrupted or inaccessible entry — keep the default.
    }
    loaded.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(codec ? codec.pack(value) : value));
    } catch {
      // Storage full or unavailable — the app still works, just unpersisted.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, value]);

  return [value, setValue];
}
