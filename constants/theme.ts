/**
 * The single source of truth for every color in the app, defined for both light
 * and dark mode.
 *
 * @remarks
 * Tokens are semantic (named by role, not by hue) so components reference intent
 * — `colors.overlay`, `colors.onAccent` — and both themes stay in sync. Any color
 * used in the app should resolve to one of these; the only deliberate exceptions
 * are shadow black (a universal, non-themed convention) and the contrast palette
 * in `utils/contrast.ts` (computed for legibility over album artwork, not tied to
 * the app theme).
 */
export interface ThemeColors {
  /** Screen background. */
  background: string;
  /** Raised surfaces (cards, inputs, sheets) above the background. */
  surface: string;
  /** Primary text and icons. */
  primary: string;
  /** Muted secondary text and icons. */
  secondary: string;
  /** Brand accent for emphasis and primary actions. */
  accent: string;
  /** Foreground (text/icons) placed on an `accent` surface. */
  onAccent: string;
  /** Error / destructive state. */
  error: string;
  /** Success / confirmation state. */
  success: string;
  /** Background of disabled controls. */
  disabled: string;
  /** Translucent scrim rendered behind modals, sheets, and popups. */
  overlay: string;
  /**
   * A surface that intentionally contrasts with the active theme — dark in light
   * mode, light in dark mode.
   *
   */
  inverseSurface: string;
  /** Foreground (text/icons) placed on `inverseSurface`. */
  onInverse: string;
}

export type ThemeName = 'light' | 'dark';

const Light: ThemeColors = {
  background: "#FBF7F4",
  surface: "#FFFFFF",
  primary: '#1F1A1C',
  secondary: '#6E6266',
  accent: "#AE0558",
  onAccent: "#FFFFFF",
  error: "#D92D20",
  success: "#16A34A",
  disabled: "#C7C0BC",
  overlay: "rgba(0, 0, 0, 0.5)",
  inverseSurface: "#2E2629",
  onInverse: "#F7F0ED",
};

const Dark: ThemeColors = {
  background: "#1A1416",
  surface: "#241C1F",
  primary: '#F5EDEA',
  secondary: '#A89BA0',
  accent: "#E94B8A",
  onAccent: "#FFFFFF",
  error: "#F97066",
  success: "#4ADE80",
  disabled: "#4A4145",
  overlay: "rgba(0, 0, 0, 0.5)",
  inverseSurface: "#F1EAE7",
  onInverse: "#241C1F",
};

export const Themes: Record<ThemeName, ThemeColors> = {
  light: Light,
  dark: Dark,
};
