import { queryKeys } from "@/api/queryKeys";
import ArtistScreen from "@/components/media/artistScreen";
import { createTestQueryClient } from "@/test-utils/createTestQueryClient";
import { makeAlbumRef, makeArtist } from "@/test-utils/fixtures";
import {
  fireEvent,
  renderWithProviders,
} from "@/test-utils/renderWithProviders";
import type { Artist } from "@/types/artists";
import type { QueryClient } from "@tanstack/react-query";

const mockArtistStar = jest.fn();

jest.mock("@/api/artists/mutations", () => ({
  useArtistStar: () => ({ mutate: mockArtistStar }),
}));

jest.mock("@/components/media/albumItem", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    __esModule: true,
    default: ({ id }: { id: string }) => React.createElement(Text, null, id),
  };
});

const renderScreen = async (
  artist: Artist,
  onAlbumPress = jest.fn(),
): Promise<
  {
    onAlbumPress: jest.Mock;
  } & Awaited<ReturnType<typeof renderWithProviders>>
> => {
  const queryClient: QueryClient = createTestQueryClient();
  queryClient.setQueryData(queryKeys.artists.detail(artist.id), artist);
  queryClient.setQueryData(
    queryKeys.artists.image(artist.id),
    "https://img.jpg",
  );
  const utils = await renderWithProviders(
    <ArtistScreen id={artist.id} onAlbumPress={onAlbumPress} />,
    { queryClient },
  );
  return { onAlbumPress, ...utils };
};

const testArtist = (overrides: Partial<Artist> = {}): Artist =>
  makeArtist({
    id: "ar1",
    name: "Radiohead",
    starred: false,
    albums: [makeAlbumRef({ id: "al1" }), makeAlbumRef({ id: "al2" })],
    ...overrides,
  });

describe("ArtistScreen", () => {
  it("renders the artist name and album list", async () => {
    const { getByText } = await renderScreen(testArtist());

    expect(getByText("Radiohead")).toBeTruthy();
    expect(getByText("Albums")).toBeTruthy();
    expect(getByText("al1")).toBeTruthy();
    expect(getByText("al2")).toBeTruthy();
  });

  it("calls onAlbumPress when an album is tapped", async () => {
    const { getByText, onAlbumPress } = await renderScreen(testArtist());

    fireEvent.press(getByText("al1"));
    expect(onAlbumPress).toHaveBeenCalledWith("al1");
  });

  it("shows an outline heart and stars the artist when unstarred", async () => {
    const { getByText } = await renderScreen(testArtist({ starred: false }));

    expect(getByText("heart")).toBeTruthy();
    fireEvent.press(getByText("heart"));
    expect(mockArtistStar).toHaveBeenCalledWith({ id: "ar1", starred: false });
  });

  it("shows a filled heart when the artist is already starred", async () => {
    const { getByText } = await renderScreen(testArtist({ starred: true }));
    expect(getByText("heart.fill")).toBeTruthy();
  });
});
