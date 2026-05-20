import { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { ThemeColors, ThemeName, Themes } from "../utils/theme";

interface ThemeContextProps {
  theme: ThemeName;
  colors: ThemeColors;
  changeTheme: (value: ThemeName) => void;
}

export const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  colors: Themes.light,
  changeTheme: () => {},
});

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeName>(systemTheme || "light");

  useEffect(() => {
    if (systemTheme) {
      setTheme(systemTheme);
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
