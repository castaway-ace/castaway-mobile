import { IconSymbol } from "@/components/ui/iconSymbol";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/themeContext";
import { ComponentProps, FC, useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";

/**
 * Fade timings for a pill entering and leaving the row.
 *
 * @remarks
 * Out is quicker than in, matching the toast and sheet transitions: a pill on
 * its way out is already dismissed as far as the user is concerned, so lingering
 * on it only delays the row settling.
 */
const PILL_FADE_IN_MS = 300;
const PILL_FADE_OUT_MS = 200;

/**
 * How long a surviving pill takes to slide to its new spot once its neighbors
 * leave. Roughly matches the fade so the row reads as one motion.
 */
const PILL_SETTLE_MS = 220;

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
 *
 * A pill fades itself in and out as it joins or leaves the row, and slides when
 * its neighbors go. This uses the declarative `entering`/`exiting` props rather
 * than the shared values the rest of the app animates with, because those cannot
 * animate an unmount — by the time the value changed, the component would
 * already be gone. Reanimated instead holds the view in place until `exiting`
 * finishes.
 */
const FilterPill: FC<FilterPillProps> = (props) => {
  const { active = false, onPress, accessibilityLabel, testID } = props;
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const foreground = active ? colors.onAccent : colors.primary;

  return (
    // The transition lives on a wrapper rather than an animated `Pressable`, so
    // press handling stays a plain platform component.
    <Animated.View
      entering={FadeIn.duration(PILL_FADE_IN_MS)}
      exiting={FadeOut.duration(PILL_FADE_OUT_MS)}
      layout={LinearTransition.duration(PILL_SETTLE_MS)}
    >
      <Pressable
        style={[styles.pill, active && styles.pillActive]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        accessibilityLabel={accessibilityLabel ?? props.label}
        testID={testID}
      >
        {/* Narrowed off `props` rather than destructured fields: pulling `label`
            and `icon` out separately loses the union's guarantee that exactly
            one of them is present, leaving `icon` possibly undefined here. */}
        {props.label !== undefined ? (
          <Text style={[styles.label, { color: foreground }]}>
            {props.label}
          </Text>
        ) : (
          <IconSymbol size={16} name={props.icon} color={foreground} />
        )}
      </Pressable>
    </Animated.View>
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
