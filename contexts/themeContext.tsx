import { ThemeColors, ThemeName, Themes } from "@/constants/theme";
import { createContext, useContext, useEffect, useState } from "react";
import { ColorSchemeName, useColorScheme } from "react-native";

interface ThemeContextProps {
  theme: ThemeName;
  colors: ThemeColors;
  changeTheme: (value: ThemeName) => void;
}

const normalizeScheme = (scheme: ColorSchemeName): ThemeName =>
  scheme === "dark" ? "dark" : "light";

export const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  colors: Themes.light,
  changeTheme: () => {},
});

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeName>(normalizeScheme(systemTheme));

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

export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;
