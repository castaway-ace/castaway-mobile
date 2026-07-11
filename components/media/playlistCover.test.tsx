import PlaylistCover from "@/components/media/playlistCover";
import { render } from "@/test-utils/renderWithProviders";

describe("PlaylistCover", () => {
  it("renders a single placeholder when there are no urls", async () => {
    const { getAllByTestId } = await render(
      <PlaylistCover urls={undefined} style={{}} />,
    );
    expect(getAllByTestId("expo-image")).toHaveLength(1);
  });

  it("renders one cover for a single url", async () => {
    const { getByTestId } = await render(
      <PlaylistCover urls={["https://cover/a.jpg"]} style={{}} />,
    );
    expect(getByTestId("expo-image").props.accessibilityLabel).toBe(
      "https://cover/a.jpg",
    );
  });

  it("renders a four-tile grid for four covers", async () => {
    const { getAllByTestId } = await render(
      <PlaylistCover urls={["a", "b", "c", "d"]} style={{}} />,
    );
    expect(getAllByTestId("expo-image")).toHaveLength(4);
  });

  it("mirrors two covers into four tiles", async () => {
    const { getAllByTestId } = await render(
      <PlaylistCover urls={["a", "b"]} style={{}} />,
    );
    expect(getAllByTestId("expo-image")).toHaveLength(4);
  });
});
