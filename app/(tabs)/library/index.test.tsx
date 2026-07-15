import { libraryApi } from "@/api/library/api";
import Library from "@/app/(tabs)/library";
import { PopupModalProvider } from "@/contexts/popupModalContext";
import {
  makeAlbumLibraryItem,
  makeArtistLibraryItem,
  makePlaylistLibraryItem,
} from "@/test-utils/fixtures";
import {
  fireEvent,
  renderWithProviders,
  waitFor,
} from "@/test-utils/renderWithProviders";

// (jest.mock is hoisted above the imports above.)
jest.mock("@/api/library/api", () => ({
  libraryApi: { getAll: jest.fn(() => new Promise(() => {})) },
}));
jest.mock("@/api/interactions/api", () => ({
  interactionApi: {
    getAll: jest.fn(() => new Promise(() => {})),
    createOrUpdateAlbum: jest.fn(),
    createOrUpdateArtist: jest.fn(),
    createOrUpdatePlaylist: jest.fn(),
  },
}));

const mockGetAll = libraryApi.getAll as jest.Mock;

const renderLibrary = () =>
  renderWithProviders(
    <PopupModalProvider>
      <Library />
    </PopupModalProvider>,
  );

describe("Library screen", () => {
  it("shows a list of row skeletons while the library loads", async () => {
    const { getAllByTestId } = await renderLibrary();

    expect(getAllByTestId("library-item-skeleton")).toHaveLength(5);
  });

  it("renders playlists, albums, and artists in the order the server returned", async () => {
    mockGetAll.mockResolvedValue([
      makeArtistLibraryItem({ artist: { id: "ar1", name: "My Artist" } }),
      makePlaylistLibraryItem({ playlist: { id: "pl1", name: "My Playlist" } }),
      makeAlbumLibraryItem({ album: { id: "al1", title: "My Album" } }),
    ]);

    const { findByText, queryByTestId } = await renderLibrary();

    expect(await findByText("My Artist")).toBeTruthy();
    expect(await findByText("My Playlist")).toBeTruthy();
    expect(await findByText("My Album")).toBeTruthy();
    expect(queryByTestId("library-item-skeleton")).toBeNull();
  });

  it("requests the whole library rather than the endpoint's default page", async () => {
    mockGetAll.mockResolvedValue([]);

    await renderLibrary();

    expect(mockGetAll).toHaveBeenCalledWith({
      limit: 200,
      offset: 0,
      type: undefined,
    });
  });
});

describe("Library filters", () => {
  it("offers a pill per type and no clear pill by default", async () => {
    mockGetAll.mockResolvedValue([]);

    const { findByText, getByText, queryByTestId } = await renderLibrary();

    expect(await findByText("Playlists")).toBeTruthy();
    expect(getByText("Albums")).toBeTruthy();
    expect(getByText("Artists")).toBeTruthy();
    expect(queryByTestId("library-filter-clear")).toBeNull();
  });

  it("requests only the tapped type", async () => {
    mockGetAll.mockResolvedValue([]);

    const { findByTestId } = await renderLibrary();
    fireEvent.press(await findByTestId("library-filter-artist"));

    await waitFor(() =>
      expect(mockGetAll).toHaveBeenCalledWith({
        limit: 200,
        offset: 0,
        type: "artist",
      }),
    );
  });

  it("drops the other pills and reveals a clear pill once filtered", async () => {
    mockGetAll.mockResolvedValue([]);

    const { findByTestId, getByTestId, queryByText } = await renderLibrary();
    fireEvent.press(await findByTestId("library-filter-album"));

    await waitFor(() => expect(queryByText("Playlists")).toBeNull());
    expect(queryByText("Artists")).toBeNull();
    expect(queryByText("Albums")).toBeTruthy();
    expect(getByTestId("library-filter-clear")).toBeTruthy();
  });

  it("restores every pill when cleared, reusing the cached unfiltered list", async () => {
    mockGetAll.mockResolvedValue([]);

    const { findByTestId, getByText, queryByTestId } = await renderLibrary();
    fireEvent.press(await findByTestId("library-filter-album"));
    await waitFor(() => expect(mockGetAll).toHaveBeenCalledTimes(2));

    fireEvent.press(await findByTestId("library-filter-clear"));

    await waitFor(() => expect(getByText("Playlists")).toBeTruthy());
    expect(getByText("Artists")).toBeTruthy();
    expect(queryByTestId("library-filter-clear")).toBeNull();
    // Clearing returns to the unfiltered key fetched on mount, still fresh
    // within SHORT stale time — so it's served from cache with no third request.
    expect(mockGetAll).toHaveBeenCalledTimes(2);
  });

  it("clears the filter when the selected pill is tapped again", async () => {
    mockGetAll.mockResolvedValue([]);

    const { findByTestId, getByText, queryByTestId } = await renderLibrary();
    fireEvent.press(await findByTestId("library-filter-album"));
    await waitFor(() => expect(queryByTestId("library-filter-clear")).toBeTruthy());

    // Re-tapping the only pill left standing means the same thing as clearing.
    fireEvent.press(await findByTestId("library-filter-album"));

    await waitFor(() => expect(getByText("Playlists")).toBeTruthy());
    expect(getByText("Artists")).toBeTruthy();
    expect(queryByTestId("library-filter-clear")).toBeNull();
  });

  it("keeps the loaded list on screen instead of skeletons while a filter loads", async () => {
    mockGetAll.mockResolvedValue([
      makePlaylistLibraryItem({ playlist: { id: "pl1", name: "My Playlist" } }),
    ]);

    const { findByText, findByTestId, queryByTestId, getByText } =
      await renderLibrary();
    expect(await findByText("My Playlist")).toBeTruthy();

    // Never resolves, so the artists request stays in flight.
    mockGetAll.mockReturnValue(new Promise(() => {}));
    fireEvent.press(await findByTestId("library-filter-artist"));

    // The whole point of keepPreviousData: tapping a pill must not tear the
    // list down to skeletons for a round trip.
    await waitFor(() => expect(getByText("Artists")).toBeTruthy());
    expect(queryByTestId("library-item-skeleton")).toBeNull();
    expect(getByText("My Playlist")).toBeTruthy();
  });

  it("names the empty filter and keeps it clearable", async () => {
    mockGetAll.mockResolvedValue([]);

    const { findByTestId, findByText, getByTestId } = await renderLibrary();
    fireEvent.press(await findByTestId("library-filter-artist"));

    expect(await findByText("No artists in your library")).toBeTruthy();
    // Without the clear pill an empty filter would be a dead end.
    expect(getByTestId("library-filter-clear")).toBeTruthy();
  });

  it("reports an empty library when nothing is filtered", async () => {
    mockGetAll.mockResolvedValue([]);

    const { findByText } = await renderLibrary();

    expect(await findByText("Your library is empty")).toBeTruthy();
  });

  it("does not flash the wrong empty message while switching filters", async () => {
    mockGetAll.mockResolvedValue([]);

    const { findByTestId, queryByText } = await renderLibrary();
    fireEvent.press(await findByTestId("library-filter-artist"));
    await findByTestId("library-filter-clear");

    // Artists resolved empty; albums is now in flight, so `items` still holds
    // the artists result and says nothing about albums yet.
    mockGetAll.mockReturnValue(new Promise(() => {}));
    fireEvent.press(await findByTestId("library-filter-clear"));
    fireEvent.press(await findByTestId("library-filter-album"));

    await waitFor(() =>
      expect(queryByText("No artists in your library")).toBeNull(),
    );
    expect(queryByText("No albums in your library")).toBeNull();
  });
});
