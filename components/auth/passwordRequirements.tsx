import { ThemeColors } from "@/constants/theme";
import { PASSWORD_RULES } from "@/constants/validation";
import { useTheme } from "@/contexts/themeContext";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

interface PasswordRequirementsProps {
  value: string;
}

/**
 * Live checklist that ticks off each password rule as the user types.
 *
 * @remarks
 * Reads from the shared {@link PASSWORD_RULES} so the on-screen requirements and
 * the schema that actually validates the password can't drift apart. Each row
 * carries an accessibility label announcing met/not-met state, since the ✓/○
 * glyph alone isn't conveyed to screen readers.
 */
const PasswordRequirements = ({ value }: PasswordRequirementsProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(value);
        return (
          <View
            key={rule.label}
            style={styles.row}
            accessible
            accessibilityLabel={`${rule.label}: ${met ? "met" : "not met"}`}
          >
            <Text
              style={[
                styles.icon,
                { color: met ? colors.success : colors.secondary },
              ]}
            >
              {met ? "✓" : "○"}
            </Text>
            <Text
              style={[
                styles.text,
                { color: met ? colors.success : colors.secondary },
              ]}
            >
              {rule.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

export default PasswordRequirements;

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { gap: 4 },
    row: { flexDirection: "row", alignItems: "center", gap: 8 },
    icon: { fontSize: 14, width: 16, textAlign: "center" },
    text: { fontSize: 14 },
  });
