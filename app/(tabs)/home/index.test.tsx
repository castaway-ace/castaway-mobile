import HomeScreen from "@/app/(tabs)/home";
import { renderWithProviders } from "@/test-utils/renderWithProviders";

// Keep every list query pending so the home shelves render their loading
// skeletons. requireActual preserves each module's order enum. (jest.mock is
// hoisted above the imports above.)
jest.mock("@/api/albums/api", () => {
  const actual = jest.requireActual("@/api/albums/api");
  return {
    ...actual,
    albumApi: { ...actual.albumApi, getAll: jest.fn(() => new Promise(() => {})) },
  };
});
jest.mock("@/api/artists/api", () => {
  const actual = jest.requireActual("@/api/artists/api");
  return {
    ...actual,
    artistApi: {
      ...actual.artistApi,
      getAll: jest.fn(() => new Promise(() => {})),
    },
  };
});
jest.mock("@/api/playlists/api", () => {
  const actual = jest.requireActual("@/api/playlists/api");
  return {
    ...actual,
    playlistApi: {
      ...actual.playlistApi,
      getAll: jest.fn(() => new Promise(() => {})),
    },
  };
});
jest.mock("@/api/interactions/api", () => ({
  interactionApi: {
    getAll: jest.fn(() => new Promise(() => {})),
    createOrUpdateAlbum: jest.fn(),
    createOrUpdateArtist: jest.fn(),
    createOrUpdatePlaylist: jest.fn(),
  },
}));

describe("Home screen loading state", () => {
  it("shows a skeleton shelf for each section while the lists load", async () => {
    const { getAllByTestId } = await renderWithProviders(<HomeScreen />);

    // Favorite albums, playlists, recently played, favorite artists.
    expect(getAllByTestId("skeleton-shelf")).toHaveLength(4);
    expect(getAllByTestId("album-item-skeleton").length).toBeGreaterThan(0);
    expect(getAllByTestId("playlist-item-skeleton").length).toBeGreaterThan(0);
    expect(getAllByTestId("interaction-item-skeleton").length).toBeGreaterThan(
      0,
    );
    expect(getAllByTestId("artist-item-skeleton").length).toBeGreaterThan(0);
  });
});
