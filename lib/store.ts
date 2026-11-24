import { useCallback, useMemo, useSyncExternalStore } from "react";
import { defaults, type Briefing, type Entry, type Settings } from "./briefing";

export type Interest = { id: string; name: string };

// Everything a person sets up lives in this browser: there are no accounts.
const PREFIX = "nexttime:";
const listeners = new Set<() => void>();

function subscribe(fn: () => void) {
  listeners.add(fn);
  window.addEventListener("storage", fn);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", fn);
  };
}

function raw(key: string) {
  try {
    return localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export function load<T>(key: string, fallback: T): T {
  const text = raw(key);
  if (text == null) return fallback;
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

export function write(key: string, value: unknown) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    return false;
  }
  listeners.forEach((fn) => fn());
  return true;
}

function useStored<T>(key: string, fallback: T) {
  const text = useSyncExternalStore(subscribe, () => raw(key), () => null);
  const value = useMemo(() => {
    if (text == null) return fallback;
    try {
      return JSON.parse(text) as T;
    } catch {
      return fallback;
    }
  }, [text, fallback]);
  const set = useCallback((next: T) => write(key, next), [key]);
  return [value, set] as const;
}

const none: never[] = [];

export const useInterests = () => useStored<Interest[]>("interests", none);
export const useBriefings = () => useStored<Briefing[]>("briefings", none);
export const useSaved = () => useStored<Entry[]>("saved", none);
export const useRead = () => useStored<number[]>("read", none);

export function useSettings() {
  const [stored, set] = useStored<Partial<Settings>>("settings", defaults);
  const settings = useMemo<Settings>(() => ({ ...defaults, ...stored }), [stored]);
  return [settings, set] as const;
}

// Keeps as many past briefings as the browser has room for.
export function keepBriefings(list: Briefing[]) {
  for (const n of [40, 15, 5, 1]) if (write("briefings", list.slice(0, n))) return;
}

const nothing = () => () => {};
export const useClient = () => useSyncExternalStore(nothing, () => true, () => false);
