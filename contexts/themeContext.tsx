import { ThemeColors, ThemeName, Themes } from "@/constants/theme";
import { createContext, useContext, useEffect, useState } from "react";
import { ColorSchemeName, useColorScheme } from "react-native";

interface ThemeContextProps {
  theme: ThemeName;
  /** Resolved color palette for the active theme; what components actually read. */
  colors: ThemeColors;
  changeTheme: (value: ThemeName) => void;
}

// Collapse the platform's tri-state scheme (light | dark | null) to a concrete
// theme, treating "unknown" as light so there's always a definite value.
const normalizeScheme = (scheme: ColorSchemeName): ThemeName =>
  scheme === "dark" ? "dark" : "light";

// Seeded with a real light-theme value rather than `undefined`, so this context
// has no throwing guard: a consumer rendered outside the provider still gets a
// usable palette instead of crashing.
export const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  colors: Themes.light,
  changeTheme: () => {},
});

/**
 * Provides the active theme and its color palette.
 *
 * @remarks
 * Initializes from and follows the OS light/dark setting, while still allowing an
 * in-app override through {@link ThemeContextProps.changeTheme}. Exposing
 * resolved `colors` (not just the name) lets components read palette values
 * directly without importing the theme table themselves.
 */
const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeName>(normalizeScheme(systemTheme));

  // Track the OS theme as it changes at runtime (e.g. auto day/night switch).
  useEffect(() => {
    if (systemTheme) {
      setTheme(normalizeScheme(systemTheme));
    }
  }, [systemTheme]);

  const changeTheme = (value: ThemeName) => {
    setTheme(value);
  };

  const colors = Themes[theme];

  return (
    <ThemeContext.Provider value={{ theme, colors, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/** Accessor for the active theme and palette. Safe outside a provider (see the seeded default). */
export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;
