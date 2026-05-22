import { StyleSheet } from "react-native";
import { ThemeColors } from "../../constants/theme";

export const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 32,
      backgroundColor: colors.background,
      justifyContent: "center",
      gap: 36,
    },
    logoContainer: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },
    logo: { width: 72, height: 72, borderRadius: 12 },
    logoText: { color: colors.primary, fontSize: 48, textAlign: "center" },
    inputContainer: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
    },
    inputLabel: {
      fontSize: 16,
      color: colors.primary,
    },
    inputField: {
      backgroundColor: colors.surface,
      borderColor: colors.primary,
      borderWidth: 1,
      color: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 16,
      borderRadius: 8,
    },
    passwordWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderColor: colors.primary,
      borderWidth: 1,
      borderRadius: 8,
      paddingRight: 8,
    },
    passwordInput: {
      flex: 1,
      color: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 16,
    },
    toggleButton: {
      paddingHorizontal: 8,
      paddingVertical: 8,
    },
    toggleText: {
      color: colors.accent,
      fontSize: 16,
    },
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
    errorText: {
      color: "red",
    },
    signupSection: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      alignItems: "center",
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
