import PlaylistCover from "@/components/media/playlistCover";
import { render } from "@/test-utils/renderWithProviders";
import { PlaylistType } from "@/types/playlist";

describe("PlaylistCover", () => {
  it("renders the heart mark for Liked Songs, ignoring its album covers", async () => {
    const { getByText, queryByTestId } = await render(
      <PlaylistCover
        urls={["a", "b", "c", "d"]}
        type={PlaylistType.LIKED}
        style={{}}
      />,
    );
    expect(getByText("heart.fill")).toBeTruthy();
    expect(queryByTestId("expo-image")).toBeNull();
  });

  it("still tiles album covers for a user playlist", async () => {
    const { getAllByTestId, queryByText } = await render(
      <PlaylistCover
        urls={["a", "b", "c", "d"]}
        type={PlaylistType.USER}
        style={{}}
      />,
    );
    expect(getAllByTestId("expo-image")).toHaveLength(4);
    expect(queryByText("heart.fill")).toBeNull();
  });

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
