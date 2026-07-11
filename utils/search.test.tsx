import { queryKeys } from "@/api/queryKeys";
import { createTestQueryClient } from "@/test-utils/createTestQueryClient";
import {
  makeAlbumRef,
  makeAlbumSummary,
  makeArtistRef,
  makeArtistSummary,
  makeSearch,
  makeTrackSummary,
} from "@/test-utils/fixtures";
import {
  renderHookWithProviders,
  waitFor,
} from "@/test-utils/renderWithProviders";
import { SearchItemType, useOrganizedSearch } from "@/utils/search";

describe("useOrganizedSearch", () => {
  it("returns an empty array when there is no search result", async () => {
    const { result } = await renderHookWithProviders(() =>
      useOrganizedSearch(undefined),
    );
    expect(result.current).toEqual([]);
  });

  it("maps albums, artists, and tracks into typed search items", async () => {
    const search = makeSearch({
      albums: [
        makeAlbumSummary({
          id: "al1",
          title: "Album One",
          artists: [makeArtistRef({ name: "A1" })],
        }),
      ],
      artists: [makeArtistSummary({ id: "ar1", name: "Artist One" })],
      tracks: [
        makeTrackSummary({
          id: "tr1",
          title: "Track One",
          album: makeAlbumRef({ id: "al2" }),
          artists: [makeArtistRef({ name: "TA" })],
        }),
      ],
    });

    const queryClient = createTestQueryClient();
    queryClient.setQueryData(queryKeys.albums.cover("al1"), "cover-al1");
    queryClient.setQueryData(queryKeys.albums.cover("al2"), "cover-al2");
    queryClient.setQueryData(queryKeys.artists.image("ar1"), "img-ar1");

    const { result } = await renderHookWithProviders(
      () => useOrganizedSearch(search),
      { queryClient },
    );

    await waitFor(() => expect(result.current).toHaveLength(3));

    const [album, artist, track] = result.current;

    expect(album).toMatchObject({
      id: "al1",
      type: SearchItemType.ALBUM,
      text: "Album One",
      subText: "Album • A1",
      imageUrl: "cover-al1",
    });
    expect(artist).toMatchObject({
      id: "ar1",
      type: SearchItemType.ARTIST,
      text: "Artist One",
      subText: "Artist",
      imageUrl: "img-ar1",
    });
    expect(track).toMatchObject({
      id: "tr1",
      type: SearchItemType.TRACK,
      text: "Track One",
      subText: "Track • TA",
      albumId: "al2",
      imageUrl: "cover-al2",
    });
  });

  it("shares one album cover between an album and a track from that album", async () => {
    const search = makeSearch({
      albums: [makeAlbumSummary({ id: "shared", title: "Shared" })],
      artists: [],
      tracks: [
        makeTrackSummary({
          id: "tr1",
          title: "From Shared",
          album: makeAlbumRef({ id: "shared" }),
        }),
      ],
    });

    const queryClient = createTestQueryClient();
    queryClient.setQueryData(queryKeys.albums.cover("shared"), "cover-shared");

    const { result } = await renderHookWithProviders(
      () => useOrganizedSearch(search),
      { queryClient },
    );

    await waitFor(() =>
      expect(result.current[0]?.imageUrl).toBe("cover-shared"),
    );
    const album = result.current.find((i) => i.type === SearchItemType.ALBUM);
    const track = result.current.find((i) => i.type === SearchItemType.TRACK);
    expect(album?.imageUrl).toBe("cover-shared");
    expect(track?.imageUrl).toBe("cover-shared");
  });
});
