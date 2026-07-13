import Library from "@/app/(tabs)/library";
import { PopupModalProvider } from "@/contexts/popupModalContext";
import { renderWithProviders } from "@/test-utils/renderWithProviders";

// Keep the interactions query pending so the list renders row skeletons.
// (jest.mock is hoisted above the imports above.)
jest.mock("@/api/interactions/api", () => ({
  interactionApi: {
    getAll: jest.fn(() => new Promise(() => {})),
    createOrUpdateAlbum: jest.fn(),
    createOrUpdateArtist: jest.fn(),
    createOrUpdatePlaylist: jest.fn(),
  },
}));

describe("Library screen loading state", () => {
  it("shows a list of row skeletons while the feed loads", async () => {
    const { getAllByTestId } = await renderWithProviders(
      <PopupModalProvider>
        <Library />
      </PopupModalProvider>,
    );

    expect(getAllByTestId("interaction-item-skeleton")).toHaveLength(5);
  });
});
