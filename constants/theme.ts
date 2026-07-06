/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  highlight: string;
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
  highlight: "#E4DB5A",
  error: "#D92D20",
  success: "#16A34A",
};

const Dark: ThemeColors = {
  background: "#1A1416",
  surface: "241C1F",
  primary: '#F5EDEA',
  secondary: '#A89BA0',
  accent: "#E94B8A",
  highlight: "#E4DB5A",
  error: "#F97066",
  success: "#4ADE80",
};

export const Themes: Record<ThemeName, ThemeColors> = {
  light: Light,
  dark: Dark,
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
