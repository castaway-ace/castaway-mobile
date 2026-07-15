import HomeScreen from "@/app/(tabs)/home";
import {
  CONTENT_BOTTOM_GAP,
  useBottomInset,
} from "@/contexts/bottomInsetContext";
import { renderWithProviders } from "@/test-utils/renderWithProviders";
import { useEffect } from "react";

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

// Stands in for the tab bar, which is what publishes its measured height (bar
// plus mini-player) in the real app.
const InsetPublisher = ({ height }: { height: number }) => {
  const { setBottomInset } = useBottomInset();
  useEffect(() => setBottomInset(height), [height, setBottomInset]);
  return null;
};

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

describe("Home screen bottom spacing", () => {
  it("pads its content past the docked tab bar and mini-player", async () => {
    const inset = 157;
    const { getByTestId } = await renderWithProviders(
      <>
        <InsetPublisher height={inset} />
        <HomeScreen />
      </>,
    );

    // The last shelf (Favorite Artists) is otherwise covered by the mini-player,
    // which stacks above the tab bar and so isn't in useBottomTabBarHeight.
    expect(
      getByTestId("home-scroll").props.contentContainerStyle.paddingBottom,
    ).toBe(inset + CONTENT_BOTTOM_GAP);
  });

  it("reserves no player space when nothing is docked", async () => {
    const { getByTestId } = await renderWithProviders(<HomeScreen />);

    expect(
      getByTestId("home-scroll").props.contentContainerStyle.paddingBottom,
    ).toBe(CONTENT_BOTTOM_GAP);
  });
});
