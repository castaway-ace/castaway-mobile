import { IconSymbol } from "@/components/ui/iconSymbol";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/contexts/themeContext";
import { FC, useMemo, useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  AnimatedRef,
  AnimatedStyle,
  Extrapolation,
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Height of the header's content row, below the status-bar inset. */
export const STICKY_HEADER_CONTENT_HEIGHT = 48;

/** Width reserved for the back button, mirrored as a spacer to center the title. */
const HEADER_BUTTON_WIDTH = 32;

/**
 * Scroll distance over which the header crossfades, ending the moment the
 * screen's own title is fully hidden behind it. The fade tracks the title's
 * approach rather than snapping at the threshold.
 */
const HEADER_FADE_DISTANCE = 64;

/**
 * Opacity shared by the header's background and title as it reveals. Spelled as
 * an `AnimatedStyle` because `useAnimatedStyle` hands back an opaque handle, not
 * the plain object its worklet returns.
 */
type HeaderRevealStyle = AnimatedStyle<{ opacity: number }>;

/** Wiring returned by {@link useStickyHeaderReveal}; see each field for where it goes. */
export interface StickyHeaderReveal {
  /** Attach to the screen's {@link Animated.ScrollView}. */
  scrollRef: AnimatedRef<Animated.ScrollView>;
  /** The header's bottom edge — use as the scroll content's `paddingTop`. */
  headerBottom: number;
  /** Attach to the row holding the screen's title (a direct scroll-content child). */
  onHeaderRowLayout: (event: LayoutChangeEvent) => void;
  /** Attach to the screen's own title text. */
  onTitleLayout: (event: LayoutChangeEvent) => void;
  /** Pass to {@link StickyHeader}. */
  headerStyle: HeaderRevealStyle;
}

/**
 * Tracks when a screen's own title scrolls under the sticky header and derives
 * the header's reveal opacity from it.
 *
 * @remarks
 * Split from {@link StickyHeader} because the trigger point can only be measured
 * from elements the *screen* owns — the title lives in the scroll content, not in
 * the header — so the screen has to place the two `onLayout` handlers itself.
 *
 * Opacity is driven straight from scroll position rather than a timed animation
 * off a threshold, which ties the crossfade to the user's finger and reverses it
 * on the way back up for free.
 */
export const useStickyHeaderReveal = (): StickyHeaderReveal => {
  const insets = useSafeAreaInsets();

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);

  const headerBottom = insets.top + STICKY_HEADER_CONTENT_HEIGHT;

  // Measured rather than hardcoded: a long title wraps to a second line, which
  // moves the point where it slips under the header. `headerRowY` is relative to
  // the scroll content (the row is a direct child of the content container) and
  // `titleBottom` is relative to that row, so the two sum to the title's bottom
  // edge in scroll-content coordinates.
  const [headerRowY, setHeaderRowY] = useState(0);
  const [titleBottom, setTitleBottom] = useState(0);

  const onHeaderRowLayout = (event: LayoutChangeEvent) =>
    setHeaderRowY(event.nativeEvent.layout.y);

  const onTitleLayout = (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    setTitleBottom(y + height);
  };

  const revealOffset = headerRowY + titleBottom - headerBottom;

  const headerStyle = useAnimatedStyle(() => {
    // Negative until both onLayouts have reported; without this the clamp below
    // would read a scroll of 0 as "past the threshold" and flash the header.
    if (revealOffset <= 0) return { opacity: 0 };
    return {
      opacity: interpolate(
        scrollOffset.value,
        [revealOffset - HEADER_FADE_DISTANCE, revealOffset],
        [0, 1],
        Extrapolation.CLAMP,
      ),
    };
  });

  return {
    scrollRef,
    headerBottom,
    onHeaderRowLayout,
    onTitleLayout,
    headerStyle,
  };
};

interface StickyHeaderProps {
  /** The screen's title, shown centered once the header reveals. */
  title: string | undefined;
  /** Reveal opacity from {@link useStickyHeaderReveal}. */
  headerStyle: HeaderRevealStyle;
  /** Invoked by the back button, which stays visible at every scroll position. */
  onBack: () => void;
}

/**
 * A header pinned over a scrolling screen: the back button is always visible,
 * while the background and title fade in as the screen's own title scrolls
 * beneath it.
 *
 * @remarks
 * Render as a sibling *after* the scroll view (so it stacks above it) rather than
 * inside it, or it would scroll away with the content. Pair with
 * {@link useStickyHeaderReveal}, which supplies `headerStyle` and the scroll
 * content's `paddingTop`.
 *
 * @param props - See {@link StickyHeaderProps}.
 */
export const StickyHeader: FC<StickyHeaderProps> = ({
  title,
  headerStyle,
  onBack,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  return (
    // box-none so the header's empty space doesn't swallow touches meant for the
    // content scrolling underneath it.
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top,
          height: insets.top + STICKY_HEADER_CONTENT_HEIGHT,
        },
      ]}
      pointerEvents="box-none"
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.background, headerStyle]}
      />
      <Pressable style={styles.backButton} onPress={onBack}>
        <IconSymbol size={32} name={"arrow.backward"} color={colors.primary} />
      </Pressable>
      <Animated.Text
        style={[styles.title, headerStyle]}
        numberOfLines={1}
        testID="sticky-header-title"
      >
        {title}
      </Animated.Text>
      {/* Mirrors the back button's width so the flexed title centers against the
          screen rather than the space left over beside the button. */}
      <View style={styles.spacer} />
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    header: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      gap: 12,
    },
    background: {
      backgroundColor: colors.surface,
    },
    title: {
      flex: 1,
      textAlign: "center",
      color: colors.primary,
      fontSize: 18,
      fontWeight: 600,
    },
    backButton: {
      width: HEADER_BUTTON_WIDTH,
      justifyContent: "center",
    },
    spacer: {
      width: HEADER_BUTTON_WIDTH,
    },
  });
