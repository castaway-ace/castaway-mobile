import { ThemeColors } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const makeAuthFormStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    button: {
      backgroundColor: colors.accent,
      padding: 16,
      borderRadius: 8,
    },
    buttonDisabled: {
      backgroundColor: "gray",
      opacity: 0.6,
    },
    buttonText: { color: "white", textAlign: "center", fontSize: 18 },
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
