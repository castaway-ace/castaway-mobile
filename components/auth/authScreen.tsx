import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/themeContext";
import { ReactNode, useMemo } from "react";
import { StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

type Align = "top" | "center" | "bottom";

// Maps the friendly `align` prop to the flexbox value it controls.
const justifyByAlign = {
  top: "flex-start",
  center: "center",
  bottom: "flex-end",
} as const;

interface AuthScreenProps {
  children: ReactNode;
  /** Vertical placement of the form within the screen. */
  align?: Align;
}

/**
 * Shared shell for the auth screens: safe-area background plus a keyboard-aware
 * scroll container.
 *
 * @remarks
 * Wraps content in `KeyboardAwareScrollView` so focused inputs stay visible above
 * the keyboard, and `keyboardShouldPersistTaps="handled"` keeps a tap on the
 * submit button from being swallowed just to dismiss the keyboard. Login and
 * signup share this frame and only differ in the form they pass as `children`.
 */
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
