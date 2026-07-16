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

// Left unresolved so either query can be parked in `pending` on demand; tests
// that want them loaded seed the cache instead, and the LONG stale time means
// the seeded data is fresh and never refetches through these.
jest.mock("@/api/artists/api", () => {
  const actual = jest.requireActual("@/api/artists/api");
  return {
    ...actual,
    artistApi: {
      ...actual.artistApi,
      getOne: jest.fn(() => new Promise(() => {})),
      getImage: jest.fn(() => new Promise(() => {})),
    },
  };
});

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
  { seedImage = true }: { seedImage?: boolean } = {},
): Promise<
  {
    onAlbumPress: jest.Mock;
  } & Awaited<ReturnType<typeof renderWithProviders>>
> => {
  const queryClient: QueryClient = createTestQueryClient();
  queryClient.setQueryData(queryKeys.artists.detail(artist.id), artist);
  if (seedImage) {
    queryClient.setQueryData(
      queryKeys.artists.image(artist.id),
      "https://img.jpg",
    );
  }
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

  it("shows an empty message when the artist has no albums", async () => {
    const { getByText } = await renderScreen(testArtist({ albums: [] }));

    expect(getByText("Albums")).toBeTruthy();
    expect(getByText("No albums available")).toBeTruthy();
  });

  it("calls onAlbumPress when an album is tapped", async () => {
    const { getByText, onAlbumPress } = await renderScreen(testArtist());

    await fireEvent.press(getByText("al1"));
    expect(onAlbumPress).toHaveBeenCalledWith("al1");
  });

  it("shows an outline heart and stars the artist when unstarred", async () => {
    const { getByText } = await renderScreen(testArtist({ starred: false }));

    expect(getByText("heart")).toBeTruthy();
    await fireEvent.press(getByText("heart"));
    expect(mockArtistStar).toHaveBeenCalledWith({ id: "ar1", starred: false });
  });

  it("shows a filled heart when the artist is already starred", async () => {
    const { getByText } = await renderScreen(testArtist({ starred: true }));
    expect(getByText("heart.fill")).toBeTruthy();
  });

  it("renders the artist photo once its url resolves", async () => {
    const { getByTestId } = await renderScreen(testArtist());

    // cacheKey rather than the raw uri: the url is presigned and re-signed on
    // every fetch, so it can't be the cache identity. See presignedImageSource.
    expect(getByTestId("expo-image").props.source).toEqual({
      uri: "https://img.jpg",
      cacheKey: "https://img.jpg",
    });
  });

  it("holds the blurhash rather than the placeholder while the url is in flight", async () => {
    const { getByTestId } = await renderScreen(testArtist(), jest.fn(), {
      seedImage: false,
    });

    // The placeholder art is a transparent icon, so standing it in here would
    // read as an empty hero for the whole request.
    expect(getByTestId("expo-image").props.source).toBeUndefined();
  });

  it("falls back to the placeholder once the url resolves empty", async () => {
    const artist = testArtist();
    const queryClient: QueryClient = createTestQueryClient();
    queryClient.setQueryData(queryKeys.artists.detail(artist.id), artist);
    queryClient.setQueryData(queryKeys.artists.image(artist.id), "");

    const { getByTestId } = await renderWithProviders(
      <ArtistScreen id={artist.id} onAlbumPress={jest.fn()} />,
      { queryClient },
    );

    // The bundled asset, not a uri — an artist who genuinely has no photo.
    expect(getByTestId("expo-image").props.source).toBeDefined();
    expect(getByTestId("expo-image").props.accessibilityLabel).toBeUndefined();
  });

  it("requests the artist photo without waiting on the artist query", async () => {
    const { artistApi } = require("@/api/artists/api");
    const queryClient: QueryClient = createTestQueryClient();

    // Artist detail deliberately left unseeded and in flight: the image request
    // should still go out rather than queueing behind it.
    await renderWithProviders(<ArtistScreen id="ar1" onAlbumPress={jest.fn()} />, {
      queryClient,
    });

    expect(artistApi.getImage).toHaveBeenCalledWith("ar1");
  });
});
