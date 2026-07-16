import { queryKeys } from "@/api/queryKeys";
import PlaylistItem from "@/components/media/playlistItem";
import { createTestQueryClient } from "@/test-utils/createTestQueryClient";
import { makePlaylist } from "@/test-utils/fixtures";
import { measureLikedCover } from "@/test-utils/measureLikedCover";
import { renderWithProviders } from "@/test-utils/renderWithProviders";
import { PlaylistType } from "@/types/playlist";

describe("PlaylistItem", () => {
  it("renders the playlist name and cover from cache", async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(
      queryKeys.playlists.detail("p1"),
      makePlaylist({ name: "Road Trip", albumCoverUrls: ["https://cover/x.jpg"] }),
    );

    const { getByText, getByTestId } = await renderWithProviders(
      <PlaylistItem id="p1" />,
      { queryClient },
    );

    expect(getByText("Road Trip")).toBeTruthy();
    expect(getByTestId("expo-image").props.accessibilityLabel).toBe(
      "https://cover/x.jpg",
    );
  });

  it("renders the heart mark for Liked Songs", async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(
      queryKeys.playlists.detail("p1"),
      makePlaylist({ name: "Liked Songs", type: PlaylistType.LIKED }),
    );

    const { getByText, queryByTestId, getByTestId } = await renderWithProviders(
      <PlaylistItem id="p1" />,
      { queryClient },
    );
    await measureLikedCover(getByTestId);

    expect(getByText("Liked Songs")).toBeTruthy();
    expect(getByText("heart.fill")).toBeTruthy();
    expect(queryByTestId("expo-image")).toBeNull();
  });
});
