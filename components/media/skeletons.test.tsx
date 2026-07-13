import AlbumItem from "@/components/media/albumItem";
import { AlbumScreenSkeleton } from "@/components/media/albumScreen";
import ArtistItem from "@/components/media/artistItem";
import { ArtistScreenSkeleton } from "@/components/media/artistScreen";
import PlaylistItem from "@/components/media/playlistItem";
import { PlaylistScreenSkeleton } from "@/components/media/playlistScreen";
import {
  AlbumItemSkeleton,
  ArtistItemSkeleton,
  InteractionItemSkeleton,
  MediaCardSkeleton,
  MediaRowSkeleton,
  PlaylistItemSkeleton,
  SearchItemSkeleton,
  SkeletonShelf,
} from "@/components/media/skeletons";
import { renderWithProviders } from "@/test-utils/renderWithProviders";
import { Text } from "react-native";

// Keep the self-fetching cards' detail queries pending so the loading branch
// (the skeleton) is what renders. requireActual preserves the order enums that
// the query modules also import from these files. The direct-render tests below
// don't rely on these — they render the skeleton components on their own.
// (jest.mock is hoisted above the imports above.)
jest.mock("@/api/albums/api", () => {
  const actual = jest.requireActual("@/api/albums/api");
  return {
    ...actual,
    albumApi: {
      ...actual.albumApi,
      getOne: jest.fn(() => new Promise(() => {})),
      getCover: jest.fn(() => new Promise(() => {})),
    },
  };
});
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
jest.mock("@/api/playlists/api", () => {
  const actual = jest.requireActual("@/api/playlists/api");
  return {
    ...actual,
    playlistApi: {
      ...actual.playlistApi,
      getOne: jest.fn(() => new Promise(() => {})),
      getAllTracks: jest.fn(() => new Promise(() => {})),
    },
  };
});

// The album/playlist screen modules pull in the audio context (and thus
// expo-audio) at import time; stub it, mirroring the other screen tests.
jest.mock("@/contexts/audioPlayerContext", () => ({
  useAudioPlayerContext: () => ({}),
}));

describe("media item skeletons render their placeholder", () => {
  it("album card", async () => {
    const { getByTestId } = await renderWithProviders(<AlbumItemSkeleton />);
    expect(getByTestId("album-item-skeleton")).toBeTruthy();
  });

  it("artist card", async () => {
    const { getByTestId } = await renderWithProviders(<ArtistItemSkeleton />);
    expect(getByTestId("artist-item-skeleton")).toBeTruthy();
  });

  it("playlist card", async () => {
    const { getByTestId } = await renderWithProviders(<PlaylistItemSkeleton />);
    expect(getByTestId("playlist-item-skeleton")).toBeTruthy();
  });

  it("interaction card in both variants", async () => {
    const grid = await renderWithProviders(
      <InteractionItemSkeleton variant="grid" />,
    );
    expect(grid.getByTestId("interaction-item-skeleton")).toBeTruthy();

    const row = await renderWithProviders(
      <InteractionItemSkeleton variant="row" />,
    );
    expect(row.getByTestId("interaction-item-skeleton")).toBeTruthy();
  });

  it("search row", async () => {
    const { getByTestId } = await renderWithProviders(<SearchItemSkeleton />);
    expect(getByTestId("search-item-skeleton")).toBeTruthy();
  });
});

describe("universal skeleton building blocks", () => {
  it("MediaCardSkeleton renders in one- and two-line forms", async () => {
    const two = await renderWithProviders(
      <MediaCardSkeleton testID="card-2" lines={2} />,
    );
    expect(two.getByTestId("card-2")).toBeTruthy();

    const one = await renderWithProviders(
      <MediaCardSkeleton testID="card-1" lines={1} />,
    );
    expect(one.getByTestId("card-1")).toBeTruthy();
  });

  it("MediaRowSkeleton renders a thumbnail beside text lines", async () => {
    const { getByTestId } = await renderWithProviders(
      <MediaRowSkeleton testID="row" thumbSize={48} thumbRadius={4} />,
    );
    expect(getByTestId("row")).toBeTruthy();
  });
});

describe("self-fetching cards fall back to a skeleton while loading", () => {
  it("album card", async () => {
    const { getByTestId } = await renderWithProviders(<AlbumItem id="a1" />);
    expect(getByTestId("album-item-skeleton")).toBeTruthy();
  });

  it("artist card", async () => {
    const { getByTestId } = await renderWithProviders(<ArtistItem id="ar1" />);
    expect(getByTestId("artist-item-skeleton")).toBeTruthy();
  });

  it("playlist card", async () => {
    const { getByTestId } = await renderWithProviders(<PlaylistItem id="p1" />);
    expect(getByTestId("playlist-item-skeleton")).toBeTruthy();
  });
});

describe("detail screen skeletons render their placeholder", () => {
  it("album screen", async () => {
    const { getByTestId } = await renderWithProviders(<AlbumScreenSkeleton />);
    expect(getByTestId("album-screen-skeleton")).toBeTruthy();
  });

  it("artist screen", async () => {
    const { getByTestId } = await renderWithProviders(<ArtistScreenSkeleton />);
    expect(getByTestId("artist-screen-skeleton")).toBeTruthy();
  });

  it("playlist screen", async () => {
    const { getByTestId } = await renderWithProviders(
      <PlaylistScreenSkeleton />,
    );
    expect(getByTestId("playlist-screen-skeleton")).toBeTruthy();
  });
});

describe("SkeletonShelf", () => {
  it("renders a title placeholder and its children", async () => {
    const { getByTestId, getByText } = await renderWithProviders(
      <SkeletonShelf>
        <Text>card</Text>
      </SkeletonShelf>,
    );
    expect(getByTestId("skeleton-shelf")).toBeTruthy();
    expect(getByText("card")).toBeTruthy();
  });
});
