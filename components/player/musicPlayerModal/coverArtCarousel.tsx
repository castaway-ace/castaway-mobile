import { useAlbumCover } from "@/api/albums/queries";
import { blurHash } from "@/constants/blur";
import { CAROUSEL_GAP } from "@/constants/player";
import { PlayableTrack } from "@/contexts/audioPlayerContext";
import { presignedImageSource } from "@/utils/images";
import { Image } from "expo-image";
import { FC } from "react";
import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
// Type-only: importing a value from here would pull the audio engine in behind it.
import type { CarouselStrip } from "../useTrackSwipe";

interface CoverArtBlockProps {
  track: PlayableTrack | null;
  /** Fixed block width so the trio lines up on the strip's grid; unset pre-layout. */
  width?: number;
}

/**
 * One track's cover art, sized to a single slot of the carousel.
 *
 * @remarks
 * Each block resolves its own art rather than taking it from the player context,
 * which only knows the current track's. That costs nothing: {@link useAlbumCover}
 * keys by album id, so the current block's query is the one the context already
 * holds — a cache hit — and an absent neighbor idles on `skipToken` without
 * fetching.
 */
const CoverArtBlock: FC<CoverArtBlockProps> = ({ track, width }) => {
  const { data: coverArtUrl } = useAlbumCover(track?.album.id);
  // `as const` keeps the percentage a literal, which is what RN's DimensionValue
  // accepts — widened to `string` it no longer matches.
  const size = { width: width ?? "100%" } as const;

  // No placeholder for a slot with no track behind it: a blurHash reads as art
  // still loading, implying a neighbor that doesn't exist.
  if (!track) {
    return <View style={[styles.cover, size]} />;
  }

  return (
    <Image
      source={coverArtUrl ? presignedImageSource(coverArtUrl) : undefined}
      placeholder={blurHash}
      style={[styles.cover, size]}
    />
  );
};

interface CoverArtCarouselProps extends CarouselStrip {
  previousTrack: PlayableTrack | null;
  currentTrack: PlayableTrack;
  nextTrack: PlayableTrack | null;
}

/**
 * The full-screen player's cover art, rendered as a three-slot strip that slides
 * with the swipe so the neighboring track's art is visible mid-drag.
 *
 * @remarks
 * Positioning is owned by {@link useCarouselStrip} and shared with the track-info
 * strip below it, so the two move as one and land together despite their different
 * widths. See {@link useTrackSwipe} for the anchoring rationale.
 *
 * Unlike the text strip, the strip needs an explicit full width until it has been
 * measured. Text blocks size themselves from their content, but a cover has no
 * intrinsic width: `width: "100%"` inside an auto-width row resolves against an
 * indefinite parent and collapses to nothing, so the art would be blank for the
 * first frames. Pinning the strip to the viewport makes the chain definite; once
 * measured the strip goes back to auto-width, which is exactly three blocks wide.
 */
const CoverArtCarousel: FC<CoverArtCarouselProps> = ({
  previousTrack,
  currentTrack,
  nextTrack,
  stripStyle,
  restingLeft,
  width,
  onViewportLayout,
}) => {
  const measured = width > 0;

  return (
    <View
      style={styles.viewport}
      onLayout={onViewportLayout}
      testID="cover-art-viewport"
    >
      <Animated.View
        style={[
          styles.strip,
          !measured && styles.stripFull,
          { left: restingLeft },
          stripStyle,
        ]}
      >
        {measured && <CoverArtBlock track={previousTrack} width={width} />}
        <CoverArtBlock
          track={currentTrack}
          width={measured ? width : undefined}
        />
        {measured && <CoverArtBlock track={nextTrack} width={width} />}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  viewport: {
    width: "100%",
    aspectRatio: 1,
    overflow: "hidden",
  },
  // The row gap is what `useCarouselStrip` accounts for in its pitch — the two have
  // to stay in step or the strip drifts off its grid.
  strip: {
    flexDirection: "row",
    gap: CAROUSEL_GAP,
  },
  stripFull: {
    width: "100%",
  },
  cover: {
    aspectRatio: 1,
    borderRadius: 16,
  },
});

export default CoverArtCarousel;
