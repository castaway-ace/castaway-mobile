import { useSeedInteractionArtwork } from "@/api/interactions/cache";
import { queryKeys } from "@/api/queryKeys";
import { STALE_TIME } from "@/constants/query";
import { createTestQueryClient } from "@/test-utils/createTestQueryClient";
import {
  makeAlbumInteraction,
  makeArtistInteraction,
  makePlaylistInteraction,
} from "@/test-utils/fixtures";
import { renderHookWithProviders } from "@/test-utils/renderWithProviders";
import type { QueryClient } from "@tanstack/react-query";

const seedWith = async (queryClient: QueryClient) => {
  const { result } = await renderHookWithProviders(
    () => useSeedInteractionArtwork(),
    { queryClient },
  );
  return result.current;
};

describe("useSeedInteractionArtwork", () => {
  it("primes the artist image cache from an artist interaction", async () => {
    const queryClient = createTestQueryClient();
    const seed = await seedWith(queryClient);

    seed(
      makeArtistInteraction({
        artist: { id: "ar1", name: "Daft Punk" },
        coverUrl: "https://feed-cover.jpg",
      }),
    );

    expect(queryClient.getQueryData(queryKeys.artists.image("ar1"))).toBe(
      "https://feed-cover.jpg",
    );
  });

  it("primes the album cover cache from an album interaction", async () => {
    const queryClient = createTestQueryClient();
    const seed = await seedWith(queryClient);

    seed(
      makeAlbumInteraction({
        album: { id: "al1", title: "Discovery" },
        coverUrl: "https://feed-cover.jpg",
      }),
    );

    expect(queryClient.getQueryData(queryKeys.albums.cover("al1"))).toBe(
      "https://feed-cover.jpg",
    );
  });

  it("seeds fresh so the detail screen doesn't refetch a url it was just handed", async () => {
    const queryClient = createTestQueryClient();
    const seed = await seedWith(queryClient);

    seed(
      makeArtistInteraction({
        artist: { id: "ar1", name: "Daft Punk" },
        coverUrl: "https://feed-cover.jpg",
      }),
    );

    // Asked via isStaleByTime because staleness is an observer-level question:
    // this is what useArtistImage's LONG stale time resolves to on mount, and a
    // stale entry there would mean a wasted round trip for a URL we already have.
    const query = queryClient
      .getQueryCache()
      .find({ queryKey: queryKeys.artists.image("ar1") });

    expect(query?.isStaleByTime(STALE_TIME.LONG)).toBe(false);
  });

  it("leaves the cache alone when the interaction carries no cover", async () => {
    const queryClient = createTestQueryClient();
    const seed = await seedWith(queryClient);

    seed(
      makeArtistInteraction({
        artist: { id: "ar1", name: "Daft Punk" },
        coverUrl: null,
      }),
    );

    expect(
      queryClient.getQueryData(queryKeys.artists.image("ar1")),
    ).toBeUndefined();
  });

  it("ignores playlists, whose art comes from the playlist detail payload", async () => {
    const queryClient = createTestQueryClient();
    const seed = await seedWith(queryClient);

    seed(makePlaylistInteraction({ playlist: { id: "p1", name: "Road Trip" } }));

    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
  });
});
