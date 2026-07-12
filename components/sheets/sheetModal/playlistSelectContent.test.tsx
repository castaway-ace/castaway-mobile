import PlaylistSelectContent from "@/components/sheets/sheetModal/playlistSelectContent";
import {
  fireEvent,
  renderWithProviders,
} from "@/test-utils/renderWithProviders";

const mockClose = jest.fn();
const mockOpenCreate = jest.fn();
const mockOpenConfirm = jest.fn();
const mockAddTrack = jest.fn();

jest.mock("@/contexts/sheetModalContext", () => ({
  ...jest.requireActual("@/contexts/sheetModalContext"),
  useSheetModal: () => ({ close: mockClose }),
}));
jest.mock("@/contexts/popupModalContext", () => ({
  usePopupModal: () => ({
    openCreatePlaylist: mockOpenCreate,
    openConfirm: mockOpenConfirm,
  }),
}));
jest.mock("@/api/playlists/queries", () => ({
  usePlaylists: () => ({
    data: {
      pages: [
        [
          { id: "p1", name: "Chill", type: "USER", albumCoverUrls: [] },
          { id: "p2", name: "Faves", type: "USER", albumCoverUrls: [] },
        ],
      ],
    },
  }),
  usePlaylistsContainingTrack: () => new Set(["p2"]),
}));
jest.mock("@/api/playlists/mutations", () => ({
  useAddTrackToPlaylist: () => ({ mutate: mockAddTrack }),
}));

describe("PlaylistSelectContent", () => {
  it("lists playlists and marks ones that already contain the track", async () => {
    const { getByText, getAllByText } = await renderWithProviders(
      <PlaylistSelectContent trackId="t1" />,
    );
    expect(getByText("Create new playlist")).toBeTruthy();
    expect(getByText("Chill")).toBeTruthy();
    expect(getByText("Faves")).toBeTruthy();
    expect(getAllByText("Added")).toHaveLength(1);
  });

  it("opens the create-playlist popup for this track", async () => {
    const { getByText } = await renderWithProviders(
      <PlaylistSelectContent trackId="t1" />,
    );
    await fireEvent.press(getByText("Create new playlist"));
    expect(mockClose).toHaveBeenCalled();
    expect(mockOpenCreate).toHaveBeenCalledWith({ trackId: "t1" });
  });

  it("adds the track directly when the playlist does not contain it", async () => {
    const { getByText } = await renderWithProviders(
      <PlaylistSelectContent trackId="t1" />,
    );
    await fireEvent.press(getByText("Chill"));
    expect(mockClose).toHaveBeenCalled();
    expect(mockAddTrack).toHaveBeenCalledWith({
      playlistId: "p1",
      trackId: "t1",
      playlistName: "Chill",
    });
  });

  it("asks for confirmation when the playlist already contains the track", async () => {
    const { getByText } = await renderWithProviders(
      <PlaylistSelectContent trackId="t1" />,
    );
    await fireEvent.press(getByText("Faves"));
    expect(mockOpenConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Already added",
        confirmLabel: "Add anyway",
        onConfirm: expect.any(Function),
      }),
    );
    expect(mockAddTrack).not.toHaveBeenCalled();
  });
});
