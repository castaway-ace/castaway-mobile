import { CAROUSEL_GAP } from "@/constants/player";
import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import { useCallback, useState } from "react";
import { LayoutChangeEvent } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";

// How far a strip must travel before a release commits, as a fraction of one track.
const COMMIT_RATIO = 0.25;
// A flick this fast (px/s) commits regardless of distance, so a short quick swipe
// still works. Stays in pixels: it's the finger's speed, not any strip's width.
const COMMIT_VELOCITY = 500;
// Fraction of the drag applied when there's no track to move to, so a strip gives
// a little and visibly springs back rather than feeling dead.
const RESISTANCE = 0.25;
// Horizontal travel before the swipe activates. Large enough that a tap meant for
// a player's own press targets can't be mistaken for the start of a drag.
const AXIS_SLOP = 12;
// Matches the player sheet's animations so the two feel of a piece.
const SETTLE_DURATION = 220;

/**
 * Swipe-to-change-track, shared by the mini-player and the full-screen player:
 * drag left for the next track, right for the previous one, with the carousel
 * strips tracking the finger so the neighboring track slides into view before the
 * skip commits.
 *
 * @returns `pan` for the `GestureDetector` on whichever surface should receive the
 * drag, `onSwipeScaleLayout` to measure what one track of travel means, and the
 * `offset`/`steps` pair that {@link useCarouselStrip} turns into a position.
 *
 * @remarks
 * Position is measured in **tracks**, not pixels, which is what lets one gesture
 * drive several strips of different widths: each covers its own width over the
 * same drag, so they all land together. It also makes the offset independent of
 * any measurement, so nothing needs restating when a strip is re-measured.
 *
 * A strip renders a fixed trio (previous / current / next). On commit the trio
 * re-renders shifted by one, which is the whole difficulty: a shared value and a
 * React commit land on separate pipelines, so resetting `offset` alongside the skip
 * would show one frame of the wrong track re-centered.
 *
 * So `offset` is never reset. It drifts by one track per commit, and each strip's
 * plain `left` style cancels the drift out — being a plain style, `left` changes in
 * the *same* React commit as the trio it re-anchors, so the two can't tear apart.
 * The invariant: `offset` is written only on the UI thread, `left` only from
 * render, and the rest position is always `steps`.
 */
