import PlaylistContent from "@/components/sheets/sheetModal/playlistContent";
import { SheetType } from "@/contexts/sheetModalContext";
import {
  act,
  fireEvent,
  renderWithProviders,
} from "@/test-utils/renderWithProviders";
import { router, usePathname } from "expo-router";

const mockClose = jest.fn();
const mockOpenConfirm = jest.fn();
const mockDeletePlaylist = jest.fn();

jest.mock("@/contexts/sheetModalContext", () => ({
  ...jest.requireActual("@/contexts/sheetModalContext"),
  useSheetModal: () => ({ close: mockClose }),
}));
jest.mock("@/contexts/popupModalContext", () => ({
  usePopupModal: () => ({ openConfirm: mockOpenConfirm }),
}));
jest.mock("@/api/playlists/mutations", () => ({
  useDeletePlaylist: () => ({ mutate: mockDeletePlaylist }),
}));

describe("PlaylistContent", () => {
  it("confirms then deletes the playlist and navigates to the tab root", async () => {
    (usePathname as jest.Mock).mockReturnValue("/library/playlists/p1");

    const { getByText } = await renderWithProviders(
      <PlaylistContent content={{ type: SheetType.PLAYLIST, id: "p1" }} />,
    );

    await fireEvent.press(getByText("Delete Playlist"));

    expect(mockOpenConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Delete Playlist",
        confirmLabel: "Delete",
        onConfirm: expect.any(Function),
      }),
    );

    await act(async () => mockOpenConfirm.mock.calls[0][0].onConfirm());
    expect(mockDeletePlaylist).toHaveBeenCalledWith(
      "p1",
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );

    await act(async () => mockDeletePlaylist.mock.calls[0][1].onSuccess());
    expect(mockClose).toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith("/library");
  });
});
