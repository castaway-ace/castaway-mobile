import { libraryApi } from "@/api/library/api";
import Library from "@/app/(tabs)/library";
import { PopupModalProvider } from "@/contexts/popupModalContext";
import {
  makeAlbumLibraryItem,
  makeArtistLibraryItem,
  makePlaylistLibraryItem,
} from "@/test-utils/fixtures";
import { renderWithProviders } from "@/test-utils/renderWithProviders";

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
    (libraryApi.getAll as jest.Mock).mockResolvedValue([
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
    (libraryApi.getAll as jest.Mock).mockResolvedValue([]);

    await renderLibrary();

    expect(libraryApi.getAll).toHaveBeenCalledWith({ limit: 200, offset: 0 });
  });
});
