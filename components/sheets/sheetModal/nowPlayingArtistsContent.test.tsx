import NowPlayingArtistsContent from "@/components/sheets/sheetModal/nowPlayingArtistsContent";
import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import { makeArtistRef, makeTrack } from "@/test-utils/fixtures";
import {
  fireEvent,
  renderWithProviders,
} from "@/test-utils/renderWithProviders";
import { router } from "expo-router";

const mockClose = jest.fn();
const mockClosePlayer = jest.fn();
const mockArtistInteraction = jest.fn();

jest.mock("@/contexts/sheetModalContext", () => ({
  ...jest.requireActual("@/contexts/sheetModalContext"),
  useSheetModal: () => ({ close: mockClose }),
}));
jest.mock("@/contexts/playerModalContext", () => ({
  usePlayerModal: () => ({ close: mockClosePlayer }),
}));
jest.mock("@/contexts/audioPlayerContext", () => ({
  useAudioPlayerContext: jest.fn(),
}));
jest.mock("@/utils/useTabLocation", () => ({ useTabLocation: () => "home" }));
jest.mock("@/api/interactions/mutations", () => ({
  useUpdateArtistInteraction: () => ({ mutate: mockArtistInteraction }),
}));

const track = makeTrack({
  id: "tk1",
  artists: [
    makeArtistRef({ id: "ar1", name: "Radiohead" }),
    makeArtistRef({ id: "ar2", name: "Thom Yorke" }),
  ],
});

const mockedContext = useAudioPlayerContext as jest.Mock;

describe("NowPlayingArtistsContent", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders no artists when there is no current track", async () => {
    mockedContext.mockReturnValue({ currentTrack: null });
    const { queryByText } = await renderWithProviders(
      <NowPlayingArtistsContent />,
    );
    expect(queryByText("Radiohead")).toBeNull();
  });

  it("lists every artist credited on the track", async () => {
    mockedContext.mockReturnValue({ currentTrack: track });
    const { getByText } = await renderWithProviders(
      <NowPlayingArtistsContent />,
    );

    expect(getByText("Radiohead")).toBeTruthy();
    expect(getByText("Thom Yorke")).toBeTruthy();
  });

  it("navigates to the picked artist, closing the sheet and player", async () => {
    mockedContext.mockReturnValue({ currentTrack: track });
    const { getByText } = await renderWithProviders(
      <NowPlayingArtistsContent />,
    );

    await fireEvent.press(getByText("Thom Yorke"));

    expect(mockArtistInteraction).toHaveBeenCalledWith("ar2");
    expect(router.navigate).toHaveBeenCalledWith("/(tabs)/home/artists/ar2");
    expect(mockClose).toHaveBeenCalled();
    expect(mockClosePlayer).toHaveBeenCalled();
  });
});
