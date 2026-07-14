import { queryKeys } from "@/api/queryKeys";
import AlbumScreen from "@/components/media/albumScreen";
import { SheetType } from "@/contexts/sheetModalContext";
import { createTestQueryClient } from "@/test-utils/createTestQueryClient";
import {
  makeAlbum,
  makeAlbumTrack,
  makeArtistRef,
} from "@/test-utils/fixtures";
import {
  fireEvent,
  renderWithProviders,
} from "@/test-utils/renderWithProviders";
import type { Album } from "@/types/albums";
import type { QueryClient } from "@tanstack/react-query";

const mockAlbumStar = jest.fn();
const mockPlayQueue = jest.fn();
const mockOpen = jest.fn();

jest.mock("@/api/albums/mutations", () => ({
  useAlbumStar: () => ({ mutate: mockAlbumStar }),
}));

jest.mock("@/contexts/audioPlayerContext", () => ({
  useAudioPlayerContext: () => ({ playQueue: mockPlayQueue }),
}));

jest.mock("@/contexts/sheetModalContext", () => ({
  ...jest.requireActual("@/contexts/sheetModalContext"),
  useSheetModal: () => ({ open: mockOpen }),
}));

const makeTestAlbum = (overrides: Partial<Album> = {}): Album =>
  makeAlbum({
    id: "a1",
    title: "OK Computer",
    releaseDate: "1997-06-16T12:00:00.000Z",
    starred: false,
    artists: [makeArtistRef({ id: "ar1", name: "Radiohead" })],
    tracks: [
      makeAlbumTrack({
        id: "tk1",
        title: "Airbag",
        trackNumber: 1,
        artists: [makeArtistRef({ name: "Thom" })],
      }),
      makeAlbumTrack({ id: "tk2", title: "Karma Police", trackNumber: 2 }),
    ],
    ...overrides,
  });

const renderScreen = async (
  album: Album,
  onArtistPress = jest.fn(),
): Promise<
  {
    onArtistPress: jest.Mock;
  } & Awaited<ReturnType<typeof renderWithProviders>>
> => {
  const queryClient: QueryClient = createTestQueryClient();
  queryClient.setQueryData(
    queryKeys.albums.cover(album.id),
    "https://cover.jpg",
  );
  const utils = await renderWithProviders(
    <AlbumScreen album={album} onArtistPress={onArtistPress} />,
    { queryClient },
  );
  return { onArtistPress, ...utils };
};

describe("AlbumScreen", () => {
  it("renders the album title, artist, release line, and tracks", async () => {
    const { getByText } = await renderScreen(makeTestAlbum());

    expect(getByText("OK Computer")).toBeTruthy();
    expect(getByText("Radiohead")).toBeTruthy();
    expect(getByText(/^Album • /)).toBeTruthy();
    expect(getByText("Airbag")).toBeTruthy();
    expect(getByText("Karma Police")).toBeTruthy();
  });

  it("calls onArtistPress when an artist is tapped", async () => {
    const { getByText, onArtistPress } = await renderScreen(makeTestAlbum());

    fireEvent.press(getByText("Radiohead"));
    expect(onArtistPress).toHaveBeenCalledWith("ar1");
  });

  it("plays the album starting at the tapped track", async () => {
    const album = makeTestAlbum();
    const { getByText } = await renderScreen(album);

    fireEvent.press(getByText("Karma Police"));
    expect(mockPlayQueue).toHaveBeenCalledWith(album.tracks, 1, {
      type: "album",
      name: "OK Computer",
    });
  });

  it("shows an outline heart and stars the album when unstarred", async () => {
    const { getByText } = await renderScreen(makeTestAlbum({ starred: false }));

    expect(getByText("heart")).toBeTruthy();
    fireEvent.press(getByText("heart"));
    expect(mockAlbumStar).toHaveBeenCalledWith({ id: "a1", starred: false });
  });

  it("shows a filled heart when the album is already starred", async () => {
    const { getByText } = await renderScreen(makeTestAlbum({ starred: true }));
    expect(getByText("heart.fill")).toBeTruthy();
  });

  it("opens the album-track options sheet", async () => {
    const { getAllByText } = await renderScreen(makeTestAlbum());

    fireEvent.press(getAllByText("ellipsis")[0]);
    expect(mockOpen).toHaveBeenCalledWith({
      type: SheetType.ALBUM_TRACK,
      id: "a1",
      trackId: "tk1",
    });
  });
});
