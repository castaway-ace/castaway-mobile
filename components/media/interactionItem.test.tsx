import InteractionItem from "@/components/media/interactionItem";
import {
  makeAlbumInteraction,
  makeAlbumRef,
  makeArtistInteraction,
  makeArtistRef,
  makePlaylistInteraction,
  makePlaylistRef,
} from "@/test-utils/fixtures";
import { renderWithProviders } from "@/test-utils/renderWithProviders";

describe("InteractionItem", () => {
  it("renders an album interaction with title, artists, and cover", async () => {
    const interaction = makeAlbumInteraction({
      album: makeAlbumRef({ title: "Dark Side" }),
      artists: [makeArtistRef({ name: "Pink Floyd" })],
      coverUrl: "https://cover/dsotm.jpg",
    });

    const { getByText, getByTestId } = await renderWithProviders(
      <InteractionItem interaction={interaction} />,
    );

    expect(getByText("Dark Side")).toBeTruthy();
    expect(getByText("Pink Floyd")).toBeTruthy();
    expect(getByTestId("expo-image").props.accessibilityLabel).toBe(
      "https://cover/dsotm.jpg",
    );
  });

  it("falls back to the placeholder when an album has no cover", async () => {
    const interaction = makeAlbumInteraction({ coverUrl: null });

    const { getByTestId } = await renderWithProviders(
      <InteractionItem interaction={interaction} />,
    );

    expect(getByTestId("expo-image").props.accessibilityLabel).toBeUndefined();
  });

  it("renders an artist interaction labelled 'Artist'", async () => {
    const interaction = makeArtistInteraction({
      artist: makeArtistRef({ name: "David Bowie" }),
    });

    const { getByText } = await renderWithProviders(
      <InteractionItem interaction={interaction} />,
    );

    expect(getByText("David Bowie")).toBeTruthy();
    expect(getByText("Artist")).toBeTruthy();
  });

  it("renders a playlist interaction labelled 'Playlist' with a cover grid", async () => {
    const interaction = makePlaylistInteraction({
      playlist: makePlaylistRef({ name: "Chill Vibes" }),
      coverUrls: ["a", "b"],
    });

    const { getByText, getAllByTestId } = await renderWithProviders(
      <InteractionItem interaction={interaction} />,
    );

    expect(getByText("Chill Vibes")).toBeTruthy();
    expect(getByText("Playlist")).toBeTruthy();
    expect(getAllByTestId("expo-image")).toHaveLength(4);
  });

  it("renders in the row variant", async () => {
    const interaction = makeArtistInteraction({
      artist: makeArtistRef({ name: "Aphex Twin" }),
    });

    const { getByText } = await renderWithProviders(
      <InteractionItem interaction={interaction} variant="row" />,
    );

    expect(getByText("Aphex Twin")).toBeTruthy();
  });
});
