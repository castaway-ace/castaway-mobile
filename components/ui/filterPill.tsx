import { IconSymbol } from "@/components/ui/iconSymbol";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/themeContext";
import { ComponentProps, FC, useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

/**
 * Read off {@link IconSymbol} rather than imported, because its iOS and
 * Android implementations type `name` differently — going through the component
 * picks up whichever one the platform resolved.
 */
type IconName = ComponentProps<typeof IconSymbol>["name"];

type FilterPillProps = {
  /** Fills with `accent` instead of `surface`. */
  active?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  testID?: string;
} & ({ label: string; icon?: never } | { icon: IconName; label?: never });

/**
 * A rounded, tappable filter chip — either a text label or a single icon.
 *
 * @remarks
 * `label` and `icon` are mutually exclusive in the type, so a pill is always one
 * or the other and neither variant needs a fallback branch.
 *
 * The icon variant exists for the clear ("X") pill, which renders `active` so it
 * carries the same accent fill as the selected pill beside it — the two read as
 * one connected control rather than two unrelated chips.
 */
const FilterPill: FC<FilterPillProps> = (props) => {
  const { active = false, onPress, accessibilityLabel, testID } = props;
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const foreground = active ? colors.onAccent : colors.primary;

  return (
    <Pressable
      style={[styles.pill, active && styles.pillActive]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={accessibilityLabel ?? props.label}
      testID={testID}
    >
      {props.label !== undefined ? (
        <Text style={[styles.label, { color: foreground }]}>{props.label}</Text>
      ) : (
        <IconSymbol size={16} name={props.icon} color={foreground} />
      )}
    </Pressable>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    pill: {
      backgroundColor: colors.surface,
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
    },
    pillActive: {
      backgroundColor: colors.accent,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
    },
  });

export default FilterPill;
