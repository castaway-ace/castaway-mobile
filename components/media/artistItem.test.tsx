import { queryKeys } from "@/api/queryKeys";
import ArtistItem from "@/components/media/artistItem";
import { createTestQueryClient } from "@/test-utils/createTestQueryClient";
import { makeArtist } from "@/test-utils/fixtures";
import { renderWithProviders } from "@/test-utils/renderWithProviders";

jest.mock("@/api/artists/api", () => ({
  ...jest.requireActual("@/api/artists/api"),
  artistApi: {
    getOne: jest.fn().mockRejectedValue(new Error("not fetched")),
    getImage: jest.fn().mockRejectedValue(new Error("no image")),
  },
}));

describe("ArtistItem", () => {
  it("renders the artist name and image from cache", async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(
      queryKeys.artists.detail("ar1"),
      makeArtist({ name: "Portishead" }),
    );
    queryClient.setQueryData(
      queryKeys.artists.image("ar1"),
      "https://img/portishead.jpg",
    );

    const { getByText, getByTestId } = await renderWithProviders(
      <ArtistItem id="ar1" />,
      { queryClient },
    );

    expect(getByText("Portishead")).toBeTruthy();
    expect(getByTestId("expo-image").props.accessibilityLabel).toBe(
      "https://img/portishead.jpg",
    );
  });

  it("uses the placeholder when there is no artist image", async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(
      queryKeys.artists.detail("ar2"),
      makeArtist({ name: "Boards of Canada" }),
    );

    const { getByText, getByTestId } = await renderWithProviders(
      <ArtistItem id="ar2" />,
      { queryClient },
    );

    expect(getByText("Boards of Canada")).toBeTruthy();
    expect(getByTestId("expo-image").props.accessibilityLabel).toBeUndefined();
  });
});
