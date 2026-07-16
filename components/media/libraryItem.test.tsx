import LibraryItem from "@/components/media/libraryItem";
import {
  makeAlbumLibraryItem,
  makeAlbumRef,
  makeArtistLibraryItem,
  makeArtistRef,
  makePlaylistLibraryItem,
  makePlaylistRef,
} from "@/test-utils/fixtures";
import { measureLikedCover } from "@/test-utils/measureLikedCover";
import { renderWithProviders } from "@/test-utils/renderWithProviders";
import { PlaylistType } from "@/types/playlist";

describe("LibraryItem", () => {
  it("renders an album row with title, artists, and cover", async () => {
    const item = makeAlbumLibraryItem({
      album: makeAlbumRef({ title: "Kid A" }),
      artists: [makeArtistRef({ name: "Radiohead" })],
      coverUrl: "https://cover/kida.jpg",
    });

    const { getByText, getByTestId } = await renderWithProviders(
      <LibraryItem item={item} />,
    );

    expect(getByText("Kid A")).toBeTruthy();
    expect(getByText("Album • Radiohead")).toBeTruthy();
    expect(getByTestId("expo-image").props.accessibilityLabel).toBe(
      "https://cover/kida.jpg",
    );
  });

  it("falls back to the placeholder when an album has no cover", async () => {
    const item = makeAlbumLibraryItem({ coverUrl: null });

    const { getByTestId } = await renderWithProviders(
      <LibraryItem item={item} />,
    );

    expect(getByTestId("expo-image").props.accessibilityLabel).toBeUndefined();
  });

  it("renders an artist row labelled 'Artist'", async () => {
    const item = makeArtistLibraryItem({
      artist: makeArtistRef({ name: "Boards of Canada" }),
    });

    const { getByText } = await renderWithProviders(<LibraryItem item={item} />);

    expect(getByText("Boards of Canada")).toBeTruthy();
    expect(getByText("Artist")).toBeTruthy();
  });

  it("renders a user playlist row labelled 'Playlist' with a cover grid", async () => {
    const item = makePlaylistLibraryItem({
      playlist: makePlaylistRef({ name: "Chill Vibes" }),
      coverUrls: ["a", "b"],
    });

    const { getByText, getAllByTestId } = await renderWithProviders(
      <LibraryItem item={item} />,
    );

    expect(getByText("Chill Vibes")).toBeTruthy();
    expect(getByText("Playlist")).toBeTruthy();
    expect(getAllByTestId("expo-image")).toHaveLength(4);
  });

  it("renders the heart mark for Liked Songs", async () => {
    const item = makePlaylistLibraryItem({
      playlist: makePlaylistRef({ name: "Liked Songs" }),
      playlistType: PlaylistType.LIKED,
    });

    const { getByText, queryByTestId, getByTestId } = await renderWithProviders(
      <LibraryItem item={item} />,
    );
    await measureLikedCover(getByTestId);

    expect(getByText("Liked Songs")).toBeTruthy();
    expect(getByText("heart.fill")).toBeTruthy();
    expect(queryByTestId("expo-image")).toBeNull();
  });
});
