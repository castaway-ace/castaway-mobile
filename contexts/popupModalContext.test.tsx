import {
  PopupModalProvider,
  usePopupModal,
} from "@/contexts/popupModalContext";
import { act, renderHook } from "@/test-utils/renderWithProviders";

describe("popupModalContext", () => {
  it("opens the create-playlist popup with an optional trackId", async () => {
    const { result } = await renderHook(() => usePopupModal(), {
      wrapper: PopupModalProvider,
    });

    expect(result.current.content).toBeNull();

    await act(async () => result.current.openCreatePlaylist({ trackId: "t1" }));
    expect(result.current.content).toEqual({
      variant: "createPlaylist",
      trackId: "t1",
    });

    await act(async () => result.current.close());
    expect(result.current.content).toBeNull();
  });

  it("opens a confirm popup carrying its options", async () => {
    const { result } = await renderHook(() => usePopupModal(), {
      wrapper: PopupModalProvider,
    });

    const onConfirm = jest.fn();
    await act(async () =>
      result.current.openConfirm({
        title: "Delete?",
        message: "This cannot be undone",
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
        onConfirm,
      }),
    );

    expect(result.current.content).toMatchObject({
      variant: "confirm",
      title: "Delete?",
      confirmLabel: "Delete",
    });
  });

  it("throws when used outside its provider", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    await expect(renderHook(() => usePopupModal())).rejects.toThrow(
      "usePopupModal must be used within a PopupModalProvider",
    );
    spy.mockRestore();
  });
});
