import { ThemeColors } from "@/constants/theme";
import { StyleSheet } from "react-native";

/**
 * Shared styles for the center-popup family (the create-playlist and confirm
 * dialogs plus their host). Kept in one theme-aware factory so both dialog
 * variants and the router share one backdrop, card, and button treatment.
 */
export const makePopupStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFill,
      justifyContent: "center",
      alignItems: "center",
    },
    backdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor: colors.overlay,
    },
    card: {
      width: "80%",
    },
    sheet: {
      width: "100%",
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
      backgroundColor: colors.surface,
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
      backgroundColor: colors.accent,
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
      color: colors.onAccent,
    },
  });
