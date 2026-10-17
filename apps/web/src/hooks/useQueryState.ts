import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

type Updates = Record<string, string | number | null | undefined>;

/**
 * Filters live in the URL so views are shareable and survive reloads.
 * Filter changes replace the history entry; page navigation still pushes.
 *
 * React Router applies URL updates inside a transition, so controlled inputs
 * bound straight to the URL would briefly revert (checkboxes) or drop rapid
 * keystrokes. An optimistic copy is read until the URL catches up; any other
 * URL change (back/forward, links) discards it.
 */
export function useQueryState() {
  const [params, setParams] = useSearchParams();
  const base = params.toString();
  const [optimistic, setOptimistic] = useState<{ base: string; next: URLSearchParams } | null>(null);
  const current = optimistic && optimistic.base === base ? optimistic.next : params;

  const get = useCallback((key: string, fallback = '') => current.get(key) ?? fallback, [current]);
  const set = useCallback((updates: Updates) => {
    const next = new URLSearchParams(current);
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === undefined || value === '') next.delete(key);
      else next.set(key, String(value));
    }
    setOptimistic({ base, next });
    setParams(next, { replace: true });
  }, [base, current, setParams]);
  const reset = useCallback((keys: string[]) => set(Object.fromEntries(keys.map((key) => [key, null]))), [set]);
  const countActive = (keys: string[]) => keys.filter((key) => current.get(key)).length;
  return { get, set, reset, countActive };
}

export function usePageTitle(title: string) {
  useEffect(() => { document.title = `${title} · ReservationWatch (synthetic demo)`; }, [title]);
}
