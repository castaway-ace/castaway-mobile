import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/themeContext";
import { forwardRef, useMemo, useState } from "react";
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
  secure?: boolean;
}

const AuthField = forwardRef<TextInput, AuthFieldProps>(function AuthField(
  { label, error, secure = false, onFocus, onBlur, ...inputProps },
  ref,
) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [isFocused, setIsFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

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
          <Pressable
            onPress={() => setIsVisible((prev) => !prev)}
            style={styles.toggle}
            hitSlop={8}
          >
            <Text style={styles.toggleText}>{isVisible ? "Hide" : "Show"}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

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
