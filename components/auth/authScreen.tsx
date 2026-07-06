import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/themeContext";
import { ReactNode, useMemo } from "react";
import { StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

type Align = "top" | "center" | "bottom";

const justifyByAlign = {
  top: "flex-start",
  center: "center",
  bottom: "flex-end",
} as const;

interface AuthScreenProps {
  children: ReactNode;
  align?: Align;
}

const AuthScreen = ({ children, align = "center" }: AuthScreenProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.content,
          { justifyContent: justifyByAlign[align] },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={80}
      >
        {children}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default AuthScreen;

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flexGrow: 1,
      gap: 24,
      paddingHorizontal: 32,
      paddingVertical: 32,
    },
  });
