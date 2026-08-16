"use client";

import { useEffect, useState } from "react";

/**
 * State that survives a reload.
 *
 * Reads on mount rather than during the initial render: reading localStorage
 * while rendering makes the server and client disagree and React throws the
 * hydrated tree away. The first paint always shows `initial`, then the stored
 * value arrives a tick later — invisible to the visitor, and correct.
 */
export function useSticky<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(`devopoly:${key}`);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      // Private mode, quota, or corrupt JSON — the default is fine.
    }
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!loaded) return; // don't write the default over a stored value
    try {
      window.localStorage.setItem(`devopoly:${key}`, JSON.stringify(value));
    } catch {
      // Ignore: persistence is a convenience, never a requirement.
    }
  }, [key, value, loaded]);

  return [value, setValue] as const;
}

export default useSticky;
