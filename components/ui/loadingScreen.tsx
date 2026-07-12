import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/themeContext";
import { FC, useMemo } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

/** Full-screen centered spinner on a themed background, shown while a route or the session bootstraps. */
const LoadingScreen: FC = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
  });

export default LoadingScreen;
