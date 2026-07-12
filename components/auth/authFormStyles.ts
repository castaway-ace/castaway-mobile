import { ThemeColors } from "@/constants/theme";
import { StyleSheet } from "react-native";

/**
 * Shared styles for the login and signup forms (submit button, form-level error,
 * and the "switch to signup/login" link row). One theme-aware factory so both
 * screens' shared chrome stays identical.
 */
export const makeAuthFormStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    button: {
      backgroundColor: colors.accent,
      padding: 16,
      borderRadius: 8,
    },
    buttonDisabled: {
      backgroundColor: colors.disabled,
      opacity: 0.6,
    },
    buttonText: { color: colors.onAccent, textAlign: "center", fontSize: 18 },
    formError: {
      color: colors.error,
      textAlign: "center",
      fontSize: 14,
    },
    signupSection: {
      alignItems: "center",
      gap: 8,
    },
    signupText: {
      fontSize: 18,
      color: colors.primary,
    },
    signupLink: {
      fontSize: 18,
      color: colors.accent,
    },
  });
