import Search from "@/app/(tabs)/search";
import { renderWithProviders } from "@/test-utils/renderWithProviders";

// Keep the discover-albums query pending so the empty-input state renders its
// skeleton shelf. requireActual preserves the album order enum. SearchItem pulls
// in the audio context (and expo-audio) at import time, so stub it too.
// (jest.mock is hoisted above the imports above.)
jest.mock("@/api/albums/api", () => {
  const actual = jest.requireActual("@/api/albums/api");
  return {
    ...actual,
    albumApi: { ...actual.albumApi, getAll: jest.fn(() => new Promise(() => {})) },
  };
});
jest.mock("@/contexts/audioPlayerContext", () => ({
  useAudioPlayerContext: () => ({}),
}));

describe("Search screen loading state", () => {
  it("shows a discover skeleton shelf while the album list loads", async () => {
    const { getByTestId, getAllByTestId } = await renderWithProviders(
      <Search />,
    );

    expect(getByTestId("skeleton-shelf")).toBeTruthy();
    expect(getAllByTestId("album-item-skeleton").length).toBeGreaterThan(0);
  });
});
