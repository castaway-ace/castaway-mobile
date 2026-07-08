/**
 * Colors used across the app, defined for both light and dark mode.
 */

export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  error: string;
  success: string;
}

export type ThemeName = 'light' | 'dark';

const Light: ThemeColors = {
  background: "#FBF7F4",
  surface: "#FFFFFF",
  primary: '#1F1A1C',
  secondary: '#6E6266',
  accent: "#AE0558",
  error: "#D92D20",
  success: "#16A34A",
};

const Dark: ThemeColors = {
  background: "#1A1416",
  surface: "#241C1F",
  primary: '#F5EDEA',
  secondary: '#A89BA0',
  accent: "#E94B8A",
  error: "#F97066",
  success: "#4ADE80",
};

export const Themes: Record<ThemeName, ThemeColors> = {
  light: Light,
  dark: Dark,
};
