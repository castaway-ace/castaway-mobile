import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/themeContext";
import { forwardRef, ReactNode, useMemo, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

export interface AuthFieldProps extends TextInputProps {
  label: string;
  error?: string;
  /** Renders as a password field with a show/hide toggle. */
  secure?: boolean;
  /** Extra content below the field (e.g. the password-requirements checklist). */
  footer?: ReactNode;
}

/**
 * Labeled text input for the auth forms: focus/error border states and, for
 * passwords, a show/hide toggle.
 *
 * @remarks
 * `forwardRef`s to the underlying `TextInput` so a form can focus the next field
 * on submit. The border color encodes state (error → focused → idle). See
 * `handleChangeText` for the toggle-clear workaround it guards against.
 */
const AuthField = forwardRef<TextInput, AuthFieldProps>((
  {
    label,
    error,
    secure = false,
    footer,
    onFocus,
    onBlur,
    value,
    onChangeText,
    ...inputProps
  },
  ref,
) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [isFocused, setIsFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Timestamp of the last show/hide toggle, and a live mirror of `value`, both
  // used by the toggle-clear workaround below.
  const toggledAt = useRef(0);
  const valueRef = useRef(value);
  valueRef.current = value;

  const handleToggle = () => {
    toggledAt.current = Date.now();
    setIsVisible((prev) => !prev);
  };

  const handleChangeText = (text: string) => {
    // Some keyboards/OSes emit a spurious empty-string change right after
    // toggling secureTextEntry, wiping the password. If we see an empty value
    // land within 500ms of a toggle while the field was non-empty, treat it as
    // that glitch and restore the prior value instead of clearing.
    if (
      secure &&
      text.length === 0 &&
      (valueRef.current?.length ?? 0) > 0 &&
      Date.now() - toggledAt.current < 500
    ) {
      onChangeText?.(valueRef.current ?? "");
      return;
    }
    onChangeText?.(text);
  };

  const borderColor = error
    ? colors.error
    : isFocused
      ? colors.accent
      : colors.primary;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isFocused && { color: colors.accent }]}>
        {label}
      </Text>
      <View style={[styles.inputWrapper, { borderColor }]}>
        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor={colors.secondary}
          selectionColor={colors.accent}
          secureTextEntry={secure && !isVisible}
          value={value}
          onChangeText={handleChangeText}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...inputProps}
        />
        {secure ? (
          <Pressable onPress={handleToggle} style={styles.toggle} hitSlop={8}>
            <Text style={styles.toggleText}>{isVisible ? "Hide" : "Show"}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {footer}
    </View>
  );
});

AuthField.displayName = "AuthField";

export default AuthField;

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { gap: 8 },
    label: { fontSize: 16, color: colors.primary },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderRadius: 8,
    },
    input: {
      flex: 1,
      color: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 16,
    },
    toggle: { paddingHorizontal: 8, paddingVertical: 8 },
    toggleText: { color: colors.accent, fontSize: 16 },
    error: { color: colors.error, fontSize: 14 },
  });
