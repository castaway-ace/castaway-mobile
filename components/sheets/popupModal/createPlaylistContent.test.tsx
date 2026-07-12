import CreatePlaylistContent from "@/components/sheets/popupModal/createPlaylistContent";
import {
  act,
  fireEvent,
  renderWithProviders,
} from "@/test-utils/renderWithProviders";
import { router } from "expo-router";

const mockClose = jest.fn();
const mockClosePlayer = jest.fn();
const mockCreate = jest.fn();
const mockAddTrack = jest.fn();
const mockPlaylistInteraction = jest.fn();

jest.mock("@/contexts/popupModalContext", () => ({
  usePopupModal: () => ({ close: mockClose }),
}));
jest.mock("@/contexts/playerModalContext", () => ({
  usePlayerModal: () => ({ close: mockClosePlayer }),
}));
jest.mock("@/utils/useTabLocation", () => ({ useTabLocation: () => "home" }));
jest.mock("@/api/playlists/mutations", () => ({
  useCreatePlaylist: () => ({ mutate: mockCreate }),
  useAddTrackToPlaylist: () => ({ mutate: mockAddTrack }),
}));
jest.mock("@/api/interactions/mutations", () => ({
  useUpdatePlaylistInteraction: () => ({ mutate: mockPlaylistInteraction }),
}));

describe("CreatePlaylistContent", () => {
  it("does nothing when the name is blank", async () => {
    const { getByText } = await renderWithProviders(<CreatePlaylistContent />);

    await fireEvent.press(getByText("Submit"));

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("creates a playlist and navigates to it (no track)", async () => {
    const { getByText, getByPlaceholderText } = await renderWithProviders(
      <CreatePlaylistContent />,
    );

    await fireEvent.changeText(getByPlaceholderText("Enter Name"), "Road Trip");
    await fireEvent.press(getByText("Submit"));

    expect(mockCreate).toHaveBeenCalledWith(
      "Road Trip",
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );

    const onSuccess = mockCreate.mock.calls[0][1].onSuccess;
    await act(async () => onSuccess({ id: "new-id" }));

    expect(mockClose).toHaveBeenCalled();
    expect(mockPlaylistInteraction).toHaveBeenCalledWith("new-id");
    expect(mockClosePlayer).toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith("/(tabs)/home/playlists/new-id");
    expect(mockAddTrack).not.toHaveBeenCalled();
  });

  it("adds the given track to the new playlist before navigating", async () => {
    const { getByText, getByPlaceholderText } = await renderWithProviders(
      <CreatePlaylistContent trackId="t1" />,
    );

    await fireEvent.changeText(getByPlaceholderText("Enter Name"), "Faves");
    await fireEvent.press(getByText("Submit"));

    const onSuccess = mockCreate.mock.calls[0][1].onSuccess;
    await act(async () => onSuccess({ id: "pl-9" }));

    expect(mockAddTrack).toHaveBeenCalledWith(
      { playlistId: "pl-9", trackId: "t1", playlistName: "Faves" },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });
});
