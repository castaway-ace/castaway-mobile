import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/themeContext";
import { Image } from "expo-image";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

/** App logo and wordmark shown atop the login and signup screens. */
const AuthHeader = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.logoContainer}>
      <Image
        style={styles.logo}
        source={require("../../assets/images/castaway.png")}
      />
      <Text style={styles.logoText}>Castaway</Text>
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    logoContainer: {
      alignItems: "center",
      gap: 8,
    },
    logo: { width: 72, height: 72, borderRadius: 12 },
    logoText: { color: colors.primary, fontSize: 48, textAlign: "center" },
  });

export default AuthHeader;
