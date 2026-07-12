import { useEffect, useState } from "react";

/**
 * Returns a copy of `value` that only updates after it has stayed unchanged for
 * `delayMs` — used to throttle rapidly-changing input (e.g. a search box) before
 * it drives an expensive effect like a network query.
 *
 * @remarks
 * Each change restarts the timer, so intermediate values are discarded and only
 * the latest settles through. The cleanup clears the pending timer on every
 * change and on unmount, preventing a stale value from landing after the input
 * has moved on.
 *
 * @typeParam T - Type of the debounced value.
 * @param value - The live value to track.
 * @param delayMs - Quiet period, in milliseconds, before `value` is published.
 * @returns The most recent value that has been stable for `delayMs`.
 */
export const useDebouncedValue = <T>(value: T, delayMs: number): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
};
