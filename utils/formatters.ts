/**
 * Formats a duration in seconds as `m:ss` for the player's time labels.
 *
 * @remarks
 * Guards non-finite/negative input (e.g. `NaN` before a track's duration is
 * known) to `"0:00"` so the UI never shows `NaN:NaN`.
 */
export const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

/**
 * Formats an ISO date string as e.g. `05 Jun 2024` for release dates. Returns an
 * empty string when the date is missing.
 */
export const formatDate = (date: string | undefined): string => {
  if (!date) {
    return "";
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return formatter.format(new Date(date));
};