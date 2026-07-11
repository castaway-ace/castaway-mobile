import { queryKeys } from "@/api/queryKeys";
import AlbumItem from "@/components/media/albumItem";
import { createTestQueryClient } from "@/test-utils/createTestQueryClient";
import { makeAlbum, makeArtistRef } from "@/test-utils/fixtures";
import { renderWithProviders } from "@/test-utils/renderWithProviders";

describe("AlbumItem", () => {
  it("renders the album title, artists, and cover from cache", async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(
      queryKeys.albums.detail("a1"),
      makeAlbum({
        title: "OK Computer",
        artists: [makeArtistRef({ name: "Radiohead" })],
      }),
    );
    queryClient.setQueryData(
      queryKeys.albums.cover("a1"),
      "https://cover/okc.jpg",
    );

    const { getByText, getByTestId } = await renderWithProviders(
      <AlbumItem id="a1" />,
      { queryClient },
    );

    expect(getByText("OK Computer")).toBeTruthy();
    expect(getByText("Radiohead")).toBeTruthy();
    expect(getByTestId("expo-image").props.accessibilityLabel).toBe(
      "https://cover/okc.jpg",
    );
  });
});
