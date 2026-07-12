import { ConfirmPopup, usePopupModal } from "@/contexts/popupModalContext";
import { useTheme } from "@/contexts/themeContext";
import { FC, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { makePopupStyles } from "./popupStyles";

interface ConfirmContentProps {
  content: ConfirmPopup;
}

/**
 * The generic confirmation dialog — title, message, and a cancel/confirm pair,
 * all supplied by the caller via {@link ConfirmPopup}.
 *
 * @remarks
 * One reusable dialog backs every destructive action in the app (delete
 * playlist, remove track, re-add duplicate).
 * It just renders the passed copy and invokes `onConfirm`, closing first so the
 * callback runs after the popup is gone.
 */
const ConfirmContent: FC<ConfirmContentProps> = ({ content }) => {
  const { colors } = useTheme();
  const { close } = usePopupModal();
  const styles = useMemo(() => makePopupStyles(colors), [colors]);

  const onConfirmPress = () => {
    // Dismiss before running the action so any navigation it triggers doesn't
    // happen behind a still-open popup.
    close();
    content.onConfirm();
  };

  return (
    <View style={styles.sheet}>
      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.message}>{content.message}</Text>
      <View style={styles.buttonRow}>
        <Pressable style={styles.secondaryButton} onPress={close}>
          <Text style={styles.buttonText}>{content.cancelLabel}</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={onConfirmPress}>
          <Text style={styles.primaryButtonText}>{content.confirmLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ConfirmContent;
