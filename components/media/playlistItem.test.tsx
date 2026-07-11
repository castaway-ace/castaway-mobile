import { queryKeys } from "@/api/queryKeys";
import PlaylistItem from "@/components/media/playlistItem";
import { createTestQueryClient } from "@/test-utils/createTestQueryClient";
import { makePlaylist } from "@/test-utils/fixtures";
import { renderWithProviders } from "@/test-utils/renderWithProviders";

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
});