export const useTrackSwipe = () => {
  const { nextTrack, previousTrack, skipNext, skipPrevious } =
    useAudioPlayerContext();

  // Net committed swipes; negative is forward. Grows unbounded but stays an exact
  // integer, so the anchor can't accumulate rounding drift.
  const [steps, setSteps] = useState(0);
  // Width of the strip the finger is actually on. Its pitch is what one track of
  // travel means, so that strip tracks 1:1 while the others cover their own pitch
  // over the same drag.
  const [swipeWidth, setSwipeWidth] = useState(0);
  const swipePitch = swipeWidth > 0 ? swipeWidth + CAROUSEL_GAP : 0;

  const offset = useSharedValue(0);
  const start = useSharedValue(0);

  // Both in one commit: the anchor moves on the same frame the context hands back
  // a trio shifted by one. Splitting them is the one-frame flash.
  //
  // No staleness guard needed despite this running ~220ms after the render that
  // built it. The rest position is `steps` for whatever `steps` holds, and each
  // strip's `restingLeft` derives from the same `steps`, so they always sum to a
  // centered current block no matter what the trio turned out to contain. An
  // external track change (a natural end, a lock-screen skip) therefore just
  // re-centers on the new track, which is exactly what it should do.
  const commit = useCallback(
    (wantsNext: boolean) => {
      setSteps((value) => (wantsNext ? value - 1 : value + 1));
      if (wantsNext) {
        skipNext();
      } else {
        skipPrevious();
      }
    },
    [skipNext, skipPrevious],
  );

  const onSwipeScaleLayout = useCallback((event: LayoutChangeEvent) => {
    setSwipeWidth(event.nativeEvent.layout.width);
  }, []);

  const canGoNext = nextTrack !== null;
  const canGoPrevious = previousTrack !== null;

  const pan = Gesture.Pan()
    // Horizontal only. Below this the touch stays with the player's own Pressables
    // — tapping to expand, to star, to play — and past it the pan activates and
    // cancels the press.
    .activeOffsetX([-AXIS_SLOP, AXIS_SLOP])
    .onBegin(() => {
      cancelAnimation(offset);
      // Anchor to the settled grid position rather than wherever an interrupted
      // commit animation left the strips, so snap targets can't drift off-grid.
      start.value = steps;
    })
    .onUpdate((event) => {
      if (swipePitch <= 0) return;
      const blocked =
        (event.translationX < 0 && !canGoNext) ||
        (event.translationX > 0 && !canGoPrevious);
      const travelled = blocked
        ? event.translationX * RESISTANCE
        : event.translationX;
      offset.value = start.value + travelled / swipePitch;
    })
    .onEnd((event) => {
      const delta = offset.value - start.value;
      const wantsNext = delta < 0;
      const reachable = wantsNext ? canGoNext : canGoPrevious;
      // Velocity has to agree with direction: a leftward flick that ended right
      // of the anchor isn't a forward skip.
      const flicked = wantsNext
        ? event.velocityX < -COMMIT_VELOCITY
        : event.velocityX > COMMIT_VELOCITY;
      const far = Math.abs(delta) > COMMIT_RATIO;

      if (swipePitch > 0 && reachable && (far || flicked)) {
        offset.value = withTiming(
          start.value + (wantsNext ? -1 : 1),
          { duration: SETTLE_DURATION },
          (finished) => {
            // Unfinished means the user grabbed it mid-flight; commit nothing.
            if (finished) {
              runOnJS(commit)(wantsNext);
            }
          },
        );
        return;
      }
      offset.value = withTiming(start.value, { duration: SETTLE_DURATION });
    });

  return { pan, offset, steps, onSwipeScaleLayout };
};

// Inferred rather than hand-written: reanimated's animated-style types don't
// survive being restated by name.
export type TrackSwipe = ReturnType<typeof useTrackSwipe>;

/**
 * Positions one carousel strip against a {@link useTrackSwipe} gesture.
 *
 * @returns `stripStyle` (the animated drag) and `restingLeft` (the plain
 * re-anchoring offset) for the strip, the measured block `width` (`0` until first
 * layout), and `onViewportLayout` to measure it.
 *
 * @remarks
 * Call this once per strip; several strips can share one gesture, each scaling the
 * shared offset by its own pitch. See {@link useTrackSwipe} for why `restingLeft`
 * has to be a plain style rather than part of the animated transform.
 *
 * The invariant holds at any pitch: at rest the transform is `steps * pitch` and
 * `restingLeft` is `-pitch * (1 + steps)`, so the current block — always at strip-x
 * `pitch` — sits at `pitch - pitch * (1 + steps) + steps * pitch`, which is 0 for
 * every value of `steps`.
 */
export const useCarouselStrip = ({
  offset,
  steps,
}: Pick<TrackSwipe, "offset" | "steps">) => {
  const [width, setWidth] = useState(0);

  // Distance from one slot to the next: a block plus the gap after it. Zero before
  // measurement, which keeps the unmeasured first frame anchored at 0 — exactly
  // where the lone current block already sits.
  const pitch = width > 0 ? width + CAROUSEL_GAP : 0;

  const restingLeft = -pitch * (1 + steps);

  // `pitch` is a plain JS number captured by the worklet closure, so a re-measure
  // propagates on the next render without a shared-value write.
  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value * pitch }],
  }));

  const onViewportLayout = useCallback((event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  }, []);

  return { stripStyle, restingLeft, width, onViewportLayout };
};

export type CarouselStrip = ReturnType<typeof useCarouselStrip>;
