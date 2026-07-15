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

// How far the strip must travel before a release commits, as a fraction of one
// track's width.
const COMMIT_RATIO = 0.25;
// A flick this fast commits regardless of distance, so a short quick swipe works.
const COMMIT_VELOCITY = 500;
// Fraction of the drag applied when there's no track to move to, so the strip
// gives a little and visibly springs back rather than feeling dead.
const RESISTANCE = 0.25;
// Horizontal travel before the swipe activates. Large enough that a tap meant for
// the mini-player's own press targets can't be mistaken for the start of a drag.
const AXIS_SLOP = 12;
// Matches the player sheet's animations so the two feel of a piece.
const SETTLE_DURATION = 220;

/**
 * Swipe-to-change-track for the mini-player: drag left for the next track, right
 * for the previous one, with the track-info strip tracking the finger so the
 * neighboring track slides into view before the skip commits.
 *
 * @returns `pan` for the artwork's `GestureDetector`, plus everything the strip
 * needs to position itself: `stripStyle` (the animated drag), `restingLeft` (the
 * plain re-anchoring offset), the measured block `width` (`0` until first layout),
 * and `onViewportLayout` to measure it.
 *
 * @remarks
 * The strip renders a fixed trio (previous / current / next). On commit the trio
 * re-renders shifted by one, which is the whole difficulty: a shared value and a
 * React commit land on separate pipelines, so resetting `translateX` to zero
 * alongside the skip would show one frame of the wrong track re-centered.
 *
 * So `translateX` is never reset. It drifts by one track width per commit, and a
 * plain `left` style cancels the drift out. Being a plain style, `left` changes in
 * the *same* React commit as the trio it re-anchors — the two can't tear apart.
 * The invariant: `translateX` is written only on the UI thread, `left` only from
 * render, and the rest position is always `steps * width`.
 */
export const useTrackSwipe = () => {
  const { nextTrack, previousTrack, skipNext, skipPrevious } =
    useAudioPlayerContext();

  // Net committed swipes; negative is forward. Grows unbounded but stays an exact
  // integer multiple of `width`, so the anchor can't accumulate rounding drift.
  const [steps, setSteps] = useState(0);
  const [width, setWidth] = useState(0);

  const translateX = useSharedValue(0);
  const start = useSharedValue(0);

  const restingLeft = -width * (1 + steps);

  // Both in one commit: the anchor moves on the same frame the context hands back
  // a trio shifted by one. Splitting them is the one-frame flash.
  //
  // No staleness guard needed despite this running ~220ms after the render that
  // built it. The rest position is `steps * width` for whatever `steps` holds, and
  // `restingLeft` derives from the same `steps`, so the two always sum to a
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

  const onViewportLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const measured = event.nativeEvent.layout.width;
      if (measured === width) return;
      // Restate the offset against the new measurement (rotation): `steps` counts
      // tracks, so the pixel rest position has to be recomputed to stay on grid.
      translateX.value = steps * measured;
      setWidth(measured);
    },
    [width, steps, translateX],
  );

  const canGoNext = nextTrack !== null;
  const canGoPrevious = previousTrack !== null;
  const resting = steps * width;

  const pan = Gesture.Pan()
    // Horizontal only. Below this the touch stays with the mini-player's own
    // Pressables, so tapping to expand the player still works; past it the pan
    // activates and cancels the press.
    .activeOffsetX([-AXIS_SLOP, AXIS_SLOP])
    .onBegin(() => {
      cancelAnimation(translateX);
      // Anchor to the settled grid position rather than wherever an interrupted
      // commit animation left the strip, so snap targets can't drift off-grid.
      start.value = resting;
    })
    .onUpdate((event) => {
      const blocked =
        (event.translationX < 0 && !canGoNext) ||
        (event.translationX > 0 && !canGoPrevious);
      translateX.value =
        start.value +
        (blocked ? event.translationX * RESISTANCE : event.translationX);
    })
    .onEnd((event) => {
      const delta = translateX.value - start.value;
      const wantsNext = delta < 0;
      const reachable = wantsNext ? canGoNext : canGoPrevious;
      // Velocity has to agree with direction: a leftward flick that ended right
      // of the anchor isn't a forward skip.
      const flicked = wantsNext
        ? event.velocityX < -COMMIT_VELOCITY
        : event.velocityX > COMMIT_VELOCITY;
      const far = Math.abs(delta) > width * COMMIT_RATIO;

      if (width > 0 && reachable && (far || flicked)) {
        translateX.value = withTiming(
          start.value + (wantsNext ? -width : width),
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
      translateX.value = withTiming(start.value, { duration: SETTLE_DURATION });
    });

  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return { pan, stripStyle, restingLeft, width, onViewportLayout };
};

// Inferred rather than hand-written: reanimated's animated-style types don't
// survive being restated by name.
export type TrackSwipe = ReturnType<typeof useTrackSwipe>;
