/**
 * Duration (ms) for the player's color crossfades — background tint, foreground
 * text, and icon color. Centralized so every element re-tints in lockstep as the
 * track (and its cover color) changes.
 */
export const COLOR_TRANSITION_DURATION = 300;

/**
 * Space (px) between neighboring slots of a player carousel strip, so tracks read
 * as separate cards rather than one continuous sheet as they slide past.
 *
 * @remarks
 * Shared because a strip's layout and its positioning maths have to agree: this is
 * both the flexbox `gap` between blocks and part of the pitch each block is offset
 * by (see `useCarouselStrip`). Changing it in only one place would drift the strip
 * off its grid. It lives here rather than beside that hook so the carousels can
 * read it without pulling the audio engine in behind it.
 */
export const CAROUSEL_GAP = 16;
