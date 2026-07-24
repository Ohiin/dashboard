import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A useState-like hook backed by localStorage. Persists on every change
 * (auto-save), and reads the initial value synchronously so widgets never
 * flash empty on mount.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const keyRef = useRef(key);
  keyRef.current = key;

  useEffect(() => {
    try {
      window.localStorage.setItem(keyRef.current, JSON.stringify(value));
    } catch {
      // storage full or unavailable — fail silently, UI still works in-memory
    }
  }, [value]);

  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(keyRef.current);
    } catch {
      /* noop */
    }
  }, []);

  return [value, setValue, remove] as const;
}

export function removeLocalStorageKeysWithPrefix(prefix: string) {
  const toRemove: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k && k.startsWith(prefix)) toRemove.push(k);
  }
  toRemove.forEach((k) => window.localStorage.removeItem(k));
}
