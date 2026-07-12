/**
 * Shared React Query stale windows.
 *
 * @remarks
 * `SHORT` (5 min) is for data that changes with user actions and should refresh
 * soon after focus — list feeds, search, interactions. `LONG` (10 min) is for
 * near-immutable detail/asset data (a specific album, cover URLs), which is
 * instead kept fresh by explicit invalidation from the relevant mutations.
 * Centralized so these two policies stay consistent across every query.
 */
export const STALE_TIME = {
  SHORT: 5 * 60 * 1000,
  LONG: 10 * 60 * 1000,
} as const;

/** How long unused query data lingers in cache (10 min) before garbage collection. */
export const GC_TIME = 10 * 60 * 1000;
