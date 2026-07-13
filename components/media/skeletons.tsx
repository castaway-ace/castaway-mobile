import { Skeleton } from "@/components/ui/skeleton";
import { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

/**
 * Universal fixed-width card placeholder: a square cover over one or two text
 * lines. The shared shape behind the album, playlist, and interaction-grid
 * skeletons — pass `lines` to match how many text rows the real card has.
 */
export const MediaCardSkeleton = ({
  lines = 2,
  size = 160,
  testID,
}: {
  lines?: 1 | 2;
  size?: number;
  testID?: string;
}) => (
  <View style={[styles.card, { width: size }]} testID={testID}>
    <Skeleton width="100%" height={size} borderRadius={12} />
    <Skeleton width="80%" height={16} borderRadius={4} />
    {lines === 2 && <Skeleton width="55%" height={14} borderRadius={4} />}
  </View>
);

/**
 * Universal full-width row placeholder: a square thumbnail beside two text
 * lines. The shared shape behind the interaction-row and search skeletons — the
 * caller sizes the thumbnail to match the real row.
 */
export const MediaRowSkeleton = ({
  thumbSize,
  thumbRadius,
  testID,
}: {
  thumbSize: number;
  thumbRadius: number;
  testID?: string;
}) => (
  <View style={styles.row} testID={testID}>
    <Skeleton width={thumbSize} height={thumbSize} borderRadius={thumbRadius} />
    <View style={styles.rowText}>
      <Skeleton width="60%" height={16} borderRadius={4} />
      <Skeleton width="40%" height={14} borderRadius={4} />
    </View>
  </View>
);

/** Loading placeholder for the album card (cover + title + artist). */
export const AlbumItemSkeleton = () => (
  <MediaCardSkeleton lines={2} testID="album-item-skeleton" />
);

/** Loading placeholder for the playlist card (cover + single name line). */
export const PlaylistItemSkeleton = () => (
  <MediaCardSkeleton lines={1} testID="playlist-item-skeleton" />
);

/**
 * Loading placeholder for the interaction feed item, matching its layout in
 * either the shelf (`grid`) or list (`row`) variant.
 */
export const InteractionItemSkeleton = ({
  variant = "grid",
}: {
  variant?: "grid" | "row";
}) =>
  variant === "grid" ? (
    <MediaCardSkeleton lines={2} testID="interaction-item-skeleton" />
  ) : (
    <MediaRowSkeleton
      thumbSize={100}
      thumbRadius={12}
      testID="interaction-item-skeleton"
    />
  );

/** Loading placeholder for the search result row (thumbnail + two text lines). */
export const SearchItemSkeleton = () => (
  <MediaRowSkeleton thumbSize={48} thumbRadius={4} testID="search-item-skeleton" />
);

/**
 * Loading placeholder for the circular artist card. Kept separate from
 * {@link MediaCardSkeleton} since its round image and centered layout don't fit
 * the square-card shape.
 */
export const ArtistItemSkeleton = () => (
  <View style={styles.artist} testID="artist-item-skeleton">
    <Skeleton width={120} height={120} borderRadius={60} />
    <Skeleton width={90} height={16} borderRadius={4} />
  </View>
);

/**
 * A horizontally-scrolling shelf of card skeletons under a placeholder title —
 * the loading state for a home/search content row.
 *
 * @remarks
 * Mirrors the real shelf's shape (a section title over a horizontal row) so the
 * screen keeps its rhythm while the list query loads. Pass the appropriate card
 * skeletons (e.g. several {@link AlbumItemSkeleton}s) as children.
 */
export const SkeletonShelf = ({ children }: { children: ReactNode }) => (
  <View style={styles.shelf} testID="skeleton-shelf">
    <Skeleton
      width="45%"
      height={24}
      borderRadius={4}
      style={styles.shelfTitle}
    />
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.shelfRow}
    >
      {children}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  card: { gap: 8 },
  row: { flexDirection: "row", gap: 12, alignItems: "center" },
  rowText: { flex: 1, gap: 6 },
  artist: { alignItems: "center", gap: 8 },
  shelf: { gap: 16 },
  shelfTitle: { marginHorizontal: 16 },
  shelfRow: { flexDirection: "row", gap: 16, paddingHorizontal: 16 },
});
