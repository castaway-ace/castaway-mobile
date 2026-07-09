import { ThemeColors } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const makePopupStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFill,
      justifyContent: "center",
      alignItems: "center",
    },
    backdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    sheet: {
      width: "80%",
      gap: 24,
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: colors.background,
      padding: 24,
    },
    title: {
      fontSize: 20,
      color: colors.primary,
    },
    message: {
      fontSize: 16,
      lineHeight: 22,
      color: colors.secondary,
    },
    textFieldContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.accent,
      backgroundColor: colors.secondary,
    },
    textField: {
      flex: 1,
      paddingVertical: 8,
      color: colors.primary,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "center",
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 12,
    },
    submitButton: {
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.secondary,
    },
    secondaryButton: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: colors.secondary,
    },
    primaryButton: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: colors.accent,
    },
    buttonText: {
      fontSize: 16,
      color: colors.primary,
    },
    primaryButtonText: {
      fontSize: 16,
      color: "#FFFFFF",
    },
  });
